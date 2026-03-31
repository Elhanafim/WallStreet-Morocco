export interface OpcvmFund {
  type: string | null;
  name: string;
  societe_gestion: string | null;
  vl: number | null;
  perf_1m: number | null;
  perf_ytd: number | null;
  perf_1an: number | null;
  encours: number | null;
}

export interface OpcvmResponse {
  funds: OpcvmFund[];
  count: number;
  source: string;
  last_updated: string;
  cached?: boolean;
  error?: boolean;
}

export interface OpcvmTopResponse {
  top: OpcvmFund[];
  metric: string;
  source: string;
  last_updated: string;
}

let _cache: { data: OpcvmResponse; ts: number } | null = null;
const CACHE_MS = 5 * 60_000; // 5 minutes

export async function fetchOpcvm(params?: {
  type?: string;
  sg?: string;
  sort?: string;
  order?: string;
}): Promise<OpcvmResponse> {
  const now = Date.now();
  if (!params && _cache && now - _cache.ts < CACHE_MS) {
    return _cache.data;
  }

  const qs = new URLSearchParams();
  if (params?.type)  qs.set('type', params.type);
  if (params?.sg)    qs.set('sg', params.sg);
  if (params?.sort)  qs.set('sort', params.sort ?? 'perf_ytd');
  if (params?.order) qs.set('order', params.order ?? 'desc');

  try {
    const url = `/api/opcvm${qs.toString() ? '?' + qs.toString() : ''}`;
    const res = await fetch(url);
    const data: OpcvmResponse = await res.json();
    if (!params) _cache = { data, ts: now };
    return data;
  } catch {
    return { funds: [], count: 0, source: 'unavailable', last_updated: '', error: true };
  }
}

export async function fetchOpcvmTop(n = 5, metric = 'perf_ytd'): Promise<OpcvmTopResponse> {
  try {
    const res = await fetch(`/api/opcvm?_path=top&n=${n}&metric=${metric}`);
    return await res.json();
  } catch {
    return { top: [], metric, source: 'unavailable', last_updated: '' };
  }
}
