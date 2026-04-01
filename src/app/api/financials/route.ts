/**
 * Financials API Route
 *
 * Proxies the terminal.risk.ma /api/all endpoint and returns normalized
 * financial data for a single BVC ticker.
 *
 * GET /api/financials?ticker=NKL
 */

import { NextRequest, NextResponse } from 'next/server';

const RISK_MA_URL = 'https://terminal.risk.ma/proxy.php?endpoint=/api/all';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FinancialIndicator {
  name: string;
  value: number | null;
  trend: number | null;
}

export interface FinancialsData {
  ticker: string;
  sector: string | null;
  currentPrice: number | null;
  performance: number | null;
  marketCap: number | null;
  peRatio: number | null;
  avgVolume30d: number | null;
  ytdChange: number | null;
  estimatedRevenue: number | null;
  estimatedNetIncome: number | null;
  indicators: FinancialIndicator[];
}

// ── In-memory cache ───────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
let _cache: { data: Record<string, any>; ts: number } | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function num(v: unknown): number | null {
  if (v == null || v === '' || v === 'N/A') return null;
  const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function normalize(raw: Record<string, any>): FinancialsData {
  const ticker = String(raw.symbol ?? raw.ticker ?? '').toUpperCase();

  // Financial indicators — risk.ma nests them differently per stock
  const indicators: FinancialIndicator[] = [
    {
      name: "Chiffre d'affaires",
      value: num(raw.revenue ?? raw.ca ?? raw.chiffre_affaires),
      trend: num(raw.revenue_growth ?? raw.ca_growth ?? raw.ca_trend),
    },
    {
      name: 'EBITDA',
      value: num(raw.ebitda),
      trend: num(raw.ebitda_growth ?? raw.ebitda_trend),
    },
    {
      name: 'Résultat net',
      value: num(raw.net_income ?? raw.resultat_net ?? raw.netIncome),
      trend: num(raw.net_income_growth ?? raw.resultat_net_growth ?? raw.ni_trend),
    },
    {
      name: 'Actifs totaux',
      value: num(raw.total_assets ?? raw.actifs_totaux),
      trend: num(raw.total_assets_growth ?? raw.actifs_trend),
    },
    {
      name: 'Capitaux propres',
      value: num(raw.equity ?? raw.capitaux_propres),
      trend: num(raw.equity_growth ?? raw.capitaux_trend),
    },
  ];

  return {
    ticker,
    sector: raw.sector ?? raw.secteur ?? null,
    currentPrice: num(raw.price ?? raw.cours ?? raw.lastPrice),
    performance: num(raw.change ?? raw.performance ?? raw.variation),
    marketCap: num(raw.marketCap ?? raw.capital ?? raw.capitalisation),
    peRatio: num(raw.pe ?? raw.pe_ratio ?? raw.ratio_pe),
    avgVolume30d: num(raw.volume ?? raw.volume_moyen ?? raw.avg_volume),
    ytdChange: num(raw.ytd ?? raw.variation_ytd ?? raw.change ?? raw.performance),
    estimatedRevenue: num(raw.est_revenue ?? raw.revenus_estimes ?? raw.revenue_est ?? raw.revenue),
    estimatedNetIncome: num(raw.est_net_income ?? raw.benefice_net_estime ?? raw.netIncome_est ?? raw.net_income),
    indicators,
  };
}

async function fetchAll(): Promise<Record<string, any>> {
  const res = await fetch(RISK_MA_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, */*',
      Referer: 'https://terminal.risk.ma/',
    },
    // Next.js fetch — disable its built-in cache in favour of our own
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`risk.ma returned HTTP ${res.status}`);
  const json = await res.json();
  return json;
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

  try {
    // Serve from cache if fresh
    const now = Date.now();
    if (!_cache || now - _cache.ts > CACHE_TTL) {
      const raw = await fetchAll();
      _cache = { data: raw, ts: now };
    }

    const raw = _cache.data;

    // risk.ma API: data may be in raw.stocks[] or raw.data[] or raw as an object keyed by ticker
    let stockRaw: Record<string, any> | undefined;

    if (Array.isArray(raw.stocks)) {
      stockRaw = raw.stocks.find(
        (s: any) => String(s.symbol ?? s.ticker ?? '').toUpperCase() === ticker
      );
    } else if (Array.isArray(raw.data)) {
      stockRaw = raw.data.find(
        (s: any) => String(s.symbol ?? s.ticker ?? '').toUpperCase() === ticker
      );
    } else if (raw[ticker]) {
      stockRaw = raw[ticker] as Record<string, any>;
    }

    if (!stockRaw) {
      return NextResponse.json(
        { error: `Ticker '${ticker}' not found`, ticker, indicators: [] },
        { status: 404 }
      );
    }

    const normalized = normalize({ ...stockRaw, symbol: ticker });

    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/financials]', msg);
    return NextResponse.json({ error: msg, ticker, indicators: [] }, { status: 503 });
  }
}
