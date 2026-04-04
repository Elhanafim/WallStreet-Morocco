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
  // Company identity (from StocksMA / bvcCompanies)
  isin: string | null;
  sector: string | null;
  companyName: string | null;
  companyDesc: string | null;
  // Market data
  currentPrice: number | null;
  performance: number | null;
  marketCap: number | null;
  peRatio: number | null;
  avgVolume30d: number | null;
  ytdChange: number | null;
  // Extended Yahoo Finance fields
  week52High: number | null;
  week52Low: number | null;
  priceToBook: number | null;
  eps: number | null;
  dividendYield: number | null;
  dividendRate: number | null;
  // Estimates
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
