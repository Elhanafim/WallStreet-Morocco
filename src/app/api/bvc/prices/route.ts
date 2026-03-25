/**
 * BVC Market Data API Route
 *
 * Proxies the official Casablanca Bourse REST API.
 * Uses Node.js https module with rejectUnauthorized:false because
 * casablanca-bourse.com has SSL cert issues that block Node fetch.
 *
 * GET /api/bvc/prices           → full snapshot
 * GET /api/bvc/prices?ticker=BOA → single ticker
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const BVC_HOST = 'www.casablanca-bourse.com';
const BVC_PATH = '/api/proxy/fr/api/bourse/dashboard/ticker?marche=59&class%5B%5D=50';

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json, */*',
  'Accept-Language': 'fr-MA,fr;q=0.9',
  Referer: 'https://www.casablanca-bourse.com/fr/live-market/marche-actions-listing',
  Host: BVC_HOST,
};

// In-memory cache — survives warm Lambda invocations
let _cache: { data: NormalizedPrice[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

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

function parseFloat0(v: unknown): number {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? 0 : n;
}

function normalize(raw: Record<string, unknown>): NormalizedPrice {
  const current = parseFloat0(raw.field_cours_courant);
  const close   = parseFloat0(raw.field_closing_price);
  const lastPrice = current > 0 ? current : close;
  return {
    ticker:         String(raw.ticker ?? '').toUpperCase(),
    name:           String(raw.label ?? raw.ticker ?? ''),
    lastPrice,
    change:         parseFloat0(raw.field_difference),
    changePercent:  parseFloat0(raw.field_var_veille),
    open:           parseFloat0(raw.field_opening_price),
    high:           parseFloat0(raw.field_high_price),
    low:            parseFloat0(raw.field_low_price),
    volume:         parseFloat0(raw.field_cumul_volume_echange),
    referencePrice: parseFloat0(raw.field_static_reference_price),
    timestamp:      new Date().toISOString(),
    source:         'casablanca-bourse',
    available:      lastPrice > 0,
  };
}

/** HTTPS request with TLS verification disabled (BVC cert issues). */
function httpsGet(host: string, path: string, headers: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path,
        method: 'GET',
        headers,
        rejectUnauthorized: false, // BVC uses a self-signed/expired cert
        timeout: 12_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
          } else {
            resolve(body);
          }
        });
      }
    );
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.on('error', reject);
    req.end();
  });
}

async function fetchAll(): Promise<NormalizedPrice[]> {
  const body = await httpsGet(BVC_HOST, BVC_PATH, REQUEST_HEADERS);
  const json = JSON.parse(body);
  const values: Record<string, unknown>[] = json?.data?.values ?? [];
  if (values.length === 0) throw new Error('BVC API returned empty values');
  return values.map(normalize).filter((p) => p.ticker && p.available);
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams
    .get('ticker')?.toUpperCase().replace('CSEMA:', '').trim();

  try {
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

    return NextResponse.json(
      { data: all, count: all.length, timestamp: new Date().toISOString() },
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
