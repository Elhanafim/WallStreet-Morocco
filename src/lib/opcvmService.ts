export interface OpcvmFund {
  type:             string | null;
  name:             string;
  societe_gestion:  string | null;
  vl:               number | null;
  var_jour:         number | null;   // daily variation % — available from medias24 only
  perf_1m:          number | null;
  perf_ytd:         number | null;
  perf_1an:         number | null;
  encours:          number | null;
  source?:          string;
}

export interface OpcvmResponse {
  funds:        OpcvmFund[];
  count:        number;
  total?:       number;
  source:       string;
  data_date:    string | null;
  last_updated: string;
  by_type?:     Record<string, number>;
  cached?:      boolean;
  error?:       boolean;
}

export interface OpcvmSummaryEntry {
  count:         number;
  avg_ytd:       number | null;
  best_ytd:      number | null;
  worst_ytd:     number | null;
  best_fund:     string | null;
  total_encours: number;
}

export interface OpcvmSummaryResponse {
  summary:       Record<string, OpcvmSummaryEntry>;
  total_funds:   number;
  total_encours: number;
  source:        string;
  data_date:     string | null;
  last_updated:  string;
  by_type?:      Record<string, number>;
}

export interface OpcvmTopResponse {
  top:          OpcvmFund[];
  worst:        OpcvmFund[];
  metric:       string;
  source:       string;
  data_date:    string | null;
  last_updated: string;
}

// ── Client-side 5-min cache ───────────────────────────────────────────────────

let _cache: { data: OpcvmResponse; ts: number } | null = null;
const CACHE_MS = 5 * 60_000;

// ── Fetch helpers ─────────────────────────────────────────────────────────────

export async function fetchOpcvm(params?: {
  type?:  string;
  sg?:    string;
  sort?:  string;
  order?: string;
}): Promise<OpcvmResponse> {
  const now = Date.now();
  if (!params && _cache && now - _cache.ts < CACHE_MS) return _cache.data;

  const qs = new URLSearchParams();
  if (params?.type)  qs.set('type',  params.type);
  if (params?.sg)    qs.set('sg',    params.sg);
  if (params?.sort)  qs.set('sort',  params.sort ?? 'perf_ytd');
  if (params?.order) qs.set('order', params.order ?? 'desc');

  try {
    const url  = `/api/opcvm${qs.toString() ? '?' + qs.toString() : ''}`;
    const res  = await fetch(url);
    const data: OpcvmResponse = await res.json();
    if (!params) _cache = { data, ts: now };
    return data;
  } catch {
    return { funds: [], count: 0, source: 'unavailable', data_date: null, last_updated: '', error: true };
  }
}

export async function fetchOpcvmSummary(): Promise<OpcvmSummaryResponse | null> {
  try {
    const res = await fetch('/api/opcvm?_path=summary');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchOpcvmTop(
  n      = 5,
  metric = 'perf_ytd',
  type?: string,
): Promise<OpcvmTopResponse | null> {
  try {
    const qs = new URLSearchParams({ _path: 'top', n: String(n), metric });
    if (type) qs.set('type', type);
    const res = await fetch(`/api/opcvm?${qs}`);
    return await res.json();
  } catch {
    return null;
  }
}

export async function refreshOpcvmCache(): Promise<void> {
  try {
    await fetch('/api/opcvm?_path=refresh', { method: 'POST' });
    _cache = null;
  } catch { /* non-fatal */ }
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatVL(vl: number | null): string {
  if (vl === null) return '—';
  return (
    new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(vl) + ' DH'
  );
}

export function formatEncours(enc: number | null): string {
  if (enc === null) return '—';
  if (enc >= 1000) return (enc / 1000).toFixed(1) + ' Mrd';
  return enc.toFixed(0) + ' MDH';
}

export function formatPerf(val: number | null): string {
  if (val === null) return '—';
  return (val >= 0 ? '+' : '') + val.toFixed(2) + '%';
}

// ── Type color maps ───────────────────────────────────────────────────────────

export const TYPE_COLORS_LIGHT: Record<string, string> = {
  'Actions':      'bg-blue-50 text-blue-700 border-blue-200',
  'Diversifiés':  'bg-teal-50 text-teal-700 border-teal-200',
  'Monétaires':   'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Obligataires': 'bg-purple-50 text-purple-700 border-purple-200',
  'Contractuels': 'bg-orange-50 text-orange-700 border-orange-200',
};

export const TYPE_COLORS_DARK: Record<string, string> = {
  'Actions':      'bg-blue-900/30 text-blue-300 border-blue-700',
  'Diversifiés':  'bg-teal-900/30 text-teal-300 border-teal-700',
  'Monétaires':   'bg-yellow-900/30 text-yellow-300 border-yellow-700',
  'Obligataires': 'bg-purple-900/30 text-purple-300 border-purple-700',
  'Contractuels': 'bg-orange-900/30 text-orange-300 border-orange-700',
};

export const FUND_TYPES = [
  'Actions',
  'Diversifiés',
  'Monétaires',
  'Obligataires',
  'Contractuels',
] as const;

export type FundType = typeof FUND_TYPES[number];
