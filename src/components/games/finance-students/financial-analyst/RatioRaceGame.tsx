'use client';

import React from 'react';
import { 
  BarChart3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Building2,
  Table as TableIcon,
  HelpCircle,
  FileText,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { useRatioRace, CaseStudy, Financials } from './useRatioRace';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const RATIO_DESCRIPTION: Record<string, string> = {
  liquidity: 'Sert à évaluer la capacité de l\'entreprise à payer ses dettes court terme.',
  solvency: 'Évalue la pérennité de la structure financière et le niveau d\'endettement.',
  profitability: 'Mesure la capacité à générer un profit par rapport aux ressources.',
  efficiency: 'Analyse la rotation des actifs et la gestion du cycle d\'exploitation.',
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RatioRaceGame() {
  const {
    state,
    currentCase,
    cases,
    ratios,
    startGame,
    goToQuiz,
    selectRatio,
    nextCase,
    resetGame,
  } = useRatioRace();

  const { phase, currentCaseIndex, score, history } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-black font-display mb-3">Ratio Race</h1>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Devenez analyste crédit. Examinez les états financiers de 3 entreprises marocaines sur 3 ans, identifiez les signaux d&apos;alerte et choisissez les bons ratios pour valider vos hypothèses.
        </p>

        <div className="grid grid-cols-1 gap-4 mb-10 text-left">
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <TableIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-primary/40">Mécanique</h3>
              <p className="text-sm font-bold text-primary">Analyse de tendances N/N-2</p>
            </div>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-success shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-primary/40">Score</h3>
              <p className="text-sm font-bold text-primary">+100 pts par diagnostic correct</p>
            </div>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2"
        >
          Analyser le premier dossier <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Status Header ────────────────────────────────────────────────────────
  const statusHeader = (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
          {currentCaseIndex + 1}
        </div>
        <div>
          <h2 className="text-lg font-black text-primary font-display uppercase tracking-tight leading-none">Étude de Cas</h2>
          <span className="text-[10px] font-bold text-primary/40 italic">Dossier {currentCaseIndex + 1} sur {cases.length}</span>
        </div>
      </div>
      <div className="bg-white border border-surface-100 px-4 py-2 rounded-2xl shadow-sm text-right">
        <div className="text-[10px] font-bold text-primary/40 uppercase">Score Total</div>
        <div className="text-lg font-black text-primary">{score} <span className="text-[10px] opacity-40">pts</span></div>
      </div>
    </div>
  );

  // ── Phase 1: Case Study (Data Review) ──────────────────────────────────────
  if (phase === 'case_study') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 flex-1 overflow-y-auto pr-2 pb-4">
          {/* Company Bio */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-primary leading-none uppercase">{currentCase.companyName}</h3>
                  <Badge variant="outline" size="xs" className="mt-1">{currentCase.industry}</Badge>
                </div>
              </div>
              <p className="text-sm text-primary/60 leading-relaxed italic mb-4">
                &quot;{currentCase.description}&quot;
              </p>
              <div className="pt-4 border-t border-surface-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-primary/70">Objectif : Identifier le signal d&apos;alerte</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-black uppercase text-amber-600">Conseil de l&apos;expert</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                Regardez l&apos;évolution des données sur 3 ans. Une croissance du CA peut parfois masquer une dégradation de la structure financière ou de la liquidité.
              </p>
            </div>
          </div>

          {/* Financial Data Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-primary/40 uppercase mb-4 flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> États Financiers Simplifiés (MAD Million)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-primary/40 border-b border-surface-100">
                    <tr>
                      <th className="py-2 font-bold uppercase text-[10px]">Poste</th>
                      {currentCase.financials.map(f => (
                        <th key={f.year} className="py-2 text-right font-black">{f.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    <tr className="bg-indigo-50/20"><td className="py-2 font-bold text-xs uppercase">Chiffre d&apos;Affaires</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-black">{f.revenue}</td>))}</tr>
                    <tr><td className="py-2 text-xs text-primary/60">EBITDA</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-medium">{f.ebitda}</td>))}</tr>
                    <tr><td className="py-2 text-xs text-primary/60">Résultat Net</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-medium">{f.netIncome}</td>))}</tr>
                    <tr className="bg-surface-50/50"><td className="py-2 font-bold text-xs uppercase">Capitaux Propres</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-black">{f.equity}</td>))}</tr>
                    <tr><td className="py-2 text-xs text-primary/60">Dette Totale</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-medium">{f.totalDebt}</td>))}</tr>
                    <tr><td className="py-2 text-xs text-primary/60">Actif Court Terme</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-medium">{f.currentAssets}</td>))}</tr>
                    <tr><td className="py-2 text-xs text-primary/60">Passif Court Terme</td>{currentCase.financials.map(f => (<td key={f.year} className="text-right font-medium">{f.currentLiabilities}</td>))}</tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visualizer */}
            <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-primary/40 uppercase mb-6 flex justify-between">
                <span>Visualisation : CA vs. Profit</span>
                <span className="text-[9px] lowercase italic opacity-50">Tendances sur 3 ans</span>
              </h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentCase.financials}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                    <YAxis hide />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="CA" />
                    <Bar dataKey="netIncome" fill="#10b981" radius={[4, 4, 0, 0]} name="Net" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={goToQuiz}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Établir le diagnostic <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 2: Quiz (Ratio Selection) ────────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black font-display text-primary mb-2">Quel est le signal d&apos;alerte ?</h2>
          <p className="text-primary/50 text-sm max-w-md mx-auto">
            Sélectionnez la famille de ratios la plus pertinente pour mettre en évidence le risque majeur dans ce dossier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 flex-1 overflow-y-auto pr-2">
          {ratios.filter((r, i, self) => self.findIndex(t => t.type === r.type) === i).map(ratio => (
            <button
              key={ratio.id}
              onClick={() => selectRatio(ratio.id)}
              className="bg-white border border-surface-200 rounded-3xl p-6 text-left hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-primary font-display uppercase tracking-tight group-hover:text-indigo-600">
                  {ratio.type === 'liquidity' ? 'Liquidité' : 
                   ratio.type === 'solvency' ? 'Solvabilité' : 
                   ratio.type === 'profitability' ? 'Rentabilité' : 'Efficience'}
                </h3>
                <ChevronRight className="w-5 h-5 text-surface-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-primary/50 leading-relaxed mb-4">
                {RATIO_DESCRIPTION[ratio.type]}
              </p>
              <div className="flex gap-2">
                <code className="text-[9px] bg-surface-50 text-indigo-600 px-2 py-1 rounded-lg font-bold">
                  Ex: {ratio.label}
                </code>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto bg-surface-50/50 rounded-2xl p-4 border border-surface-100 text-center italic text-[11px] text-primary/40 shrink-0 mb-4">
          Astuce : Relisez la bio de l&apos;entreprise {currentCase.companyName} pour comprendre son modèle économique.
        </div>
      </div>
    );
  }

  // ── Phase 3: Feedback ──────────────────────────────────────────────────────
  if (phase === 'feedback') {
    const lastResult = history[history.length - 1];
    const isCorrect = lastResult.wasCorrect;

    return (
      <div className="max-w-2xl mx-auto animate-fade-in flex flex-col items-center justify-center py-10 h-full">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mb-8 animate-scale-in",
          isCorrect ? "bg-success/10" : "bg-danger/10"
        )}>
          {isCorrect ? <CheckCircle2 className="w-12 h-12 text-success" /> : <XCircle className="w-12 h-12 text-danger" />}
        </div>
        
        <h2 className={cn(
          "text-3xl font-black font-display mb-2",
          isCorrect ? "text-success" : "text-danger"
        )}>
          {isCorrect ? 'Diagnostic Correct !' : 'Diagnostic Erroné'}
        </h2>
        
        <div className="bg-white border border-surface-200 rounded-3xl p-8 shadow-sm text-center mb-10 w-full animate-slide-up">
          <div className="text-[10px] font-black uppercase text-primary/40 mb-4 tracking-widest">Le Signal d&apos;Alerte</div>
          <h3 className="text-xl font-bold text-primary mb-4 leading-tight">
            {currentCase.targetSignal}
          </h3>
          <p className="text-sm text-primary/60 leading-relaxed mb-6">
            {currentCase.explanation}
          </p>
          <div className="bg-indigo-50/50 rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-[10px] font-black text-indigo-400 uppercase">Preuve par les chiffres</div>
            <div className="flex justify-between text-xs font-black text-indigo-900 px-4">
              <span>{currentCase.financials[0].year}</span>
              <span>→</span>
              <span>{currentCase.financials[2].year}</span>
            </div>
            {/* Simple sparkline logic could go here */}
          </div>
        </div>

        <button
          onClick={nextCase}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Dossier suivant <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 4: Summary ──────────────────────────────────────────────────────
  if (phase === 'summary') {
    const correctCount = history.filter(h => h.wasCorrect).length;

    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-black font-display mb-2">Examen Terminée</h1>
        <p className="text-primary/50 mb-10">Vous avez analysé tous les dossiers de crédit.</p>

        <div className="bg-white border border-surface-200 rounded-3xl p-8 shadow-md mb-10 divide-y divide-surface-100">
          <div className="pb-6">
            <div className="text-[10px] font-black uppercase text-primary/40 mb-2">Score Final</div>
            <div className="text-5xl font-black text-indigo-600">{score}</div>
          </div>
          <div className="py-6 flex justify-between items-center px-4">
            <div className="text-left">
              <div className="text-xs font-black uppercase text-primary/40">Précision</div>
              <p className="text-lg font-bold">{correctCount} / {cases.length} corrects</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-black uppercase text-primary/40">Niveau</div>
              <p className="text-lg font-bold text-success">{correctCount === cases.length ? 'Analyste Senior' : 'Junior'}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600/5 rounded-2xl p-6 text-sm text-primary/70 leading-relaxed mb-10 border border-indigo-600/10 italic">
          &quot;L&apos;analyse de ratios n&apos;est pas une fin en soi, mais une boussole qui pointe vers les questions à poser au management de l&apos;entreprise.&quot;
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2 mb-20"
        >
          Refaire une certification <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return null;
}
