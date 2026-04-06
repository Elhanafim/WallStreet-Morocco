/**
 * OPCVM Data API Route
 *
 * Three-source fallback chain:
 *   Source A: medias24.com/leboursier/opcvm-variations (ASFIM — most complete, has var_jour)
 *   Source B: opcvm-maroc.ma  (HTML table — static-rendered)
 *   Source C: data.gov.ma     (AMMC official weekly XLS — most reliable fallback)
 *
 * Results are in-memory cached for 6 hours (VL changes at most once per business day).
 *
 * GET /api/opcvm                           — all funds (with optional type/sg/sort/order filters)
 * GET /api/opcvm?_path=top&n=5&metric=...  — top + worst N funds by metric
 * GET /api/opcvm?_path=summary             — aggregated stats by type
 * POST /api/opcvm?_path=refresh            — invalidate cache
 */

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OpcvmRow {
  type:             string | null;
  name:             string;
  societe_gestion:  string | null;
  vl:               number | null;
  var_jour:         number | null;   // daily variation % (medias24 only)
  perf_1m:          number | null;
  perf_ytd:         number | null;
  perf_1an:         number | null;
  encours:          number | null;
  source:           string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const SCRAPE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.google.com/',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1',
};

function parseNum(val: unknown): number | null {
  if (val == null) return null;
  const s = String(val)
    .replace(/,/g, '.')
    .replace(/%/g, '')
    .replace(/\u00a0|\u202f/g, '')
    .replace(/\s+/g, '')
    .trim();
  if (!s || s === '-' || s === '—' || s.toLowerCase() === 'nan') return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

const HEADER_RE = /^(nan|type|catégorie|nom|fonds|societe|société|vl|perf|encours|actif|libellé|gérant|name)$/i;

const CATEGORY_MAP: Record<string, string> = {
  'action':       'Actions',
  'actions':      'Actions',
  'diversifie':   'Diversifiés',
  'diversifies':  'Diversifiés',
  'monetaire':    'Monétaires',
  'monetaires':   'Monétaires',
  'obligataire':  'Obligataires',
  'obligataires': 'Obligataires',
  'contractuel':  'Contractuels',
  'contractuels': 'Contractuels',
};

function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().trim()
    .replace(/é|è/g, 'e')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i');
  return CATEGORY_MAP[key] ?? raw.trim();
}

// ── Source A: medias24.com/leboursier/opcvm-variations ────────────────────────

async function scrapeMedias24(): Promise<{ funds: OpcvmRow[]; dataDate: string | null }> {
  const url = 'https://medias24.com/leboursier/opcvm-variations';
  const source = 'medias24.com/leboursier (ASFIM)';

  try {
    // Pre-visit homepage to get cookies
    try {
      await fetch('https://medias24.com', {
        headers: SCRAPE_HEADERS,
        signal: AbortSignal.timeout(6_000),
      });
    } catch { /* non-fatal */ }

    const res = await fetch(url, {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(18_000),
    });

    if (!res.ok) {
      console.warn(`[opcvm/A] medias24 returned ${res.status}`);
      return { funds: [], dataDate: null };
    }

    const html = await res.text();
    const funds: OpcvmRow[] = [];
    let dataDate: string | null = null;

    // Extract date (dd/mm/yyyy pattern)
    const dateMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) dataDate = dateMatch[1];

    // Extract tables — walk DOM using regex
    let currentCategory = 'Inconnu';

    // Find category headings and tables
    const headingRe = /<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi;
    const tableRe   = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const trRe      = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const tdRe      = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

    // Build a map of heading positions → category
    const headings: Array<{ pos: number; category: string }> = [];
    let hm: RegExpExecArray | null;
    while ((hm = headingRe.exec(html)) !== null) {
      const text = hm[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const norm = normalizeCategory(text);
      if (Object.values(CATEGORY_MAP).includes(norm)) {
        headings.push({ pos: hm.index, category: norm });
      }
    }

    // Parse tables, assigning category based on nearest preceding heading
    let tm: RegExpExecArray | null;
    while ((tm = tableRe.exec(html)) !== null) {
      const tablePos = tm.index;
      // Find the closest heading before this table
      const nearest = headings
        .filter(h => h.pos < tablePos)
        .sort((a, b) => b.pos - a.pos)[0];
      if (nearest) currentCategory = nearest.category;

      const tableHtml = tm[1];
      let rm: RegExpExecArray | null;
      trRe.lastIndex = 0;
      while ((rm = trRe.exec(tableHtml)) !== null) {
        const cells: string[] = [];
        let dm: RegExpExecArray | null;
        tdRe.lastIndex = 0;
        while ((dm = tdRe.exec(rm[1])) !== null) {
          cells.push(
            dm[1]
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/\s+/g, ' ')
              .trim()
          );
        }
        if (cells.length < 3) continue;
        if (!cells[0] || cells[0].length < 2) continue;
        if (HEADER_RE.test(cells[0])) continue;

        const fund: OpcvmRow = {
          type:            currentCategory,
          name:            cells[0],
          societe_gestion: cells[1] || null,
          vl:              parseNum(cells[2]),
          var_jour:        parseNum(cells[3]),
          perf_1m:         parseNum(cells[4]),
          perf_ytd:        parseNum(cells[5]),
          perf_1an:        parseNum(cells[6]),
          encours:         parseNum(cells[7]),
          source,
        };

        if (fund.vl !== null) funds.push(fund);
      }
    }

    console.log(`[opcvm/A] medias24: ${funds.length} funds (date: ${dataDate})`);
    return { funds, dataDate };

  } catch (e) {
    console.warn('[opcvm/A] medias24 scrape error:', e);
    return { funds: [], dataDate: null };
  }
}

// ── Source B: opcvm-maroc.ma HTML ─────────────────────────────────────────────

async function scrapeOpcvmMaroc(): Promise<OpcvmRow[]> {
  const source = 'opcvm-maroc.ma';
  const URLS = [
    'https://www.opcvm-maroc.ma/index.php/fr/',
    'https://www.opcvm-maroc.ma/fr/opcvm/',
    'https://www.opcvm-maroc.ma/fr/',
  ];
  for (const url of URLS) {
    try {
      const res = await fetch(url, {
        headers: SCRAPE_HEADERS,
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) continue;
      const html = await res.text();

      const rows: OpcvmRow[] = [];
      const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;

      let trM: RegExpExecArray | null;
      while ((trM = trRe.exec(html)) !== null) {
        const cells: string[] = [];
        let tdM: RegExpExecArray | null;
        while ((tdM = tdRe.exec(trM[1])) !== null) {
          cells.push(
            tdM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
          );
        }
        if (cells.length < 4) continue;
        const name = cells[1] ?? '';
        if (!name || name.length < 3 || HEADER_RE.test(name)) continue;

        rows.push({
          type:            cells[0] || null,
          name,
          societe_gestion: cells[2] || null,
          vl:              parseNum(cells[3]),
          var_jour:        null,
          perf_1m:         parseNum(cells[4]),
          perf_ytd:        parseNum(cells[5]),
          perf_1an:        parseNum(cells[6]),
          encours:         parseNum(cells[7]),
          source,
        });
      }

      if (rows.length > 0) {
        console.log(`[opcvm/B] ${rows.length} funds from ${url}`);
        return rows;
      }
    } catch (e) {
      console.warn(`[opcvm/B] Failed ${url}:`, e);
    }
  }
  return [];
}

// ── Source C: data.gov.ma AMMC weekly XLS ────────────────────────────────────

const DATAGOV_DATASET_URLS = [
  'https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2026',
  'https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025',
];

async function findLatestXlsUrl(): Promise<string | null> {
  const hrefRe = /href="([^"]*\.xlsx?)"/gi;
  for (const datasetUrl of DATAGOV_DATASET_URLS) {
    try {
      const res = await fetch(datasetUrl, { headers: SCRAPE_HEADERS, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) continue;
      const html = await res.text();
      const links: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = hrefRe.exec(html)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) href = 'https://data.gov.ma' + href;
        links.push(href);
      }
      if (links.length > 0) return links[links.length - 1];
    } catch (e) {
      console.warn(`[opcvm/C] Failed ${datasetUrl}:`, e);
    }
  }
  return null;
}

async function scrapeDataGovXls(): Promise<OpcvmRow[]> {
  const source = 'data.gov.ma (AMMC)';
  try {
    const xlsUrl = await findLatestXlsUrl();
    if (!xlsUrl) return [];

    const res = await fetch(xlsUrl, { headers: SCRAPE_HEADERS, signal: AbortSignal.timeout(25_000) });
    if (!res.ok) return [];

    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];

    let rawRows: unknown[][] = [];
    for (const skip of [3, 2, 1, 0]) {
      const all = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, range: skip });
      if (all.length > 5) { rawRows = all; break; }
    }

    const funds: OpcvmRow[] = [];
    for (const row of rawRows) {
      if (!Array.isArray(row) || row.length < 4) continue;
      const name    = String(row[1] ?? '').trim();
      const typeVal = String(row[0] ?? '').trim();
      if (!name || name.length < 2 || /^nan$/i.test(name)) continue;
      if (HEADER_RE.test(name) || HEADER_RE.test(typeVal)) continue;

      funds.push({
        type:            /^nan$/i.test(typeVal) ? null : normalizeCategory(typeVal),
        name,
        societe_gestion: String(row[2] ?? '').trim() || null,
        vl:              parseNum(row[3]),
        var_jour:        null,
        perf_1m:         parseNum(row[4]),
        perf_ytd:        parseNum(row[5]),
        perf_1an:        parseNum(row[6]),
        encours:         parseNum(row[7]),
        source,
      });
    }

    console.log(`[opcvm/C] ${funds.length} funds from data.gov.ma`);
    return funds;
  } catch (e) {
    console.warn('[opcvm/C] XLS error:', e);
    return [];
  }
}

// ── In-memory cache (6 hours) ─────────────────────────────────────────────────

interface CacheEntry {
  funds:        OpcvmRow[];
  source:       string;
  data_date:    string | null;
  last_updated: string;
  by_type:      Record<string, number>;
  ts:           number;
}

let _cache: CacheEntry | null = null;
const CACHE_TTL = 6 * 60 * 60_000; // 6 hours

async function getOpcvmData(): Promise<CacheEntry> {
  const now = Date.now();
  if (_cache && now - _cache.ts < CACHE_TTL && _cache.funds.length > 0) return _cache;

  // Source A: medias24.com (primary)
  let { funds, dataDate } = await scrapeMedias24();
  let source = 'medias24.com/leboursier (ASFIM)';

  // Source B: opcvm-maroc.ma
  if (!funds.length) {
    funds  = await scrapeOpcvmMaroc();
    source = 'opcvm-maroc.ma';
    dataDate = null;
  }

  // Source C: data.gov.ma
  if (!funds.length) {
    funds  = await scrapeDataGovXls();
    source = 'data.gov.ma (AMMC)';
    dataDate = null;
  }

  const by_type: Record<string, number> = {};
  for (const f of funds) {
    const t = f.type ?? 'Autre';
    by_type[t] = (by_type[t] ?? 0) + 1;
  }

  const entry: CacheEntry = {
    funds,
    source:       funds.length ? source : 'unavailable',
    data_date:    dataDate,
    last_updated: new Date().toISOString(),
    by_type,
    ts:           now,
  };

  if (funds.length > 0) _cache = entry;
  return entry;
}

// ── Route handlers ────────────────────────────────────────────────────────────

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const path   = searchParams.get('_path') ?? '';
  const type   = searchParams.get('type');
  const sg     = searchParams.get('sg');
  const sort   = searchParams.get('sort')   ?? 'perf_ytd';
  const order  = searchParams.get('order')  ?? 'desc';

  const data = await getOpcvmData();

  // /api/opcvm?_path=summary
  if (path === 'summary') {
    const byType: Record<string, {
      count: number;
      avg_ytd: number | null;
      best_ytd: number | null;
      worst_ytd: number | null;
      best_fund: string | null;
      total_encours: number;
    }> = {};
    for (const f of data.funds) {
      const t = f.type ?? 'Autre';
      if (!byType[t]) byType[t] = { count: 0, avg_ytd: null, best_ytd: null, worst_ytd: null, best_fund: null, total_encours: 0 };
      byType[t].count++;
      if (f.encours) byType[t].total_encours += f.encours;
    }
    for (const t of Object.keys(byType)) {
      const vals = data.funds.filter(f => (f.type ?? 'Autre') === t && f.perf_ytd != null);
      if (vals.length) {
        const ytds = vals.map(f => f.perf_ytd!);
        byType[t].avg_ytd   = Math.round((ytds.reduce((a, b) => a + b, 0) / ytds.length) * 100) / 100;
        byType[t].best_ytd  = Math.max(...ytds);
        byType[t].worst_ytd = Math.min(...ytds);
        const best = vals.sort((a, b) => b.perf_ytd! - a.perf_ytd!)[0];
        byType[t].best_fund = best?.name ?? null;
      }
    }
    return NextResponse.json(
      {
        summary:       byType,
        total_funds:   data.funds.length,
        total_encours: data.funds.reduce((s, f) => s + (f.encours ?? 0), 0),
        source:        data.source,
        data_date:     data.data_date,
        last_updated:  data.last_updated,
        by_type:       data.by_type,
      },
      { headers: CACHE_HEADERS }
    );
  }

  let funds = [...data.funds];

  // Filters
  if (type) funds = funds.filter(f => (f.type ?? '').toLowerCase().includes(type.toLowerCase()));
  if (sg)   funds = funds.filter(f => (f.societe_gestion ?? '').toLowerCase().includes(sg.toLowerCase()));

  // Sort
  const reverse = order !== 'asc';
  funds.sort((a, b) => {
    const va = (a as unknown as Record<string, number | null>)[sort] ?? null;
    const vb = (b as unknown as Record<string, number | null>)[sort] ?? null;
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return reverse ? vb - va : va - vb;
  });

  // /api/opcvm?_path=top
  if (path === 'top') {
    const n      = Math.max(1, Math.min(50, parseInt(searchParams.get('n') ?? '5')));
    const metric = searchParams.get('metric') ?? 'perf_ytd';
    const elig   = funds.filter(f => (f as Record<string, unknown>)[metric] != null);
    return NextResponse.json(
      {
        top:          elig.slice(0, n),
        worst:        elig.slice(-n),
        metric,
        source:       data.source,
        data_date:    data.data_date,
        last_updated: data.last_updated,
      },
      { headers: CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      funds,
      count:        funds.length,
      total:        data.funds.length,
      source:       data.source,
      data_date:    data.data_date,
      last_updated: data.last_updated,
      by_type:      data.by_type,
      error:        funds.length === 0,
    },
    { headers: CACHE_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  if (searchParams.get('_path') === 'refresh') {
    _cache = null;
    const data = await getOpcvmData();
    return NextResponse.json({
      refreshed:    true,
      total:        data.funds.length,
      source:       data.source,
      data_date:    data.data_date,
    });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
