'use client';

import { useState, useCallback } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase = 'intro' | 'case_study' | 'quiz' | 'feedback' | 'summary';

export interface Financials {
  year: number;
  revenue: number;
  ebitda: number;
  netIncome: number;
  totalAssets: number;
  equity: number;
  totalDebt: number;
  currentAssets: number;
  currentLiabilities: number;
  accountsReceivable: number;
}

export interface CaseStudy {
  id: string;
  companyName: string;
  industry: string;
  description: string;
  financials: Financials[];
  targetSignal: string;        // e.g. "Crise de liquidité imminente"
  correctRatioType: 'liquidity' | 'solvency' | 'profitability' | 'efficiency';
  explanation: string;
}

export interface RatioChoice {
  id: string;
  type: 'liquidity' | 'solvency' | 'profitability' | 'efficiency';
  label: string;
  formula: string;
}

export interface RatioRaceState {
  phase: GamePhase;
  currentCaseIndex: number;
  score: number;
  userChoices: (string | null)[];
  history: { caseId: string; wasCorrect: boolean; selectedRatioId: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CASES: CaseStudy[] = [
  {
    id: 'case1',
    companyName: 'BTP Atlas',
    industry: 'Construction / BTP',
    description: 'Une grande entreprise de BTP qui multiplie les contrats d\'infrastructure publique.',
    financials: [
      { year: 2021, revenue: 500, ebitda: 80, netIncome: 40, totalAssets: 1000, equity: 400, totalDebt: 300, currentAssets: 300, currentLiabilities: 200, accountsReceivable: 150 },
      { year: 2022, revenue: 650, ebitda: 100, netIncome: 50, totalAssets: 1200, equity: 450, totalDebt: 450, currentAssets: 400, currentLiabilities: 350, accountsReceivable: 280 },
      { year: 2023, revenue: 800, ebitda: 120, netIncome: 55, totalAssets: 1500, equity: 505, totalDebt: 650, currentAssets: 500, currentLiabilities: 600, accountsReceivable: 450 },
    ],
    targetSignal: 'Dégradation alarmante de la liquidité (BFR non maîtrisé)',
    correctRatioType: 'liquidity',
    explanation: 'Malgré la croissance, le ratio de liquidité générale est passé de 1.5 à 0.83. L\'entreprise finance ses besoins de court terme (BFR) par des dettes court terme excessives.',
  },
  {
    id: 'case2',
    companyName: 'Cosmétiques du Souss',
    industry: 'Agro / Cosmétique',
    description: 'Producteur d\'huile d\'argan haut de gamme pour l\'export.',
    financials: [
      { year: 2021, revenue: 100, ebitda: 30, netIncome: 15, totalAssets: 200, equity: 100, totalDebt: 50, currentAssets: 80, currentLiabilities: 40, accountsReceivable: 20 },
      { year: 2022, revenue: 110, ebitda: 25, netIncome: 10, totalAssets: 220, equity: 110, totalDebt: 70, currentAssets: 90, currentLiabilities: 50, accountsReceivable: 25 },
      { year: 2023, revenue: 120, ebitda: 18, netIncome: 5, totalAssets: 250, equity: 115, totalDebt: 90, currentAssets: 100, currentLiabilities: 65, accountsReceivable: 30 },
    ],
    targetSignal: 'Chute de la rentabilité opérationnelle',
    correctRatioType: 'profitability',
    explanation: 'La marge d\'EBITDA s\'effondre (de 30% à 15%) malgré la hausse du CA, indiquant une mauvaise maîtrise des coûts de production.',
  },
  {
    id: 'case3',
    companyName: 'Maroc Logistik',
    industry: 'Transport / Logistique',
    description: 'Leader du transport routier de marchandises.',
    financials: [
      { year: 2021, revenue: 300, ebitda: 50, netIncome: 20, totalAssets: 600, equity: 300, totalDebt: 200, currentAssets: 120, currentLiabilities: 100, accountsReceivable: 60 },
      { year: 2022, revenue: 350, ebitda: 60, netIncome: 25, totalAssets: 750, equity: 325, totalDebt: 300, currentAssets: 150, currentLiabilities: 130, accountsReceivable: 80 },
      { year: 2023, revenue: 420, ebitda: 80, netIncome: 30, totalAssets: 1000, equity: 355, totalDebt: 500, currentAssets: 200, currentLiabilities: 180, accountsReceivable: 110 },
    ],
    targetSignal: 'Surendettement progressif pour financer la flotte',
    correctRatioType: 'solvency',
    explanation: 'Le ratio Gearing (Dette/Equity) est passé de 0.67 à 1.41 en 3 ans, affaiblissant la structure financière de l\'entreprise.',
  },
];

const RATIO_CHOICES: RatioChoice[] = [
  { id: 'rel', type: 'liquidity', label: 'Liquidité Générale', formula: 'Actif Court / Passif Court' },
  { id: 'dea', type: 'solvency', label: 'Gearing', formula: 'Dette Nette / Capitaux Propres' },
  { id: 'roe', type: 'profitability', label: 'ROE', formula: 'Résultat Net / Capitaux Propres' },
  { id: 'dso', type: 'efficiency', label: 'DSO (Délai Client)', formula: '(Clients / CA) * 360' },
  { id: 'cur', type: 'liquidity', label: 'Cash Ratio', formula: 'Trésorerie / Passif Court' },
  { id: 'sol', type: 'solvency', label: 'Autonomie Financière', formula: 'Capitaux Propres / Total Bilan' },
  { id: 'mar', type: 'profitability', label: 'Marge EBITDA', formula: 'EBITDA / CA' },
];

export const RATIO_TYPES: RatioChoice['type'][] = ['liquidity', 'solvency', 'profitability', 'efficiency'];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRatioRace() {
  const [state, setState] = useState<RatioRaceState>({
    phase: 'intro',
    currentCaseIndex: 0,
    score: 0,
    userChoices: [],
    history: [],
  });

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'case_study' }));
  }, []);

  const goToQuiz = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'quiz' }));
  }, []);

  const selectRatio = useCallback((ratioId: string) => {
    setState(prev => {
      const currentCase = CASES[prev.currentCaseIndex];
      const selectedRatio = RATIO_CHOICES.find(r => r.id === ratioId)!;
      const isCorrect = selectedRatio.type === currentCase.correctRatioType;
      
      const newScore = isCorrect ? prev.score + 100 : prev.score;
      const newHistory = [...prev.history, { caseId: currentCase.id, wasCorrect: isCorrect, selectedRatioId: ratioId }];

      return {
        ...prev,
        phase: 'feedback',
        score: newScore,
        history: newHistory,
        userChoices: [...prev.userChoices, ratioId],
      };
    });
  }, []);

  const nextCase = useCallback(() => {
    setState(prev => {
      const nextIdx = prev.currentCaseIndex + 1;
      const finished = nextIdx >= CASES.length;
      
      if (finished) {
        saveHighScore({
          game: 'ratio-race',
          score: prev.score,
          date: new Date().toISOString(),
          label: `${prev.score} pts`,
        });
        return { ...prev, phase: 'summary' };
      }

      return { ...prev, phase: 'case_study', currentCaseIndex: nextIdx };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'intro',
      currentCaseIndex: 0,
      score: 0,
      userChoices: [],
      history: [],
    });
  }, []);

  const currentCase = CASES[state.currentCaseIndex];

  return {
    state,
    currentCase,
    cases: CASES,
    ratios: RATIO_CHOICES,
    startGame,
    goToQuiz,
    selectRatio,
    nextCase,
    resetGame,
  };
}
