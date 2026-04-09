import { useState, useCallback, useMemo } from 'react';
import { saveHighScore } from '@/lib/gameScores';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GamePhase = 'intro' | 'allocation' | 'news' | 'quarterly' | 'summary';
export type Sector = 'banques' | 'telecom' | 'immobilier' | 'btp' | 'tourisme' | 'consommation' | 'industrie' | 'energie' | 'mines' | 'cash';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  sector: Sector;
  emoji: string;
  /** Base annualised expected return (%) */
  baseReturn: number;
  /** Annualised volatility (standard deviation, %) */
  volatility: number;
  description: string;
}

export interface MacroEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** sector → return impact in percentage points for this quarter */
  impact: Partial<Record<Sector, number>>;
}

export interface QuarterResult {
  quarter: number;
  event: MacroEvent;
  assetReturns: Record<string, number>;   // asset id → quarterly return %
  portfolioReturn: number;                 // weighted portfolio return %
  portfolioValue: number;                  // absolute value
  weights: Record<string, number>;         // weights used this quarter
}

export interface BenchmarkState {
  weights: Record<string, number>;
  value: number;
  history: { quarter: number; value: number; return_pct: number }[];
}

export interface CasablancaState {
  phase: GamePhase;
  quarter: number;
  totalQuarters: number;
  portfolioValue: number;
  startingValue: number;
  weights: Record<string, number>;         // asset id → weight (sum = 100)
  pendingEvent: MacroEvent | null;
  history: QuarterResult[];
  assets: Asset[];
  benchmark: BenchmarkState;
}

// ─── Asset universe ────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  { id: 'atlasbank',   name: 'AtlasBank',      ticker: 'ATB',  sector: 'banques',       emoji: '🏦', baseReturn: 8,  volatility: 12, description: 'Banque universelle leader du Maroc. Stable, dividendes réguliers.' },
  { id: 'maroctelecom',name: 'MarocTel+',      ticker: 'MTL',  sector: 'telecom',       emoji: '📡', baseReturn: 7,  volatility: 10, description: 'Opérateur télécoms défensif. Flux de trésorerie prévisibles.' },
  { id: 'riadimmo',    name: 'RiadImmo',       ticker: 'RIM',  sector: 'immobilier',    emoji: '🏘️', baseReturn: 9,  volatility: 16, description: 'Promoteur immobilier sensible aux taux d\'intérêt.' },
  { id: 'btpatlas',    name: 'BTP Atlas',      ticker: 'BTA',  sector: 'btp',           emoji: '🏗️', baseReturn: 10, volatility: 20, description: 'Groupe de construction cyclique. Profite des grands chantiers.' },
  { id: 'soleil',      name: 'Soleil Tourisme',ticker: 'STR',  sector: 'tourisme',      emoji: '🌞', baseReturn: 12, volatility: 28, description: 'Hôtellerie et loisirs. Très sensible au contexte géopolitique.' },
  { id: 'consocasa',   name: 'ConsoCasa',      ticker: 'CSC',  sector: 'consommation',  emoji: '🛒', baseReturn: 7,  volatility: 11, description: 'Biens de grande consommation. Défensif, peu cyclique.' },
  { id: 'indunord',    name: 'IndustrieNord',  ticker: 'IND',  sector: 'industrie',     emoji: '⚙️', baseReturn: 9,  volatility: 18, description: 'Conglomérat industriel. Sensible à la conjoncture mondiale.' },
  { id: 'solaireplus', name: 'SolairePlus',    ticker: 'SLP',  sector: 'energie',       emoji: '☀️', baseReturn: 14, volatility: 30, description: 'Énergies renouvelables en croissance rapide. Risque élevé.' },
  { id: 'mineatlas',   name: 'MineAtlas',      ticker: 'MNA',  sector: 'mines',         emoji: '⛏️', baseReturn: 11, volatility: 25, description: 'Extraction de phosphates. Sensible aux cours mondiaux des matières premières.' },
  { id: 'cash',        name: 'Liquidités',     ticker: 'CASH', sector: 'cash',          emoji: '💵', baseReturn: 3,  volatility: 0,  description: 'Fonds monétaire. Rendement faible mais sans risque.' },
];

// ─── Macro events ──────────────────────────────────────────────────────────────

const MACRO_EVENTS: MacroEvent[] = [
  {
    id: 'rate_hike',
    emoji: '📈',
    title: 'Hausse des taux directeurs',
    description: 'Bank Al-Maghrib relève son taux directeur de 50 pb. Le crédit se renchérit.',
    impact: { banques: +2, immobilier: -4, btp: -3, consommation: -2 },
  },
  {
    id: 'rate_cut',
    emoji: '📉',
    title: 'Baisse des taux directeurs',
    description: 'Assouplissement monétaire — les taux immobiliers baissent, la consommation repart.',
    impact: { banques: -1, immobilier: +5, btp: +4, consommation: +3 },
  },
  {
    id: 'tourism_boom',
    emoji: '✈️',
    title: 'Boom touristique record',
    description: 'Les arrivées touristiques au Maroc atteignent un niveau historique.',
    impact: { tourisme: +12, consommation: +3, immobilier: +2 },
  },
  {
    id: 'drought',
    emoji: '🌵',
    title: 'Sécheresse prolongée',
    description: 'La pluviométrie insuffisante pèse sur l\'agriculture et la consommation intérieure.',
    impact: { consommation: -5, btp: -2, industrie: -3 },
  },
  {
    id: 'phosphate_surge',
    emoji: '⛏️',
    title: 'Envolée des phosphates',
    description: 'La demande mondiale d\'engrais explose — les exportations marocaines s\'accélèrent.',
    impact: { mines: +15, industrie: +4, energie: +2 },
  },
  {
    id: 'geopolitical_risk',
    emoji: '⚠️',
    title: 'Tensions régionales',
    description: 'L\'instabilité dans la région pèse sur la confiance des investisseurs étrangers.',
    impact: { tourisme: -10, banques: -4, immobilier: -3, industrie: -2 },
  },
  {
    id: 'green_deal',
    emoji: '🌿',
    title: 'Plan Vert National',
    description: 'Le gouvernement accélère les investissements dans les énergies renouvelables.',
    impact: { energie: +18, industrie: +5, btp: +4 },
  },
  {
    id: 'eu_growth',
    emoji: '🇪🇺',
    title: 'Reprise en Europe',
    description: 'La croissance européenne stimule les exportations marocaines et le tourisme.',
    impact: { tourisme: +8, industrie: +5, mines: +4, telecom: +2 },
  },
  {
    id: 'inflation_spike',
    emoji: '💸',
    title: 'Poussée inflationniste',
    description: 'L\'inflation dépasse 6% — le pouvoir d\'achat se comprime, la consommation recule.',
    impact: { consommation: -6, banques: -2, tourisme: -4, telecom: -1 },
  },
  {
    id: 'megaproject',
    emoji: '🏟️',
    title: 'Grand projet d\'infrastructure',
    description: 'Le Maroc remporte l\'organisation d\'un événement mondial majeur. Les chantiers s\'accélèrent.',
    impact: { btp: +14, immobilier: +6, tourisme: +8, energie: +3 },
  },
  {
    id: 'global_recession',
    emoji: '🌍',
    title: 'Récession mondiale',
    description: 'La croissance mondiale ralentit fortement. Les marchés émergents sous pression.',
    impact: { mines: -12, industrie: -8, tourisme: -10, energie: -5, banques: -4 },
  },
  {
    id: 'calm',
    emoji: '😌',
    title: 'Trimestre sans événement majeur',
    description: 'Le contexte macro reste stable. Les fondamentaux guident les performances.',
    impact: {},
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function rnd() { return Math.random(); }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function pickEvent(usedIds: Set<string>): MacroEvent {
  const available = MACRO_EVENTS.filter((e) => !usedIds.has(e.id));
  const pool = available.length > 0 ? available : MACRO_EVENTS;
  return pool[Math.floor(rnd() * pool.length)];
}

/** Generate quarterly return for one asset given the event */
function quarterlyReturn(asset: Asset, event: MacroEvent): number {
  const annualBase  = asset.baseReturn;
  const qBase       = annualBase / 4;
  const noise       = (rnd() - 0.5) * 2 * asset.volatility / Math.sqrt(4);   // ≈ quarterly vol
  const eventBump   = (event.impact[asset.sector] ?? 0) / 4;                  // event is annual pts
  return parseFloat((qBase + noise + eventBump).toFixed(2));
}

function makeInitialWeights(): Record<string, number> {
  // Equal weight across first 5 assets + rest = 0, with 10% cash
  const defaultWeights: Record<string, number> = {};
  ASSETS.forEach((a) => { defaultWeights[a.id] = 0; });
  // Default: 18% each in top 5, 10% cash
  const equity = ['atlasbank', 'maroctelecom', 'consocasa', 'riadimmo', 'btpatlas'];
  equity.forEach((id) => { defaultWeights[id] = 18; });
  defaultWeights['cash'] = 10;
  return defaultWeights;
}

// ─── Benchmark weights — simplified MASI-like index ──────────────────────────

const BENCHMARK_WEIGHTS: Record<string, number> = {
  atlasbank: 20,
  maroctelecom: 15,
  consocasa: 15,
  riadimmo: 10,
  btpatlas: 10,
  indunord: 10,
  soleil: 8,
  mineatlas: 7,
  solaireplus: 5,
  cash: 0,
};

function makeInitialBenchmark(): BenchmarkState {
  return {
    weights: { ...BENCHMARK_WEIGHTS },
    value: 100_000,
    history: [],
  };
}

function makeInitialState(): CasablancaState {
  return {
    phase: 'intro',
    quarter: 1,
    totalQuarters: 12,
    portfolioValue: 100_000,
    startingValue: 100_000,
    weights: makeInitialWeights(),
    pendingEvent: null,
    history: [],
    assets: ASSETS,
    benchmark: makeInitialBenchmark(),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCasablanca() {
  const [state, setState] = useState<CasablancaState>(makeInitialState);

  const startGame = useCallback(() => {
    const event = pickEvent(new Set());
    setState({
      ...makeInitialState(),
      phase: 'news',
      pendingEvent: event,
    });
  }, []);

  const setWeight = useCallback((assetId: string, value: number) => {
    setState((prev) => {
      const newWeights = { ...prev.weights, [assetId]: value };
      return { ...prev, weights: newWeights };
    });
  }, []);

  /** Called from the news phase — proceed to allocation */
  const proceedToAllocation = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'allocation' }));
  }, []);

  /** Called after confirming allocations — simulate the quarter */
  const simulateQuarter = useCallback(() => {
    setState((prev) => {
      if (!prev.pendingEvent) return prev;
      const event = prev.pendingEvent;

      const assetReturns: Record<string, number> = {};
      ASSETS.forEach((a) => {
        assetReturns[a.id] = quarterlyReturn(a, event);
      });

      // Weighted portfolio return
      const portfolioReturn = ASSETS.reduce((sum, a) => {
        const w = (prev.weights[a.id] ?? 0) / 100;
        return sum + w * (assetReturns[a.id] ?? 0);
      }, 0);

      const portfolioValue = prev.portfolioValue * (1 + portfolioReturn / 100);

      // Benchmark return (same asset returns, fixed weights)
      const benchmarkReturn = ASSETS.reduce((sum, a) => {
        const w = (prev.benchmark.weights[a.id] ?? 0) / 100;
        return sum + w * (assetReturns[a.id] ?? 0);
      }, 0);
      const benchmarkValue = prev.benchmark.value * (1 + benchmarkReturn / 100);

      const result: QuarterResult = {
        quarter: prev.quarter,
        event,
        assetReturns,
        portfolioReturn: parseFloat(portfolioReturn.toFixed(2)),
        portfolioValue: parseFloat(portfolioValue.toFixed(0)),
        weights: { ...prev.weights },
      };

      const isLast = prev.quarter >= prev.totalQuarters;
      const usedIds = new Set([...prev.history.map((r) => r.event.id), event.id]);
      const nextEvent = isLast ? null : pickEvent(usedIds);

      // Save high score on last quarter
      if (isLast) {
        const finalReturn = parseFloat(
          (((portfolioValue - prev.startingValue) / prev.startingValue) * 100).toFixed(2)
        );
        saveHighScore({
          game: 'casablanca-capital',
          score: finalReturn,
          date: new Date().toISOString(),
          label: `${finalReturn >= 0 ? '+' : ''}${finalReturn.toFixed(1)}%`,
        });
      }

      return {
        ...prev,
        phase: isLast ? 'summary' : 'quarterly',
        quarter: prev.quarter + (isLast ? 0 : 0),
        portfolioValue,
        pendingEvent: nextEvent,
        history: [...prev.history, result],
        benchmark: {
          ...prev.benchmark,
          value: benchmarkValue,
          history: [...prev.benchmark.history, {
            quarter: prev.quarter,
            value: parseFloat(benchmarkValue.toFixed(0)),
            return_pct: parseFloat(benchmarkReturn.toFixed(2)),
          }],
        },
      };
    });
  }, []);

  const nextQuarter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'news',
      quarter: prev.quarter + 1,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(makeInitialState());
  }, []);

  // Derived
  const totalReturn = parseFloat(
    (((state.portfolioValue - state.startingValue) / state.startingValue) * 100).toFixed(2)
  );
  const weightSum = Object.values(state.weights).reduce((s, w) => s + w, 0);

  // Benchmark return
  const benchmarkReturn = parseFloat(
    (((state.benchmark.value - state.startingValue) / state.startingValue) * 100).toFixed(2)
  );

  // Excess return vs benchmark
  const excessReturn = parseFloat((totalReturn - benchmarkReturn).toFixed(2));

  // Annualized return (CAGR): (finalValue / startValue)^(4/totalQuarters) - 1
  const annualizedReturn = useMemo(() => {
    if (state.history.length === 0) return 0;
    const years = state.history.length / 4;
    if (years <= 0) return 0;
    const ratio = state.portfolioValue / state.startingValue;
    return parseFloat(((Math.pow(ratio, 1 / years) - 1) * 100).toFixed(2));
  }, [state.portfolioValue, state.startingValue, state.history.length]);

  const maxDrawdown = (() => {
    let peak = state.startingValue;
    let maxDd = 0;
    for (const r of state.history) {
      if (r.portfolioValue > peak) peak = r.portfolioValue;
      const dd = ((peak - r.portfolioValue) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }
    return parseFloat(maxDd.toFixed(2));
  })();

  const sectorExposure: Partial<Record<Sector, number>> = {};
  ASSETS.forEach((a) => {
    const w = state.weights[a.id] ?? 0;
    if (w > 0) {
      sectorExposure[a.sector] = (sectorExposure[a.sector] ?? 0) + w;
    }
  });

  return {
    state,
    startGame,
    setWeight,
    proceedToAllocation,
    simulateQuarter,
    nextQuarter,
    resetGame,
    totalReturn,
    benchmarkReturn,
    excessReturn,
    annualizedReturn,
    weightSum,
    maxDrawdown,
    sectorExposure,
  };
}
