'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Eye, 
  TrendingUp as BulletIcon, 
  ChevronRight, 
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
  MousePointer2,
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { 
  useHedgeOrHold, 
  HedgeLevel, 
  ExposureType, 
  Outlook 
} from './useHedgeOrHold';
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
  Legend
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const OUTLOOK_STYLES: Record<Outlook, { color: string; bg: string; icon: any; label: string }> = {
  bullish: { color: 'text-danger', bg: 'bg-danger/10', icon: TrendingUp, label: 'Haussier (Risque ↑)' },
  bearish: { color: 'text-success', bg: 'bg-success/10', icon: TrendingDown, label: 'Baissier (Risque ↓)' },
  uncertain: { color: 'text-primary/40', bg: 'bg-surface-100', icon: Eye, label: 'Incertain' },
};

const formatMAD = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M MAD`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k MAD`;
  return `${v.toFixed(0)} MAD`;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HedgeOrHoldGame() {
  const {
    state,
    startGame,
    setDecision,
    confirmDecisions,
    revealResults,
    nextPeriod,
    resetGame,
    hedgeEffectiveness,
  } = useHedgeOrHold();

  const { phase, period, totalPeriods, cumulativePnL, cumulativeUnhedgedPnL, exposures, outlooks, decisions, history } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-secondary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-secondary" />
        </div>
        <h1 className="text-3xl font-black font-display mb-3">Hedge or Hold?</h1>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Gérez la trésorerie d&apos;une entreprise exportatrice marocaine. Protégez vos marges contre la volatilité des changes, des taux et du pétrole. Décidez du niveau de couverture optimal pour chaque période.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Expositions</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold"><span className="text-xl">💶</span> EUR/MAD (Import)</div>
              <div className="flex items-center gap-2 text-xs font-bold"><span className="text-xl">📈</span> Taux Variable</div>
              <div className="flex items-center gap-2 text-xs font-bold"><span className="text-xl">🛢️</span> Pétrole</div>
            </div>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Périodes</h3>
            <p className="text-2xl font-black">6 Mois</p>
            <p className="text-[10px] text-primary/50">Simulez un semestre de trésorerie</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-secondary text-white font-bold py-4 rounded-2xl hover:bg-secondary/95 transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-2"
        >
          Ouvrir le terminal de trading <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Status Header ────────────────────────────────────────────────────────
  const statusHeader = (
    <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in shrink-0">
      <div className="bg-primary text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Mois</div>
        <div className="text-2xl font-black font-display">{period} / {totalPeriods}</div>
        <LineChartIcon className="absolute right-[-10px] bottom-[-10px] w-12 h-12 opacity-10" />
      </div>
      <div className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">P&L Cumulé (Couvert)</div>
        <div className={cn("text-xl font-black", cumulativePnL >= 0 ? "text-success" : "text-danger")}>
          {cumulativePnL >= 0 ? '+' : ''}{formatMAD(cumulativePnL)}
        </div>
      </div>
      <div className="bg-white border border-surface-100 p-4 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Sans Couverture</div>
        <div className={cn("text-xl font-bold opacity-40", cumulativeUnhedgedPnL >= 0 ? "text-success" : "text-danger")}>
          {cumulativeUnhedgedPnL >= 0 ? '+' : ''}{formatMAD(cumulativeUnhedgedPnL)}
        </div>
      </div>
    </div>
  );

  // ── Phase 1: Decision ─────────────────────────────────────────────────────
  if (phase === 'decision') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-1 text-center">Décisions de Couverture</h2>
          <p className="text-sm text-primary/50 text-center">Analysez les perspectives et choisissez votre niveau de protection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 flex-1 overflow-y-auto pr-2">
          {exposures.map(exp => {
            const outlook = outlooks.find(o => o.exposureId === exp.id)!;
            const OStyle = OUTLOOK_STYLES[outlook.outlook];
            const currentDec = decisions.find(d => d.exposureId === exp.id)?.level || 'none';
            
            return (
              <div key={exp.id} className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm flex flex-col animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{exp.emoji}</span>
                  <div>
                    <h3 className="font-black text-primary leading-none uppercase text-xs tracking-wider">{exp.name}</h3>
                    <p className="text-[10px] text-primary/40 mt-0.5">{formatMAD(exp.notional)}</p>
                  </div>
                </div>

                <div className={cn("rounded-xl p-3 mb-6 border", OStyle.bg, "border-current/10")}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <OStyle.icon className={cn("w-4 h-4", OStyle.color)} />
                    <span className={cn("text-[10px] font-black uppercase tracking-tight", OStyle.color)}>
                      {OStyle.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-primary/70 leading-relaxed italic">{outlook.hint}</p>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">Choisir Couverture</div>
                  {(['none', 'partial', 'full'] as HedgeLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setDecision(exp.id, lvl)}
                      className={cn(
                        "w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex justify-between items-center",
                        currentDec === lvl
                          ? "bg-secondary text-white border-secondary shadow-md"
                          : "bg-surface-50 border-surface-100 text-primary/60 hover:border-secondary/30"
                      )}
                    >
                      <span>{lvl === 'none' ? 'Aucune (0%)' : lvl === 'partial' ? 'Partielle (50%)' : 'Totale (100%)'}</span>
                      {currentDec === lvl && <MousePointer2 className="w-3 h-3" />}
                    </button>
                  ))}
                  <div className="pt-2 text-[9px] text-primary/30 text-center flex items-center justify-center gap-1">
                    <Info className="w-2.5 h-2.5" />
                    {currentDec === 'none' ? 'Coût: 0' : currentDec === 'partial' ? `Coût: ~${formatMAD(exp.notional * 0.004)}` : `Coût: ~${formatMAD(exp.notional * 0.008)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={confirmDecisions}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Fixer les positions <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 2: Market Reveal ────────────────────────────────────────────────
  if (phase === 'market_reveal') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-fade-in text-primary">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-white border-4 border-primary/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-black font-display mb-3">Fixing du Marché...</h2>
        <p className="text-primary/60 mb-10 leading-relaxed">
          Bank Al-Maghrib et les marchés internationaux valident les cours de clôture pour le mois {period}...
        </p>

        <button
          onClick={revealResults}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          Voir le P&L financier <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 3: Results ─────────────────────────────────────────────────────
  if (phase === 'results') {
    const lastResult = history[history.length - 1];
    
    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-primary mb-1">Performances du Mois {period}</h2>
          <p className={cn(
            "text-sm font-bold",
            lastResult.totalHedged >= 0 ? "text-success" : "text-danger"
          )}>
            Résultat net : {lastResult.totalHedged >= 0 ? '+' : ''}{formatMAD(lastResult.totalHedged)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 flex-1 overflow-y-auto pr-2">
          {exposures.map(exp => {
            const res = lastResult.pnl.find(p => p.exposureId === exp.id)!;
            const move = lastResult.moves.find(m => m.exposureId === exp.id)!;
            const dec = lastResult.decisions.find(d => d.exposureId === exp.id)!.level;
            
            return (
              <div key={exp.id} className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{exp.emoji}</span>
                  <div>
                    <h3 className="font-bold text-primary uppercase text-xs">{exp.name}</h3>
                    <div className={cn("text-sm font-black mt-0.5", move.move >= 0 ? "text-danger" : "text-success")}>
                      {move.label}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-primary/40">
                    <span>Sans protection</span>
                    <span className={res.unhedgedPnL >= 0 ? "text-success" : "text-danger"}>
                      {res.unhedgedPnL >= 0 ? '+' : ''}{formatMAD(res.unhedgedPnL)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", res.unhedgedPnL >= 0 ? "bg-success" : "bg-danger")} 
                      style={{ width: `${Math.min(100, (Math.abs(res.unhedgedPnL) / (exp.notional * 0.15)) * 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-1 border-l border-surface-100 pl-6">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-primary/40">
                    <span>Position Couverte ({dec === 'none' ? '0%' : dec === 'partial' ? '50%' : '100%'})</span>
                    <span className={cn("font-black", res.hedgedPnL >= 0 ? "text-success" : "text-danger")}>
                      {res.hedgedPnL >= 0 ? '+' : ''}{formatMAD(res.hedgedPnL)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", res.hedgedPnL >= 0 ? "bg-success" : "bg-danger")} 
                      style={{ width: `${Math.min(100, (Math.abs(res.hedgedPnL) / (exp.notional * 0.15)) * 100)}%` }} 
                    />
                  </div>
                  <div className="text-[9px] text-primary/30 mt-1">Coût de couverture: {formatMAD(res.hedgeCost)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={nextPeriod}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Passer au mois suivant <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 4: Summary ──────────────────────────────────────────────────────
  if (phase === 'summary') {
    const chartData = history.map(h => ({
      name: `M${h.period}`,
      couvert: h.totalHedged,
      nonCouvert: h.totalUnhedged,
      cumul: history.slice(0, h.period).reduce((s, p) => s + p.totalHedged, 0)
    }));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in text-primary py-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-black font-display mb-2">Bilan de Trésorerie</h1>
          <p className="text-primary/50">Synthèse de votre performance de couverture sur le semestre.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-50 p-6 rounded-3xl border border-surface-100 flex flex-col justify-center">
            <div className="text-xs font-bold text-primary/40 uppercase mb-2">P&L Net Final</div>
            <div className={cn("text-3xl font-black", cumulativePnL >= 0 ? "text-success" : "text-danger")}>
              {cumulativePnL >= 0 ? '+' : ''}{formatMAD(cumulativePnL)}
            </div>
            <p className="text-[10px] text-primary/40 mt-1 italic">
              Vs. {formatMAD(cumulativeUnhedgedPnL)} sans gestion
            </p>
          </div>
          <div className="bg-surface-50 p-6 rounded-3xl border border-surface-100 flex flex-col justify-center">
            <div className="text-xs font-bold text-primary/40 uppercase mb-2">Efficacité Hedge</div>
            <div className="text-3xl font-black text-secondary">
              {(hedgeEffectiveness * 100).toFixed(0)}%
            </div>
            <p className="text-[10px] text-primary/40 mt-1">Réduction de la volatilité</p>
          </div>
          <div className="bg-primary text-white p-6 rounded-3xl shadow-xl flex flex-col justify-center">
            <div className="text-xs font-bold opacity-60 uppercase mb-2">Score Finance</div>
            <div className="text-3xl font-black">{Math.max(0, Math.round(cumulativePnL / 1000))} pts</div>
            <p className="text-[10px] opacity-40 mt-1">Basé sur le gain net préservé</p>
          </div>
        </div>

        {/* Chart Evolution */}
        <div className="bg-white border border-surface-200 rounded-3xl p-6 mb-10 shadow-sm">
          <h3 className="text-sm font-bold text-primary/40 uppercase mb-8 flex items-center justify-between">
            <span>Évolution mensuelle du P&L</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-3 h-3 rounded-sm bg-secondary" /> Couvert</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-3 h-3 rounded-sm bg-surface-200" /> Sans gestion</span>
            </div>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [formatMAD(v)]}
                />
                <ReferenceLine y={0} stroke="#cbd5e1" />
                <Bar dataKey="couvert" fill="#000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonCouvert" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Recap */}
        <div className="bg-secondary/5 rounded-3xl p-8 mb-10 border border-secondary/10">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-secondary" />
            <h3 className="text-xl font-bold text-secondary font-display">Le Point du Trésorier</h3>
          </div>
          <div className="space-y-4 text-sm text-primary/70 leading-relaxed">
            <p>
              Gérer une trésorerie en entreprise ne consiste pas à parier sur le marché, mais à <strong>neutraliser l&apos;incertitude</strong>. 
              Une couverture (Hedge) réussie permet de :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 list-disc ml-4">
              <li><strong>Figer les coûts:</strong> Garantir une marge brute sur les importations.</li>
              <li><strong>Sécuriser les flux:</strong> Éviter les chocs de trésorerie sur les prêts à taux variable.</li>
              <li><strong>Visibilité budgétaire:</strong> Planifier les investissements avec des coûts d&apos;énergie prévisibles.</li>
            </ul>
            <p className="text-xs italic mt-4 opacity-60">
              Note : La couverture parfaite a un coût financier. Le défi est de trouver le bon équilibre entre risque résiduel et coût du hedge.
            </p>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2 mb-20"
        >
          Nouvelle mission de trésorerie <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return null;
}
