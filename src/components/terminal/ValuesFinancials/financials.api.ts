/**
 * Client-side API helper for the /api/financials endpoint.
 */

export interface FinancialIndicator {
  name: string;
  value: number | null;
  trend: number | null;
}

export interface FinancialsData {
  ticker: string;
  // Company identity
  isin: string | null;
  sector: string | null;
  industry: string | null;
  companyName: string | null;
  companyDesc: string | null;
  // Market data (from BVC API — MAD)
  currentPrice: number | null;
  performance: number | null;
  marketCap: number | null;
  peRatio: number | null;
  avgVolume30d: number | null;
  ytdChange: number | null;
  // Extended (from TradingView scanner)
  week52High: number | null;
  week52Low: number | null;
  priceToBook: number | null;
  eps: number | null;
  dividendYield: number | null;
  dividendRate: number | null;
  sharesOutstanding: number | null;
  // Fundamentals (TradingView FY)
  revenue: number | null;
  netIncome: number | null;
  ebitda: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  totalAssets: number | null;
  totalDebt: number | null;
  stockholdersEquity: number | null;
  freeCashFlow: number | null;
  cashFromOperations: number | null;
  cashFromInvesting: number | null;
  cashFromFinancing: number | null;
  // Margins (%)
  grossMarginPct: number | null;
  operatingMarginPct: number | null;
  netMarginPct: number | null;
  // Profitability & ratios
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  beta: number | null;
  // Performance (%, already percentage — e.g. -15.5 means -15.5%)
  perfW: number | null;
  perf1M: number | null;
  perf3M: number | null;
  perf6M: number | null;
  perfY: number | null;
  perfYTD: number | null;
  // Technical indicators
  rsi: number | null;
  adx: number | null;
  macd: number | null;
  recommendAll: number | null;
  // Legacy estimates (same as revenue/netIncome for fallback compat)
  estimatedRevenue: number | null;
  estimatedNetIncome: number | null;
  indicators: FinancialIndicator[];
}

export async function fetchFinancials(ticker: string): Promise<FinancialsData> {
  const res = await fetch(`/api/financials?ticker=${encodeURIComponent(ticker)}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<FinancialsData>;
}

// ── Formatting helpers shared across sub-components ───────────────────────────

export function fmtMAD(value: number | null | undefined): string {
  if (value == null) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} Md MAD`;
  if (abs >= 1_000_000)     return `${(value / 1_000_000).toFixed(0)} M MAD`;
  if (abs >= 1_000)         return `${(value / 1_000).toFixed(1)} K MAD`;
  return `${value.toFixed(2)} MAD`;
}

export function fmtPct(value: number | null | undefined): string {
  if (value == null) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function fmtVolume(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

export function fmtPrice(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toFixed(2);
}
