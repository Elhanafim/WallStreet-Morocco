// Level 1 price proxy — Wafa Bourse
// Fetches server-side (no CORS) and returns { price, source, timestamp } or { error }.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// In-memory cache: ticker → { price, timestamp }
const cache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000; // 60 seconds

/** Try to extract a MAD price from raw HTML using common patterns. */
function extractPrice(html: string, ticker: string): number | null {
  // Pattern 1: JSON-like data attributes e.g. "lastPrice":412.50 or "cours":412.50
  const jsonPatterns = [
    /"(?:lastPrice|last_price|cours|price|dernier|close)"\s*:\s*([\d]+(?:[.,][\d]{1,4})?)/i,
    /(?:lastPrice|last_price|cours|price|dernier|close)["']?\s*[=:]\s*["']?([\d]+(?:[.,][\d]{1,4})?)/i,
  ];
  for (const pattern of jsonPatterns) {
    const m = html.match(pattern);
    if (m) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v > 0 && v < 999_999) return v;
    }
  }

  // Pattern 2: ticker near a price (look for ticker followed by whitespace/tags then a number)
  const tickerEscaped = ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nearTickerPattern = new RegExp(
    `${tickerEscaped}[\\s\\S]{0,200}?([\\d]{2,6}(?:[.,][\\d]{2})?)\\s*(?:MAD|DH|DHS)?`,
    'i'
  );
  const m2 = html.match(nearTickerPattern);
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
  if (!ticker) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      symbol: ticker,
      price: cached.price,
      source: 'wafabourse',
      timestamp: new Date(cached.ts).toISOString(),
      cached: true,
    });
  }

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; WallStreetMorocco/1.0)',
    'Accept': 'text/html,application/json,*/*',
    'Accept-Language': 'fr-MA,fr;q=0.9',
  };

  const TIMEOUT = 4_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    // Attempt 1: JSON search API (common internal SPA pattern)
    const apiUrl = `https://www.wafabourse.com/api/instruments/search?q=${ticker}&limit=1`;
    let price: number | null = null;

    try {
      const apiRes = await fetch(apiUrl, {
        headers: HEADERS,
        signal: controller.signal,
      });
      if (apiRes.ok) {
        const ct = apiRes.headers.get('content-type') ?? '';
        if (ct.includes('json')) {
          const json = await apiRes.json();
          // Look for price in common JSON shapes
          const candidates = [
            json?.data?.[0]?.lastPrice,
            json?.data?.[0]?.cours,
            json?.[0]?.lastPrice,
            json?.[0]?.cours,
            json?.price,
          ];
          for (const c of candidates) {
            if (typeof c === 'number' && c > 0) { price = c; break; }
            if (typeof c === 'string') {
              const v = parseFloat(c.replace(',', '.'));
              if (v > 0) { price = v; break; }
            }
          }
        }
      }
    } catch {
      // API attempt failed — silently continue to HTML scrape
    }

    // Attempt 2: HTML page scrape
    if (price === null) {
      const pageUrl = `https://www.wafabourse.com/fr/market-tracking/instruments-financiers?search=${ticker}`;
      try {
        const pageRes = await fetch(pageUrl, {
          headers: HEADERS,
          signal: controller.signal,
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          price = extractPrice(html, ticker);
        }
      } catch {
        // HTML scrape failed — continue
      }
    }

    clearTimeout(timer);

    if (price !== null) {
      cache.set(ticker, { price, ts: Date.now() });
      return NextResponse.json({
        symbol: ticker,
        price,
        source: 'wafabourse',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Price not found', symbol: ticker }, { status: 404 });
  } catch (err: any) {
    clearTimeout(timer);
    // 403 / CAPTCHA / timeout — log silently, return 503
    console.warn(`[proxy/price] ${ticker}: ${err?.message ?? 'unknown error'}`);
    return NextResponse.json({ error: 'Source unavailable', symbol: ticker }, { status: 503 });
  }
}
