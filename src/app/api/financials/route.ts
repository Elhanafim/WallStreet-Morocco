/**
 * Financials API Route
 *
 * Exposes financial data for a single BVC ticker by proxying the
 * local Python FastAPI microservice (which uses BVCscrap).
 *
 * GET /api/financials?ticker=NKL
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'http://localhost:8001/api/financials';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams
    .get('ticker')
    ?.toUpperCase()
    .replace('CSEMA:', '')
    .trim();

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}?ticker=${ticker}`, {
      // Cache briefly in Next.js, though FastAPI handles the main caching logic
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: `Ticker '${ticker}' not found`, ticker, indicators: [] },
          { status: 404 }
        );
      }
      const errText = await res.text();
      throw new Error(`Python API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/financials] Error fetching from FastAPI:', msg);
    return NextResponse.json(
      { error: msg, ticker, indicators: [] }, 
      { status: 503 }
    );
  }
}
