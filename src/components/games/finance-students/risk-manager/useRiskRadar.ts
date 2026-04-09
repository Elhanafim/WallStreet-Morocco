'use client';

import { useState, useCallback, useMemo } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskType = 'credit' | 'market' | 'liquidity' | 'operational' | 'legal' | 'strategic';
export type Severity = 'low' | 'medium' | 'high';
export type Likelihood = 'low' | 'medium' | 'high';
export type GamePhase = 'intro' | 'read_events' | 'classify' | 'assess' | 'allocate' | 'simulate' | 'summary' | 'game_over';

export interface RiskEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  trueType: RiskType;
  baseSeverity: Severity;      // Low=1, Medium=2, High=3
  baseLikelihood: Severity;
  capitalImpact: number;       // % of capital ratio affected
  nplImpact: number;           // additional NPL % (credit events only)
  lcrImpact: number;           // LCR reduction (liquidity events only)
}

export interface PlayerClassification {
  eventId: string;
  assignedType: RiskType | null;
  assignedSeverity: Severity | null;
  assignedLikelihood: Severity | null;
}

export interface RiskAllocation {
  credit: number;
  market: number;
  liquidity: number;
  operational: number;
  legal: number;
  strategic: number;
}

export interface BankState {
  capitalRatio: number;        // % e.g. 12.0
  nplRatio: number;            // % e.g. 5.0
  lcr: number;                 // % e.g. 120.0
  status: 'healthy' | 'warning' | 'breach';
}

export interface QuarterResult {
  quarter: number;
  events: RiskEvent[];
  classifications: PlayerClassification[];
  allocation: RiskAllocation;
  losses: { eventId: string; potential: number; actual: number; mitigated: number }[];
  scoreGained: number;
  bankBefore: BankState;
  bankAfter: BankState;
}

export interface RiskRadarState {
  phase: GamePhase;
  quarter: number;
  totalQuarters: number;
  score: number;
  bank: BankState;
  currentEvents: RiskEvent[];
  classifications: PlayerClassification[];
  allocation: RiskAllocation;
  history: QuarterResult[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RISK_TYPES: RiskType[] = ['credit', 'market', 'liquidity', 'operational', 'legal', 'strategic'];

const EVENT_POOL: RiskEvent[] = [
  // Credit
  { id: 'c1', emoji: '📉', title: 'Hausse des NPLs PME', description: 'Une dégradation de la conjoncture affecte le remboursement des crédits aux petites entreprises.', trueType: 'credit', baseSeverity: 'medium', baseLikelihood: 'high', capitalImpact: 0.4, nplImpact: 0.8, lcrImpact: 0 },
  { id: 'c2', emoji: '🏢', title: 'Défaut Grand Emprunteur', description: 'Un acteur majeur de l\'agro-industrie annonce sa cessation de paiement.', trueType: 'credit', baseSeverity: 'high', baseLikelihood: 'low', capitalImpact: 0.8, nplImpact: 1.2, lcrImpact: 0 },
  { id: 'c3', emoji: '🏠', title: 'Baisse Collatéral Immo', description: 'Une correction du marché immobilier réduit la valeur des garanties hypothécaires.', trueType: 'credit', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.3, nplImpact: 0.2, lcrImpact: 0 },
  // Market
  { id: 'm1', emoji: '📊', title: 'Chute du MASI', description: 'Une panique boursière fait plonger l\'indice de la Bourse de Casablanca de 15% en une semaine.', trueType: 'market', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.5, nplImpact: 0, lcrImpact: 0 },
  { id: 'm2', emoji: '💸', title: 'Dépréciation du Dirham', description: 'Une forte pression sur la balance des paiements entraîne un décalage du cours du MAD.', trueType: 'market', baseSeverity: 'high', baseLikelihood: 'low', capitalImpact: 0.6, nplImpact: 0, lcrImpact: 0 },
  { id: 'm3', emoji: '🏛️', title: 'Hausse Taux Souverains', description: 'Le rendement des bons du Trésor à 10 ans augmente brusquement, impactant le portefeuille obligataire.', trueType: 'market', baseSeverity: 'medium', baseLikelihood: 'high', capitalImpact: 0.4, nplImpact: 0, lcrImpact: 0 },
  // Liquidity
  { id: 'l1', emoji: '🏦', title: 'Retrait Massif Dépôts', description: 'Des rumeurs infondées provoquent un flux inhabituel de retraits dans les agences du Nord.', trueType: 'liquidity', baseSeverity: 'high', baseLikelihood: 'low', capitalImpact: 0, nplImpact: 0, lcrImpact: 15 },
  { id: 'l2', emoji: '🤝', title: 'Assèchement Interbancaire', description: 'Les banques de la place deviennent réticentes à se prêter des liquidités à court terme.', trueType: 'liquidity', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0, nplImpact: 0, lcrImpact: 10 },
  { id: 'l3', emoji: '⌛', title: 'Concentration Maturités', description: 'Un volume important de certificats de dépôt arrive à échéance simultanément.', trueType: 'liquidity', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0, nplImpact: 0, lcrImpact: 8 },
  // Operational
  { id: 'o1', emoji: '💻', title: 'Panne Système Bancaire', description: 'Une erreur de maintenance rend l\'app mobile et les GAB indisponibles pendant 48h.', trueType: 'operational', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.2, nplImpact: 0, lcrImpact: 2 },
  { id: 'o2', emoji: '🕵️', title: 'Fraude Interne Major', description: 'Un détournement de fonds significatif est découvert au sein du back-office titres.', trueType: 'operational', baseSeverity: 'high', baseLikelihood: 'low', capitalImpact: 0.5, nplImpact: 0, lcrImpact: 0 },
  { id: 'o3', emoji: '🛡️', title: 'Cyber-attaque', description: 'Un ransomware paralyse une partie des services administratifs du siège social.', trueType: 'operational', baseSeverity: 'high', baseLikelihood: 'low', capitalImpact: 0.4, nplImpact: 0, lcrImpact: 0 },
  // Legal
  { id: 'le1', emoji: '⚖️', title: 'Non-conformité BAM', description: 'Bank Al-Maghrib relève des lacunes dans le dispositif de lutte contre le blanchiment.', trueType: 'legal', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.3, nplImpact: 0, lcrImpact: 0 },
  { id: 'le2', emoji: '📝', title: 'Litige Fiscal', description: 'L\'administration fiscale conteste les provisions de l\'exercice précédent.', trueType: 'legal', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.4, nplImpact: 0, lcrImpact: 0 },
  { id: 'le3', emoji: '📜', title: 'Violation RGPD/CNDP', description: 'Une fuite de données clients entraîne une sanction lourde de la commission nationale.', trueType: 'legal', baseSeverity: 'medium', baseLikelihood: 'low', capitalImpact: 0.2, nplImpact: 0, lcrImpact: 0 },
  // Strategic
  { id: 's1', emoji: '📱', title: 'Retard Digital', description: 'Un concurrent lance une néo-banque qui capte une partie de la clientèle jeune.', trueType: 'strategic', baseSeverity: 'medium', baseLikelihood: 'medium', capitalImpact: 0.3, nplImpact: 0, lcrImpact: 0 },
  { id: 's2', emoji: '🔄', title: 'Échec de Fusion', description: 'Le projet d\'acquisition de la banque subsaharienne est annulé après une due diligence négative.', trueType: 'strategic', baseSeverity: 'low', baseLikelihood: 'medium', capitalImpact: 0.1, nplImpact: 0, lcrImpact: 0 },
  { id: 's3', emoji: '📉', title: 'Baisse Marge Intermédiation', description: 'Le resserrement des marges sur le crédit immobilier dégrade le PNB prévisionnel.', trueType: 'strategic', baseSeverity: 'medium', baseLikelihood: 'high', capitalImpact: 0.4, nplImpact: 0, lcrImpact: 0 },
];

const SEVERITY_VALUES: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

function pickEvents(count: number, excludeIds: Set<string>): RiskEvent[] {
  const available = EVENT_POOL.filter(e => !excludeIds.has(e.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const INITIAL_BANK: BankState = {
  capitalRatio: 12.0,
  nplRatio: 5.0,
  lcr: 120,
  status: 'healthy',
};

const INITIAL_ALLOCATION: RiskAllocation = {
  credit: 0, market: 0, liquidity: 0, operational: 0, legal: 0, strategic: 0,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRiskRadar() {
  const [state, setState] = useState<RiskRadarState>({
    phase: 'intro',
    quarter: 1,
    totalQuarters: 6,
    score: 0,
    bank: INITIAL_BANK,
    currentEvents: [],
    classifications: [],
    allocation: INITIAL_ALLOCATION,
    history: [],
  });

  const usedEventIds = useMemo(() => new Set(state.history.flatMap(h => h.events.map(e => e.id))), [state.history]);

  const startGame = useCallback(() => {
    const events = pickEvents(3, new Set());
    setState(prev => ({
      ...prev,
      phase: 'read_events',
      currentEvents: events,
      classifications: events.map(e => ({ eventId: e.id, assignedType: null, assignedSeverity: null, assignedLikelihood: null })),
    }));
  }, []);

  const acknowledgeEvents = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'classify' }));
  }, []);

  const setClassification = useCallback((eventId: string, type: RiskType) => {
    setState(prev => ({
      ...prev,
      classifications: prev.classifications.map(c => c.eventId === eventId ? { ...c, assignedType: type } : c),
    }));
  }, []);

  const setSeverity = useCallback((eventId: string, severity: Severity) => {
    setState(prev => ({
      ...prev,
      classifications: prev.classifications.map(c => c.eventId === eventId ? { ...c, assignedSeverity: severity } : c),
    }));
  }, []);

  const setLikelihood = useCallback((eventId: string, likelihood: Likelihood) => {
    setState(prev => ({
      ...prev,
      classifications: prev.classifications.map(c => c.eventId === eventId ? { ...c, assignedLikelihood: likelihood } : c),
    }));
  }, []);

  const confirmClassification = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'assess' }));
  }, []);

  const confirmAssessment = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'allocate' }));
  }, []);

  const setAllocation = useCallback((type: RiskType, value: number) => {
    setState(prev => {
      const totalOthers = Object.entries(prev.allocation)
        .filter(([k]) => k !== type)
        .reduce((sum, [_, v]) => sum + v, 0);
      
      const cappedValue = Math.min(value, 100 - totalOthers);
      return {
        ...prev,
        allocation: { ...prev.allocation, [type]: cappedValue },
      };
    });
  }, []);

  const simulateLosses = useCallback(() => {
    setState(prev => {
      const results = prev.currentEvents.map(event => {
        const trueSeverity = SEVERITY_VALUES[event.baseSeverity];
        const trueLikelihood = SEVERITY_VALUES[event.baseLikelihood];
        const randomFactor = 0.8 + Math.random() * 0.4;
        const potentialImpact = trueSeverity * trueLikelihood * randomFactor;
        
        // Allocation coverage: each risk type has a theoretical "max required" 
        // We'll say max required is 50 points to fully mitigate a high/high event
        const allocation = prev.allocation[event.trueType];
        const coverageRatio = Math.min(1, allocation / 40); 
        
        return {
          eventId: event.id,
          potential: potentialImpact,
          actual: potentialImpact * (1 - coverageRatio * 0.8), // Mitigate up to 80%
          mitigated: coverageRatio * 0.8,
        };
      });

      // Update bank metrics
      let { capitalRatio, nplRatio, lcr } = prev.bank;
      results.forEach((r, i) => {
        const event = prev.currentEvents[i];
        const impactScale = r.actual / 9; // Max potential is 9 (3*3)
        
        capitalRatio -= event.capitalImpact * impactScale;
        if (event.trueType === 'credit') nplRatio += event.nplImpact * impactScale;
        if (event.trueType === 'liquidity') lcr -= event.lcrImpact * impactScale;
      });

      // Score
      let roundScore = 0;
      prev.classifications.forEach(c => {
        const event = prev.currentEvents.find(e => e.id === c.eventId);
        if (event) {
          if (c.assignedType === event.trueType) roundScore += 10;
          if (c.assignedSeverity === event.baseSeverity) roundScore += 5;
          if (c.assignedLikelihood === event.baseLikelihood) roundScore += 5;
        }
      });

      const nextBank: BankState = {
        capitalRatio: Number(capitalRatio.toFixed(2)),
        nplRatio: Number(nplRatio.toFixed(2)),
        lcr: Math.round(lcr),
        status: (capitalRatio < 9.5 || lcr < 100) ? 'breach' : (capitalRatio < 10.5 || lcr < 110) ? 'warning' : 'healthy',
      };

      const result: QuarterResult = {
        quarter: prev.quarter,
        events: prev.currentEvents,
        classifications: prev.classifications,
        allocation: { ...prev.allocation },
        losses: results,
        scoreGained: roundScore,
        bankBefore: prev.bank,
        bankAfter: nextBank,
      };

      const isLast = prev.quarter >= prev.totalQuarters || nextBank.status === 'breach';

      if (isLast) {
        saveHighScore({
          game: 'risk-radar',
          score: prev.score + roundScore,
          date: new Date().toISOString(),
          label: `${prev.score + roundScore} pts`,
        });
      }

      return {
        ...prev,
        phase: isLast ? 'game_over' : 'simulate',
        score: prev.score + roundScore,
        bank: nextBank,
        history: [...prev.history, result],
      };
    });
  }, []);

  const nextQuarter = useCallback(() => {
    setState(prev => {
      const nextQ = prev.quarter + 1;
      const excluded = new Set(prev.history.flatMap(h => h.events.map(e => e.id)));
      const events = pickEvents(3, excluded);
      
      return {
        ...prev,
        phase: 'read_events',
        quarter: nextQ,
        currentEvents: events,
        classifications: events.map(e => ({ eventId: e.id, assignedType: null, assignedSeverity: null, assignedLikelihood: null })),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'intro',
      quarter: 1,
      totalQuarters: 6,
      score: 0,
      bank: INITIAL_BANK,
      currentEvents: [],
      classifications: [],
      allocation: INITIAL_ALLOCATION,
      history: [],
    });
  }, []);

  return {
    state,
    startGame,
    acknowledgeEvents,
    setClassification,
    setSeverity,
    setLikelihood,
    confirmClassification,
    confirmAssessment,
    setAllocation,
    simulateLosses,
    nextQuarter,
    resetGame,
  };
}
