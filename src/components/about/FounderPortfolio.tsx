'use client';

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from 'recharts';
import { TrendingUp, DollarSign, Award, Flame, Target, AlertCircle } from 'lucide-react';

// ─── Real DCA portfolio data ─────────────────────────────────────────────────
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

const ALLOCATION = [
  { ticker: 'ATW',  name: 'Attijariwafa Bank',  sector: 'Banque',          pct: 28, color: '#1B3D6E' },
  { ticker: 'IAM',  name: 'Maroc Telecom',      sector: 'Télécoms',        pct: 22, color: '#3A86FF' },
  { ticker: 'BCP',  name: 'Banque Populaire',   sector: 'Banque',          pct: 18, color: '#2563EB' },
  { ticker: 'LHM',  name: 'LafargeHolcim',      sector: 'Matériaux',       pct: 15, color: '#B8974A' },
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
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }} className="px-4 py-3 text-xs min-w-[160px]">
      <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>${p.value.toLocaleString()}</span>
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
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }} className="px-3 py-2 text-xs">
      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{d.ticker} · {d.name}</p>
      <p style={{ color: 'var(--text-secondary)' }}>{d.sector}</p>
      <p className="font-medium mt-1" style={{ color: 'var(--navy)' }}>{d.pct}%</p>
    </div>
  );
}

export default function FounderPortfolio() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: 'rgba(184,151,74,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" style={{ backgroundColor: 'rgba(15,45,82,0.04)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }}>
            <Target className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--gold)' }}>Stratégie & Performance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium mb-4" style={{ color: 'var(--navy)' }}>
            Sélection de titres BVC<br />
            <span style={{ color: 'var(--gold)' }}>+51% en 17 mois</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            DCA de 100$/mois depuis novembre 2024. Une sélection rigoureuse des titres les plus
            prometteurs de la Bourse de Casablanca, combinée à un run-up de marché parfaitement capturé.
          </p>
        </div>

        {/* ── KPI strip ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {METRICS.map((m) => {
            const cardStyle =
              m.variant === 'gold'
                ? { backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }
                : m.variant === 'success'
                ? { backgroundColor: 'rgba(13,122,78,0.06)', border: '1px solid rgba(13,122,78,0.2)' }
                : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' };
            const valColor =
              m.variant === 'gold' ? 'var(--gold)' : m.variant === 'success' ? 'var(--gain)' : 'var(--text-primary)';
            return (
              <div key={m.label} className="rounded-[10px] p-5 text-center" style={cardStyle}>
                <m.icon className="w-5 h-5 mx-auto mb-2" style={{ color: valColor }} />
                <p className="text-2xl font-medium" style={{ color: valColor }}>{m.value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Two-column: chart + allocation ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Growth chart — 2/3 width */}
          <div className="lg:col-span-2 rounded-[12px] p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>Évolution du portefeuille</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Nov 2024 — Mar 2026 · DCA 100$/mois</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-right">
                <span className="flex items-center gap-1.5 justify-end" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-3 h-0.5 inline-block rounded-full" style={{ backgroundColor: '#3A86FF' }} /> Mon portefeuille
                </span>
                <span className="flex items-center gap-1.5 justify-end" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-3 h-0.5 inline-block rounded-full" style={{ backgroundColor: 'var(--gold)' }} /> MASI DCA
                </span>
                <span className="flex items-center gap-1.5 justify-end" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-3 h-0.5 inline-block rounded-full" style={{ backgroundColor: 'var(--border)' }} /> Capital investi
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fpfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3A86FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3A86FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fmasiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#B8974A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#B8974A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="finvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F5F7FA" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#F5F7FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#8298B0', fontSize: 10 }}
                  axisLine={false} tickLine={false} interval={2}
                />
                <YAxis
                  tick={{ fill: '#8298B0', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="invested"  name="Investi"       stroke="#C8D6E5" strokeWidth={1} strokeDasharray="4 4" fill="url(#finvGrad)"  />
                <Area type="monotone" dataKey="masi"      name="MASI DCA"      stroke="#B8974A" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#fmasiGrad)" />
                <Area type="monotone" dataKey="portfolio" name="Mon portefeuille" stroke="#3A86FF" strokeWidth={2.5} fill="url(#fpfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation — 1/3 width */}
          <div className="rounded-[12px] p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="font-medium text-base mb-1" style={{ color: 'var(--text-primary)' }}>Répartition</h3>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Portefeuille BVC illustratif</p>

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
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{a.ticker}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.pct}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
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
            { label: 'Mon portefeuille DCA',       pct: 51.0,  gain: '+$867',  style: { backgroundColor: 'rgba(13,122,78,0.06)', border: '1px solid rgba(13,122,78,0.2)' },  textColor: 'var(--gain)', highlight: true  },
            { label: 'MASI benchmark DCA',          pct: 6.5,   gain: '+$113',  style: { backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.2)' },  textColor: 'var(--gold)',  highlight: false },
            { label: 'Livret épargne (3.5%/an)',    pct: 4.7,   gain: '+$60',   style: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' },           textColor: 'var(--text-muted)',    highlight: false },
          ].map((b) => (
            <div key={b.label} className="rounded-[10px] p-5" style={b.style}>
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{b.label}</p>
              <p className="text-4xl font-medium mb-1" style={{ color: b.textColor }}>+{b.pct}%</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{b.gain} sur $1 700</p>
              {b.highlight && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(13,122,78,0.1)', color: 'var(--gain)' }}>
                  <Flame className="w-3 h-3" />
                  7,8× le MASI · 10,9× un livret
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Disclaimer ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-[10px] p-5 text-sm" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="leading-relaxed">
            <strong style={{ color: 'var(--text-secondary)' }}>Portefeuille illustratif.</strong>{' '}
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
