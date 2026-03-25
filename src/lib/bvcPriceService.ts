/**
 * BVC Price Service — calls /api/bvc/prices (Next.js route).
 * That route proxies the official Casablanca Bourse REST API directly.
 * No external Python microservice required.
 *
 * All components must use this service — never call APIs directly.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BVCPrice {
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
  timestamp: string;
  cached?: boolean;
  source: string;
  available: boolean;
}

export interface BVCFundamentals {
  ticker: string;
  name?: string;
  price?: BVCPrice;
  quoteTable?: {
    peRatio?: string;
    eps?: string;
    yield?: string;
    dividend?: string;
    marketCap?: string;
    beta?: string;
    week52Range?: string;
    avgVolume?: string;
    sharesOutstanding?: string;
    [key: string]: string | undefined;
  };
  historical?: Array<Record<string, unknown>>;
  timestamp?: string;
  cached?: boolean;
}

export interface BVCMovers {
  gainers: BVCPrice[];
  losers: BVCPrice[];
  timestamp: string;
  total: number;
}

export interface MarketStatus {
  open: boolean;
  nextOpen: string;
  nextClose: string;
  timezone: string;
  delayMinutes: number;
}

// ── In-memory frontend cache (30 s TTL) ───────────────────────────────────────

const frontendCache = new Map<string, { data: BVCPrice; ts: number }>();
const FRONTEND_CACHE_TTL = 30_000;

function cacheGet(ticker: string): BVCPrice | null {
  const entry = frontendCache.get(ticker.toUpperCase());
  if (entry && Date.now() - entry.ts < FRONTEND_CACHE_TTL) return entry.data;
  return null;
}

function cacheSet(ticker: string, data: BVCPrice) {
  frontendCache.set(ticker.toUpperCase(), { data, ts: Date.now() });
}

function cleanTicker(raw: string): string {
  return raw.toUpperCase().replace('CSEMA:', '').trim();
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, timeoutMs = 10_000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// Snapshot populated by fetchSnapshot(); used by fetchPrice as a secondary cache
let _snapshot: Map<string, BVCPrice> | null = null;
let _snapshotTs = 0;
const SNAPSHOT_TTL = 60_000;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch live price for a single BVC ticker (e.g. "ATW", "CSEMA:BCP").
 * Returns null on failure — caller shows manual entry UI.
 */
export async function fetchPrice(ticker: string): Promise<BVCPrice | null> {
  const t = cleanTicker(ticker);

  // 1. Frontend cache
  const cached = cacheGet(t);
  if (cached) return cached;

  // 2. In-memory snapshot (populated by fetchSnapshot)
  if (_snapshot && Date.now() - _snapshotTs < SNAPSHOT_TTL) {
    const hit = _snapshot.get(t);
    if (hit) return hit;
  }

  // 3. Single-ticker API call (triggers snapshot fetch on server side)
  const data = await safeFetch<BVCPrice>(`/api/bvc/prices?ticker=${t}`, 12_000);
  if (data && data.available && data.lastPrice > 0) {
    cacheSet(t, data);
    return data;
  }

  return null;
}

/**
 * Fetch prices for multiple tickers in one call.
 * Returns a map of ticker → BVCPrice (missing tickers are omitted).
 */
export async function fetchBatchPrices(
  tickers: string[]
): Promise<Record<string, BVCPrice>> {
  if (tickers.length === 0) return {};

  // Seed from snapshot first
  await fetchSnapshot();

  const result: Record<string, BVCPrice> = {};
  for (const raw of tickers) {
    const t = cleanTicker(raw);
    const hit = cacheGet(t) ?? _snapshot?.get(t);
    if (hit) result[t] = hit;
  }
  return result;
}

/**
 * Fetch all BVC stocks in one call (≈ 113 instruments).
 * Pre-populates the frontend cache; use on Marchés / dashboard pages.
 */
export async function fetchSnapshot(): Promise<BVCPrice[]> {
  // Use in-memory snapshot if fresh
  if (_snapshot && Date.now() - _snapshotTs < SNAPSHOT_TTL) {
    return Array.from(_snapshot.values());
  }

  const resp = await safeFetch<{ data: BVCPrice[] }>('/api/bvc/prices', 12_000);
  if (!resp?.data?.length) return [];

  _snapshot = new Map();
  _snapshotTs = Date.now();

  for (const price of resp.data) {
    if (price.ticker && price.available && price.lastPrice > 0) {
      _snapshot.set(price.ticker, price);
      cacheSet(price.ticker, price);
    }
  }

  return resp.data;
}

/**
 * Top gainers and losers derived from the snapshot.
 */
export async function fetchMovers(): Promise<BVCMovers | null> {
  const all = await fetchSnapshot();
  if (!all.length) return null;

  const sorted = [...all].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
  return {
    gainers: sorted.slice(0, 10),
    losers:  sorted.slice(-10).reverse(),
    timestamp: new Date().toISOString(),
    total: all.length,
  };
}

/**
 * Returns market open/closed status (Casablanca timezone, Mon–Fri 09:30–15:30).
 */
export function getMarketStatus(): MarketStatus {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Africa/Casablanca' })
  );
  const day = now.getDay(); // 0=Sun, 6=Sat
  const min = now.getHours() * 60 + now.getMinutes();
  const open = day >= 1 && day <= 5 && min >= 9 * 60 + 30 && min < 15 * 60 + 30;

  // Next open: next weekday at 09:30
  const next = new Date(now);
  if (!open) {
    next.setHours(9, 30, 0, 0);
    if (min >= 15 * 60 + 30 || day === 0 || day === 6) next.setDate(next.getDate() + 1);
    while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1);
  }

  return {
    open,
    nextOpen:  open ? '' : next.toISOString(),
    nextClose: open
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30).toISOString()
      : '',
    timezone: 'Africa/Casablanca',
    delayMinutes: 0, // official BVC data, no delay
  };
}

/**
 * Fundamentals stub — returns price data only (no P/E from this source).
 */
export async function fetchFundamentals(ticker: string): Promise<BVCFundamentals | null> {
  const price = await fetchPrice(ticker);
  if (!price) return null;
  return { ticker: price.ticker, name: price.name, price, timestamp: price.timestamp };
}

// ── Display helpers ───────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  'casablanca-bourse': 'Bourse de Casablanca',
  'StocksMA':          'Leboursier (StocksMA)',
  'StocksMA-Excel':    'Leboursier (cache Excel)',
  'casabourse':        'Bourse de Casablanca',
};

export function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function sourceColorClass(source: string): string {
  if (source === 'casablanca-bourse' || source === 'casabourse') return 'bg-emerald-500';
  if (source === 'StocksMA') return 'bg-blue-400';
  if (source === 'StocksMA-Excel') return 'bg-amber-400';
  return 'bg-blue-400';
}

export function formatChange(price: BVCPrice): string {
  const sign = price.changePercent >= 0 ? '+' : '';
  return `${sign}${price.changePercent.toFixed(2)}%`;
}

export function formatPriceTime(timestamp: string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    if (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      return d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}
