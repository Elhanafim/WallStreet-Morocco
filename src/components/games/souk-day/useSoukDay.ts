import { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriceLevel = 'base' | 'small_discount' | 'big_discount';
export type BehaviorType = 'full_price' | 'wants_discount' | 'price_sensitive';
export type GamePhase = 'intro' | 'playing' | 'result' | 'summary';

export interface Product {
  id: string;
  name: string;
  emoji: string;
  unitCost: number;   // vendor's cost per unit (MAD)
  basePrice: number;  // normal selling price (MAD)
  stock: number;
  unitsSold: number;
}

export interface Customer {
  name: string;
  emoji: string;
  preferredProductId: string;
  behavior: BehaviorType;
  behaviorLabel: string;
  /** Max price this customer will pay (derived from behavior) */
  maxWillingToPay: number;
}

export interface SaleResult {
  sold: boolean;
  chosenPrice: number;
  cogs: number;
  profit: number;
  message: string;
}

export interface SoukDayState {
  phase: GamePhase;
  round: number;
  totalRounds: number;
  cash: number;
  startingCash: number;
  products: Product[];
  currentCustomer: Customer | null;
  lastResult: SaleResult | null;
  /** Pending price choice before confirming */
  pendingPrice: PriceLevel;
  // Aggregates
  totalRevenue: number;
  totalCOGS: number;
  lostCustomers: number;
  priceChoiceCounts: Record<PriceLevel, number>;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  { id: 'dates',     name: 'Dattes',           emoji: '🌴', unitCost: 15, basePrice: 30, stock: 20, unitsSold: 0 },
  { id: 'olives',    name: 'Olives marinées',  emoji: '🫒', unitCost: 10, basePrice: 22, stock: 20, unitsSold: 0 },
  { id: 'tea',       name: 'Thé à la menthe',  emoji: '🍵', unitCost:  5, basePrice: 12, stock: 30, unitsSold: 0 },
  { id: 'souvenirs', name: 'Artisanat',        emoji: '🏺', unitCost: 25, basePrice: 60, stock: 15, unitsSold: 0 },
];

const CUSTOMER_POOL = [
  { name: 'Ahmed',   emoji: '🧔' },
  { name: 'Fatima',  emoji: '👩' },
  { name: 'Youssef', emoji: '🧑' },
  { name: 'Aicha',   emoji: '👩🏽' },
  { name: 'Karim',   emoji: '🧔🏽' },
  { name: 'Nadia',   emoji: '👩🏻' },
  { name: 'Omar',    emoji: '👴' },
  { name: 'Leila',   emoji: '👧' },
  { name: 'Hassan',  emoji: '👨' },
  { name: 'Mariam',  emoji: '👩🏽‍💼' },
  { name: 'Bilal',   emoji: '🧑🏻' },
  { name: 'Zineb',   emoji: '👩‍🦱' },
];

/** Ratio of base price the customer will pay at most */
const BEHAVIOR_CONFIG: Record<BehaviorType, { label: string; maxRatio: number; weight: number }> = {
  full_price:      { label: 'Prêt à payer le prix',    maxRatio: 1.00, weight: 0.35 },
  wants_discount:  { label: 'Cherche une remise',       maxRatio: 0.83, weight: 0.40 },
  price_sensitive: { label: 'Très sensible au prix',   maxRatio: 0.68, weight: 0.25 },
};

/** Price applied as fraction of base price */
const PRICE_RATIO: Record<PriceLevel, number> = {
  base:           1.00,
  small_discount: 0.85,
  big_discount:   0.70,
};

const TOTAL_ROUNDS = 12;
const STARTING_CASH = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd() {
  return Math.random();
}

function pickWeighted<T extends string>(
  options: T[],
  weights: number[]
): T {
  let r = rnd();
  for (let i = 0; i < options.length; i++) {
    r -= weights[i];
    if (r <= 0) return options[i];
  }
  return options[options.length - 1];
}

function generateCustomer(products: Product[]): Customer {
  const available = products.filter((p) => p.stock > 0);
  // Fall back to all products if stock is exhausted
  const pool = available.length > 0 ? available : products;
  const product = pool[Math.floor(rnd() * pool.length)];

  const behaviors: BehaviorType[] = ['full_price', 'wants_discount', 'price_sensitive'];
  const weights = behaviors.map((b) => BEHAVIOR_CONFIG[b].weight);
  const behavior = pickWeighted(behaviors, weights);
  const config = BEHAVIOR_CONFIG[behavior];

  // Add slight randomness (±10%) to the maxWillingToPay
  const jitter = 0.90 + rnd() * 0.20;
  const maxWillingToPay = Math.round(product.basePrice * config.maxRatio * jitter);

  const persona = CUSTOMER_POOL[Math.floor(rnd() * CUSTOMER_POOL.length)];

  return {
    name: persona.name,
    emoji: persona.emoji,
    preferredProductId: product.id,
    behavior,
    behaviorLabel: config.label,
    maxWillingToPay,
  };
}

function makeInitialState(): SoukDayState {
  return {
    phase: 'intro',
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    cash: STARTING_CASH,
    startingCash: STARTING_CASH,
    products: INITIAL_PRODUCTS.map((p) => ({ ...p })),
    currentCustomer: null,
    lastResult: null,
    pendingPrice: 'base',
    totalRevenue: 0,
    totalCOGS: 0,
    lostCustomers: 0,
    priceChoiceCounts: { base: 0, small_discount: 0, big_discount: 0 },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSoukDay() {
  const [state, setState] = useState<SoukDayState>(makeInitialState);

  const startGame = useCallback(() => {
    const products = INITIAL_PRODUCTS.map((p) => ({ ...p }));
    setState({
      ...makeInitialState(),
      phase: 'playing',
      products,
      currentCustomer: generateCustomer(products),
    });
  }, []);

  const setPendingPrice = useCallback((level: PriceLevel) => {
    setState((prev) => ({ ...prev, pendingPrice: level }));
  }, []);

  const confirmSale = useCallback(() => {
    setState((prev) => {
      if (!prev.currentCustomer || prev.phase !== 'playing') return prev;

      const customer = prev.currentCustomer;
      const product = prev.products.find((p) => p.id === customer.preferredProductId)!;
      const ratio = PRICE_RATIO[prev.pendingPrice];
      const chosenPrice = Math.round(product.basePrice * ratio);

      const outOfStock = product.stock <= 0;
      const sold = !outOfStock && chosenPrice <= customer.maxWillingToPay;

      const revenue = sold ? chosenPrice : 0;
      const cogs    = sold ? product.unitCost : 0;
      const profit  = revenue - cogs;

      let message: string;
      if (outOfStock) {
        message = `Rupture de stock sur ${product.name} !`;
      } else if (sold) {
        const margin = Math.round(((chosenPrice - product.unitCost) / chosenPrice) * 100);
        message = `Vendu à ${chosenPrice} MAD — marge de ${margin}%`;
      } else {
        const gap = chosenPrice - customer.maxWillingToPay;
        message = `${customer.name} a refusé — votre prix dépassait son budget de ${gap} MAD`;
      }

      const updatedProducts = prev.products.map((p) =>
        p.id === product.id && sold
          ? { ...p, stock: p.stock - 1, unitsSold: p.unitsSold + 1 }
          : p
      );

      const isLast = prev.round >= prev.totalRounds;

      return {
        ...prev,
        phase: isLast ? 'summary' : 'result',
        round: prev.round + (isLast ? 0 : 0), // keep for display in result screen
        cash: prev.cash + profit,
        products: updatedProducts,
        currentCustomer: prev.currentCustomer, // keep for result display
        lastResult: { sold, chosenPrice, cogs, profit, message },
        totalRevenue: prev.totalRevenue + revenue,
        totalCOGS: prev.totalCOGS + cogs,
        lostCustomers: prev.lostCustomers + (sold ? 0 : 1),
        priceChoiceCounts: {
          ...prev.priceChoiceCounts,
          [prev.pendingPrice]: prev.priceChoiceCounts[prev.pendingPrice] + 1,
        },
      };
    });
  }, []);

  const nextCustomer = useCallback(() => {
    setState((prev) => {
      const nextRound = prev.round + 1;
      const updatedProducts = prev.products;
      return {
        ...prev,
        phase: 'playing',
        round: nextRound,
        currentCustomer: generateCustomer(updatedProducts),
        lastResult: null,
        pendingPrice: 'base',
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(makeInitialState());
  }, []);

  // Derived summary helpers
  const totalProfit = state.cash - state.startingCash;
  const bestProduct = [...state.products].sort((a, b) => b.unitsSold - a.unitsSold)[0] ?? null;
  const mostUsedPrice = (Object.entries(state.priceChoiceCounts) as [PriceLevel, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? 'base';

  return {
    state,
    startGame,
    setPendingPrice,
    confirmSale,
    nextCustomer,
    resetGame,
    totalProfit,
    bestProduct,
    mostUsedPrice,
  };
}
