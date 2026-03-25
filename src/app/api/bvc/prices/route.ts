/**
 * BVC Market Data API Route
 *
 * Proxies the official Casablanca Bourse API:
 *   https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/ticker
 *
 * GET /api/bvc/prices           → full snapshot (all 113 instruments)
 * GET /api/bvc/prices?ticker=BOA → single ticker
 *
 * No Python microservice needed — runs on Vercel as a Node.js serverless function.
 */

import { NextRequest, NextResponse } from 'next/server';

const BVC_API =
  'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/ticker';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, */*',
  'Accept-Language': 'fr-MA,fr;q=0.9',
  Referer: 'https://www.casablanca-bourse.com/fr/live-market/marche-actions-listing',
};

// In-memory cache: survives warm Lambda invocations (typically ~60 s)
let _cache: { data: NormalizedPrice[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export interface NormalizedPrice {
  ticker: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  referencePrice: number;
  timestamp: string;
  source: string;
  available: boolean;
}

function normalize(raw: Record<string, unknown>): NormalizedPrice {
  const current = parseFloat(String(raw.field_cours_courant ?? 0));
  const close   = parseFloat(String(raw.field_closing_price ?? 0));
  const lastPrice = current > 0 ? current : close;

  return {
    ticker:         String(raw.ticker ?? '').toUpperCase(),
    name:           String(raw.label ?? raw.ticker ?? ''),
    lastPrice,
    change:         parseFloat(String(raw.field_difference ?? 0)),
    changePercent:  parseFloat(String(raw.field_var_veille ?? 0)),
    open:           parseFloat(String(raw.field_opening_price ?? 0)),
    high:           parseFloat(String(raw.field_high_price ?? 0)),
    low:            parseFloat(String(raw.field_low_price ?? 0)),
    volume:         parseFloat(String(raw.field_cumul_volume_echange ?? 0)),
    referencePrice: parseFloat(String(raw.field_static_reference_price ?? 0)),
    timestamp:      new Date().toISOString(),
    source:         'casablanca-bourse',
    available:      lastPrice > 0,
  };
}

async function fetchAll(): Promise<NormalizedPrice[]> {
  const res = await fetch(
    `${BVC_API}?marche=59&class%5B%5D=50`,
    { headers: HEADERS, next: { revalidate: 0 } }
  );

  if (!res.ok) {
    throw new Error(`BVC API returned ${res.status}`);
  }

  const json = await res.json();
  const values: Record<string, unknown>[] = json?.data?.values ?? [];

  if (values.length === 0) {
    throw new Error('BVC API returned empty data');
  }

  return values
    .map(normalize)
    .filter((p) => p.ticker && p.available);
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase().replace('CSEMA:', '').trim();

  try {
    // Serve from cache if fresh
    const now = Date.now();
    if (!_cache || now - _cache.ts > CACHE_TTL) {
      const data = await fetchAll();
      _cache = { data, ts: now };
    }

    const all = _cache.data;

    if (ticker) {
      const found = all.find((p) => p.ticker === ticker);
      if (!found) {
        return NextResponse.json(
          { error: `Ticker '${ticker}' not found`, available: false, lastPrice: 0 },
          { status: 404 }
        );
      }
      return NextResponse.json(found, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    // Full snapshot
    return NextResponse.json(
      { data: all, count: all.length, timestamp: new Date().toISOString(), cached: now - _cache.ts < 1000 },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/bvc/prices]', msg);
    return NextResponse.json(
      { error: msg, available: false, lastPrice: 0 },
      { status: 503 }
    );
  }
}
