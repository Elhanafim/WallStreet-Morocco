import { useState, useCallback } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriceLevel = 'base' | 'small_discount' | 'big_discount' | 'premium';
export type CustomerType = 'local_regular' | 'tourist' | 'group_buyer' | 'collector';
export type GamePhase = 'intro' | 'prep' | 'playing' | 'result' | 'day_summary' | 'game_over';

export interface Product {
  id: string;
  name: string;
  emoji: string;
  unitCost: number;       // vendor cost per unit (MAD)
  basePrice: number;      // normal selling price (MAD)
  maxStock: number;
  currentStock: number;
  unitsSold: number;
  totalRevenue: number;
  priceLevel: PriceLevel; // set during prep
  isPromoted: boolean;    // bundle promotion (buy 2, get 10% off)
}

export interface Customer {
  name: string;
  emoji: string;
  type: CustomerType;
  typeLabel: string;
  preferredProductId: string;
  maxWillingToPay: number;
  quantity: number;       // 1 normally, 2 for group_buyer
}

export interface DayEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  trafficMultiplier: number;   // 1.0 = normal
  costMultiplier: number;      // 1.0 = normal
  budgetMultiplier: number;    // 1.0 = normal
  touristBoost: boolean;
}

export interface SaleResult {
  sold: boolean;
  revenue: number;
  cogs: number;
  profit: number;
  quantity: number;
  message: string;
  reputationDelta: number;
}

export interface DaySummaryData {
  day: number;
  event: DayEvent;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  customerCount: number;
  salesCount: number;
  lostCount: number;
  stockoutCount: number;
  reputationEnd: number;
}

export interface SoukDayState {
  phase: GamePhase;
  day: number;
  totalDays: number;
  round: number;
  totalRounds: number;
  cash: number;
  startingCash: number;
  reputation: number;             // 0-100
  products: Product[];
  currentCustomer: Customer | null;
  currentEvent: DayEvent | null;
  lastResult: SaleResult | null;
  pendingPrice: PriceLevel;
  dayHistory: DaySummaryData[];
  // Current day aggregates
  dayRevenue: number;
  dayCOGS: number;
  daySales: number;
  dayLost: number;
  dayStockouts: number;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const BASE_PRODUCTS: Omit<Product, 'currentStock' | 'unitsSold' | 'totalRevenue' | 'priceLevel' | 'isPromoted'>[] = [
  { id: 'dates',     name: 'Dattes Medjool',    emoji: '🌴', unitCost: 15, basePrice: 30, maxStock: 20 },
  { id: 'olives',    name: 'Olives marinées',   emoji: '🫒', unitCost: 10, basePrice: 22, maxStock: 20 },
  { id: 'tea',       name: 'Thé à la menthe',   emoji: '🍵', unitCost:  5, basePrice: 12, maxStock: 30 },
  { id: 'souvenirs', name: 'Artisanat',         emoji: '🏺', unitCost: 25, basePrice: 60, maxStock: 15 },
];

function makeProducts(): Product[] {
  return BASE_PRODUCTS.map((p) => ({
    ...p,
    currentStock: p.maxStock,
    unitsSold: 0,
    totalRevenue: 0,
    priceLevel: 'base' as PriceLevel,
    isPromoted: false,
  }));
}

const CUSTOMER_PERSONAS = [
  { name: 'Ahmed',   emoji: '🧔'   },
  { name: 'Fatima',  emoji: '👩'   },
  { name: 'Youssef', emoji: '🧑'   },
  { name: 'Aicha',   emoji: '👩🏽'  },
  { name: 'Karim',   emoji: '🧔🏽'  },
  { name: 'Nadia',   emoji: '👩🏻'  },
  { name: 'Omar',    emoji: '👴'   },
  { name: 'Leila',   emoji: '👧'   },
  { name: 'Hassan',  emoji: '👨'   },
  { name: 'Mariam',  emoji: '👩🏽‍💼' },
  { name: 'Bilal',   emoji: '🧑🏻'  },
  { name: 'Zineb',   emoji: '👩‍🦱' },
  { name: 'Sophie',  emoji: '👱‍♀️' },
  { name: 'James',   emoji: '👨🏼'  },
  { name: 'Yuki',    emoji: '👩🏻‍🦰' },
  { name: 'Hans',    emoji: '🧓'   },
];

interface CustomerConfig {
  label: string;
  /** Max price ratio relative to base price */
  maxRatio: number;
  /** Weight for random selection */
  weight: number;
  /** Preferred product ids (empty = any) */
  preferredProducts: string[];
  /** Quantity per purchase */
  quantity: number;
}

const CUSTOMER_CONFIG: Record<CustomerType, CustomerConfig> = {
  local_regular:  { label: 'Client local',           maxRatio: 0.82, weight: 0.35, preferredProducts: ['dates', 'olives', 'tea'], quantity: 1 },
  tourist:        { label: 'Touriste',                maxRatio: 1.05, weight: 0.30, preferredProducts: ['souvenirs', 'tea'],       quantity: 1 },
  group_buyer:    { label: 'Acheteur en groupe',      maxRatio: 0.88, weight: 0.20, preferredProducts: [],                         quantity: 2 },
  collector:      { label: 'Collectionneur',          maxRatio: 1.20, weight: 0.15, preferredProducts: ['souvenirs'],              quantity: 1 },
};

/** Price ratio applied to base price */
export const PRICE_RATIO: Record<PriceLevel, number> = {
  base:           1.00,
  small_discount: 0.85,
  big_discount:   0.70,
  premium:        1.15,
};

export const PRICE_LABELS: Record<PriceLevel, { label: string; sublabel: string }> = {
  base:           { label: 'Prix normal',     sublabel: '100% du prix de base' },
  small_discount: { label: '−15% de remise',  sublabel: 'Petite réduction' },
  big_discount:   { label: '−30% de remise',  sublabel: 'Grosse réduction' },
  premium:        { label: '+15% prestige',   sublabel: 'Prix premium' },
};

export const EVENT_POOL: DayEvent[] = [
  { id: 'sunny',          emoji: '☀️', title: 'Beau temps',           description: 'Le soleil attire les passants au souk — plus de clients aujourd\'hui.',     trafficMultiplier: 1.20, costMultiplier: 1.0,  budgetMultiplier: 1.0,  touristBoost: false },
  { id: 'rain',           emoji: '🌧️', title: 'Pluie',                description: 'La pluie éloigne les promeneurs — moins de passage.',                       trafficMultiplier: 0.70, costMultiplier: 1.0,  budgetMultiplier: 1.0,  touristBoost: false },
  { id: 'tourist_bus',    emoji: '🚌', title: 'Bus de touristes',     description: 'Un bus de touristes débarque ! Ils sont prêts à dépenser.',                 trafficMultiplier: 1.10, costMultiplier: 1.0,  budgetMultiplier: 1.10, touristBoost: true  },
  { id: 'supplier_shock', emoji: '📈', title: 'Hausse fournisseur',   description: 'Le prix d\'achat de vos produits augmente de 20% aujourd\'hui.',            trafficMultiplier: 1.0,  costMultiplier: 1.20, budgetMultiplier: 1.0,  touristBoost: false },
  { id: 'festival',       emoji: '🎉', title: 'Festival local',       description: 'C\'est la fête dans le quartier ! Les clients sont plus généreux.',         trafficMultiplier: 1.30, costMultiplier: 1.0,  budgetMultiplier: 1.15, touristBoost: false },
  { id: 'normal',         emoji: '😌', title: 'Journée normale',      description: 'Rien de particulier — une journée classique au souk.',                      trafficMultiplier: 1.0,  costMultiplier: 1.0,  budgetMultiplier: 1.0,  touristBoost: false },
];

const TOTAL_ROUNDS = 12;
const TOTAL_DAYS = 3;
const STARTING_CASH = 500;
const STARTING_REPUTATION = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd() { return Math.random(); }

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function pickWeighted<T extends string>(options: T[], weights: number[]): T {
  let r = rnd();
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

function pickEvent(usedIds: Set<string>): DayEvent {
  const available = EVENT_POOL.filter((e) => !usedIds.has(e.id));
  const pool = available.length > 0 ? available : EVENT_POOL;
  return pool[Math.floor(rnd() * pool.length)];
}

/**
 * Generate a customer based on event and available products.
 * The event can boost tourist proportion and customer budgets.
 */
function generateCustomer(
  products: Product[],
  event: DayEvent,
  reputation: number,
): Customer {
  const available = products.filter((p) => p.currentStock > 0);
  const pool = available.length > 0 ? available : products;

  // Adjust customer type weights based on event
  const types: CustomerType[] = ['local_regular', 'tourist', 'group_buyer', 'collector'];
  let weights = types.map((t) => CUSTOMER_CONFIG[t].weight);

  if (event.touristBoost) {
    // Double tourist weight
    const touristIdx = types.indexOf('tourist');
    weights[touristIdx] *= 2;
    // Re-normalize
    const sum = weights.reduce((s, w) => s + w, 0);
    weights = weights.map((w) => w / sum);
  }

  const type = pickWeighted(types, weights);
  const config = CUSTOMER_CONFIG[type];

  // Pick preferred product
  const preferredPool = config.preferredProducts.length > 0
    ? pool.filter((p) => config.preferredProducts.includes(p.id))
    : pool;
  const productPool = preferredPool.length > 0 ? preferredPool : pool;
  const product = productPool[Math.floor(rnd() * productPool.length)];

  // Calculate max willing to pay
  // Budget is influenced by: base ratio, event budget multiplier, reputation bonus
  const reputationBonus = reputation > 70 ? 1.08 : reputation < 30 ? 0.90 : 1.0;
  const jitter = 0.90 + rnd() * 0.20; // ±10%
  const maxWillingToPay = Math.round(
    product.basePrice * config.maxRatio * event.budgetMultiplier * reputationBonus * jitter
  );

  const persona = CUSTOMER_PERSONAS[Math.floor(rnd() * CUSTOMER_PERSONAS.length)];

  return {
    name: persona.name,
    emoji: persona.emoji,
    type,
    typeLabel: config.label,
    preferredProductId: product.id,
    maxWillingToPay,
    quantity: config.quantity,
  };
}

/**
 * Resolve a sale: check if customer buys based on price vs willingness.
 * Returns updated product and sale result.
 */
function resolveSale(
  product: Product,
  customer: Customer,
  event: DayEvent,
): SaleResult {
  const priceRatio = PRICE_RATIO[product.priceLevel];
  const unitPrice = Math.round(product.basePrice * priceRatio);
  const quantity = Math.min(customer.quantity, product.currentStock);

  // Apply promotion: 10% off if buying 2+ of a promoted product
  const promoDiscount = product.isPromoted && quantity >= 2 ? 0.90 : 1.0;
  const totalPrice = Math.round(unitPrice * quantity * promoDiscount);

  if (product.currentStock <= 0) {
    return {
      sold: false, revenue: 0, cogs: 0, profit: 0, quantity: 0,
      message: `Rupture de stock sur ${product.name} ! 😞`,
      reputationDelta: -2,
    };
  }

  // Customer compares total price to their budget × quantity
  const customerBudget = customer.maxWillingToPay * quantity;
  const sold = totalPrice <= customerBudget;

  if (!sold) {
    const gap = totalPrice - customerBudget;
    return {
      sold: false, revenue: 0, cogs: 0, profit: 0, quantity: 0,
      message: `${customer.name} a refusé — votre prix dépassait son budget de ${gap} MAD`,
      reputationDelta: -3,
    };
  }

  // Compute cost with event multiplier
  const actualUnitCost = Math.round(product.unitCost * event.costMultiplier);
  const cogs = actualUnitCost * quantity;
  const profit = totalPrice - cogs;
  const margin = Math.round(((totalPrice - cogs) / totalPrice) * 100);

  // Reputation delta: fair price = +2, big discount = +1, premium = +3 if sold
  let reputationDelta = 2;
  if (product.priceLevel === 'big_discount') reputationDelta = 1;
  if (product.priceLevel === 'premium') reputationDelta = 3;

  const qtyLabel = quantity > 1 ? ` (×${quantity})` : '';
  return {
    sold: true,
    revenue: totalPrice,
    cogs,
    profit,
    quantity,
    message: `Vendu à ${totalPrice} MAD${qtyLabel} — marge de ${margin}%`,
    reputationDelta,
  };
}

function makeInitialState(): SoukDayState {
  return {
    phase: 'intro',
    day: 1,
    totalDays: TOTAL_DAYS,
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    cash: STARTING_CASH,
    startingCash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    products: makeProducts(),
    currentCustomer: null,
    currentEvent: null,
    lastResult: null,
    pendingPrice: 'base',
    dayHistory: [],
    dayRevenue: 0,
    dayCOGS: 0,
    daySales: 0,
    dayLost: 0,
    dayStockouts: 0,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSoukDay() {
  const [state, setState] = useState<SoukDayState>(makeInitialState);

  /** Start the game: go to day 1 prep */
  const startGame = useCallback(() => {
    const event = pickEvent(new Set());
    setState({
      ...makeInitialState(),
      phase: 'prep',
      currentEvent: event,
      products: makeProducts(),
    });
  }, []);

  /** Set price level for a product during prep */
  const setProductPrice = useCallback((productId: string, level: PriceLevel) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, priceLevel: level } : p
      ),
    }));
  }, []);

  /** Toggle promotion on a product (only one at a time) */
  const togglePromotion = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => ({
        ...p,
        isPromoted: p.id === productId ? !p.isPromoted : false,
      })),
    }));
  }, []);

  /** Confirm prep, start the sales phase */
  const confirmPrep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentEvent) return prev;
      return {
        ...prev,
        phase: 'playing',
        round: 1,
        dayRevenue: 0,
        dayCOGS: 0,
        daySales: 0,
        dayLost: 0,
        dayStockouts: 0,
        currentCustomer: generateCustomer(prev.products, prev.currentEvent, prev.reputation),
        lastResult: null,
        pendingPrice: 'base',
      };
    });
  }, []);

  /** Set the pending price level during a sale */
  const setPendingPrice = useCallback((level: PriceLevel) => {
    setState((prev) => ({ ...prev, pendingPrice: level }));
  }, []);

  /** Confirm the sale with the pending price */
  const confirmSale = useCallback(() => {
    setState((prev) => {
      if (!prev.currentCustomer || !prev.currentEvent || prev.phase !== 'playing') return prev;

      const customer = prev.currentCustomer;
      const product = prev.products.find((p) => p.id === customer.preferredProductId)!;

      // Temporarily override product price level with pending price for this sale
      const productWithPrice = { ...product, priceLevel: prev.pendingPrice };
      const result = resolveSale(productWithPrice, customer, prev.currentEvent);

      const updatedProducts = prev.products.map((p) => {
        if (p.id === product.id && result.sold) {
          return {
            ...p,
            currentStock: p.currentStock - result.quantity,
            unitsSold: p.unitsSold + result.quantity,
            totalRevenue: p.totalRevenue + result.revenue,
          };
        }
        return p;
      });

      const newReputation = clamp(prev.reputation + result.reputationDelta, 0, 100);
      const isStockout = product.currentStock <= 0 && !result.sold;

      return {
        ...prev,
        phase: 'result',
        cash: prev.cash + result.profit,
        products: updatedProducts,
        lastResult: result,
        reputation: newReputation,
        dayRevenue: prev.dayRevenue + result.revenue,
        dayCOGS: prev.dayCOGS + result.cogs,
        daySales: prev.daySales + (result.sold ? 1 : 0),
        dayLost: prev.dayLost + (result.sold ? 0 : 1),
        dayStockouts: prev.dayStockouts + (isStockout ? 1 : 0),
      };
    });
  }, []);

  /** Move to next customer, or to day summary if the round is over */
  const nextCustomer = useCallback(() => {
    setState((prev) => {
      if (!prev.currentEvent) return prev;
      const nextRound = prev.round + 1;

      if (nextRound > prev.totalRounds) {
        // End of day — compute day summary
        const summary: DaySummaryData = {
          day: prev.day,
          event: prev.currentEvent,
          totalRevenue: prev.dayRevenue,
          totalCOGS: prev.dayCOGS,
          grossProfit: prev.dayRevenue - prev.dayCOGS,
          customerCount: prev.totalRounds,
          salesCount: prev.daySales,
          lostCount: prev.dayLost,
          stockoutCount: prev.dayStockouts,
          reputationEnd: prev.reputation,
        };

        return {
          ...prev,
          phase: 'day_summary',
          dayHistory: [...prev.dayHistory, summary],
        };
      }

      return {
        ...prev,
        phase: 'playing',
        round: nextRound,
        currentCustomer: generateCustomer(prev.products, prev.currentEvent, prev.reputation),
        lastResult: null,
        pendingPrice: 'base',
      };
    });
  }, []);

  /** Start next day (restock and new event) or go to game over */
  const nextDay = useCallback(() => {
    setState((prev) => {
      if (prev.day >= prev.totalDays) {
        // Game over — save high score
        const totalProfit = prev.cash - prev.startingCash;
        saveHighScore({
          game: 'souk-day',
          score: totalProfit,
          date: new Date().toISOString(),
          label: `${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('fr-MA')} MAD`,
        });

        return {
          ...prev,
          phase: 'game_over',
        };
      }

      // Next day: restock, new event
      const usedEventIds = new Set(prev.dayHistory.map((d) => d.event.id));
      const newEvent = pickEvent(usedEventIds);

      return {
        ...prev,
        phase: 'prep',
        day: prev.day + 1,
        currentEvent: newEvent,
        products: prev.products.map((p) => ({
          ...p,
          currentStock: p.maxStock,
          unitsSold: 0,
          totalRevenue: 0,
          priceLevel: 'base' as PriceLevel,
          isPromoted: false,
        })),
        dayRevenue: 0,
        dayCOGS: 0,
        daySales: 0,
        dayLost: 0,
        dayStockouts: 0,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(makeInitialState());
  }, []);

  // ─── Derived values ───────────────────────────────────────────────────────

  const totalProfit = state.cash - state.startingCash;
  const totalRevenue = state.dayHistory.reduce((s, d) => s + d.totalRevenue, 0) + state.dayRevenue;
  const totalCOGS = state.dayHistory.reduce((s, d) => s + d.totalCOGS, 0) + state.dayCOGS;

  const bestProductOverall = (() => {
    // Aggregate across all days (from history + current)
    const totals: Record<string, number> = {};
    for (const p of state.products) {
      totals[p.id] = (totals[p.id] ?? 0) + p.unitsSold;
    }
    for (const d of state.dayHistory) {
      // dayHistory doesn't track per-product — we rely on current products
    }
    const entries = Object.entries(totals);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return state.products.find((p) => p.id === entries[0][0]) ?? null;
  })();

  return {
    state,
    startGame,
    setProductPrice,
    togglePromotion,
    confirmPrep,
    setPendingPrice,
    confirmSale,
    nextCustomer,
    nextDay,
    resetGame,
    totalProfit,
    totalRevenue,
    totalCOGS,
    bestProductOverall,
  };
}
