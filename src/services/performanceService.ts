/**
 * Portfolio performance service.
 * Computes G/P per holding using live prices, saves daily snapshots to localStorage.
 */

export interface HoldingPerformance {
  holdingId: string;
  currentPrice: number | null;  // null if no live price available
  currentValue: number;
  gainLoss: number;
  gainLossPct: number;
}

export interface PortfolioPerformance {
  totalCost: number;
  totalValue: number;
  totalGain: number;
  totalGainPct: number;
  holdings: Record<string, HoldingPerformance>;
}

export interface DailySnapshot {
  date: string;       // ISO date string YYYY-MM-DD
  totalValue: number;
  totalCost: number;
}

const MAX_SNAPSHOTS = 180;
const SNAPSHOT_KEY = (id: string) => `portfolio_snapshots_${id}`;

export function loadSnapshots(portfolioId: string): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY(portfolioId));
    if (!raw) return [];
    return JSON.parse(raw) as DailySnapshot[];
  } catch {
    return [];
  }
}

export function saveSnapshot(portfolioId: string, totalValue: number, totalCost: number) {
  if (totalValue <= 0 || totalCost <= 0) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = loadSnapshots(portfolioId);
    // Update today's entry or append
    const idx = existing.findIndex((s) => s.date === today);
    if (idx >= 0) {
      existing[idx] = { date: today, totalValue, totalCost };
    } else {
      existing.push({ date: today, totalValue, totalCost });
    }
    // Keep last MAX_SNAPSHOTS
    const trimmed = existing.slice(-MAX_SNAPSHOTS);
    localStorage.setItem(SNAPSHOT_KEY(portfolioId), JSON.stringify(trimmed));
  } catch {
    // localStorage not available (SSR or quota exceeded)
  }
}

export function calculateHoldingPerformance(
  holdingId: string,
  quantity: number,
  purchasePrice: number,
  currentPrice: number | null
): HoldingPerformance {
  const cost = quantity * purchasePrice;
  if (currentPrice === null || currentPrice <= 0) {
    return { holdingId, currentPrice: null, currentValue: cost, gainLoss: 0, gainLossPct: 0 };
  }
  const currentValue = quantity * currentPrice;
  const gainLoss = currentValue - cost;
  const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0;
  return { holdingId, currentPrice, currentValue, gainLoss, gainLossPct };
}

export function calculatePortfolioPerformance(
  holdings: Array<{ id: string; quantity: number; purchasePrice: number; assetSymbol: string; assetType: string }>,
  livePrices: Record<string, number>  // ticker → price
): PortfolioPerformance {
  const holdingMap: Record<string, HoldingPerformance> = {};
  let totalCost = 0;
  let totalValue = 0;

  for (const h of holdings) {
    const cost = h.quantity * h.purchasePrice;
    totalCost += cost;

    const ticker = h.assetType === 'STOCK'
      ? (h.assetSymbol.split(':')[1] ?? h.assetSymbol)
      : h.assetSymbol;
    const livePrice = livePrices[ticker] ?? null;
    const perf = calculateHoldingPerformance(h.id, h.quantity, h.purchasePrice, livePrice);
    holdingMap[h.id] = perf;
    totalValue += perf.currentValue;
  }

  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return { totalCost, totalValue, totalGain, totalGainPct, holdings: holdingMap };
}
