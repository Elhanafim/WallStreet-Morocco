// Level 3 price proxy — Bourse de Casablanca (official, delayed 15 min)

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const cache = new Map<string, { price: number; ts: number }>();
const CACHE_TTL = 60_000;

function extractPrice(html: string, ticker: string): number | null {
  // CSE typically renders a table; look for price adjacent to ticker
  const t = ticker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // JSON patterns embedded in page scripts
  const jsonPat = /"(?:dernier|lastPrice|last|cours|close)"\s*:\s*([\d]+(?:[.,][\d]{1,4})?)/i;
  const m0 = html.match(jsonPat);
  if (m0) {
    const v = parseFloat(m0[1].replace(',', '.'));
    if (v > 0 && v < 999_999) return v;
  }

  // Table cell pattern: ticker in <td>, followed by price cells
  const tablePat = new RegExp(
    `<td[^>]*>\\s*${t}\\s*</td>(?:[\\s\\S]{0,500}?<td[^>]*>\\s*)([\\d]{2,6}(?:[,.]\\d{2})?)`,
    'i'
  );
  const m1 = html.match(tablePat);
  if (m1) {
    const v = parseFloat(m1[1].replace(',', '.'));
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
      source: 'casablanca-bourse', timestamp: new Date(cached.ts).toISOString(), cached: true,
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
    // Attempt 1: CSE JSON API (known internal endpoint pattern)
    const apiUrls = [
      `https://www.casablanca-bourse.com/bourseweb/api/quotation/${ticker}`,
      `https://www.casablanca-bourse.com/bourseweb/fr/Fiche-Valeur.aspx?val=${ticker}`,
    ];

    for (const url of apiUrls) {
      if (price !== null) break;
      try {
        const r = await fetch(url, { headers: HEADERS, signal: controller.signal });
        if (!r.ok) continue;
        const ct = r.headers.get('content-type') ?? '';
        if (ct.includes('json')) {
          const j = await r.json();
          const candidates = [j?.dernier, j?.lastPrice, j?.close, j?.data?.dernier];
          for (const c of candidates) {
            if (typeof c === 'number' && c > 0) { price = c; break; }
            if (typeof c === 'string') {
              const v = parseFloat(c.replace(',', '.'));
              if (v > 0) { price = v; break; }
            }
          }
        } else {
          price = extractPrice(await r.text(), ticker);
        }
      } catch { /* continue */ }
    }

    clearTimeout(timer);

    if (price !== null) {
      cache.set(ticker, { price, ts: Date.now() });
      return NextResponse.json({
        symbol: ticker, price, source: 'casablanca-bourse', timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Price not found', symbol: ticker }, { status: 404 });
  } catch (err: any) {
    clearTimeout(timer);
    console.warn(`[proxy/price-cse] ${ticker}: ${err?.message ?? 'unknown error'}`);
    return NextResponse.json({ error: 'Source unavailable', symbol: ticker }, { status: 503 });
  }
}
