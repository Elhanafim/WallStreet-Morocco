import { useState, useCallback, useMemo } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriceLevel       = 'low' | 'medium' | 'high';
export type MaintenanceLevel = 'low' | 'medium' | 'high';
export type MarketingLevel   = 'none' | 'local' | 'global';
export type GamePhase        = 'intro' | 'decision' | 'results' | 'summary';

export interface SeasonEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  occupancyDelta: number;   // percentage points (+/-)
  adrlDelta: number;        // % change to ADR willingness
}

export interface ExpenseBreakdown {
  staff: number;
  utilities: number;
  maintenance: number;
  marketingFixed: number;
  marketingCommission: number;
  total: number;
}

export interface MonthResult {
  month: number;
  monthName: string;
  event: SeasonEvent;
  occupancy: number;       // 0-1
  adr: number;             // avg daily rate (MAD)
  roomNights: number;
  revenue: number;
  expenses: number;
  expenseBreakdown: ExpenseBreakdown;
  profit: number;
  guestRating: number;     // 1-5
  cumulativeProfit: number;
}

export interface RiadsState {
  phase: GamePhase;
  month: number;           // 1-12
  totalMonths: number;
  rooms: number;
  // Current decisions
  priceLevel: PriceLevel;
  maintenanceLevel: MaintenanceLevel;
  marketingLevel: MarketingLevel;
  // Tracked state
  maintenanceScore: number; // 0-100 — deteriorates without maintenance
  guestRating: number;      // 1-5
  cash: number;
  startingCash: number;
  // History
  monthHistory: MonthResult[];
  currentEvent: SeasonEvent | null;
}

// ─── Static config ────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Base ADR by price level (MAD) */
const ADR_BY_PRICE: Record<PriceLevel, number> = {
  low:    480,
  medium: 720,
  high:   1050,
};

/** Occupancy impact of price level (percentage points) */
const PRICE_OCCUPANCY_DELTA: Record<PriceLevel, number> = {
  low:    +10,
  medium:   0,
  high:   -12,
};

/** Monthly maintenance cost (MAD) */
const MAINTENANCE_COST: Record<MaintenanceLevel, number> = {
  low:    2_000,
  medium: 5_500,
  high:   10_000,
};

/** Marketing cost + occupancy effect */
const MARKETING_CONFIG: Record<MarketingLevel, { fixedCost: number; revenueCommission: number; occupancyDelta: number }> = {
  none:   { fixedCost: 0,     revenueCommission: 0,    occupancyDelta: 0   },
  local:  { fixedCost: 2_000, revenueCommission: 0,    occupancyDelta: +8  },
  global: { fixedCost: 0,     revenueCommission: 0.18, occupancyDelta: +20 },
};

const FIXED_MONTHLY_COSTS = {
  staff:    9_000,
  utilities: 2_500,
};

/** Season events — one per month, randomised from a pool */
const EVENT_POOL: SeasonEvent[] = [
  { id: 'ramadan',      emoji: '🌙', title: 'Ramadan',              description: 'Les voyages locaux augmentent mais les touristes étrangers baissent.',   occupancyDelta: -5,  adrlDelta: -5  },
  { id: 'eid',          emoji: '🎉', title: 'Aïd el-Fitr',          description: 'Forte demande familiale marocaine — courts séjours populaires.',          occupancyDelta: +15, adrlDelta: +10 },
  { id: 'high_season',  emoji: '☀️', title: 'Haute saison estivale', description: 'Afflux de touristes européens — les riads affichent complet.',            occupancyDelta: +25, adrlDelta: +20 },
  { id: 'low_season',   emoji: '❄️', title: 'Basse saison',          description: 'Peu de voyageurs. Bonne période pour la rénovation.',                    occupancyDelta: -20, adrlDelta: -15 },
  { id: 'marathon',     emoji: '🏃', title: 'Marathon de Marrakech', description: 'Des coureurs du monde entier envahissent la ville.',                      occupancyDelta: +30, adrlDelta: +15 },
  { id: 'festival',     emoji: '🎭', title: 'Festival des arts',     description: 'Marrakech accueille un festival culturel international.',                 occupancyDelta: +20, adrlDelta: +10 },
  { id: 'drought',      emoji: '🌵', title: 'Canicule',              description: 'Températures extrêmes — certains voyageurs annulent.',                   occupancyDelta: -10, adrlDelta: -5  },
  { id: 'spring',       emoji: '🌸', title: 'Printemps idéal',       description: 'La météo parfaite attire de nombreux groupes de voyage.',                 occupancyDelta: +15, adrlDelta: +5  },
  { id: 'offseason',    emoji: '🍂', title: 'Hors-saison classique', description: 'Activité normale — pas d\'événement particulier ce mois-ci.',             occupancyDelta:  0,  adrlDelta:  0  },
  { id: 'floods',       emoji: '🌧️', title: 'Précipitations fortes', description: 'Des pluies prolongées freinent les activités touristiques.',              occupancyDelta: -15, adrlDelta: -10 },
  { id: 'luxury_trend', emoji: '💎', title: 'Tourisme de luxe',      description: 'Un magazine international classe Marrakech en top destination.',         occupancyDelta: +12, adrlDelta: +25 },
  { id: 'business',     emoji: '💼', title: 'Congrès international', description: 'Un grand congrès d\'affaires attire des voyageurs professionnels.',       occupancyDelta: +18, adrlDelta: +12 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rnd() {
  return Math.random();
}

function pickEvent(usedIds: Set<string>): SeasonEvent {
  const available = EVENT_POOL.filter((e) => !usedIds.has(e.id));
  const pool = available.length > 0 ? available : EVENT_POOL;
  return pool[Math.floor(rnd() * pool.length)];
}

function computeOccupancy(
  priceLevel: PriceLevel,
  marketingLevel: MarketingLevel,
  maintenanceScore: number,
  guestRating: number,
  eventDelta: number
): number {
  const base = 0.68; // 68% base occupancy
  const priceAdj   = PRICE_OCCUPANCY_DELTA[priceLevel] / 100;
  const marketAdj  = MARKETING_CONFIG[marketingLevel].occupancyDelta / 100;
  const maintAdj   = maintenanceScore < 40 ? -0.10 : maintenanceScore < 65 ? -0.04 : 0;
  const ratingAdj  = guestRating < 3 ? -0.08 : guestRating >= 4.5 ? +0.05 : 0;
  const eventAdj   = eventDelta / 100;
  const noise      = (rnd() - 0.5) * 0.08; // ±4%

  return clamp(base + priceAdj + marketAdj + maintAdj + ratingAdj + eventAdj + noise, 0.05, 0.98);
}

function computeGuestRating(current: number, maintenanceScore: number, occupancy: number): number {
  // Low maintenance → guests complain
  const maintEffect = maintenanceScore < 40 ? -0.4 : maintenanceScore < 65 ? -0.15 : maintenanceScore > 80 ? +0.1 : 0;
  // High occupancy with low maintenance → worse rating
  const crowdEffect = occupancy > 0.90 && maintenanceScore < 60 ? -0.2 : 0;
  const noise = (rnd() - 0.5) * 0.2;
  return clamp(current + maintEffect + crowdEffect + noise, 1, 5);
}

function computeMaintenanceScore(current: number, level: MaintenanceLevel): number {
  const decay: Record<MaintenanceLevel, number> = { low: -12, medium: -2, high: +10 };
  return clamp(current + decay[level] + (rnd() - 0.5) * 4, 0, 100);
}

function makeInitialState(): RiadsState {
  return {
    phase: 'intro',
    month: 1,
    totalMonths: 12,
    rooms: 8,
    priceLevel: 'medium',
    maintenanceLevel: 'medium',
    marketingLevel: 'local',
    maintenanceScore: 75,
    guestRating: 4.0,
    cash: 30_000,
    startingCash: 30_000,
    monthHistory: [],
    currentEvent: null,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRiads() {
  const [state, setState] = useState<RiadsState>(makeInitialState);

  const startGame = useCallback(() => {
    setState((prev) => {
      const event = pickEvent(new Set());
      return { ...makeInitialState(), phase: 'decision', currentEvent: event };
    });
  }, []);

  const setDecision = useCallback(
    (key: 'priceLevel' | 'maintenanceLevel' | 'marketingLevel', value: string) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const confirmMonth = useCallback(() => {
    setState((prev) => {
      if (!prev.currentEvent) return prev;
      const event = prev.currentEvent;
      const { priceLevel, maintenanceLevel, marketingLevel, rooms, month, monthHistory } = prev;

      const mktConfig  = MARKETING_CONFIG[marketingLevel];
      const occupancy  = computeOccupancy(priceLevel, marketingLevel, prev.maintenanceScore, prev.guestRating, event.occupancyDelta);
      const adrBase    = ADR_BY_PRICE[priceLevel];
      const adrFinal   = Math.round(adrBase * (1 + event.adrlDelta / 100));
      const days       = DAYS_IN_MONTH[month - 1];
      const roomNights = Math.round(rooms * occupancy * days);
      const revenue    = roomNights * adrFinal;

      const marketingCommission = Math.round(revenue * mktConfig.revenueCommission);
      const expenseBreakdown: ExpenseBreakdown = {
        staff: FIXED_MONTHLY_COSTS.staff,
        utilities: FIXED_MONTHLY_COSTS.utilities,
        maintenance: MAINTENANCE_COST[maintenanceLevel],
        marketingFixed: mktConfig.fixedCost,
        marketingCommission,
        total: FIXED_MONTHLY_COSTS.staff + FIXED_MONTHLY_COSTS.utilities +
               MAINTENANCE_COST[maintenanceLevel] + mktConfig.fixedCost + marketingCommission,
      };
      const expenses = expenseBreakdown.total;

      const profit = revenue - expenses;
      const cumulativeProfit = (monthHistory[monthHistory.length - 1]?.cumulativeProfit ?? 0) + profit;
      const newMaintenanceScore = computeMaintenanceScore(prev.maintenanceScore, maintenanceLevel);
      const newGuestRating = computeGuestRating(prev.guestRating, newMaintenanceScore, occupancy);

      const result: MonthResult = {
        month,
        monthName: MONTH_NAMES[month - 1],
        event,
        occupancy,
        adr: adrFinal,
        roomNights,
        revenue,
        expenses,
        expenseBreakdown,
        profit,
        guestRating: newGuestRating,
        cumulativeProfit,
      };

      const isLast = month >= prev.totalMonths;
      const usedIds = new Set(monthHistory.map((r) => r.event.id));
      usedIds.add(event.id);
      const nextEvent = isLast ? null : pickEvent(usedIds);

      // Save high score on last month
      if (isLast) {
        const finalProfit = prev.cash + profit - prev.startingCash;
        saveHighScore({
          game: 'riads-and-rials',
          score: finalProfit,
          date: new Date().toISOString(),
          label: `${finalProfit >= 0 ? '+' : ''}${Math.round(finalProfit).toLocaleString('fr-MA')} MAD`,
        });
      }

      return {
        ...prev,
        phase: isLast ? 'summary' : 'results',
        maintenanceScore: newMaintenanceScore,
        guestRating: newGuestRating,
        cash: prev.cash + profit,
        monthHistory: [...monthHistory, result],
        currentEvent: nextEvent,
      };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'decision',
      month: prev.month + 1,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(makeInitialState());
  }, []);

  const totalProfit = state.cash - state.startingCash;
  const lastMonth   = state.monthHistory[state.monthHistory.length - 1] ?? null;

  // Expense preview: estimated costs before confirming
  const expensePreview = useMemo((): ExpenseBreakdown => {
    const mktConfig = MARKETING_CONFIG[state.marketingLevel];
    // Estimate revenue for commission calculation (use a rough occupancy estimate)
    const estOccupancy = 0.65;
    const adr = ADR_BY_PRICE[state.priceLevel];
    const days = DAYS_IN_MONTH[(state.month - 1) % 12];
    const estRevenue = Math.round(state.rooms * estOccupancy * days * adr);
    const marketingCommission = Math.round(estRevenue * mktConfig.revenueCommission);
    const total = FIXED_MONTHLY_COSTS.staff + FIXED_MONTHLY_COSTS.utilities +
                  MAINTENANCE_COST[state.maintenanceLevel] + mktConfig.fixedCost + marketingCommission;
    return {
      staff: FIXED_MONTHLY_COSTS.staff,
      utilities: FIXED_MONTHLY_COSTS.utilities,
      maintenance: MAINTENANCE_COST[state.maintenanceLevel],
      marketingFixed: mktConfig.fixedCost,
      marketingCommission,
      total,
    };
  }, [state.priceLevel, state.maintenanceLevel, state.marketingLevel, state.month, state.rooms]);

  return {
    state,
    startGame,
    setDecision,
    confirmMonth,
    nextMonth,
    resetGame,
    totalProfit,
    lastMonth,
    expensePreview,
  };
}
