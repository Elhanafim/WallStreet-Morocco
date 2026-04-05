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
import { getCompany } from '@/lib/data/bvcCompanies';
import { DONNEES_BVC } from '@/lib/data/donnees';

// BVC ticker → donnees entry (handles DWY/DIS alias for Disway)
const DONNEES_MAP = new Map(
  DONNEES_BVC.map(d => [d.ticker, d])
);
const TICKER_ALIASES: Record<string, string> = { 'DWY': 'DIS' };

function getDonnees(ticker: string) {
  return DONNEES_MAP.get(ticker) ?? DONNEES_MAP.get(TICKER_ALIASES[ticker] ?? '');
}

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

  // Enrich with static company data (ISIN, sector, name) from StocksMA
  const company = getCompany(ticker);

  // Fetch BVC price and Yahoo Finance in parallel
  const [bvc, yf] = await Promise.all([
    fetchBVCPrice(ticker, origin),
    fetchYahoo(ticker),
  ]);

  // Nothing from live sources — fall back to donnees-only response (no 503)
  if (!bvc && !yf) {
    const dn503 = getDonnees(ticker);
    const dn503D = dn503?.donnees;
    if (dn503D) {
      return NextResponse.json({
        ticker,
        isin:               company?.isin      ?? null,
        sector:             company?.sector     ?? dn503D.sector   ?? null,
        industry:           dn503D.industry     ?? null,
        companyName:        company?.name       ?? null,
        companyDesc:        company?.desc       ?? null,
        currentPrice:       null,
        performance:        null,
        marketCap:          dn503D.market_cap   ?? null,
        peRatio:            dn503D.pe_ratio      ?? null,
        avgVolume30d:       null,
        ytdChange:          null,
        week52High:         null,
        week52Low:          null,
        priceToBook:        null,
        eps:                dn503D.eps           ?? null,
        dividendYield:      dn503D.dividend_yield != null ? dn503D.dividend_yield * 100 : null,
        dividendRate:       null,
        sharesOutstanding:  dn503D.shares_outstanding ?? null,
        revenue:            dn503D.revenue       ?? null,
        netIncome:          dn503D.net_income    ?? null,
        ebitda:             dn503D.ebitda        ?? null,
        estimatedRevenue:   dn503D.revenue       ?? null,
        estimatedNetIncome: dn503D.net_income    ?? null,
        indicators:         [],
        source:             'tradingview-screener',
      });
    }
    return NextResponse.json(
      {
        error: 'Données temporairement indisponibles. Veuillez réessayer.',
        ticker,
        isin:        company?.isin   ?? null,
        sector:      company?.sector ?? null,
        industry:    null,
        companyName: company?.name   ?? null,
        companyDesc: company?.desc   ?? null,
        indicators:  [],
        source:      'unavailable',
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

  const dn = getDonnees(ticker);
  const dnD = dn?.donnees;

  const response = {
    ticker,
    isin:               company?.isin         ?? null,
    sector:             company?.sector        ?? dnD?.sector    ?? null,
    industry:           dnD?.industry          ?? null,
    companyName:        company?.name          ?? null,
    companyDesc:        company?.desc          ?? null,
    currentPrice:       bvc?.lastPrice         ?? yf?.regularMarketPrice         ?? null,
    performance:        bvc?.changePercent      ?? yf?.regularMarketChangePercent ?? null,
    // Market cap: prefer BVC (MAD), then donnees (MAD), then Yahoo Finance
    marketCap:          bvc
                          ? (dnD?.market_cap ?? yf?.marketCap ?? null)
                          : (dnD?.market_cap ?? yf?.marketCap ?? null),
    // Valuation ratios: donnees (TradingView) preferred over Yahoo Finance
    peRatio:            dnD?.pe_ratio          ?? yf?.trailingPE               ?? null,
    avgVolume30d:       yf?.averageDailyVolume3Month ?? null,
    ytdChange:          yf?.ytdReturn          ?? null,
    week52High:         yf?.fiftyTwoWeekHigh   ?? null,
    week52Low:          yf?.fiftyTwoWeekLow    ?? null,
    priceToBook:        yf?.priceToBook        ?? null,
    eps:                dnD?.eps               ?? yf?.epsTrailingTwelveMonths ?? null,
    dividendYield:      dnD?.dividend_yield != null
                          ? dnD.dividend_yield * 100
                          : yf?.dividendYield != null ? yf.dividendYield * 100 : null,
    dividendRate:       yf?.trailingAnnualDividendRate ?? null,
    sharesOutstanding:  dnD?.shares_outstanding ?? null,
    // Fundamentals from TradingView screener (last reported)
    revenue:            dnD?.revenue     ?? null,
    netIncome:          dnD?.net_income  ?? null,
    ebitda:             dnD?.ebitda      ?? null,
    estimatedRevenue:   dnD?.revenue     ?? null,
    estimatedNetIncome: dnD?.net_income  ?? null,
    indicators,
    source: bvc ? 'casablanca-bourse' : (dn ? 'tradingview-screener' : 'yahoo-finance'),
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
