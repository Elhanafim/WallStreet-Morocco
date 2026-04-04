/**
 * Medias24 proxy — sourced from iamleblanc/StocksMA data-source patterns
 * Proxies: https://medias24.com/content/api?method=getStockInfo&ISIN={isin}&format=json
 *
 * GET /api/medias24?isin=MA0000011488
 * GET /api/medias24?method=getBestPerformers
 * GET /api/medias24?method=getWorstPerformers
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://medias24.com/content/api';

// User-Agent pool matching StocksMA pattern
const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

function pickUA(): string {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const isin   = searchParams.get('isin');
  const method = searchParams.get('method');

  let url: string;
  if (method === 'getBestPerformers') {
    url = `${BASE}?method=getBestPerformers&format=json`;
  } else if (method === 'getWorstPerformers') {
    url = `${BASE}?method=getWorstPerformers&format=json`;
  } else if (isin) {
    url = `${BASE}?method=getStockInfo&ISIN=${encodeURIComponent(isin)}&format=json`;
  } else {
    return NextResponse.json({ error: 'isin or method required' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': pickUA(),
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://medias24.com/',
        'Origin': 'https://medias24.com',
      },
      signal: AbortSignal.timeout(6_000),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Medias24 returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unavailable' },
      { status: 503 }
    );
  }
}
