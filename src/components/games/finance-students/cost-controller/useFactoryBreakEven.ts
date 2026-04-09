'use client';

import { useState, useCallback } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase = 'intro' | 'plan' | 'demand_reveal' | 'results' | 'summary';

export interface CostStructure {
  fixedCosts: number;          // MAD/month
  variableCostPerUnit: number; // MAD
  sellingPrice: number;        // MAD
  capacityInvested: boolean;
}

export interface ProductionDecision {
  quantity: number;
  priceAdjustment: number;     // e.g. -0.2 to 0.2
  investInCapacity: boolean;
}

export interface DemandOutcome {
  forecast: number;
  actual: number;
  seasonalityFactor: number;
}

export interface PeriodResult {
  period: number;
  decision: ProductionDecision;
  demand: DemandOutcome;
  unitsSold: number;
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  inventoryCost: number;
  profit: number;
  breakEvenQty: number;
  contributionMargin: number;
}

export interface BreakEvenGameState {
  phase: GamePhase;
  period: number;
  totalPeriods: number;
  cash: number;
  costs: CostStructure;
  currentDecision: ProductionDecision;
  lastDemand: DemandOutcome | null;
  inventory: number;
  history: PeriodResult[];
}

// ─── Data & Constants ─────────────────────────────────────────────────────────

const INITIAL_COSTS: CostStructure = {
  fixedCosts: 50_000,
  variableCostPerUnit: 80,
  sellingPrice: 150,
  capacityInvested: false,
};

const BASE_FORECAST = 320;
export const SEASONALITY = [0.8, 0.9, 1.2, 1.3, 1.0, 0.8]; // 6 months seasonality
const PRICE_ELASTICITY = -1.5; // -10% price -> +15% demand
const INVENTORY_HOLDING_COST = 8; // MAD per unit per month

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFactoryBreakEven() {
  const [state, setState] = useState<BreakEvenGameState>({
    phase: 'intro',
    period: 1,
    totalPeriods: 6,
    cash: 100_000,
    costs: INITIAL_COSTS,
    currentDecision: {
      quantity: 300,
      priceAdjustment: 0,
      investInCapacity: false,
    },
    lastDemand: null,
    inventory: 0,
    history: [],
  });

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'plan' }));
  }, []);

  const setDecision = useCallback((key: keyof ProductionDecision, value: any) => {
    setState(prev => ({
      ...prev,
      currentDecision: { ...prev.currentDecision, [key]: value },
    }));
  }, []);

  const confirmPlan = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'demand_reveal' }));
  }, []);

  const revealResults = useCallback(() => {
    setState(prev => {
      const { quantity, priceAdjustment, investInCapacity } = prev.currentDecision;
      const seasonality = SEASONALITY[prev.period - 1] || 1.0;
      
      // Effective price
      const price = prev.costs.sellingPrice * (1 + priceAdjustment);
      
      // Variable cost shift if capacity invested
      let vCost = prev.costs.variableCostPerUnit;
      let fCost = prev.costs.fixedCosts;
      if (investInCapacity || prev.costs.capacityInvested) {
        vCost = 70; // Lower variable cost
        fCost += 15_000; // Higher fixed cost
      }

      // Demand calculation
      const priceRatio = price / prev.costs.sellingPrice;
      const elasticityFactor = Math.pow(priceRatio, PRICE_ELASTICITY);
      const forecast = Math.round(BASE_FORECAST * seasonality * elasticityFactor);
      const noise = (Math.random() - 0.5) * 0.1 * forecast;
      const actualDemand = Math.max(0, Math.round(forecast + noise));

      // Sales & Inventory
      const totalAvailable = quantity + prev.inventory;
      const unitsSold = Math.min(totalAvailable, actualDemand);
      const unsoldUnits = Math.max(0, totalAvailable - actualDemand);

      // Financials
      const revenue = unitsSold * price;
      const totalVariableCosts = quantity * vCost;
      const inventoryCost = unsoldUnits * INVENTORY_HOLDING_COST;
      const profit = revenue - totalVariableCosts - fCost - inventoryCost;
      
      const contributionMargin = price - vCost;
      const breakEvenQty = contributionMargin > 0 ? Math.ceil(fCost / contributionMargin) : Infinity;

      const result: PeriodResult = {
        period: prev.period,
        decision: { ...prev.currentDecision },
        demand: { forecast, actual: actualDemand, seasonalityFactor: seasonality },
        unitsSold,
        revenue,
        variableCosts: totalVariableCosts,
        fixedCosts: fCost,
        inventoryCost,
        profit,
        breakEvenQty,
        contributionMargin,
      };

      const isLast = prev.period >= prev.totalPeriods;
      const newCash = prev.cash + profit;
      
      if (isLast) {
        saveHighScore({
          game: 'factory-break-even',
          score: Math.round(newCash),
          date: new Date().toISOString(),
          label: `${newCash >= 0 ? '+' : ''}${Math.round(newCash / 1000)}k MAD`,
        });
      }

      return {
        ...prev,
        phase: 'results',
        cash: newCash,
        inventory: unsoldUnits,
        costs: {
          ...prev.costs,
          capacityInvested: prev.costs.capacityInvested || investInCapacity,
          variableCostPerUnit: vCost,
          fixedCosts: fCost,
        },
        currentDecision: { ...prev.currentDecision, investInCapacity: false }, // reset toggle
        lastDemand: { forecast, actual: actualDemand, seasonalityFactor: seasonality },
        history: [...prev.history, result],
      };
    });
  }, []);

  const nextPeriod = useCallback(() => {
    setState(prev => {
      const nextP = prev.period + 1;
      const finished = nextP > prev.totalPeriods;
      return {
        ...prev,
        phase: finished ? 'summary' : 'plan',
        period: nextP,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'intro',
      period: 1,
      totalPeriods: 6,
      cash: 100_000,
      costs: INITIAL_COSTS,
      currentDecision: { quantity: 300, priceAdjustment: 0, investInCapacity: false },
      lastDemand: null,
      inventory: 0,
      history: [],
    });
  }, []);

  return {
    state,
    startGame,
    setDecision,
    confirmPlan,
    revealResults,
    nextPeriod,
    resetGame,
  };
}
