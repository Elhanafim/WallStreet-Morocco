/**
 * OPCVM Data API Route
 *
 * Ports the Python scraper logic directly into Next.js — no external service needed.
 *
 * Source A: opcvm-maroc.ma  (HTML table — static-rendered)
 * Source B: data.gov.ma     (AMMC official weekly XLS — most reliable)
 *
 * Both are tried in sequence; the first that returns data wins.
 * Results are in-memory cached for 5 minutes.
 *
 * GET /api/opcvm                    — all funds (with optional type/sg/sort/order filters)
 * GET /api/opcvm?_path=top&n=5     — top N funds by metric
 */

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OpcvmRow {
  type:             string | null;
  name:             string;
  societe_gestion:  string | null;
  vl:               number | null;
  perf_1m:          number | null;
  perf_ytd:         number | null;
  perf_1an:         number | null;
  encours:          number | null;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const SCRAPE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  Referer: 'https://www.google.com',
};

function parseNum(val: unknown): number | null {
  if (val == null) return null;
  const s = String(val)
    .replace(',', '.')
    .replace('%', '')
    .replace(/\u00a0/g, '')   // &nbsp;
    .replace(/\s+/g, '')
    .trim();
  if (!s || s === '-' || s.toLowerCase() === 'nan') return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

const HEADER_NAMES = /^(nan|type|catégorie|nom|fonds|societe|société|vl|perf|encours|actif)$/i;

// ── Source A: opcvm-maroc.ma HTML ─────────────────────────────────────────────

async function scrapeOpcvmMaroc(): Promise<OpcvmRow[]> {
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
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Extract all <td> cells grouped by <tr>
      const rows: OpcvmRow[] = [];
      const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;

      let trM: RegExpExecArray | null;
      while ((trM = trRe.exec(html)) !== null) {
        const cells: string[] = [];
        let tdM: RegExpExecArray | null;
        while ((tdM = tdRe.exec(trM[1])) !== null) {
          cells.push(
            tdM[1]
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/\s+/g, ' ')
              .trim()
          );
        }
        if (cells.length < 4) continue;
        const name = cells[1] ?? '';
        if (!name || name.length < 3 || HEADER_NAMES.test(name)) continue;

        rows.push({
          type:            cells[0] || null,
          name,
          societe_gestion: cells[2] || null,
          vl:              parseNum(cells[3]),
          perf_1m:         parseNum(cells[4]),
          perf_ytd:        parseNum(cells[5]),
          perf_1an:        parseNum(cells[6]),
          encours:         parseNum(cells[7]),
        });
      }

      if (rows.length > 0) {
        console.log(`[opcvm/A] ${rows.length} funds from ${url}`);
        return rows;
      }
    } catch (e) {
      console.warn(`[opcvm/A] Failed ${url}:`, e);
    }
  }
  return [];
}

// ── Source B: data.gov.ma AMMC weekly XLS ────────────────────────────────────

const DATAGOV_DATASET_URLS = [
  'https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2026',
  'https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025',
];

async function findLatestXlsUrl(): Promise<string | null> {
  const hrefRe = /href="([^"]*\.xlsx?)"/gi;
  for (const datasetUrl of DATAGOV_DATASET_URLS) {
    try {
      const res = await fetch(datasetUrl, {
        headers: SCRAPE_HEADERS,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const links: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = hrefRe.exec(html)) !== null) {
        let href = m[1];
        if (!href.startsWith('http')) href = 'https://data.gov.ma' + href;
        links.push(href);
      }
      if (links.length > 0) {
        const url = links[links.length - 1]; // most recent file last
        console.log(`[opcvm/B] XLS found: ${url}`);
        return url;
      }
    } catch (e) {
      console.warn(`[opcvm/B] Failed ${datasetUrl}:`, e);
    }
  }
  return null;
}

async function scrapeDataGovXls(): Promise<OpcvmRow[]> {
  try {
    const xlsUrl = await findLatestXlsUrl();
    if (!xlsUrl) return [];

    const res = await fetch(xlsUrl, {
      headers: SCRAPE_HEADERS,
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return [];

    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];

    // Try a few skipRows strategies; stop when we get a usable table
    let rawRows: unknown[][] = [];
    for (const skip of [3, 2, 1, 0]) {
      const all = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        range: skip,
      });
      if (all.length > 5) { rawRows = all; break; }
    }

    const funds: OpcvmRow[] = [];
    for (const row of rawRows) {
      if (!Array.isArray(row) || row.length < 4) continue;
      const name    = String(row[1] ?? '').trim();
      const typeVal = String(row[0] ?? '').trim();
      if (!name || name.length < 2) continue;
      if (HEADER_NAMES.test(name) || HEADER_NAMES.test(typeVal)) continue;
      if (/^nan$/i.test(name)) continue;

      funds.push({
        type:            /^nan$/i.test(typeVal) ? null : (typeVal || null),
        name,
        societe_gestion: String(row[2] ?? '').trim() || null,
        vl:              parseNum(row[3]),
        perf_1m:         parseNum(row[4]),
        perf_ytd:        parseNum(row[5]),
        perf_1an:        parseNum(row[6]),
        encours:         parseNum(row[7]),
      });
    }

    console.log(`[opcvm/B] ${funds.length} funds from data.gov.ma XLS`);
    return funds;
  } catch (e) {
    console.warn('[opcvm/B] XLS parse error:', e);
    return [];
  }
}

// ── In-memory cache (5 min) ───────────────────────────────────────────────────

interface CacheEntry {
  funds:        OpcvmRow[];
  source:       string;
  last_updated: string;
  ts:           number;
}

let _cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60_000;

async function getOpcvmData(): Promise<CacheEntry> {
  const now = Date.now();
  if (_cache && now - _cache.ts < CACHE_TTL) return _cache;

  // Source A
  let funds = await scrapeOpcvmMaroc();
  let source = 'opcvm-maroc.ma';

  // Source B
  if (!funds.length) {
    funds = await scrapeDataGovXls();
    source = 'data.gov.ma (AMMC)';
  }

  const entry: CacheEntry = {
    funds,
    source:       funds.length ? source : 'unavailable',
    last_updated: new Date().toISOString(),
    ts:           now,
  };

  if (funds.length > 0) _cache = entry;
  return entry;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const path   = searchParams.get('_path') ?? '';
  const type   = searchParams.get('type');
  const sg     = searchParams.get('sg');
  const sort   = searchParams.get('sort')  ?? 'perf_ytd';
  const order  = searchParams.get('order') ?? 'desc';

  const data  = await getOpcvmData();
  let funds   = [...data.funds];

  // Filters
  if (type) funds = funds.filter(f => (f.type ?? '').toLowerCase().includes(type.toLowerCase()));
  if (sg)   funds = funds.filter(f => (f.societe_gestion ?? '').toLowerCase().includes(sg.toLowerCase()));

  // Sort
  const reverse = order !== 'asc';
  funds.sort((a, b) => {
    const va = (a as Record<string, number | null>)[sort] ?? -Infinity;
    const vb = (b as Record<string, number | null>)[sort] ?? -Infinity;
    return reverse ? vb - va : va - vb;
  });

  const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  // /api/opcvm?_path=top
  if (path === 'top') {
    const n      = Math.max(1, Math.min(50, parseInt(searchParams.get('n') ?? '5')));
    const metric = searchParams.get('metric') ?? 'perf_ytd';
    const eligible = funds.filter(f => (f as Record<string, unknown>)[metric] != null);
    return NextResponse.json(
      { top: eligible.slice(0, n), metric, source: data.source, last_updated: data.last_updated },
      { headers: CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      funds,
      count:        funds.length,
      source:       data.source,
      last_updated: data.last_updated,
      error:        funds.length === 0,
    },
    { headers: CACHE_HEADERS }
  );
}
