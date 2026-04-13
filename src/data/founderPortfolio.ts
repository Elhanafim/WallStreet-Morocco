// ─── Types ────────────────────────────────────────────────────────────────────

export interface Holding {
  ticker: string;
  name: string;
  sector: string;
  weight: number;           // percentage, e.g. 25
  priceNov2024: number;     // MAD
  priceMar2026: number;     // MAD
  perfPointToPoint: number; // %
  dcaReturn: number;        // % estimated DCA return
  color: string;            // hex — per-holding accent, applied inline only
  icon: string;
  rationale: string;
}

export interface DCADataPoint {
  month: string;
  monthIndex: number;       // 1 = Nov 2024 … 17 = Mar 2026
  capitalInvested: number;  // MAD
  portfolioValue: number;   // MAD
  performancePercent: number;
}

export interface Scenario {
  label: string;
  icon: string;
  stocks: string;
  capital: number;
  value: number;
  perf: number;
  badge: string;
  highlight: boolean;
  muted?: boolean;
}

export interface MarketEvent {
  date: string;
  desc: string;
  type: 'neutral' | 'positive' | 'peak' | 'danger';
}

// ─── Portfolio meta ───────────────────────────────────────────────────────────

export const PORTFOLIO_META = {
  startDate: '2024-11-01',
  endDate: '2026-03-24',
  durationMonths: 17,
  monthlyContribution: 100,
  totalInvested: 1700,
  finalValue: 2628,
  absoluteGain: 928,
  performancePercent: 54.6,
  benchmarkMASI: 2.1,
  outperformance: 52.5,
  strategy: 'DCA Concentré — 4 valeurs',
  riskProfile: 'Dynamique',
} as const;

// ─── Holdings ─────────────────────────────────────────────────────────────────
// Per-holding accent colors are applied inline (exempted from token constraint).

export const HOLDINGS: Holding[] = [
  {
    ticker: 'SMI',
    name: "Soc. Métallurgique d'Imiter",
    sector: 'Mines — Argent',
    weight: 25,
    priceNov2024: 2000,
    priceMar2026: 5760,
    perfPointToPoint: 188,
    dcaReturn: 64,
    color: '#C0C0C0',
    icon: '',
    rationale: "Exposition directe à l'argent métal, records historiques 2025-2026",
  },
  {
    ticker: 'MNG',
    name: 'Managem',
    sector: 'Mines — Or & Argent',
    weight: 25,
    priceNov2024: 2846,
    priceMar2026: 7901,
    perfPointToPoint: 178,
    dcaReturn: 61,
    color: '#FFD700',
    icon: '',
    rationale: 'Leader minier africain, mine Boto (Sénégal) en production',
  },
  {
    ticker: 'S2M',
    name: 'S.M. Monétique',
    sector: 'IT — Paiements digitaux',
    weight: 25,
    priceNov2024: 225,
    priceMar2026: 530,
    perfPointToPoint: 136,
    dcaReturn: 50,
    color: '#3B82F6',
    icon: '',
    rationale: 'Digitalisation des paiements au Maroc et en Afrique',
  },
  {
    ticker: 'RDS',
    name: 'Résidences Dar Saada',
    sector: 'Immobilier — Logement social',
    weight: 25,
    priceNov2024: 65,
    priceMar2026: 138,
    perfPointToPoint: 112,
    dcaReturn: 43,
    color: '#10B981',
    icon: '',
    rationale: 'Carnet de commandes plein, Programme national logement social',
  },
];

// ─── Scenarios ────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    label: 'A — Concentré',
    icon: '',
    stocks: '4 valeurs',
    capital: 1700,
    value: 2628,
    perf: 54.6,
    badge: '',
    highlight: true,
  },
  {
    label: 'B — Semi-diversifié',
    icon: '',
    stocks: '7 valeurs',
    capital: 1700,
    value: 2543,
    perf: 49.6,
    badge: '',
    highlight: false,
  },
  {
    label: 'C — Diversifié',
    icon: '',
    stocks: '12 valeurs',
    capital: 1700,
    value: 2290,
    perf: 34.7,
    badge: '',
    highlight: false,
  },
  {
    label: 'MASI (bench.)',
    icon: '',
    stocks: '77 valeurs',
    capital: 1700,
    value: 1736,
    perf: 2.1,
    badge: '',
    highlight: false,
    muted: true,
  },
];

// ─── Market events ────────────────────────────────────────────────────────────

export const MARKET_EVENTS: MarketEvent[] = [
  {
    date: 'Nov 2024',
    desc: 'MASI franchit 15 000 pts pour la première fois',
    type: 'neutral',
  },
  {
    date: 'Jan 2025',
    desc: 'BVC : meilleure performance mondiale, +40 indices battus',
    type: 'positive',
  },
  {
    date: 'Juil 2025',
    desc: 'Capitalisation BVC : 1 000 Mrd MAD — première historique',
    type: 'positive',
  },
  {
    date: 'Août 2025',
    desc: 'Pic MASI : 20 340 pts — All-Time High',
    type: 'peak',
  },
  {
    date: 'Mars 2026',
    desc: 'Correction -13% — Crise géopolitique (Iran)',
    type: 'danger',
  },
];

// ─── Month labels (Nov 2024 → Mar 2026) ──────────────────────────────────────

const MONTH_LABELS: string[] = [
  'Nov 24', 'Déc 24', 'Jan 25', 'Fév 25', 'Mar 25',
  'Avr 25', 'Mai 25', 'Jun 25', 'Jul 25', 'Aoû 25',
  'Sep 25', 'Oct 25', 'Nov 25', 'Déc 25', 'Jan 26',
  'Fév 26', 'Mar 26',
];

// ─── DCA timeline computation ─────────────────────────────────────────────────
//
// For each month m (1 = Nov 2024, 17 = Mar 2026):
//   price_m(s)   = s.startPrice + (s.endPrice − s.startPrice) × (m−1)/16
//   shares_m(s)  = (monthlyContrib × s.weight/100) / price_m(s)
//   cumShares_m  = Σ shares_1..m  (per stock)
//   portValue_m  = Σ cumShares_m × price_m  (all stocks)
//   capital_m    = m × monthlyContrib
//   perf_m       = (portValue_m − capital_m) / capital_m × 100

export function computeDCATimeline(): DCADataPoint[] {
  const cumShares: Record<string, number> = {};
  HOLDINGS.forEach((h) => {
    cumShares[h.ticker] = 0;
  });

  return MONTH_LABELS.map((label, idx) => {
    const m = idx + 1;
    const t = (m - 1) / 16; // 0 at month 1, 1 at month 17

    // Buy this month's allocation for each stock
    HOLDINGS.forEach((h) => {
      const price = h.priceNov2024 + (h.priceMar2026 - h.priceNov2024) * t;
      const monthlyInvest = PORTFOLIO_META.monthlyContribution * (h.weight / 100);
      cumShares[h.ticker] += monthlyInvest / price;
    });

    // Portfolio value at current prices
    let portfolioValue = 0;
    HOLDINGS.forEach((h) => {
      const price = h.priceNov2024 + (h.priceMar2026 - h.priceNov2024) * t;
      portfolioValue += cumShares[h.ticker] * price;
    });

    const capitalInvested = m * PORTFOLIO_META.monthlyContribution;
    const perf = ((portfolioValue - capitalInvested) / capitalInvested) * 100;

    return {
      month: label,
      monthIndex: m,
      capitalInvested,
      portfolioValue: Math.round(portfolioValue * 10) / 10,
      performancePercent: Math.round(perf * 10) / 10,
    };
  });
}

// Pre-computed — pure function, no side effects, safe at module level.
export const DCA_TIMELINE: DCADataPoint[] = computeDCATimeline();
