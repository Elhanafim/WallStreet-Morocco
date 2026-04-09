'use client';

import { useState, useCallback } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase = 'intro' | 'round_intro' | 'analysis' | 'selection' | 'results' | 'summary';

export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  initialInvestment: number;   // MAD (negative)
  cashFlows: number[];         // MAD per year (Years 1 to 5)
  wacc: number;                // % (discount rate)
}

export interface ProjectMetrics {
  npv: number;
  irr: number;
  payback: number;
  pi: number;
}

export interface RoundResult {
  round: number;
  selectedProjectIds: string[];
  totalNpv: number;
  totalInvestment: number;
  budget: number;
  score: number;
}

export interface CapitalBudgetingState {
  phase: GamePhase;
  round: number;
  totalRounds: number;
  score: number;
  budget: number;
  availableProjects: Project[];
  selectedProjectIds: string[];
  history: RoundResult[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateNPV(project: Project): number {
  let npv = project.initialInvestment;
  project.cashFlows.forEach((cf, i) => {
    npv += cf / Math.pow(1 + project.wacc, i + 1);
  });
  return npv;
}

function calculateIRR(project: Project): number {
  let low = 0, high = 2, irr = 0;
  for (let i = 0; i < 20; i++) {
    irr = (low + high) / 2;
    let npv = project.initialInvestment;
    project.cashFlows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + irr, t + 1);
    });
    if (npv > 0) low = irr;
    else high = irr;
  }
  return irr;
}

function calculatePayback(project: Project): number {
  let cumulative = project.initialInvestment;
  for (let i = 0; i < project.cashFlows.length; i++) {
    if (cumulative + project.cashFlows[i] >= 0) {
      return i + (Math.abs(cumulative) / project.cashFlows[i]);
    }
    cumulative += project.cashFlows[i];
  }
  return project.cashFlows.length + 1;
}

export function getProjectMetrics(project: Project): ProjectMetrics {
  const npv = calculateNPV(project);
  const pi = (npv + Math.abs(project.initialInvestment)) / Math.abs(project.initialInvestment);
  return {
    npv,
    irr: calculateIRR(project),
    payback: calculatePayback(project),
    pi,
  };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROUNDS_DATA = [
  {
    budget: 10_000_000,
    projects: [
      { id: 'p1', name: 'Solaire Casa', category: 'Énergie', description: 'Installation de panneaux solaires sur le toit de l\'usine.', initialInvestment: -4_000_000, cashFlows: [1_200_000, 1_200_000, 1_200_000, 1_200_000, 1_200_000], wacc: 0.10 },
      { id: 'p2', name: 'Nouveau GAB', category: 'Banque', description: 'Déploiement d\'une flotte de 20 nouveaux guichets automatiques.', initialInvestment: -6_000_000, cashFlows: [2_000_000, 2_200_000, 2_400_000, 1_500_000, 800_000], wacc: 0.12 },
      { id: 'p3', name: 'E-Commerce Hub', category: 'Logistique', description: 'Centre de tri automatisé pour le dernier kilomètre.', initialInvestment: -5_000_000, cashFlows: [500_000, 1_000_000, 2_500_000, 3_500_000, 4_000_000], wacc: 0.15 },
      { id: 'p4', name: 'Rénovation Siège', category: 'Admin', description: 'Peinture et mobilier ergonomique pour les bureaux.', initialInvestment: -2_000_000, cashFlows: [100_000, 100_000, 100_000, 100_000, 100_000], wacc: 0.08 },
    ],
  },
  {
    budget: 15_000_000,
    projects: [
      { id: 'p5', name: 'Exploration Mine', category: 'Extraction', description: 'Sondage géologique pour un nouveau gisement de cobalt.', initialInvestment: -8_000_000, cashFlows: [0, 0, 500_000, 4_000_000, 15_000_000], wacc: 0.18 },
      { id: 'p6', name: 'Flotte Véhicules', category: 'Logistique', description: 'Remplacement des camions par des modèles hybrides.', initialInvestment: -7_000_000, cashFlows: [2_500_000, 2_500_000, 2_500_000, 2_500_000, 2_500_000], wacc: 0.11 },
      { id: 'p7', name: 'Logiciel ERP', category: 'IT', description: 'Mise en place d\'un système intégré de gestion.', initialInvestment: -5_000_000, cashFlows: [2_000_000, 2_000_000, 2_000_000, 1_000_000, 500_000], wacc: 0.10 },
      { id: 'p8', name: 'Usine de Safi', category: 'Industrie', description: 'Extension de la ligne de production de phosphate.', initialInvestment: -10_000_000, cashFlows: [3_000_000, 3_500_000, 4_000_000, 4_500_000, 5_000_000], wacc: 0.12 },
    ],
  },
  {
    budget: 12_000_000,
    projects: [
      { id: 'p9', name: 'Câble Sous-Marin', category: 'Télécom', description: 'Liaison data haute capacité vers Tanger Med.', initialInvestment: -6_000_000, cashFlows: [1_000_000, 2_000_000, 3_000_000, 4_000_000, 5_000_000], wacc: 0.10 },
      { id: 'p10', name: 'Portefeuille VC', category: 'Finance', description: 'Prise de participation dans 5 start-ups prometteuses.', initialInvestment: -5_000_000, cashFlows: [0, 0, 0, 0, 25_000_000], wacc: 0.25 },
      { id: 'p11', name: 'Parc Éolien Dakhla', category: 'Énergie', description: 'Contribution à un consortium de production éolienne.', initialInvestment: -8_000_000, cashFlows: [1_500_000, 1_600_000, 1_700_000, 2_000_000, 3_000_000], wacc: 0.09 },
      { id: 'p12', name: 'Recherche Argan', category: 'Agro', description: 'Développement d\'une nouvelle méthode de pressage à froid.', initialInvestment: -3_000_000, cashFlows: [1_000_000, 1_200_000, 1_400_000, 1_600_000, 1_800_000], wacc: 0.12 },
    ],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCapitalBudgeting() {
  const [state, setState] = useState<CapitalBudgetingState>({
    phase: 'intro',
    round: 1,
    totalRounds: 3,
    score: 0,
    budget: ROUNDS_DATA[0].budget,
    availableProjects: ROUNDS_DATA[0].projects,
    selectedProjectIds: [],
    history: [],
  });

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'round_intro' }));
  }, []);

  const startAnalysis = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'analysis' }));
  }, []);

  const goToSelection = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'selection' }));
  }, []);

  const toggleProject = useCallback((id: string) => {
    setState(prev => {
      const isSelected = prev.selectedProjectIds.includes(id);
      const project = prev.availableProjects.find(p => p.id === id)!;
      const currentInvestment = prev.selectedProjectIds.reduce((sum, pid) => {
        const p = prev.availableProjects.find(ap => ap.id === pid)!;
        return sum + Math.abs(p.initialInvestment);
      }, 0);

      if (!isSelected && currentInvestment + Math.abs(project.initialInvestment) > prev.budget) {
        return prev; // Budget limit exceeded
      }

      return {
        ...prev,
        selectedProjectIds: isSelected 
          ? prev.selectedProjectIds.filter(pid => pid !== id)
          : [...prev.selectedProjectIds, id],
      };
    });
  }, []);

  const confirmSelection = useCallback(() => {
    setState(prev => {
      const selected = prev.availableProjects.filter(p => prev.selectedProjectIds.includes(p.id));
      const totalNpv = selected.reduce((sum, p) => sum + calculateNPV(p), 0);
      const totalInvestment = selected.reduce((sum, p) => sum + Math.abs(p.initialInvestment), 0);
      
      // Calculate max possible NPV with the budget (simplified)
      // This is for scoring.
      const roundScore = Math.round(totalNpv / 10_000); // 1 pt per 10k MAD NPV

      const result: RoundResult = {
        round: prev.round,
        selectedProjectIds: [...prev.selectedProjectIds],
        totalNpv,
        totalInvestment,
        budget: prev.budget,
        score: roundScore,
      };

      const isGameOver = prev.round >= prev.totalRounds;
      const finalScore = prev.score + roundScore;

      if (isGameOver) {
        saveHighScore({
          game: 'capital-budgeting',
          score: finalScore,
          date: new Date().toISOString(),
          label: `${finalScore} pts`,
        });
      }

      return {
        ...prev,
        phase: 'results',
        score: finalScore,
        history: [...prev.history, result],
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setState(prev => {
      const nextR = prev.round + 1;
      const isFinished = nextR > prev.totalRounds;
      
      if (isFinished) return { ...prev, phase: 'summary' };

      const nextData = ROUNDS_DATA[nextR - 1];
      return {
        ...prev,
        phase: 'round_intro',
        round: nextR,
        budget: nextData.budget,
        availableProjects: nextData.projects,
        selectedProjectIds: [],
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      phase: 'intro',
      round: 1,
      totalRounds: 3,
      score: 0,
      budget: ROUNDS_DATA[0].budget,
      availableProjects: ROUNDS_DATA[0].projects,
      selectedProjectIds: [],
      history: [],
    });
  }, []);

  return {
    state,
    startGame,
    startAnalysis,
    goToSelection,
    toggleProject,
    confirmSelection,
    nextRound,
    resetGame,
  };
}
