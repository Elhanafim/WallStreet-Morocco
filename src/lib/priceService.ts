// Client-side price service with 3-level fallback chain.
// Called from the portfolio AddHoldingPanel when user selects a STOCK asset.

export type PriceSource = 'wafabourse' | 'bmcebourse' | 'casablanca-bourse' | 'manual';

export interface PriceResult {
  price: number;
  source: PriceSource;
  timestamp: string;
  success: true;
}

export interface PriceFailure {
  success: false;
  error: string;
}

// In-browser module-level cache (cleared on page reload — that's fine).
const cache = new Map<string, PriceResult & { cachedAt: number }>();
const CACHE_TTL = 60_000; // 60 s

/** Strip the exchange prefix and return the raw ticker. "CSEMA:ATW" → "ATW" */
function rawTicker(symbol: string): string {
  return symbol.includes(':') ? symbol.split(':')[1] : symbol;
}

async function tryProxy(
  endpoint: string,
  ticker: string,
  timeoutMs: number
): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${endpoint}?symbol=${ticker}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.price === 'number' && data.price > 0 ? data.price : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Fetch a live price for a CSEMA stock symbol.
 * Tries 3 proxy endpoints sequentially. Total max ~12 s before failing.
 */
export async function fetchLivePrice(symbol: string): Promise<PriceResult | PriceFailure> {
  const ticker = rawTicker(symbol);

  // Check cache first
  const hit = cache.get(ticker);
  if (hit && Date.now() - hit.cachedAt < CACHE_TTL) {
    return { price: hit.price, source: hit.source, timestamp: hit.timestamp, success: true };
  }

  // Level 1 — Wafa Bourse
  const p1 = await tryProxy('/api/proxy/price', ticker, 4_000);
  if (p1 !== null) {
    const result: PriceResult = { price: p1, source: 'wafabourse', timestamp: new Date().toISOString(), success: true };
    cache.set(ticker, { ...result, cachedAt: Date.now() });
    return result;
  }

  // Level 2 — BMCE Bourse
  const p2 = await tryProxy('/api/proxy/price-bmce', ticker, 4_000);
  if (p2 !== null) {
    const result: PriceResult = { price: p2, source: 'bmcebourse', timestamp: new Date().toISOString(), success: true };
    cache.set(ticker, { ...result, cachedAt: Date.now() });
    return result;
  }

  // Level 3 — Casablanca Bourse
  const p3 = await tryProxy('/api/proxy/price-cse', ticker, 4_000);
  if (p3 !== null) {
    const result: PriceResult = { price: p3, source: 'casablanca-bourse', timestamp: new Date().toISOString(), success: true };
    cache.set(ticker, { ...result, cachedAt: Date.now() });
    return result;
  }

  return { success: false, error: 'All price sources unavailable' };
}

/** Human-readable source label */
export function sourceLabel(source: PriceSource): string {
  const labels: Record<PriceSource, string> = {
    'wafabourse':        'Wafa Bourse',
    'bmcebourse':        'BMCE Capital',
    'casablanca-bourse': 'Bourse de Casablanca',
    'manual':            'Saisi manuellement',
  };
  return labels[source];
}
