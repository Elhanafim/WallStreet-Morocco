'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Info, 
  ChevronRight, 
  ArrowRight,
  PieChart,
  Activity,
  Droplets,
  Scale,
  Zap,
  Lock,
  Target
} from 'lucide-react';
import { 
  RiskType, 
  Severity, 
  Likelihood, 
  GamePhase, 
  useRiskRadar 
} from './useRiskRadar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const RISK_LABELS: Record<RiskType, string> = {
  credit: 'Crédit',
  market: 'Marché',
  liquidity: 'Liquidité',
  operational: 'Opérationnel',
  legal: 'Juridique',
  strategic: 'Stratégique',
};

const RISK_ICONS: Record<RiskType, any> = {
  credit: TrendingDown,
  market: Activity,
  liquidity: Droplets,
  operational: Zap,
  legal: Scale,
  strategic: Target,
};

const SEVERITY_COLORS: Record<Severity | Likelihood, string> = {
  low: 'text-success bg-success/10',
  medium: 'text-warning bg-warning/10',
  high: 'text-danger bg-danger/10',
};

// ─── Helper Components ───────────────────────────────────────────────────────

const BankMetric = ({ label, value, unit = '', status, min, max, prefix = '' }: {
  label: string;
  value: number;
  unit?: string;
  status: 'healthy' | 'warning' | 'breach';
  min?: number;
  max?: number;
  prefix?: string;
}) => {
  const isWarning = status === 'warning';
  const isBreach = status === 'breach';

  return (
    <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-sm">
      <div className="text-[10px] font-bold text-primary/40 uppercase tracking-wider mb-1">{label}</div>
      <div className={cn(
        "text-lg font-black font-display flex items-baseline gap-1",
        isBreach ? "text-danger" : isWarning ? "text-warning" : "text-primary"
      )}>
        {prefix}{value}{unit}
        {isBreach && <AlertTriangle className="w-3.5 h-3.5" />}
      </div>
      {(min !== undefined || max !== undefined) && (
        <div className="mt-1 text-[9px] text-primary/30 font-medium">
          {min !== undefined && `Seuil min: ${min}${unit}`}
          {max !== undefined && `Seuil max: ${max}${unit}`}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RiskRadarGame() {
  const {
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
  } = useRiskRadar();

  const { phase, quarter, totalQuarters, score, bank, currentEvents, classifications, allocation, history } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black font-display mb-3">Risk Radar: Bank Edition</h1>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Incarnez le <strong>Chief Risk Officer</strong> d&apos;une banque marocaine. 
          Pendant 6 trimestres, vous devrez identifier, évaluer et mitiger les risques qui menacent la solvabilité et la liquidité de votre institution.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10 text-left">
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Quartiers</h3>
            <p className="text-xl font-black">6</p>
            <p className="text-[10px] text-primary/50">Simulation de 1.5 an</p>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Budget</h3>
            <p className="text-xl font-black">100</p>
            <p className="text-[10px] text-primary/50">Points/trimestre</p>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Objectif</h3>
            <p className="text-xl font-black">&gt; 9.5%</p>
            <p className="text-[10px] text-primary/50">Ratio de Capital</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
        >
          Prendre mes fonctions <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Status Header (shared for playing phases) ─────────────────────────────
  const statusHeader = (
    <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in shrink-0">
      <div className="col-span-1 bg-primary text-white p-3 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Score</div>
        <div className="text-2xl font-black font-display">{score}</div>
        <div className="text-[10px] opacity-40">Trimestre {quarter}/{totalQuarters}</div>
        <PieChart className="absolute right-[-10px] bottom-[-10px] w-12 h-12 opacity-10" />
      </div>
      <div className="col-span-3 grid grid-cols-3 gap-3">
        <BankMetric 
          label="Ratio Capital (Solvabilité)" 
          value={bank.capitalRatio} 
          unit="%" 
          status={bank.status} 
          min={9.5}
        />
        <BankMetric 
          label="Ratio NPL (Créances)" 
          value={bank.nplRatio} 
          unit="%" 
          status={bank.status} 
          max={10.0}
        />
        <BankMetric 
          label="LCR (Liquidité)" 
          value={bank.lcr} 
          unit="%" 
          status={bank.status} 
          min={100}
        />
      </div>
    </div>
  );

  // ── Phase 1: Read Events ───────────────────────────────────────────────────
  if (phase === 'read_events') {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Risques émergents — T{quarter}
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-8 overflow-y-auto pr-2 flex-1">
          {currentEvents.map((event) => (
            <div key={event.id} className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all flex gap-5 animate-slide-up">
              <div className="w-14 h-14 bg-surface-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                {event.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary mb-1">{event.title}</h3>
                <p className="text-sm text-primary/60 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={acknowledgeEvents}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Classifier ces risques <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 2: Classify ──────────────────────────────────────────────────────
  if (phase === 'classify') {
    const isComplete = classifications.every(c => c.assignedType !== null);

    return (
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primary mb-1">Classification des risques</h2>
          <p className="text-sm text-primary/50">Assignez chaque événement à une catégorie de risque spécifique.</p>
        </div>

        <div className="space-y-4 mb-8 overflow-y-auto pr-2 flex-1">
          {currentEvents.map((event) => {
            const currentClass = classifications.find(c => c.eventId === event.id)?.assignedType;
            return (
              <div key={event.id} className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm animate-slide-up">
                <div className="flex gap-4 items-center mb-4">
                  <span className="text-2xl">{event.emoji}</span>
                  <h3 className="text-md font-bold text-primary">{event.title}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(RISK_LABELS).map(([type, label]) => {
                    const Icon = RISK_ICONS[type as RiskType];
                    const active = currentClass === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setClassification(event.id, type as RiskType)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                          active 
                            ? "bg-primary text-white border-primary shadow-md" 
                            : "bg-surface-50 border-surface-100 text-primary/60 hover:border-primary/30"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", active ? "text-white" : "text-primary/40")} />
                        <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-tighter">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={confirmClassification}
          disabled={!isComplete}
          className={cn(
            "w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4",
            isComplete ? "bg-primary text-white hover:bg-primary/95" : "bg-surface-100 text-primary/20 cursor-not-allowed"
          )}
        >
          Évaluer l&apos;impact <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 3: Assess ────────────────────────────────────────────────────────
  if (phase === 'assess') {
    const isComplete = classifications.every(c => c.assignedSeverity !== null && c.assignedLikelihood !== null);

    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primary mb-1">Évaluation de l&apos;exposition</h2>
          <p className="text-sm text-primary/50">Estimez la sévérité et la probabilité d&apos;occurrence pour chaque risque.</p>
        </div>

        <div className="space-y-4 mb-8 overflow-y-auto pr-2 flex-1">
          {currentEvents.map((event) => {
            const myClass = classifications.find(c => c.eventId === event.id);
            return (
              <div key={event.id} className="bg-white border border-surface-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                <div>
                  <div className="flex gap-3 items-center mb-2">
                    <span className="text-2xl">{event.emoji}</span>
                    <h3 className="text-md font-bold text-primary">{event.title}</h3>
                  </div>
                  {myClass?.assignedType && (
                    <div className="flex items-center gap-1.5 text-xs text-primary/50">
                      <span className="font-bold">Type :</span>
                      <Badge variant="primary" size="xs">{RISK_LABELS[myClass.assignedType]}</Badge>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">Sévérité</div>
                    <div className="flex flex-col gap-1.5">
                      {(['low', 'medium', 'high'] as Severity[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setSeverity(event.id, s)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all text-left",
                            myClass?.assignedSeverity === s
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-surface-50 border-surface-100 text-primary/60 hover:border-primary/20"
                          )}
                        >
                          {s === 'low' ? 'Faible' : s === 'medium' ? 'Moyenne' : 'Élevée'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">Probabilité</div>
                    <div className="flex flex-col gap-1.5">
                      {(['low', 'medium', 'high'] as Likelihood[]).map(l => (
                        <button
                          key={l}
                          onClick={() => setLikelihood(event.id, l)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all text-left",
                            myClass?.assignedLikelihood === l
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-surface-50 border-surface-100 text-primary/60 hover:border-primary/20"
                          )}
                        >
                          {l === 'low' ? 'Faible' : l === 'medium' ? 'Modérée' : 'Élevée'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={confirmAssessment}
          disabled={!isComplete}
          className={cn(
            "w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4",
            isComplete ? "bg-primary text-white hover:bg-primary/95" : "bg-surface-100 text-primary/20 cursor-not-allowed"
          )}
        >
          Allouer le budget de mitigation <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 4: Allocate ──────────────────────────────────────────────────────
  if (phase === 'allocate') {
    const totalAllocated = Object.values(allocation).reduce((a, b) => a + b, 0);
    const remaining = 100 - totalAllocated;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-primary mb-1">Mitigation & Budget</h2>
          <p className="text-sm text-primary/50">Allouez vos 100 points de budget entre les catégories pour protéger la banque.</p>
        </div>

        <div className="bg-surface-50 border border-surface-100 rounded-2xl p-4 mb-6 relative overflow-hidden shrink-0">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-xs font-bold text-primary/40 uppercase">Budget utilisé</div>
              <div className="text-2xl font-black text-primary">{totalAllocated} / 100</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-primary/40 uppercase">Restant</div>
              <div className={cn("text-xl font-black", remaining === 0 ? "text-success" : "text-primary")}>{remaining}</div>
            </div>
          </div>
          <div className="h-2 w-full bg-surface-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${totalAllocated}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 overflow-y-auto pr-2 flex-1">
          {Object.entries(RISK_LABELS).map(([type, label]) => {
            const Icon = RISK_ICONS[type as RiskType];
            const val = allocation[type as RiskType];
            return (
              <div key={type} className="bg-white border border-surface-200 rounded-2xl p-4 flex flex-col justify-between animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-50 flex items-center justify-center text-primary/40">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-primary uppercase">{label}</span>
                  </div>
                  <span className="text-lg font-black text-primary">{val}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(100, val + remaining)}
                  value={val}
                  onChange={(e) => setAllocation(type as RiskType, parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={simulateLosses}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Lancer la simulation du trimestre <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 5: Simulation (Animated results) ────────────────────────────────
  if (phase === 'simulate') {
    const lastResult = history[history.length - 1];
    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Activity className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-black font-display text-primary">Simulation T{quarter} terminée</h2>
          <p className="text-primary/50 text-sm">Les impacts ont été calculés avec succès.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 overflow-y-auto flex-1 pr-2">
          {/* Loss Summary */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-primary/40 uppercase mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Détail des pertes
            </h3>
            <div className="space-y-4">
              {lastResult.losses.map(loss => {
                const event = lastResult.events.find(e => e.id === loss.eventId);
                return (
                  <div key={loss.eventId} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-primary truncate max-w-[180px]">{event?.title}</span>
                      <span className="text-danger font-black">-{loss.actual.toFixed(1)} pts impact</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-50 rounded-full overflow-hidden flex">
                      <div className="h-full bg-danger opacity-20" style={{ width: `${(loss.potential / 9) * 100}%` }} />
                      <div className="h-full bg-danger" style={{ width: `${(loss.actual / 9) * 100}%`, marginLeft: `-${(loss.potential / 9) * 100}%` }} />
                    </div>
                    <div className="text-[9px] text-primary/40 text-right">
                      Mitigation : {(loss.mitigated * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-primary/40 uppercase mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Analyse
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary/60">Points gagnés (Précision)</span>
                  <span className="text-lg font-black text-success">+{lastResult.scoreGained}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary/60">Statut Bancaire</span>
                  <Badge variant={bank.status === 'healthy' ? 'success' : bank.status === 'warning' ? 'warning' : 'danger'}>
                    {bank.status === 'healthy' ? 'Sain' : bank.status === 'warning' ? 'Surveillance' : 'En Rupture'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <button
              onClick={nextQuarter}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-primary/95 transition-all shadow-md mt-6 flex items-center justify-center gap-2"
            >
              Trimestre suivant <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 6: Game Over ────────────────────────────────────────────────────
  if (phase === 'game_over') {
    const isBreach = bank.status === 'breach';
    const chartData = history.map(h => ({
      name: `T${h.quarter}`,
      capital: h.bankAfter.capitalRatio,
      npl: h.bankAfter.nplRatio,
      lcr: h.bankAfter.lcr
    }));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in text-primary py-4">
        <div className="text-center mb-8">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
            isBreach ? "bg-danger/10" : "bg-success/10"
          )}>
            {isBreach ? <AlertTriangle className="w-10 h-10 text-danger" /> : <Shield className="w-10 h-10 text-success" />}
          </div>
          <h1 className="text-4xl font-black font-display mb-2">
            {isBreach ? 'Banque Insolvable' : 'Mission Accomplie'}
          </h1>
          <p className="text-primary/50">
            {isBreach 
              ? 'Les ratios réglementaires ont été rompus. Le régulateur a suspendu l\'activité.'
              : 'Vous avez maintenu la stabilité de la banque malgré les chocs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-50 p-5 rounded-3xl border border-surface-100 text-center">
            <div className="text-xs font-bold text-primary/40 uppercase mb-2">Score Final</div>
            <div className="text-3xl font-black">{score}</div>
          </div>
          <div className="bg-surface-50 p-5 rounded-3xl border border-surface-100 text-center">
            <div className="text-xs font-bold text-primary/40 uppercase mb-2">Ratio Capital Final</div>
            <div className={cn("text-3xl font-black", bank.capitalRatio < 9.5 ? "text-danger" : "text-primary")}>
              {bank.capitalRatio}%
            </div>
          </div>
          <div className="bg-surface-50 p-5 rounded-3xl border border-surface-100 text-center">
            <div className="text-xs font-bold text-primary/40 uppercase mb-2">Quartiers Tenus</div>
            <div className="text-3xl font-black">{history.length} / 6</div>
          </div>
        </div>

        {/* Chart Evolution */}
        <div className="bg-white border border-surface-200 rounded-3xl p-6 mb-10 shadow-sm">
          <h3 className="text-sm font-bold text-primary/40 uppercase mb-6">Évolution du Ratio de Capital (%)</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis hide domain={[8, 14]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <ReferenceLine y={9.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Seuil BAM (9.5%)', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="capital" stroke="#000" strokeWidth={4} dot={{ r: 6, fill: '#000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Educational Recap */}
        <div className="bg-primary/5 rounded-3xl p-8 mb-10 border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-primary font-display">Récapitulatif Pédagogique</h3>
          </div>
          <div className="space-y-4 text-sm text-primary/70 leading-relaxed">
            <p>
              En tant que <strong>Risk Manager</strong>, votre rôle est crucial pour protéger les fonds propres de la banque contre les 
              pertes inattendues. La classification correcte des risques permet d&apos;utiliser les bons outils de mitigation :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 list-disc ml-4">
              <li><strong>Risque de Crédit:</strong> Provisions et analyse approfondie des emprunteurs.</li>
              <li><strong>Risque de Marché:</strong> Couverture via produits dérivés et limites d&apos;exposition.</li>
              <li><strong>Risque de Liquidité:</strong> Diversification des sources de financement.</li>
              <li><strong>Risque Opérationnel:</strong> Contrôles internes, IT robuste et assurances.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2 mb-20"
        >
          Recommencer la carrière <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-50 border border-surface-100 rounded-3xl p-6 min-h-[600px] flex flex-col shadow-inner">
      {/* Fallback for unknown phases */}
      <div className="flex-1 flex items-center justify-center text-primary/40">
        Chargement...
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
