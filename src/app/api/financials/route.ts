/**
 * Financials API Route
 *
 * Fetches financial data for a single BVC ticker.
 *
 * Strategy:
 * 1. Try the local Python FastAPI microservice (scrapes BVC directly).
 * 2. If that fails, fall back to Yahoo Finance using the TICKER.CS convention
 *    (e.g. ATW.CS, IAM.CS) which is how BVC stocks are quoted on Yahoo.
 *
 * GET /api/financials?ticker=NKL
 */

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API = process.env.PRICE_SERVICE_URL
  ? `${process.env.PRICE_SERVICE_URL}/api/financials`
  : 'http://localhost:8001/api/financials';

const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote';

// ── Yahoo Finance helpers ──────────────────────────────────────────────────────

interface YahooQuoteResult {
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketChange?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  trailingAnnualDividendRate?: number;
  ytdReturn?: number;
  floatShares?: number;
  sharesOutstanding?: number;
  shortName?: string;
  longName?: string;
}

async function fetchYahoo(ticker: string): Promise<YahooQuoteResult | null> {
  const yfTicker = `${ticker}.CS`;
  try {
    const res = await fetch(
      `${YAHOO_QUOTE}?symbols=${encodeURIComponent(yfTicker)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,averageDailyVolume3Month,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,trailingPE,priceToBook,dividendYield,trailingAnnualDividendRate,floatShares,sharesOutstanding`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8_000),
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.quoteResponse?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

function buildFromYahoo(ticker: string, q: YahooQuoteResult) {
  return {
    ticker,
    sector: null,
    currentPrice:      q.regularMarketPrice          ?? null,
    performance:       q.regularMarketChangePercent   ?? null,
    marketCap:         q.marketCap                    ?? null,
    peRatio:           q.trailingPE                   ?? null,
    avgVolume30d:      q.averageDailyVolume3Month      ?? null,
    ytdChange:         q.ytdReturn                    ?? null,
    high52w:           q.fiftyTwoWeekHigh             ?? null,
    low52w:            q.fiftyTwoWeekLow              ?? null,
    open:              q.regularMarketOpen             ?? null,
    high:              q.regularMarketDayHigh          ?? null,
    low:               q.regularMarketDayLow           ?? null,
    volume:            q.regularMarketVolume           ?? null,
    priceToBook:       q.priceToBook                  ?? null,
    dividendYield:     q.dividendYield != null ? q.dividendYield * 100 : null,
    dividendPerShare:  q.trailingAnnualDividendRate    ?? null,
    estimatedRevenue:  null,
    estimatedNetIncome: null,
    indicators:        [],
    source:            'yahoo-finance',
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams
    .get('ticker')
    ?.toUpperCase()
    .replace('CSEMA:', '')
    .trim();

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 });
  }

  // 1. Try Python microservice (BVC scraper)
  try {
    const res = await fetch(`${PYTHON_API}?ticker=${ticker}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6_000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(
        { ...data, source: 'casablanca-bourse' },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
      );
    }
  } catch {
    // Python service unavailable — fall through to Yahoo Finance
  }

  // 2. Fall back to Yahoo Finance (TICKER.CS)
  const yf = await fetchYahoo(ticker);
  if (yf) {
    return NextResponse.json(
      buildFromYahoo(ticker, yf),
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
  }

  // 3. Both sources failed
  return NextResponse.json(
    {
      error: 'Données temporairement indisponibles. Veuillez réessayer.',
      ticker,
      indicators: [],
      source: 'unavailable',
    },
    { status: 503 }
  );
}
