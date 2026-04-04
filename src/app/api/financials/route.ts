/**
 * Financials API Route
 *
 * Data strategy (in priority order):
 * 1. BVC Prices API (/api/bvc/prices) — always available, gives real-time
 *    price + volume + OHLC data directly from Casablanca Bourse.
 * 2. Yahoo Finance (TICKER.CS) — enriches with P/E, market cap, 52w range.
 *    Optional: shown if available, silently omitted if not.
 * 3. Never proxies localhost — no dependency on the Python microservice.
 *
 * GET /api/financials?ticker=ADH
 */

import { NextRequest, NextResponse } from 'next/server';

const YAHOO_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote';

// ── Yahoo Finance helper ──────────────────────────────────────────────────────

interface YFQuote {
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
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
  epsTrailingTwelveMonths?: number;
  ytdReturn?: number;
}

async function fetchYahoo(ticker: string): Promise<YFQuote | null> {
  const fields = [
    'regularMarketPrice', 'regularMarketChangePercent', 'regularMarketOpen',
    'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketVolume',
    'averageDailyVolume3Month', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
    'marketCap', 'trailingPE', 'priceToBook', 'dividendYield',
    'trailingAnnualDividendRate', 'epsTrailingTwelveMonths', 'ytdReturn',
  ].join(',');
  try {
    const res = await fetch(
      `${YAHOO_QUOTE}?symbols=${ticker}.CS&fields=${fields}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5_000),
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.quoteResponse?.result?.[0] as YFQuote) ?? null;
  } catch {
    return null;
  }
}

// ── BVC Price helper ──────────────────────────────────────────────────────────

interface BVCPrice {
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
  available: boolean;
}

async function fetchBVCPrice(ticker: string, origin: string): Promise<BVCPrice | null> {
  try {
    const res = await fetch(
      `${origin}/api/bvc/prices?ticker=${encodeURIComponent(ticker)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as BVCPrice;
    return data.available ? data : null;
  } catch {
    return null;
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams
    .get('ticker')
    ?.toUpperCase()
    .replace('CSEMA:', '')
    .trim();

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;

  // Fetch BVC price and Yahoo Finance in parallel
  const [bvc, yf] = await Promise.all([
    fetchBVCPrice(ticker, origin),
    fetchYahoo(ticker),
  ]);

  // Nothing at all — return 503
  if (!bvc && !yf) {
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

  // Build indicators list from what we have
  const indicators: { name: string; value: number | null; trend: number | null }[] = [];

  if (bvc) {
    indicators.push(
      { name: 'Cours actuel (MAD)',    value: bvc.lastPrice,       trend: bvc.changePercent },
      { name: 'Variation séance (%)',  value: bvc.changePercent,   trend: null },
      { name: 'Cours ref. veille',      value: bvc.referencePrice,  trend: null },
      { name: 'Ouverture',              value: bvc.open,            trend: null },
      { name: 'Plus haut séance',       value: bvc.high,            trend: null },
      { name: 'Plus bas séance',        value: bvc.low,             trend: null },
      { name: 'Volume échangé',         value: bvc.volume,          trend: null },
    );
  }

  if (yf) {
    if (yf.averageDailyVolume3Month != null)
      indicators.push({ name: 'Vol. moyen 30j',        value: yf.averageDailyVolume3Month,      trend: null });
    if (yf.fiftyTwoWeekHigh != null)
      indicators.push({ name: 'Plus haut 52 sem.',     value: yf.fiftyTwoWeekHigh,              trend: null });
    if (yf.fiftyTwoWeekLow != null)
      indicators.push({ name: 'Plus bas 52 sem.',      value: yf.fiftyTwoWeekLow,               trend: null });
    if (yf.marketCap != null)
      indicators.push({ name: 'Capitalisation bours.', value: yf.marketCap,                     trend: null });
    if (yf.trailingPE != null)
      indicators.push({ name: 'P/E ratio (PER)',        value: yf.trailingPE,                   trend: null });
    if (yf.priceToBook != null)
      indicators.push({ name: 'Prix / Valeur compt.',  value: yf.priceToBook,                   trend: null });
    if (yf.epsTrailingTwelveMonths != null)
      indicators.push({ name: 'BPA (12 mois)',         value: yf.epsTrailingTwelveMonths,       trend: null });
    if (yf.trailingAnnualDividendRate != null)
      indicators.push({ name: 'Dividende (MAD/action)', value: yf.trailingAnnualDividendRate,   trend: null });
    if (yf.dividendYield != null)
      indicators.push({ name: 'Rend. dividende (%)',   value: yf.dividendYield * 100,           trend: null });
  }

  const response = {
    ticker,
    sector: null,
    currentPrice:       bvc?.lastPrice              ?? yf?.regularMarketPrice          ?? null,
    performance:        bvc?.changePercent           ?? yf?.regularMarketChangePercent  ?? null,
    marketCap:          yf?.marketCap                ?? null,
    peRatio:            yf?.trailingPE               ?? null,
    avgVolume30d:       yf?.averageDailyVolume3Month ?? null,
    ytdChange:          yf?.ytdReturn                ?? null,
    estimatedRevenue:   null,
    estimatedNetIncome: null,
    indicators,
    source: bvc ? 'casablanca-bourse' : 'yahoo-finance',
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
