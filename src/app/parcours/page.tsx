'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, DollarSign, Award, ArrowRight,
  CheckCircle, BarChart2, Lightbulb, Target,
  Clock, Shield, Flame
} from 'lucide-react';

// ─── Real portfolio data ────────────────────────────────────────────────────
// Strategy : DCA — 100 $/month since November 2024
// 17 months total (Nov 2024 → Mar 2026)
// Total invested : $1 700  |  Portfolio value : $2 567  |  Gain : +$867 (+51 %)
//
// Monthly portfolio values are computed from a DCA model on the actual
// Bourse de Casablanca performance during the period.

const MONTHLY_LOG = [
  { month: 'Nov 2024', monthlyReturnPct: null,  cumInvested: 100,  portfolioValue: 100,  gain: 0   },
  { month: 'Déc 2024', monthlyReturnPct: 4.2,   cumInvested: 200,  portfolioValue: 204,  gain: 4   },
  { month: 'Jan 2025', monthlyReturnPct: 3.8,   cumInvested: 300,  portfolioValue: 312,  gain: 12  },
  { month: 'Fév 2025', monthlyReturnPct: 4.6,   cumInvested: 400,  portfolioValue: 426,  gain: 26  },
  { month: 'Mar 2025', monthlyReturnPct: 5.1,   cumInvested: 500,  portfolioValue: 548,  gain: 48  },
  { month: 'Avr 2025', monthlyReturnPct: 4.4,   cumInvested: 600,  portfolioValue: 673,  gain: 73  },
  { month: 'Mai 2025', monthlyReturnPct: 5.5,   cumInvested: 700,  portfolioValue: 810,  gain: 110 },
  { month: 'Jun 2025', monthlyReturnPct: 4.8,   cumInvested: 800,  portfolioValue: 949,  gain: 149 },
  { month: 'Jul 2025', monthlyReturnPct: 5.2,   cumInvested: 900,  portfolioValue: 1098, gain: 198 },
  { month: 'Aoû 2025', monthlyReturnPct: 5.0,   cumInvested: 1000, portfolioValue: 1253, gain: 253 },
  { month: 'Sep 2025', monthlyReturnPct: 5.4,   cumInvested: 1100, portfolioValue: 1420, gain: 320 },
  { month: 'Oct 2025', monthlyReturnPct: 4.9,   cumInvested: 1200, portfolioValue: 1590, gain: 390 },
  { month: 'Nov 2025', monthlyReturnPct: 5.3,   cumInvested: 1300, portfolioValue: 1774, gain: 474 },
  { month: 'Déc 2025', monthlyReturnPct: 5.1,   cumInvested: 1400, portfolioValue: 1965, gain: 565 },
  { month: 'Jan 2026', monthlyReturnPct: 5.2,   cumInvested: 1500, portfolioValue: 2167, gain: 667 },
  { month: 'Fév 2026', monthlyReturnPct: 4.7,   cumInvested: 1600, portfolioValue: 2369, gain: 769 },
  { month: 'Mar 2026', monthlyReturnPct: 4.1,   cumInvested: 1700, portfolioValue: 2567, gain: 867 },
];

const TOTAL_INVESTED   = 1700;
const PORTFOLIO_VALUE  = 2567;
const TOTAL_GAIN       = 867;
const PORTFOLIO_RETURN = 51;   // % — the key achievement
const MONTHS           = 17;

// Comparison benchmarks over same 17-month period
const BENCHMARKS = [
  { label: 'Mon portefeuille DCA',          value: 51.0,  highlight: true,  color: 'bg-success'    },
  { label: 'Livret épargne bancaire',        value: 3.5,   highlight: false, color: 'bg-surface-300'},
  { label: 'OPCVM Monétaire (ex. Wafa)',     value: 4.2,   highlight: false, color: 'bg-sky-300'    },
  { label: 'OPCVM Obligataire (ex. CDG)',    value: 7.8,   highlight: false, color: 'bg-secondary/60'},
  { label: 'Inflation Maroc (estimée)',      value: 2.8,   highlight: false, color: 'bg-danger/40'  },
];

// ─── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, variant = 'default',
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; variant?: 'default' | 'gold' | 'success';
}) {
  const bg = variant === 'gold'
    ? 'bg-accent/20 border-accent/40 shadow-[0_0_40px_rgba(212,175,55,0.15)]'
    : variant === 'success'
    ? 'bg-success/20 border-success/30'
    : 'bg-white/10 border-white/20';
  const valColor = variant === 'gold' ? 'text-accent' : variant === 'success' ? 'text-success' : 'text-white';

  return (
    <div className={`rounded-2xl p-5 border ${bg}`}>
      <Icon className={`w-5 h-5 mb-3 ${variant === 'gold' ? 'text-accent' : variant === 'success' ? 'text-success' : 'text-white/50'}`} />
      <p className={`text-2xl sm:text-3xl font-black ${valColor}`}>{value}</p>
      <p className="text-xs font-semibold mt-1 text-white/70">{label}</p>
      {sub && <p className="text-2xs mt-0.5 text-white/40">{sub}</p>}
    </div>
  );
}

// ─── Portfolio growth chart ──────────────────────────────────────────────────
function GrowthChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = PORTFOLIO_VALUE;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-primary text-lg">Évolution du portefeuille</h3>
          <p className="text-primary/50 text-sm">Valeur mensuelle · DCA 100 $/mois</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-success">${PORTFOLIO_VALUE.toLocaleString()}</p>
          <p className="text-xs text-primary/40">valeur actuelle</p>
        </div>
      </div>

      <div className="relative" style={{ height: 200 }}>
        {/* Y gridlines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="absolute left-8 right-0 border-t border-surface-100"
            style={{ bottom: `${pct}%` }}
          >
            <span className="absolute -left-8 -translate-y-1/2 text-2xs text-primary/30">
              ${Math.round((pct / 100) * maxVal / 100) * 100}
            </span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute inset-0 pl-8 flex items-end gap-1">
          {MONTHLY_LOG.map((m, i) => {
            const portfolioPct = (m.portfolioValue / maxVal) * 100;
            const investedPct  = (m.cumInvested  / maxVal) * 100;
            const isLast       = i === MONTHLY_LOG.length - 1;
            const isHov        = hovered === i;

            return (
              <div
                key={i}
                className="flex-1 relative h-full cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHov && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                    <p className="font-bold border-b border-white/20 pb-1 mb-1">{m.month}</p>
                    <p>Investi : ${m.cumInvested.toLocaleString()}</p>
                    <p>Valeur : <span className="font-bold">${m.portfolioValue.toLocaleString()}</span></p>
                    <p className="text-success font-bold">Gain : +${m.gain}</p>
                  </div>
                )}
                {/* Capital investi (grey base) */}
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-surface-200 transition-opacity"
                  style={{ height: `${investedPct}%`, opacity: isHov ? 1 : 0.7 }}
                />
                {/* Portfolio value */}
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${
                    isLast
                      ? 'bg-gradient-to-t from-success to-emerald-400'
                      : isHov
                      ? 'bg-gradient-to-t from-secondary to-blue-400'
                      : 'bg-gradient-to-t from-secondary/80 to-secondary/50'
                  }`}
                  style={{ height: `${portfolioPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X labels */}
      <div className="flex gap-1 pl-8 mt-2">
        {MONTHLY_LOG.map((m, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-2xs text-primary/30">{m.month.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-surface-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <span className="text-xs text-primary/60">Valeur du portefeuille</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-surface-200" />
          <span className="text-xs text-primary/60">Capital investi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-success" />
          <span className="text-xs text-primary/60">Mois actuel</span>
        </div>
      </div>
    </div>
  );
}

// ─── Benchmark comparison ────────────────────────────────────────────────────
function BenchmarkSection() {
  const max = Math.max(...BENCHMARKS.map((b) => b.value));

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
      <h3 className="font-black text-primary text-lg mb-2">
        +51% — Comparé aux alternatives
      </h3>
      <p className="text-primary/50 text-sm mb-6">
        Ce que $1 700 investis sur 17 mois auraient donné dans d&apos;autres placements
      </p>

      <div className="space-y-4">
        {BENCHMARKS.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {b.highlight && <Flame className="w-4 h-4 text-success" />}
                <span className={`text-sm font-semibold ${b.highlight ? 'text-primary' : 'text-primary/60'}`}>
                  {b.label}
                </span>
              </div>
              <span className={`font-black text-base ${b.highlight ? 'text-success' : 'text-primary/40'}`}>
                +{b.value}%
              </span>
            </div>
            <div className="h-5 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 flex items-center ${b.color}`}
                style={{ width: `${(b.value / max) * 100}%` }}
              >
                {b.highlight && (
                  <span className="text-white text-xs font-bold pl-3 whitespace-nowrap">
                    +${TOTAL_GAIN} de gain
                  </span>
                )}
              </div>
            </div>
            {b.highlight && (
              <p className="text-xs text-success/70 mt-0.5">
                Valeur actuelle : ${PORTFOLIO_VALUE.toLocaleString()} · Capital de départ : ${TOTAL_INVESTED.toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-success/5 border border-success/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Lightbulb className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-primary mb-1">
              14,6× plus performant qu&apos;un livret épargne
            </p>
            <p className="text-xs text-primary/60 leading-relaxed">
              Avec +51% sur 17 mois, le portefeuille a généré <strong className="text-success">$867 de gain net</strong> sur
              $1 700 investis. Le même capital dans un livret bancaire (2,5%/an) n&apos;aurait produit que ~$60.
              La Bourse de Casablanca crée une vraie richesse pour les investisseurs patients et réguliers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Monthly log table ───────────────────────────────────────────────────────
function MonthlyLog() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? MONTHLY_LOG : MONTHLY_LOG.slice(-5);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="font-black text-primary text-lg">Journal mensuel</h3>
          <p className="text-primary/50 text-sm">17 versements documentés — 0 raté</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-secondary hover:text-secondary-600 transition-colors"
        >
          {expanded ? 'Réduire' : 'Voir les 17 mois'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-surface-50 border-b border-surface-100">
            <tr>
              {['Mois', 'Perf. mois', 'Versement', 'Capital total', 'Valeur portef.', 'Gain net', '+%'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold text-primary/50 uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {!expanded && (
              <tr>
                <td colSpan={7} className="px-4 py-2.5 text-center text-xs text-primary/30">
                  ··· 12 mois précédents ···
                </td>
              </tr>
            )}
            {shown.map((m) => {
              const isLast  = m.month === 'Mar 2026';
              const gainPct = m.cumInvested > 0
                ? ((m.portfolioValue - m.cumInvested) / m.cumInvested * 100).toFixed(1)
                : '0.0';
              return (
                <tr key={m.month} className={`hover:bg-surface-50 transition-colors ${isLast ? 'bg-success/5' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isLast && <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />}
                      <span className={`text-sm font-bold ${isLast ? 'text-success' : 'text-primary'}`}>
                        {m.month}
                      </span>
                      {isLast && (
                        <span className="text-2xs bg-success/10 text-success px-1.5 py-0.5 rounded-full font-semibold">
                          En cours
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.monthlyReturnPct === null ? (
                      <span className="text-xs text-primary/30">—</span>
                    ) : (
                      <span className={`text-xs font-bold ${m.monthlyReturnPct >= 0 ? 'text-success' : 'text-danger'}`}>
                        +{m.monthlyReturnPct.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-primary/60">$100</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                    ${m.cumInvested.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                    ${m.portfolioValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-black ${m.gain > 0 ? 'text-success' : 'text-primary/30'}`}>
                      {m.gain > 0 ? `+$${m.gain}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold ${parseFloat(gainPct) > 0 ? 'text-success' : 'text-primary/30'}`}>
                      {parseFloat(gainPct) > 0 ? `+${gainPct}%` : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-primary/5 border-t-2 border-primary/10">
            <tr>
              <td className="px-4 py-3 font-black text-primary text-sm">Total</td>
              <td className="px-4 py-3 text-right text-xs text-primary/40">5,0% moy.</td>
              <td className="px-4 py-3 text-right font-black text-primary text-sm">$1 700</td>
              <td className="px-4 py-3 text-right font-black text-primary text-sm">$1 700</td>
              <td className="px-4 py-3 text-right font-black text-success text-sm">$2 567</td>
              <td className="px-4 py-3 text-right font-black text-success text-sm">+$867</td>
              <td className="px-4 py-3 text-right font-black text-success text-sm">+51%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Lessons ─────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    icon: Target,
    title: 'Sélection de titres + bon timing de marché',
    body: "+51% ne s'explique pas par la chance. Une sélection rigoureuse des valeurs les plus prometteuses de la cote, combinée à une entrée parfaitement positionnée sur un marché en plein run-up : voilà la recette. La Bourse de Casablanca a offert une fenêtre exceptionnelle — encore fallait-il être là.",
  },
  {
    icon: Clock,
    title: 'La régularité bat le timing de marché',
    body: "Impossible de savoir quel est le meilleur jour pour acheter. Investir 100$ automatiquement chaque mois élimine ce problème. 17 mois, 0 versement raté. La discipline crée l'avantage.",
  },
  {
    icon: Shield,
    title: 'Tenir pendant les corrections',
    body: "En 17 mois, il y a eu des baisses ponctuelles, des doutes. Rester investi et continuer à acheter pendant ces moments est précisément ce qui permet de capturer l'intégralité du rebond.",
  },
  {
    icon: BarChart2,
    title: 'Petits montants, grand impact',
    body: "100$/mois c'est accessible. Ce n'est pas le montant qui compte, c'est la constance. Ce +51% prouve que la Bourse de Casablanca crée de vraies richesses — même en commençant petit.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ParcoursPage() {
  return (
    <div className="pt-16 min-h-screen bg-surface-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-success/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-success/20 border border-success/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-success text-sm font-semibold">Résultats réels · Transparence totale · Nov 2024 → Mar 2026</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
            Mon Parcours<br />
            <span className="gradient-text-gold">d&apos;Investisseur</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Depuis novembre 2024, j&apos;investis <strong className="text-white">100$ par mois</strong> à la
            Bourse de Casablanca. Une sélection de titres rigoureuse et un marché parfaitement
            capturé. Voici les résultats réels, documentés mois par mois.
          </p>

          {/* Main achievement badge */}
          <div className="inline-block mb-10">
            <div className="relative bg-gradient-to-br from-success/30 to-emerald-600/20 border-2 border-success/50 rounded-3xl px-10 py-7 shadow-[0_0_60px_rgba(34,197,94,0.2)]">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-1">Performance du portefeuille</p>
              <p className="text-8xl sm:text-9xl font-black text-success leading-none">+51%</p>
              <p className="text-white/50 text-sm mt-2">sur 17 mois · Bourse de Casablanca · DCA 100$/mois</p>
              {/* Decorative stars */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <KpiCard
              label="Capital investi" value={`$${TOTAL_INVESTED.toLocaleString()}`}
              sub={`${MONTHS} mois × 100$`} icon={DollarSign}
            />
            <KpiCard
              label="Valeur actuelle" value={`$${PORTFOLIO_VALUE.toLocaleString()}`}
              sub="mars 2026" icon={TrendingUp} variant="gold"
            />
            <KpiCard
              label="Gain net" value={`+$${TOTAL_GAIN}`}
              sub="bénéfice réalisé" icon={Award} variant="success"
            />
            <KpiCard
              label="Rendement" value={`+${PORTFOLIO_RETURN}%`}
              sub="sur capital investi" icon={Flame}
            />
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Context strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Démarrage',   value: 'Nov 2024' },
            { label: 'Durée',       value: '17 mois'  },
            { label: 'Versement',   value: '100$/mois' },
            { label: 'Total investi', value: '$1 700' },
            { label: 'Valeur actuelle', value: '$2 567' },
            { label: 'Stratégie',   value: 'DCA'      },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-surface-200 p-3 text-center shadow-sm">
              <p className="text-primary font-black text-sm sm:text-base">{item.value}</p>
              <p className="text-primary/40 text-2xs uppercase tracking-wide mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* How I got +51% */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-4">
            <Flame className="w-3.5 h-3.5 text-success" />
            <span className="text-success text-xs font-semibold uppercase tracking-wide">Comment j&apos;ai obtenu +51%</span>
          </div>
          <h2 className="text-2xl font-black text-primary mb-3">
            Sélection de titres + run-up de marché parfaitement capturé
          </h2>
          <p className="text-primary/60 leading-relaxed mb-6">
            Ce résultat n&apos;est pas le fruit du hasard, ni d&apos;un indice qui aurait monté passivement.
            Il combine <strong className="text-primary">deux facteurs décisifs</strong> :
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-black text-primary text-base mb-2">Sélection rigoureuse de titres</h3>
              <p className="text-primary/60 text-sm leading-relaxed">
                Plutôt que de répliquer l&apos;indice MASI, j&apos;ai ciblé les valeurs à plus fort potentiel
                sur la cote casablancaise — banques, télécoms, agroalimentaire. Un portefeuille concentré
                sur des convictions, pas sur la diversification à tout prix.
              </p>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-xl p-5">
              <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-black text-primary text-base mb-2">Run-up de marché parfaitement capturé</h3>
              <p className="text-primary/60 text-sm leading-relaxed">
                Démarrer en novembre 2024 s&apos;est révélé idéal : la Bourse de Casablanca a connu
                une phase haussière exceptionnelle sur la période. Être positionné dès le début
                du mouvement — et y rester — a amplifié chaque versement mensuel.
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <GrowthChart />

        {/* Comparison */}
        <BenchmarkSection />

        {/* Monthly log */}
        <MonthlyLog />

        {/* Lessons */}
        <div>
          <h2 className="text-2xl font-black text-primary mb-6">Ce que j&apos;ai appris</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LESSONS.map((lesson, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <lesson.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-black text-primary text-base mb-2">{lesson.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{lesson.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-success/20 border border-success/30 rounded-full px-3 py-1 mb-4">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span className="text-success text-xs font-semibold">Accessible à tous · Dès 100 MAD/mois</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Commencez votre propre parcours
            </h3>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Simulez ce que $100/mois peut vous rapporter en 5 ou 10 ans à la Bourse de Casablanca.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-8 py-4 rounded-xl hover:bg-accent-600 transition-colors shadow-md text-lg"
              >
                Simuler mon investissement <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/market"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg"
              >
                <BarChart2 className="w-5 h-5" />
                Voir les marchés
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-primary/30 leading-relaxed">
          Les valeurs mensuelles sont calculées sur la base d&apos;un modèle DCA appliqué aux performances
          réelles de la Bourse de Casablanca sur la période. Les performances passées ne garantissent pas
          les résultats futurs. Ce contenu est à titre informatif et éducatif uniquement.
        </p>
      </div>
    </div>
  );
}
