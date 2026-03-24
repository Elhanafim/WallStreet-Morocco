/**
 * Frontend client for the BVC Price Microservice (FastAPI/casabourse).
 * All components must use this service — never call the microservice directly.
 */

const BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PRICE_SERVICE_URL) ||
  'http://localhost:8001';

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
  cached: boolean;
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

// ── In-memory frontend cache (secondary layer, 30 s TTL) ──────────────────────

const frontendCache = new Map<string, { data: BVCPrice; ts: number }>();
const FRONTEND_CACHE_TTL = 30_000; // 30 seconds

function cacheGet(ticker: string): BVCPrice | null {
  const entry = frontendCache.get(ticker.toUpperCase());
  if (entry && Date.now() - entry.ts < FRONTEND_CACHE_TTL) return entry.data;
  return null;
}

function cacheSet(ticker: string, data: BVCPrice) {
  frontendCache.set(ticker.toUpperCase(), { data, ts: Date.now() });
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function safeFetch<T>(path: string, timeoutMs = 5_000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch live price for a single BVC ticker (e.g. "ATW", "BCP").
 * Checks frontend cache first, then the microservice.
 * Returns null on any error — caller should fall back to manual entry.
 */
export async function fetchPrice(ticker: string): Promise<BVCPrice | null> {
  const upper = ticker.toUpperCase();

  const cached = cacheGet(upper);
  if (cached) return cached;

  const data = await safeFetch<BVCPrice>(`/prices/${upper}`);
  if (data && data.available) {
    cacheSet(upper, data);
    return data;
  }
  return null;
}

/**
 * Fetch prices for multiple tickers in one round-trip.
 * Returns a map of ticker → BVCPrice (missing tickers are omitted).
 */
export async function fetchBatchPrices(
  tickers: string[]
): Promise<Record<string, BVCPrice>> {
  if (tickers.length === 0) return {};

  const upper = tickers.map((t) => t.toUpperCase());

  // Serve from cache where possible
  const result: Record<string, BVCPrice> = {};
  const missing: string[] = [];
  for (const t of upper) {
    const c = cacheGet(t);
    if (c) result[t] = c;
    else missing.push(t);
  }

  if (missing.length > 0) {
    const resp = await safeFetch<{ data: Record<string, BVCPrice> }>(
      `/prices/batch?tickers=${missing.join(',')}`
    );
    if (resp?.data) {
      for (const [t, price] of Object.entries(resp.data)) {
        if (price.available) {
          cacheSet(t, price);
          result[t] = price;
        }
      }
    }
  }

  return result;
}

/**
 * Fetch prices for ALL BVC stocks in one call.
 * Use this on the Marchés page to pre-populate the frontend cache.
 */
export async function fetchSnapshot(): Promise<BVCPrice[]> {
  const resp = await safeFetch<{ data: BVCPrice[] }>('/prices/snapshot', 10_000);
  if (!resp?.data) return [];

  for (const price of resp.data) {
    if (price.ticker && price.available) {
      cacheSet(price.ticker, price);
    }
  }
  return resp.data;
}

/**
 * Returns market open/closed status and next session times.
 */
export async function getMarketStatus(): Promise<MarketStatus | null> {
  return safeFetch<MarketStatus>('/market/status');
}

/**
 * Fetch top gainers and losers from the current session.
 */
export async function fetchMovers(): Promise<BVCMovers | null> {
  return safeFetch<BVCMovers>('/prices/movers', 10_000);
}

/**
 * Fetch fundamentals (P/E, EPS, market cap, etc.) for a single ticker.
 */
export async function fetchFundamentals(ticker: string): Promise<BVCFundamentals | null> {
  const upper = ticker.toUpperCase();
  const data = await safeFetch<BVCFundamentals>(`/prices/fundamentals/${upper}`, 10_000);
  return data;
}

// ── Source label helpers ──────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  'StocksMA': 'Leboursier (StocksMA)',
  'StocksMA-Excel': 'Leboursier (cache Excel)',
  'casabourse': 'Bourse de Casablanca',
};

/**
 * Returns a human-readable source label for display in the UI.
 */
export function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

/**
 * Returns a dot color class for the source indicator.
 * Green = live StocksMA, Amber = Excel cache, Blue = casabourse.
 */
export function sourceColorClass(source: string): string {
  if (source === 'StocksMA') return 'bg-emerald-500';
  if (source === 'StocksMA-Excel') return 'bg-amber-400';
  return 'bg-blue-400';
}

/**
 * Format a BVCPrice change for display: "+1.23%" or "-0.45%"
 */
export function formatChange(price: BVCPrice): string {
  const sign = price.changePercent >= 0 ? '+' : '';
  return `${sign}${price.changePercent.toFixed(2)}%`;
}

/**
 * Format a BVCPrice timestamp for display (HH:MM or date).
 */
export function formatPriceTime(timestamp: string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
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
