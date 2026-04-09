'use client';

import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight,
  Calculator,
  PieChart,
  History,
  Info,
  Briefcase,
  Zap,
  BarChart3,
  Search,
  CheckCircle,
  X,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { useCapitalBudgeting, getProjectMetrics, Project } from './useCapitalBudgeting';
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
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const formatMAD = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M MAD`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k MAD`;
  return `${v.toFixed(0)} MAD`;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CapitalBudgetingGame() {
  const {
    state,
    startGame,
    startAnalysis,
    goToSelection,
    toggleProject,
    confirmSelection,
    nextRound,
    resetGame,
  } = useCapitalBudgeting();

  const { phase, round, totalRounds, score, budget, availableProjects, selectedProjectIds, history } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black font-display mb-3">Capital Budgeting</h1>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Prenez la direction des investissements d&apos;un conglomérat marocain. Votre mission est d&apos;allouer le budget annuel entre plusieurs projets stratégiques en maximisant la création de valeur (VAN).
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Décisions</h3>
            <ul className="space-y-1 text-xs font-bold">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Calcul VAN & TRI</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Rationnement du capital</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Payback & Profitabilité</li>
            </ul>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-1">Score</h3>
            <p className="text-xl font-black text-primary">+1 pt / 10k MAD</p>
            <p className="text-[10px] text-primary/40">Sur la Valeur Actuelle Nette</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-2"
        >
          Analyser les projets <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Status Header ────────────────────────────────────────────────────────
  const currentInvestment = selectedProjectIds.reduce((sum, pid) => {
    const p = availableProjects.find(ap => ap.id === pid)!;
    return sum + Math.abs(p.initialInvestment);
  }, 0);

  const statusHeader = (
    <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in shrink-0">
      <div className="bg-primary text-white p-3 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Année</div>
        <div className="text-2xl font-black font-display">{round} / {totalRounds}</div>
        <Zap className="absolute right-[-10px] bottom-[-10px] w-12 h-12 opacity-10" />
      </div>
      <div className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Budget Initial</div>
        <div className="text-lg font-black text-primary">{formatMAD(budget)}</div>
      </div>
      <div className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm text-center relative overflow-hidden">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Score Cumulé</div>
        <div className="text-lg font-black text-emerald-600">{score}</div>
      </div>
    </div>
  );

  // ── Phase 1: Round Intro ──────────────────────────────────────────────────
  if (phase === 'round_intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-fade-in text-primary">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black font-display mb-3">Nouvelle Enveloppe Budgétaire</h2>
        <p className="text-primary/60 mb-10 leading-relaxed">
          Pour l&apos;année {round}, le comité exécutif vous alloue une enveloppe de <strong>{formatMAD(budget)}</strong>.
          {availableProjects.length} projets sont sur votre bureau.
        </p>

        <button
          onClick={startAnalysis}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          Ouvrir les business plans <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 2: Analysis (View Metrics) ──────────────────────────────────────
  if (phase === 'analysis') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in flex flex-col h-full pb-4">
        {statusHeader}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">Analyse des Opportunités</h2>
            <p className="text-sm text-primary/50">Comparez les métriques financières de chaque projet.</p>
          </div>
          <Badge variant="success" size="sm">CMPC (WACC) variable par projet</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 flex-1 overflow-y-auto pr-2 pb-4">
          {availableProjects.map(proj => {
            const metrics = getProjectMetrics(proj);
            const cfData = proj.cashFlows.map((cf, i) => ({ year: `Y${i+1}`, cf }));
            
            return (
              <div key={proj.id} className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm hover:border-emerald-600/30 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-primary uppercase text-xs tracking-wider">{proj.name}</h3>
                    <Badge variant="outline" size="xs" className="mt-1">{proj.category}</Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-primary/30 uppercase block">Investissement</span>
                    <span className="text-sm font-black text-danger">{formatMAD(Math.abs(proj.initialInvestment))}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                  <div className="bg-surface-50 rounded-xl p-2 border border-surface-100">
                    <div className="text-[8px] font-bold text-primary/40 uppercase mb-0.5">VAN</div>
                    <div className="text-xs font-black text-emerald-600">{formatMAD(metrics.npv)}</div>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-2 border border-surface-100">
                    <div className="text-[8px] font-bold text-primary/40 uppercase mb-0.5">TRI</div>
                    <div className="text-xs font-black text-primary">{(metrics.irr * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-2 border border-surface-100">
                    <div className="text-[8px] font-bold text-primary/40 uppercase mb-0.5">Payback</div>
                    <div className="text-xs font-black text-primary">{metrics.payback.toFixed(1)} ans</div>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-2 border border-surface-100">
                    <div className="text-[8px] font-bold text-primary/40 uppercase mb-0.5">IP</div>
                    <div className="text-xs font-black text-secondary">{metrics.pi.toFixed(2)}</div>
                  </div>
                </div>

                <div className="h-20 w-full mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cfData}>
                      <Bar dataKey="cf" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[10px] text-primary/50 leading-relaxed italic mt-auto">
                  {proj.description}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={goToSelection}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Sélectionner les investissements <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 3: Selection (Checkbox logic) ───────────────────────────────────
  if (phase === 'selection') {
    const remaining = budget - currentInvestment;

    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full pb-4">
        {statusHeader}
        
        <div className="bg-surface-50 border border-surface-200 rounded-3xl p-6 mb-8 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-black text-primary/40 uppercase mb-1">Rationnement du Capital</div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-primary">{formatMAD(currentInvestment)}</span>
              <span className="text-sm font-bold text-primary/30 mb-1">/ {formatMAD(budget)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-primary/40 uppercase mb-1">Restant</div>
            <div className={cn("text-xl font-black", remaining < 0 ? "text-danger" : "text-emerald-600")}>
              {formatMAD(remaining)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8 flex-1 overflow-y-auto pr-2 pb-4">
          {availableProjects.map(proj => {
            const isSelected = selectedProjectIds.includes(proj.id);
            const canAfford = remaining >= Math.abs(proj.initialInvestment);
            
            return (
              <button
                key={proj.id}
                onClick={() => toggleProject(proj.id)}
                disabled={!isSelected && !canAfford}
                className={cn(
                  "bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all text-left group",
                  isSelected 
                    ? "border-emerald-600 shadow-md ring-1 ring-emerald-600/50" 
                    : !canAfford 
                      ? "opacity-50 border-surface-100 cursor-not-allowed bg-surface-50/50" 
                      : "border-surface-200 hover:border-emerald-600/40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                  isSelected ? "bg-emerald-600 text-white" : "bg-surface-100 text-primary/20 group-hover:text-emerald-600 group-hover:bg-emerald-50"
                )}>
                  {isSelected ? <CheckCircle className="w-6 h-6" /> : proj.id === 'p1' ? '☀️' : proj.id === 'p2' ? '🏦' : proj.id === 'p3' ? '📦' : '🏗️'}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-primary">{proj.name}</h3>
                  <p className="text-[10px] text-primary/40">{proj.category}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-black text-danger">{formatMAD(Math.abs(proj.initialInvestment))}</div>
                  <div className="text-[9px] font-bold text-emerald-600">VAN: +{formatMAD(getProjectMetrics(proj).npv)}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={confirmSelection}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Valider le portefeuille annuel <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 4: Results (Round Summary) ──────────────────────────────────────
  if (phase === 'results') {
    const lastResult = history[history.length - 1];
    const projects = availableProjects.filter(p => lastResult.selectedProjectIds.includes(p.id));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-black font-display text-primary">Budget {round} finalisé</h2>
          <p className="text-primary/50 text-sm">Valeur créée pour l&apos;actionnaire : <span className="text-emerald-600 font-black">{formatMAD(lastResult.totalNpv)}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto pr-2 pb-4">
          {/* Selected Projects List */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Portefeuille retenu
            </h3>
            <div className="space-y-4">
              {projects.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary">{p.name}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">+{formatMAD(getProjectMetrics(p).npv)} VAN</span>
                </div>
              ))}
              {projects.length === 0 && <p className="text-center py-8 text-xs text-primary/30 italic">Aucun projet sélectionné !</p>}
            </div>
          </div>

          {/* Efficiency Summary */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-primary/40 uppercase mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> Efficience du capital
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary/60">Utilisation du budget</span>
                  <span className="font-bold">{((lastResult.totalInvestment / lastResult.budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary/60">Indice de profitabilité moyen</span>
                  <span className="font-bold text-secondary">
                    {(projects.reduce((s, p) => s + getProjectMetrics(p).pi, 0) / (projects.length || 1)).toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-surface-100 flex justify-between items-center">
                  <span className="text-sm font-black text-primary">Score de l&apos;année</span>
                  <span className="text-xl font-black text-success">+{lastResult.score} pts</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={nextRound}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:bg-primary/95 transition-all shadow-md mt-6 flex items-center justify-center gap-2"
            >
              {round < totalRounds ? 'Passer au budget suivant' : 'Voir le bilan final'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 5: Summary (Grand Finale) ───────────────────────────────────────
  if (phase === 'summary') {
    const totalValueCreated = history.reduce((s, h) => s + h.totalNpv, 0);
    const chartData = history.map(h => ({
      name: `Année ${h.round}`,
      valeur: h.totalNpv,
    }));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in text-primary py-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black font-display mb-2">Investment Manager</h1>
          <p className="text-primary/50">Vous avez géré un cycle d&apos;investissement de 3 ans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-surface-200 p-6 rounded-3xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">VAN Totale Créée</div>
            <div className="text-3xl font-black text-emerald-600">
              {formatMAD(totalValueCreated)}
            </div>
            <p className="text-[10px] text-primary/30 mt-1">Sur 3 cycles budgétaires</p>
          </div>
          <div className="bg-white border border-surface-200 p-6 rounded-3xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">Nombre de Projets</div>
            <div className="text-3xl font-black text-primary">
              {history.reduce((s, h) => s + h.selectedProjectIds.length, 0)}
            </div>
            <p className="text-[10px] text-primary/30 mt-1">Lancés avec succès</p>
          </div>
          <div className="bg-primary text-white p-6 rounded-3xl shadow-xl text-center">
            <div className="text-[10px] font-bold opacity-60 uppercase mb-2">Score Final</div>
            <div className="text-3xl font-black">{score} pts</div>
            <p className="text-[10px] opacity-40 mt-1">Basé sur la NPV consolidée</p>
          </div>
        </div>

        {/* Chart Evolution */}
        <div className="bg-white border border-surface-200 rounded-3xl p-6 mb-10 shadow-sm">
          <h3 className="text-xs font-bold text-primary/40 uppercase mb-8">Valeur Créée par Année (VAN)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [formatMAD(v)]}
                />
                <Area type="monotone" dataKey="valeur" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Recap */}
        <div className="bg-emerald-600/5 rounded-3xl p-8 mb-10 border border-emerald-600/10">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <h3 className="text-xl font-bold text-emerald-600 font-display text-primary">Le Credo de l&apos;Investisseur</h3>
          </div>
          <div className="space-y-4 text-sm text-primary/70 leading-relaxed font-medium">
            <p>
              Le choix des investissements est le moteur de la survie d&apos;une entreprise. Voici les principes clés illustrés par ce défi :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 list-disc ml-4">
              <li><strong>VAN &gt; 0 :</strong> Un projet ne doit être accepté que s&apos;il rapporte plus qu&apos;il ne coûte, après prise en compte du coût du capital (WACC).</li>
              <li><strong>IP (Indice de Profitabilité) :</strong> Lorsque le capital est limité (ce qui est toujours le cas), il faut privilégier les projets qui créent le plus de VAN <strong>par dirham investi</strong>.</li>
              <li><strong>Le TRI :</strong> Utile pour comparer des projets de tailles différentes, mais attention aux projets avec des cash flows tardifs ou non conventionnels.</li>
              <li><strong>Délai de Récupération (Payback) :</strong> Un critère de risque plus que de valeur, crucial pour les entreprises avec des contraintes de liquidité immédiate.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2 mb-20"
        >
          Relancer une carrière d&apos;investisseur <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return null;
}
