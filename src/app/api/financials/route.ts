/**
 * Financials API Route
 *
 * Data strategy (in priority order):
 * 1. BVC Prices API (/api/bvc/prices) — real-time price + volume + OHLC
 *    directly from Casablanca Bourse.
 * 2. TradingView Scanner Symbol API — enriches with P/E, market cap,
 *    52w range, fundamentals, performance metrics, technical indicators.
 * 3. Static donnees.ts snapshot — fallback for fundamentals when TV is down.
 *
 * GET /api/financials?ticker=ADH
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompany } from '@/lib/data/bvcCompanies';
import { DONNEES_BVC } from '@/lib/data/donnees';
import { ammc_financials_2024 } from '@/lib/data/ammc_financials_2024';

// BVC ticker → donnees entry (handles DWY/DIS alias for Disway)
const DONNEES_MAP = new Map(
  DONNEES_BVC.map(d => [d.ticker, d])
);
const TICKER_ALIASES: Record<string, string> = { 'DWY': 'DIS' };

function getDonnees(ticker: string) {
  return DONNEES_MAP.get(ticker) ?? DONNEES_MAP.get(TICKER_ALIASES[ticker] ?? '');
}

// ── TradingView Scanner Symbol API ────────────────────────────────────────────

const TV_SYMBOL_API = 'https://scanner.tradingview.com/symbol';

const TV_FIELDS = [
  // Valuation
  'market_cap_basic', 'price_earnings_ttm', 'price_book_fq',
  'earnings_per_share_basic_ttm', 'dividends_yield', 'dividends_per_share_fq',
  'shares_outstanding',
  // 52-week range
  'price_52_week_high', 'price_52_week_low',
  // Income statement (FY)
  'total_revenue', 'total_revenue_fy',
  'net_income', 'net_income_fy',
  'EBITDA',
  'gross_profit', 'gross_profit_fy',
  'operating_income', 'operating_income_fy',
  // Balance sheet (FY)
  'total_assets', 'total_assets_fy',
  'total_debt', 'total_debt_fy',
  'stockholders_equity', 'stockholders_equity_fy',
  // Cash flow (FY)
  'cash_f_operating_activities', 'cash_f_operating_activities_fy',
  'cash_f_investing_activities', 'cash_f_investing_activities_fy',
  'cash_f_financing_activities', 'cash_f_financing_activities_fy',
  'free_cash_flow',
  // Margins
  'gross_margin_percent_ttm', 'operating_margin_ttm', 'net_margin_percent_ttm',
  // Profitability & ratios
  'return_on_equity_fq', 'return_on_assets_fq',
  'debt_to_equity_fq', 'current_ratio_fq',
  // Performance (already in percent, e.g. -15.5 = -15.5%)
  'Perf.W', 'Perf.1M', 'Perf.3M', 'Perf.6M', 'Perf.Y', 'Perf.YTD',
  // Technical indicators
  'RSI', 'ADX', 'MACD.macd', 'Recommend.All',
  // Volatility
  'beta_1_year',
].join(',');

interface TVSymbolData {
  market_cap_basic?: number | null;
  price_earnings_ttm?: number | null;
  price_book_fq?: number | null;
  earnings_per_share_basic_ttm?: number | null;
  dividends_yield?: number | null;
  dividends_per_share_fq?: number | null;
  shares_outstanding?: number | null;
  price_52_week_high?: number | null;
  price_52_week_low?: number | null;
  total_revenue?: number | null;
  total_revenue_fy?: number | null;
  net_income?: number | null;
  net_income_fy?: number | null;
  EBITDA?: number | null;
  gross_profit?: number | null;
  gross_profit_fy?: number | null;
  operating_income?: number | null;
  operating_income_fy?: number | null;
  total_assets?: number | null;
  total_assets_fy?: number | null;
  total_debt?: number | null;
  total_debt_fy?: number | null;
  stockholders_equity?: number | null;
  stockholders_equity_fy?: number | null;
  cash_f_operating_activities?: number | null;
  cash_f_operating_activities_fy?: number | null;
  cash_f_investing_activities?: number | null;
  cash_f_investing_activities_fy?: number | null;
  cash_f_financing_activities?: number | null;
  cash_f_financing_activities_fy?: number | null;
  free_cash_flow?: number | null;
  gross_margin_percent_ttm?: number | null;
  operating_margin_ttm?: number | null;
  net_margin_percent_ttm?: number | null;
  return_on_equity_fq?: number | null;
  return_on_assets_fq?: number | null;
  debt_to_equity_fq?: number | null;
  current_ratio_fq?: number | null;
  'Perf.W'?: number | null;
  'Perf.1M'?: number | null;
  'Perf.3M'?: number | null;
  'Perf.6M'?: number | null;
  'Perf.Y'?: number | null;
  'Perf.YTD'?: number | null;
  RSI?: number | null;
  ADX?: number | null;
  'MACD.macd'?: number | null;
  'Recommend.All'?: number | null;
  beta_1_year?: number | null;
}

/** Prefer the non-null value between multiple fallback options */
function firstValidValue<T>(...values: (T | null | undefined)[]): T | null {
  return values.find((v) => v != null && !Number.isNaN(v)) ?? null;
}

async function fetchTVSymbol(ticker: string): Promise<TVSymbolData | null> {
  try {
    const url = `${TV_SYMBOL_API}?symbol=CSEMA:${encodeURIComponent(ticker)}&fields=${TV_FIELDS}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json() as TVSymbolData;
    // Return null if the object is completely empty (symbol not found)
    if (!data || Object.keys(data).length === 0) return null;
    return data;
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
  const company = getCompany(ticker);

  // Fetch BVC price and TradingView data in parallel
  const [bvc, tv] = await Promise.all([
    fetchBVCPrice(ticker, origin),
    fetchTVSymbol(ticker),
  ]);

  // Nothing from live sources — fall back to donnees-only response
  if (!bvc && !tv) {
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
        grossProfit:        null,
        operatingIncome:    null,
        totalAssets:        null,
        totalDebt:          null,
        stockholdersEquity: null,
        freeCashFlow:       null,
        cashFromOperations: null,
        cashFromInvesting:  null,
        cashFromFinancing:  null,
        grossMarginPct:     null,
        operatingMarginPct: null,
        netMarginPct:       null,
        roe:                null,
        roa:                null,
        debtToEquity:       null,
        currentRatio:       null,
        beta:               null,
        perfW:              null,
        perf1M:             null,
        perf3M:             null,
        perf6M:             null,
        perfY:              null,
        perfYTD:            null,
        rsi:                null,
        adx:                null,
        macd:               null,
        recommendAll:       null,
        estimatedRevenue:   dn503D.revenue       ?? null,
        estimatedNetIncome: dn503D.net_income    ?? null,
        indicators:         [],
        source:             'tradingview-screener',
        ammcData:           ammc_financials_2024[ticker] ?? null,
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

  // Build indicators list from BVC session data
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

  if (tv) {
    if (tv['price_52_week_high'] != null)
      indicators.push({ name: 'Plus haut 52 sem.',      value: tv['price_52_week_high'],  trend: null });
    if (tv['price_52_week_low'] != null)
      indicators.push({ name: 'Plus bas 52 sem.',       value: tv['price_52_week_low'],   trend: null });
    if (tv['market_cap_basic'] != null)
      indicators.push({ name: 'Capitalisation (USD)',   value: tv['market_cap_basic'],    trend: null });
    if (tv['price_earnings_ttm'] != null)
      indicators.push({ name: 'P/E ratio (PER)',        value: tv['price_earnings_ttm'],  trend: null });
    if (tv['RSI'] != null)
      indicators.push({ name: 'RSI (14)',               value: tv['RSI'],                 trend: null });
    if (tv['ADX'] != null)
      indicators.push({ name: 'ADX',                   value: tv['ADX'],                 trend: null });
  }

  const dn = getDonnees(ticker);
  const dnD = dn?.donnees;
  const ammc = ammc_financials_2024[ticker] || null;

  const response = {
    ticker,
    isin:               company?.isin         ?? null,
    sector:             company?.sector        ?? dnD?.sector    ?? null,
    industry:           dnD?.industry          ?? null,
    companyName:        company?.name          ?? null,
    companyDesc:        company?.desc          ?? null,
    currentPrice:       bvc?.lastPrice         ?? null,
    performance:        bvc?.changePercent      ?? null,
    // Market cap: prefer BVC donnees (MAD), then TV (USD noted in indicator)
    marketCap:          dnD?.market_cap ?? tv?.market_cap_basic ?? null,
    // Valuation: donnees preferred, then TV
    peRatio:            dnD?.pe_ratio          ?? tv?.price_earnings_ttm         ?? null,
    avgVolume30d:       null,                  // TV scanner has no 30d avg volume
    ytdChange:          tv?.['Perf.YTD']       ?? null,
    week52High:         tv?.price_52_week_high ?? null,
    week52Low:          tv?.price_52_week_low  ?? null,
    priceToBook:        tv?.price_book_fq      ?? null,
    eps:                dnD?.eps               ?? tv?.earnings_per_share_basic_ttm ?? null,
    dividendYield:      dnD?.dividend_yield != null
                          ? dnD.dividend_yield * 100
                          : tv?.dividends_yield ?? null,
    dividendRate:       tv?.dividends_per_share_fq ?? null,
    sharesOutstanding:  dnD?.shares_outstanding ?? tv?.shares_outstanding ?? null,
    
    // Fundamentals: AMMC 2024 preferred, then TV FY, then donnees fallback
    revenue:            firstValidValue(ammc?.revenue, tv?.total_revenue_fy, tv?.total_revenue, dnD?.revenue),
    netIncome:          firstValidValue(ammc?.netIncome, tv?.net_income_fy, tv?.net_income, dnD?.net_income),
    ebitda:             firstValidValue(ammc?.ebitda, tv?.EBITDA, dnD?.ebitda),
    grossProfit:        firstValidValue(tv?.gross_profit_fy, tv?.gross_profit),
    operatingIncome:    firstValidValue(ammc?.operatingIncome, tv?.operating_income_fy, tv?.operating_income),
    totalAssets:        firstValidValue(ammc?.totalAssets, tv?.total_assets_fy, tv?.total_assets),
    totalDebt:          firstValidValue(ammc?.totalDebt, tv?.total_debt_fy, tv?.total_debt),
    stockholdersEquity: firstValidValue(ammc?.stockholdersEquity, tv?.stockholders_equity_fy, tv?.stockholders_equity),
    freeCashFlow:       firstValidValue(ammc?.freeCashFlow, tv?.free_cash_flow),
    cashFromOperations: firstValidValue(ammc?.cashFromOperations, tv?.cash_f_operating_activities_fy, tv?.cash_f_operating_activities),
    cashFromInvesting:  firstValidValue(ammc?.cashFromInvesting, tv?.cash_f_investing_activities_fy, tv?.cash_f_investing_activities),
    cashFromFinancing:  firstValidValue(tv?.cash_f_financing_activities_fy, tv?.cash_f_financing_activities),
    
    // Margins
    grossMarginPct:     tv?.gross_margin_percent_ttm ?? null,
    operatingMarginPct: tv?.operating_margin_ttm     ?? null,
    netMarginPct:       firstValidValue(ammc?.netMarginPct, tv?.net_margin_percent_ttm),
    
    // Profitability & ratios
    roe:                firstValidValue(ammc?.roe, tv?.return_on_equity_fq),
    roa:                tv?.return_on_assets_fq  ?? null,
    debtToEquity:       firstValidValue(ammc?.debtToEquity, tv?.debt_to_equity_fq),
    currentRatio:       tv?.current_ratio_fq     ?? null,
    beta:               tv?.beta_1_year          ?? null,
    
    // Performance
    perfW:              tv?.['Perf.W']   ?? null,
    perf1M:             tv?.['Perf.1M']  ?? null,
    perf3M:             tv?.['Perf.3M']  ?? null,
    perf6M:             tv?.['Perf.6M']  ?? null,
    perfY:              tv?.['Perf.Y']   ?? null,
    perfYTD:            tv?.['Perf.YTD'] ?? null,
    
    // Technical indicators
    rsi:                tv?.RSI                  ?? null,
    adx:                tv?.ADX                  ?? null,
    macd:               tv?.['MACD.macd']        ?? null,
    recommendAll:       tv?.['Recommend.All']    ?? null,
    
    // Legacy compat
    estimatedRevenue:   firstValidValue(ammc?.revenue, tv?.total_revenue_fy, tv?.total_revenue, dnD?.revenue),
    estimatedNetIncome: firstValidValue(ammc?.netIncome, tv?.net_income_fy, tv?.net_income, dnD?.net_income),
    indicators,
    source: bvc ? 'casablanca-bourse' : (tv ? 'tradingview' : 'static'),
    ammcData: ammc,
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
