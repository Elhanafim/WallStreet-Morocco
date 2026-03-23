// Level 2 price proxy — BMCE Capital Bourse
// Server-side fetch, no CORS restriction.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const cache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000;

function extractPrice(html: string, ticker: string): number | null {
  const jsonPatterns = [
    /"(?:dernier|last|cours|price|close|lastPrice)"\s*:\s*([\d]+(?:[.,][\d]{1,4})?)/i,
    /(?:dernier|lastPrice|cours)\s*[=:]\s*([\d]+(?:[.,][\d]{1,4})?)/i,
  ];
  for (const p of jsonPatterns) {
    const m = html.match(p);
    if (m) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v > 0 && v < 999_999) return v;
    }
  }

  const t = ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m2 = html.match(new RegExp(`${t}[\\s\\S]{0,300}?([\\d]{2,6}(?:[.,][\\d]{2})?)`, 'i'));
  if (m2) {
    const v = parseFloat(m2[1].replace(',', '.'));
    if (v > 0 && v < 999_999) return v;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const ticker = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });

  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      symbol: ticker, price: cached.price,
      source: 'bmcebourse', timestamp: new Date(cached.ts).toISOString(), cached: true,
    });
  }

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WallStreetMorocco/1.0)',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'fr-MA,fr;q=0.9',
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);
  let price: number | null = null;

  try {
    // Attempt 1: internal XHR API (common BMCE Bourse pattern)
    const apiUrls = [
      `https://www.bmcecapitalbourse.com/bkbbourse/api/instruments/${ticker}`,
      `https://www.bmcecapitalbourse.com/bkbbourse/api/quotes?symbol=${ticker}`,
    ];

    for (const url of apiUrls) {
      if (price !== null) break;
      try {
        const r = await fetch(url, { headers: HEADERS, signal: controller.signal });
        if (r.ok && (r.headers.get('content-type') ?? '').includes('json')) {
          const j = await r.json();
          const candidates = [j?.dernier, j?.lastPrice, j?.cours, j?.data?.dernier, j?.data?.[0]?.dernier];
          for (const c of candidates) {
            if (typeof c === 'number' && c > 0) { price = c; break; }
            if (typeof c === 'string') {
              const v = parseFloat(c.replace(',', '.'));
              if (v > 0) { price = v; break; }
            }
          }
        }
      } catch { /* continue */ }
    }

    // Attempt 2: HTML page
    if (price === null) {
      try {
        const pageRes = await fetch(
          `https://www.bmcecapitalbourse.com/bkbbourse/lists/?search=${ticker}`,
          { headers: HEADERS, signal: controller.signal }
        );
        if (pageRes.ok) price = extractPrice(await pageRes.text(), ticker);
      } catch { /* continue */ }
    }

    clearTimeout(timer);

    if (price !== null) {
      cache.set(ticker, { price, ts: Date.now() });
      return NextResponse.json({ symbol: ticker, price, source: 'bmcebourse', timestamp: new Date().toISOString() });
    }

    return NextResponse.json({ error: 'Price not found', symbol: ticker }, { status: 404 });
  } catch (err: any) {
    clearTimeout(timer);
    console.warn(`[proxy/price-bmce] ${ticker}: ${err?.message ?? 'unknown error'}`);
    return NextResponse.json({ error: 'Source unavailable', symbol: ticker }, { status: 503 });
  }
}
