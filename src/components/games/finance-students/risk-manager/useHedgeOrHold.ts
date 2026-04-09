'use client';

import { useState, useCallback } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExposureType = 'fx' | 'rate' | 'commodity';
export type HedgeLevel = 'none' | 'partial' | 'full';
export type Outlook = 'bullish' | 'bearish' | 'uncertain';
export type GamePhase = 'intro' | 'decision' | 'market_reveal' | 'results' | 'summary';

export interface Exposure {
  id: string;
  name: string;
  emoji: string;
  type: ExposureType;
  notional: number;            // MAD
  description: string;
  riskDirection: string;       // "EUR↑ = perte" etc.
}

export interface MarketOutlook {
  exposureId: string;
  outlook: Outlook;
  hint: string;
}

export interface MarketMove {
  exposureId: string;
  move: number;                // signed percentage
  label: string;
}

export interface HedgeDecision {
  exposureId: string;
  level: HedgeLevel;
}

export interface PeriodResult {
  period: number;
  decisions: HedgeDecision[];
  moves: MarketMove[];
  pnl: { exposureId: string; unhedgedPnL: number; hedgeCost: number; hedgedPnL: number }[];
  totalUnhedged: number;
  totalHedged: number;
}

export interface HedgeGameState {
  phase: GamePhase;
  period: number;
  totalPeriods: number;
  cumulativePnL: number;
  cumulativeUnhedgedPnL: number;
  exposures: Exposure[];
  outlooks: MarketOutlook[];
  decisions: HedgeDecision[];
  history: PeriodResult[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXPOSURES: Exposure[] = [
  { 
    id: 'eur_mad', 
    name: 'Import EUR/MAD', 
    emoji: '💶', 
    type: 'fx', 
    notional: 5_000_000, 
    description: 'Vous importez des composants d\'Europe payables en EUR.', 
    riskDirection: 'EUR↑ = Perte' 
  },
  { 
    id: 'floating_rate', 
    name: 'Taux Variable', 
    emoji: '📈', 
    type: 'rate', 
    notional: 10_000_000, 
    description: 'Un prêt bancaire à taux variable (indexé sur le MONIA).', 
    riskDirection: 'Taux↑ = Perte' 
  },
  { 
    id: 'brent_oil', 
    name: 'Pétrole Brent', 
    emoji: '🛢️', 
    type: 'commodity', 
    notional: 3_000_000, 
    description: 'Facture énergétique pour votre usine de production.', 
    riskDirection: 'Oil↑ = Perte' 
  },
];

const OUTLOOKS: Record<Outlook, string[]> = {
  bullish: ['La pression inflationniste devrait soutenir les cours.', 'Les analystes prévoient une hausse technique imminente.', 'La demande mondiale s\'accélère fortement.'],
  bearish: ['Le ralentissement économique pèse sur la demande.', 'L\'offre excédentaire devrait faire baisser les prix.', 'On observe une détente sur les marchés internationaux.'],
  uncertain: ['Le marché est volatil suite aux annonces géopolitiques.', 'Pas de tendance claire à court terme.', 'L\'attente des chiffres du chômage paralyse les investisseurs.'],
};

const HEDGE_COSTS: Record<HedgeLevel, number> = {
  none: 0,
  partial: 0.004, // 0.4% per period
  full: 0.008,    // 0.8% per period
};

const MOVE_SCALES: Record<ExposureType, number> = {
  fx: 0.04,        // ±4% typical move
  rate: 0.015,     // ±1.5% typical move (150 bps relative)
  commodity: 0.12, // ±12% typical move
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOutlooks(): MarketOutlook[] {
  return EXPOSURES.map(e => {
    const outlooks: Outlook[] = ['bullish', 'bearish', 'uncertain'];
    const chosen = outlooks[Math.floor(Math.random() * outlooks.length)];
    const hints = OUTLOOKS[chosen];
    return {
      exposureId: e.id,
      outlook: chosen,
      hint: hints[Math.floor(Math.random() * hints.length)],
    };
  });
}

function generateMoves(outlooks: MarketOutlook[]): MarketMove[] {
  return outlooks.map(o => {
    const exposure = EXPOSURES.find(e => e.id === o.exposureId)!;
    const baseScale = MOVE_SCALES[exposure.type];
    
    // Outlook influence: bullish increases probability of positive move
    let bias = 0;
    if (o.outlook === 'bullish') bias = 0.5 * baseScale;
    if (o.outlook === 'bearish') bias = -0.5 * baseScale;
    
    const random = (Math.random() - 0.5) * 2 * baseScale;
    const move = bias + random;
    
    let label = '';
    if (exposure.type === 'fx') label = `EUR/MAD ${move >= 0 ? '+' : ''}${(move * 100).toFixed(1)}%`;
    if (exposure.type === 'rate') label = `Taux ${move >= 0 ? '+' : ''}${(move * 10000).toFixed(0)} bps`;
    if (exposure.type === 'commodity') label = `Pétrole ${move >= 0 ? '+' : ''}${(move * 100).toFixed(1)}%`;

    return { exposureId: o.exposureId, move, label };
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHedgeOrHold() {
  const [state, setState] = useState<HedgeGameState>({
    phase: 'intro',
    period: 1,
    totalPeriods: 6,
    cumulativePnL: 0,
    cumulativeUnhedgedPnL: 0,
    exposures: EXPOSURES,
    outlooks: [],
    decisions: EXPOSURES.map(e => ({ exposureId: e.id, level: 'none' })),
    history: [],
  });

  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'decision',
      outlooks: generateOutlooks(),
    }));
  }, []);

  const setDecision = useCallback((exposureId: string, level: HedgeLevel) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(d => d.exposureId === exposureId ? { ...d, level } : d),
    }));
  }, []);

  const confirmDecisions = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'market_reveal' }));
  }, []);

  const revealResults = useCallback(() => {
    setState(prev => {
      const moves = generateMoves(prev.outlooks);
      const periodPnLs = prev.exposures.map(exp => {
        const move = moves.find(m => m.exposureId === exp.id)!.move;
        const decision = prev.decisions.find(d => d.exposureId === exp.id)!.level;
        
        const unhedgedPnL = -exp.notional * move;
        const hedgeCost = exp.notional * HEDGE_COSTS[decision];
        
        let hedgeRatio = 0;
        if (decision === 'partial') hedgeRatio = 0.5;
        if (decision === 'full') hedgeRatio = 1.0;
        
        const hedgedPnL = unhedgedPnL * (1 - hedgeRatio) - hedgeCost;
        
        return { exposureId: exp.id, unhedgedPnL, hedgeCost, hedgedPnL };
      });

      const totalUnhedged = periodPnLs.reduce((s, p) => s + p.unhedgedPnL, 0);
      const totalHedged = periodPnLs.reduce((s, p) => s + p.hedgedPnL, 0);

      const result: PeriodResult = {
        period: prev.period,
        decisions: [...prev.decisions],
        moves,
        pnl: periodPnLs,
        totalUnhedged,
        totalHedged,
      };

      const isLast = prev.period >= prev.totalPeriods;
      const newScore = prev.cumulativePnL + totalHedged;

      if (isLast) {
        saveHighScore({
          game: 'hedge-or-hold',
          score: Math.round(newScore),
          date: new Date().toISOString(),
          label: `${newScore >= 0 ? '+' : ''}${Math.round(newScore / 1000)}k MAD`,
        });
      }

      return {
        ...prev,
        phase: 'results',
        cumulativePnL: newScore,
        cumulativeUnhedgedPnL: prev.cumulativeUnhedgedPnL + totalUnhedged,
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
        phase: finished ? 'summary' : 'decision',
        period: nextP,
        outlooks: finished ? [] : generateOutlooks(),
        decisions: EXPOSURES.map(e => ({ exposureId: e.id, level: 'none' })),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'intro',
      period: 1,
      totalPeriods: 6,
      cumulativePnL: 0,
      cumulativeUnhedgedPnL: 0,
      exposures: EXPOSURES,
      outlooks: [],
      decisions: EXPOSURES.map(e => ({ exposureId: e.id, level: 'none' })),
      history: [],
    });
  }, []);

  const totalReturn = state.cumulativePnL;
  const unhedgedTotal = state.cumulativeUnhedgedPnL;
  const hedgeEffectiveness = unhedgedTotal === 0 ? 0 : Math.max(0, 1 - (Math.abs(totalReturn) / Math.abs(unhedgedTotal)));

  return {
    state,
    startGame,
    setDecision,
    confirmDecisions,
    revealResults,
    nextPeriod,
    resetGame,
    hedgeEffectiveness,
  };
}
