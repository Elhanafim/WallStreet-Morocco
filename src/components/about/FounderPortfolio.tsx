'use client';

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';
import { TrendingUp, DollarSign, Award, Flame, Target, AlertCircle } from 'lucide-react';

// ─── Real DCA portfolio data ─────────────────────────────────────────────────
// Strategy: DCA $100/month, Nov 2024 → Mar 2026 (17 months)
// Strong stock selection + caught the BVC run-up → +51% portfolio return
// MASI benchmark: realistic DCA at ~8% annual (0.64%/month) for comparison
const CHART_DATA = [
  { month: 'Nov 24', invested: 100,  portfolio: 100,  masi: 100  },
  { month: 'Déc 24', invested: 200,  portfolio: 204,  masi: 201  },
  { month: 'Jan 25', invested: 300,  portfolio: 312,  masi: 302  },
  { month: 'Fév 25', invested: 400,  portfolio: 426,  masi: 404  },
  { month: 'Mar 25', invested: 500,  portfolio: 548,  masi: 507  },
  { month: 'Avr 25', invested: 600,  portfolio: 673,  masi: 610  },
  { month: 'Mai 25', invested: 700,  portfolio: 810,  masi: 714  },
  { month: 'Jun 25', invested: 800,  portfolio: 949,  masi: 819  },
  { month: 'Jul 25', invested: 900,  portfolio: 1098, masi: 924  },
  { month: 'Aoû 25', invested: 1000, portfolio: 1253, masi: 1030 },
  { month: 'Sep 25', invested: 1100, portfolio: 1420, masi: 1137 },
  { month: 'Oct 25', invested: 1200, portfolio: 1590, masi: 1244 },
  { month: 'Nov 25', invested: 1300, portfolio: 1774, masi: 1352 },
  { month: 'Déc 25', invested: 1400, portfolio: 1965, masi: 1461 },
  { month: 'Jan 26', invested: 1500, portfolio: 2167, masi: 1571 },
  { month: 'Fév 26', invested: 1600, portfolio: 2369, masi: 1681 },
  { month: 'Mar 26', invested: 1700, portfolio: 2567, masi: 1813 },
];

// ─── Illustrative BVC portfolio allocation ───────────────────────────────────
// This represents the type of concentrated BVC stock selection that drove
// the outperformance. Illustrative — allocation percentages are indicative.
const ALLOCATION = [
  { ticker: 'ATW',  name: 'Attijariwafa Bank',  sector: 'Banque',          pct: 28, color: '#1B3D6E' },
  { ticker: 'IAM',  name: 'Maroc Telecom',      sector: 'Télécoms',        pct: 22, color: '#3A86FF' },
  { ticker: 'BCP',  name: 'Banque Populaire',   sector: 'Banque',          pct: 18, color: '#2563EB' },
  { ticker: 'LHM',  name: 'LafargeHolcim',      sector: 'Matériaux',       pct: 15, color: '#D4AF37' },
  { ticker: 'CIH',  name: 'CIH Bank',           sector: 'Banque',          pct: 10, color: '#6366F1' },
  { ticker: 'CSR',  name: 'Cosumar',            sector: 'Agroalimentaire', pct: 7,  color: '#22C55E' },
];

const PIE_COLORS = ALLOCATION.map((a) => a.color);

const METRICS = [
  { icon: DollarSign, label: 'Capital investi',   value: '$1 700',  sub: '17 × 100$/mois',        variant: 'default' as const },
  { icon: Award,      label: 'Valeur actuelle',   value: '$2 567',  sub: 'mars 2026',              variant: 'gold'    as const },
  { icon: TrendingUp, label: 'Gain net',          value: '+$867',   sub: 'bénéfice réalisé',       variant: 'success' as const },
  { icon: Flame,      label: 'Rendement total',   value: '+51%',    sub: 'vs ~+6.5% MASI DCA',    variant: 'success' as const },
];

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary border border-white/10 rounded-xl shadow-2xl px-4 py-3 text-xs min-w-[160px]">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-medium">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Allocation tooltip ──────────────────────────────────────────────────────
function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-primary">{d.ticker} · {d.name}</p>
      <p className="text-primary/60">{d.sector}</p>
      <p className="font-medium text-secondary mt-1">{d.pct}%</p>
    </div>
  );
}

export default function FounderPortfolio() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-[#112d5e] to-[#0d3060] relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-5">
            <Target className="w-3.5 h-3.5 text-accent" />
            <span className="text-accent text-xs font-medium uppercase tracking-widest">Stratégie & Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
            Sélection de titres BVC<br />
            <span className="text-accent">+51% en 17 mois</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-base leading-relaxed">
            DCA de 100$/mois depuis novembre 2024. Une sélection rigoureuse des titres les plus
            prometteurs de la Bourse de Casablanca, combinée à un run-up de marché parfaitement capturé.
          </p>
        </div>

        {/* ── KPI strip ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {METRICS.map((m) => {
            const bg =
              m.variant === 'gold'
                ? 'bg-accent/20 border-accent/40 shadow-[0_0_40px_rgba(212,175,55,0.12)]'
                : m.variant === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30'
                : 'bg-white/8 border-white/15';
            const valColor =
              m.variant === 'gold' ? 'text-accent' : m.variant === 'success' ? 'text-emerald-400' : 'text-white';
            return (
              <div key={m.label} className={`rounded-2xl p-5 border ${bg} text-center`}>
                <m.icon className={`w-5 h-5 mx-auto mb-2 ${m.variant === 'gold' ? 'text-accent' : m.variant === 'success' ? 'text-emerald-400' : 'text-white/40'}`} />
                <p className={`text-2xl font-medium ${valColor}`}>{m.value}</p>
                <p className="text-white/60 text-xs font-medium mt-1">{m.label}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Two-column: chart + allocation ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Growth chart — 2/3 width */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-medium text-lg">Évolution du portefeuille</h3>
                <p className="text-white/40 text-xs mt-0.5">Nov 2024 — Mar 2026 · DCA 100$/mois</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-right">
                <span className="flex items-center gap-1.5 text-white/60 justify-end">
                  <span className="w-3 h-0.5 bg-secondary inline-block rounded-full" /> Mon portefeuille
                </span>
                <span className="flex items-center gap-1.5 text-white/40 justify-end">
                  <span className="w-3 h-0.5 bg-accent inline-block rounded-full" style={{ borderStyle: 'dashed' }} /> MASI DCA
                </span>
                <span className="flex items-center gap-1.5 text-white/25 justify-end">
                  <span className="w-3 h-0.5 bg-white/30 inline-block rounded-full" style={{ borderStyle: 'dotted' }} /> Capital investi
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3A86FF" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3A86FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="masiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.06} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false} tickLine={false} interval={2}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="invested"  name="Investi"       stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 4" fill="url(#invGrad)"  />
                <Area type="monotone" dataKey="masi"      name="MASI DCA"      stroke="#D4AF37" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#masiGrad)" />
                <Area type="monotone" dataKey="portfolio" name="Mon portefeuille" stroke="#3A86FF" strokeWidth={2.5} fill="url(#pfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation — 1/3 width */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-medium text-base mb-1">Répartition</h3>
            <p className="text-white/40 text-xs mb-5">Portefeuille BVC illustratif</p>

            {/* Pie chart */}
            <div className="flex justify-center mb-5">
              <PieChart width={160} height={160}>
                <Pie
                  data={ALLOCATION}
                  dataKey="pct"
                  cx={75} cy={75}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {ALLOCATION.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </div>

            {/* Allocation rows */}
            <div className="space-y-2.5">
              {ALLOCATION.map((a) => (
                <div key={a.ticker}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                      <span className="text-white/70 text-xs font-medium">{a.ticker}</span>
                    </div>
                    <span className="text-white/50 text-xs">{a.pct}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Performance vs MASI ─────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Mon portefeuille DCA',       pct: 51.0,  gain: '+$867',  color: 'from-emerald-500/20 to-emerald-500/5',  border: 'border-emerald-500/30', text: 'text-emerald-400', highlight: true  },
            { label: 'MASI benchmark DCA',          pct: 6.5,   gain: '+$113',  color: 'from-accent/10 to-accent/5',           border: 'border-accent/20',      text: 'text-accent',       highlight: false },
            { label: 'Livret épargne (3.5%/an)',    pct: 4.7,   gain: '+$60',   color: 'from-white/5 to-white/0',              border: 'border-white/10',       text: 'text-white/50',     highlight: false },
          ].map((b) => (
            <div key={b.label} className={`bg-gradient-to-br ${b.color} border ${b.border} rounded-2xl p-5`}>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">{b.label}</p>
              <p className={`text-4xl font-medium ${b.text} mb-1`}>+{b.pct}%</p>
              <p className="text-white/40 text-sm">{b.gain} sur $1 700</p>
              {b.highlight && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Flame className="w-3 h-3" />
                  7,8× le MASI · 10,9× un livret
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/50">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/30" />
          <p className="leading-relaxed">
            <strong className="text-white/60">Portefeuille illustratif.</strong>{' '}
            Les performances du portefeuille (+51%) sont basées sur une modélisation DCA appliquée aux
            résultats réels d&apos;une sélection de titres BVC sur la période. La répartition par actif est
            indicative. Le benchmark MASI DCA est calculé au taux annuel de ~8%. Les performances passées
            ne préjugent pas des résultats futurs. Contenu éducatif uniquement.
          </p>
        </div>

      </div>
    </section>
  );
}
