'use client';

/**
 * M2MDonneesPanel — Dashboard financier complet pour M2M Group
 * Données issues du Rapport d'Évaluation Financière ENCG Meknès S8 — Avril 2026
 * Remplace la section DONNÉES générique pour le ticker M2M
 */

import { useState } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#040914',
  panel:  '#0B101E',
  panel2: '#0A0F1D',
  border: '#1E293B',
  orange: '#FF9800',
  green:  '#00E676',
  red:    '#FF1744',
  yellow: '#FFD700',
  cyan:   '#00E5FF',
  muted:  '#8B95A1',
  white:  '#FFFFFF',
  gold:   '#C9A84C',
  teal:   '#0E9F8E',
  blue1:  '#1E3A5F',
  navy:   '#1A4A80',
};

// ── Hardcoded M2M data from ENCG Meknès report ─────────────────────────────
const DATA = {
  // Compte de résultat social 2023-2024
  income: {
    rows: [
      { label: "Chiffre d'affaires", v23: 49.0, v24: 56.0, varPct: 14.3 },
      { label: 'EBIT', v23: 5.5, v24: 7.0, varPct: 27.3 },
      { label: "Marge d'exploitation", v23: 11.2, v24: 12.5, varPct: 1.3, isPct: true },
      { label: 'Résultat financier', v23: -2.0, v24: -1.5, varPct: 25.0 },
      { label: 'Résultat exceptionnel', v23: -8.3, v24: -0.5, varPct: 93.9 },
      { label: 'Impôt sur les sociétés', v23: 1.5, v24: 0.0, varPct: -100.0 },
      { label: 'Résultat net', v23: -3.4, v24: 5.0, varPct: null, special: 'retournement' },
      { label: 'Marge nette', v23: -6.9, v24: 8.9, varPct: 15.8, isPct: true },
    ],
  },

  // Comptes consolidés
  consolidated: {
    rows: [
      { label: 'CA consolidé', v23: 79.0, v24: 102.0, varPct: 29.1 },
      { label: 'dont M2M Group SA', v23: 49.0, v24: 56.0, varPct: 14.3, indent: true },
      { label: 'dont NAPS (60,26 %)', v23: 30.0, v24: 46.0, varPct: 53.3, indent: true, highlight: true },
      { label: 'Résultat net consolidé', v23: -5.0, v24: 3.5, varPct: null, special: 'retournement' },
    ],
  },

  // Bilan
  bilan: {
    capitalSocial: 64.778,
    reserves: 178.0,
    reportNouveau: -6.731,
    rnNet2024: 5.0,
    anc: 244.4,
    ancPerAction: 377.2,
    ancc: 209.4,
    anccPerAction: 323.2,
    dettes: 0,
    actions: 647777,
  },

  // Projections 2025-2029
  projections: [
    { year: '2025E', ca: 66.1, growth: 18, ebit: 9.3, margeEbit: 14.0, fcf: 8.0, rn: 8.0 },
    { year: '2026E', ca: 76.0, growth: 15, ebit: 11.4, margeEbit: 15.0, fcf: 9.3, rn: 12.0 },
    { year: '2027E', ca: 85.1, growth: 12, ebit: 12.8, margeEbit: 15.0, fcf: 11.5, rn: 16.0 },
    { year: '2028E', ca: 93.6, growth: 10, ebit: 14.0, margeEbit: 15.0, fcf: 12.5, rn: 20.0 },
    { year: '2029E', ca: 101.1, growth: 8, ebit: 16.2, margeEbit: 16.0, fcf: 14.2, rn: 24.0 },
  ],

  // Synthèse valorisation
  valuation: [
    { methode: 'DDM (Dividendes)', mmad: 118.8, perAction: 183.5, poids: 'Secondaire', color: C.muted },
    { methode: 'DCF (WACC 12,6 %)', mmad: 127.3, perAction: 196.5, poids: 'Principal ★★★★', color: C.cyan },
    { methode: 'ANCC (Actif Net Corrigé)', mmad: 209.4, perAction: 323.2, poids: 'Référence', color: C.teal },
    { methode: 'ANC (Actif Net Comptable)', mmad: 244.4, perAction: 377.2, poids: 'Plancher', color: C.blue1 },
    { methode: 'Méthode Praticiens (GW)', mmad: 261.8, perAction: 404.1, poids: 'Secondaire ★★★', color: C.navy },
    { methode: 'Cours boursier actuel', mmad: 298.0, perAction: 460.0, poids: 'Référence marché', color: C.orange },
    { methode: 'Multiples EV/CA × 3,6x', mmad: 273.6, perAction: 422.3, poids: 'Marché ★★★', color: C.gold },
    { methode: 'Multiples P/B × 2,4x', mmad: 502.6, perAction: 775.8, poids: 'Optimiste ★★', color: C.yellow },
  ],

  // WACC
  wacc: {
    rf: 4.5,
    prime: 7.0,
    beta: 1.15,
    ke: 12.6,
    wacc: 12.6,
    g: 3.5,
  },

  // Scénarios
  scenarios: [
    { scenario: 'Pessimiste', min: 185, max: 309, conditions: 'Stagnation marché, perte parts marché, NAPS non valorisée' },
    { scenario: 'Central (Base)', min: 309, max: 432, conditions: 'Croissance modérée, rentabilité progressive, multiples sectoriels' },
    { scenario: 'Optimiste', min: 540, max: 772, conditions: 'Forte croissance NAPS, gains parts marché, consolidation sectorielle' },
  ],
};

const COURS_ACTUEL = 460;

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmtMMAD = (v: number | null, d = 1) =>
  v == null ? '—' : `${v.toFixed(d)} MMAD`;
const fmtPct = (v: number | null) =>
  v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)} %`;
const fmtMAD = (v: number) => `${v.toFixed(1)} MAD`;

function varColor(v: number | null, special?: string): string {
  if (special === 'retournement') return C.green;
  if (v == null) return C.muted;
  return v > 0 ? C.green : v < 0 ? C.red : C.muted;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border px-3 py-2 text-[11px]" style={{ background: C.panel, borderColor: C.border, ...mono.style }}>
      <p className="font-bold uppercase mb-1" style={{ color: C.orange }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? C.white }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name.includes('Marge') ? ' %' : ' MMAD'}
        </p>
      ))}
    </div>
  );
};

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: C.border, background: C.panel2 }}>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
        ■ {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
  );
}

// ── KPI cards ─────────────────────────────────────────────────────────────────
function KpiCards() {
  const cards = [
    { label: 'Cours actuel', value: `${COURS_ACTUEL} MAD`, sub: 'Bourse de Casablanca', color: C.orange },
    { label: 'CA Social 2024', value: '56,0 MMAD', growth: '+14,3 %', sub: 'vs 49,0 MMAD en 2023', color: C.green },
    { label: 'CA Consolidé 2024', value: '102,0 MMAD', growth: '+29,1 %', sub: 'NAPS: +53,3 %', color: C.teal },
    { label: 'Résultat Net 2024', value: '+5,0 MMAD', growth: 'Retournement', sub: 'vs –3,4 MMAD en 2023', color: C.green },
    { label: 'WACC', value: '12,6 %', sub: 'Ke = Rf 4,5 % + β(7,0 %)', color: C.cyan },
    { label: 'ANC / Action', value: '377,2 MAD', sub: `P/B actuel: ${(COURS_ACTUEL / 377.2).toFixed(2)}x`, color: C.gold },
    { label: 'Recommandation', value: 'NEUTRE À', sub: 'CONSERVER', color: C.yellow },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px" style={{ background: C.border }}>
      {cards.map(c => (
        <div key={c.label} className="flex flex-col gap-1.5 p-3" style={{ background: C.panel, borderLeft: `2px solid ${c.color}` }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>{c.label}</span>
          <span className="text-sm font-black leading-tight tabular-nums" style={{ color: c.color, ...mono.style }}>{c.value}</span>
          {c.growth && (
            <span className="text-[10px] font-bold" style={{ color: c.growth.startsWith('+') || c.growth === 'Retournement' ? C.green : C.red, ...mono.style }}>
              {c.growth}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>{c.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── Income statement table ─────────────────────────────────────────────────────
function IncomeTable() {
  return (
    <div style={{ background: C.panel }}>
      {/* Header */}
      <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style,
          gridTemplateColumns: '1fr 110px 110px 90px' }}>
        <span>Indicateur</span>
        <span className="text-right">2023</span>
        <span className="text-right">2024</span>
        <span className="text-right">Variation</span>
      </div>
      {DATA.income.rows.map(row => (
        <div key={row.label} className="grid px-4 py-2.5 hover:bg-[#0f1929] transition-colors border-b"
          style={{ borderColor: C.border, gridTemplateColumns: '1fr 110px 110px 90px', ...mono.style }}>
          <span className="text-[11px] font-bold" style={{ color: C.white }}>{row.label}</span>
          <span className="text-[11px] tabular-nums text-right font-bold"
            style={{ color: row.v23 < 0 ? C.red : row.v23 === 0 ? C.muted : C.white }}>
            {row.isPct ? `${row.v23.toFixed(1)} %` : fmtMMAD(row.v23)}
          </span>
          <span className="text-[11px] tabular-nums text-right font-bold"
            style={{ color: row.v24 < 0 ? C.red : row.v24 === 0 ? C.muted : C.green }}>
            {row.isPct ? `${row.v24.toFixed(1)} %` : fmtMMAD(row.v24)}
          </span>
          <span className="text-[10px] tabular-nums text-right font-black"
            style={{ color: varColor(row.varPct, row.special) }}>
            {row.special === 'retournement' ? '↑ Retournement' : row.varPct != null ? fmtPct(row.varPct) : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Consolidated table ─────────────────────────────────────────────────────────
function ConsolidatedTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="grid px-4 py-2 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: C.orange, borderBottom: `1px solid ${C.border}`, ...mono.style,
          gridTemplateColumns: '1fr 110px 110px 90px' }}>
        <span>Indicateur</span>
        <span className="text-right">2023</span>
        <span className="text-right">2024</span>
        <span className="text-right">Variation</span>
      </div>
      {DATA.consolidated.rows.map(row => (
        <div key={row.label}
          className={`grid py-2.5 hover:bg-[#0f1929] transition-colors border-b ${row.indent ? 'pl-10 pr-4' : 'px-4'}`}
          style={{ borderColor: C.border, gridTemplateColumns: '1fr 110px 110px 90px', ...mono.style }}>
          <span className="text-[11px] font-bold" style={{ color: row.highlight ? C.gold : C.white }}>
            {row.label}
          </span>
          <span className="text-[11px] tabular-nums text-right font-bold"
            style={{ color: row.v23 < 0 ? C.red : C.white }}>
            {fmtMMAD(row.v23)}
          </span>
          <span className="text-[11px] tabular-nums text-right font-bold"
            style={{ color: row.v24 < 0 ? C.red : row.highlight ? C.gold : C.green }}>
            {fmtMMAD(row.v24)}
          </span>
          <span className="text-[10px] tabular-nums text-right font-black"
            style={{ color: varColor(row.varPct, row.special) }}>
            {row.special === 'retournement' ? '↑ Retournement' : row.varPct != null ? fmtPct(row.varPct) : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── CA bar chart 2023-2024 ────────────────────────────────────────────────────
function CaBarChart() {
  const data = [
    { an: '2023', 'M2M SA': 49.0, 'NAPS': 30.0 },
    { an: '2024', 'M2M SA': 56.0, 'NAPS': 46.0 },
  ];
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ CA CONSOLIDÉ — M2M SA vs NAPS (MMAD)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="an" tick={{ fill: C.muted, fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}`} domain={[0, 120]} />
          <Tooltip content={<ChartTip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Roboto Mono', color: C.muted }} />
          <Bar dataKey="M2M SA" fill={C.navy} radius={[2, 2, 0, 0]} />
          <Bar dataKey="NAPS" fill={C.gold} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── CA consolidé donut 2024 ────────────────────────────────────────────────────
function CaDonut() {
  const data = [
    { name: 'M2M Group SA', value: 56.0, color: C.navy },
    { name: 'NAPS (60,26 %)', value: 46.0, color: C.gold },
  ];
  return (
    <div className="p-4 flex flex-col" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ STRUCTURE CA CONSOLIDÉ 2024 — 102 MMAD
      </p>
      <div className="flex items-center gap-4 justify-center flex-1">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
              {data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
              formatter={(v: number) => [`${v.toFixed(1)} MMAD`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <div className="flex flex-col" style={mono.style}>
                <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted }}>{d.name}</span>
                <span className="text-[11px] font-black tabular-nums" style={{ color: d.color }}>
                  {d.value.toFixed(1)} MMAD ({((d.value / 102) * 100).toFixed(0)} %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RN retournement chart ──────────────────────────────────────────────────────
function RnChart() {
  const data = [
    { an: '2023 (Social)', rn: -3.4 },
    { an: '2024 (Social)', rn: 5.0 },
    { an: '2023 (Consolidé)', rn: -5.0 },
    { an: '2024 (Consolidé)', rn: 3.5 },
  ];
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ RÉSULTAT NET — RETOURNEMENT 2023→2024 (MMAD)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="an" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}`} domain={[-8, 8]} />
          <ReferenceLine y={0} stroke={C.muted} strokeDasharray="3 3" />
          <Tooltip content={<ChartTip />} />
          <Bar dataKey="rn" name="Résultat Net" radius={[2, 2, 0, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.rn >= 0 ? C.green : C.red} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Projections CA + FCF chart ─────────────────────────────────────────────────
function ProjectionsChart() {
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ PROJECTIONS CA & FCF 2025–2029 (MMAD)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={DATA.projections} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}`} domain={[0, 120]} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }}
            axisLine={false} tickLine={false} tickFormatter={v => `${v}`} domain={[0, 30]} />
          <Tooltip content={<ChartTip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Roboto Mono', color: C.muted }} />
          <Bar yAxisId="left" dataKey="ca" name="CA" fill={C.navy} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="left" dataKey="rn" name="RN estimé" fill={C.teal} radius={[2, 2, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="fcf" name="FCF" stroke={C.gold} strokeWidth={2}
            dot={{ fill: C.gold, r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Marge EBIT chart ──────────────────────────────────────────────────────────
function MargeEbitChart() {
  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ MARGE EBIT PROJETÉE 2025–2029 (%)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={DATA.projections} barCategoryGap="40%">
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} domain={[0, 20]} />
          <Tooltip
            contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
            formatter={(v: number) => [`${v.toFixed(1)} %`, 'Marge EBIT']}
          />
          <Bar dataKey="margeEbit" name="Marge EBIT %" radius={[2, 2, 0, 0]}>
            {DATA.projections.map((_, i) => (
              <Cell key={i} fill={`hsl(${170 + i * 10}, 70%, 45%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Projections table ─────────────────────────────────────────────────────────
function ProjectionsTable() {
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Année', 'CA (MMAD)', 'Croissance', 'EBIT (MMAD)', 'Marge EBIT', 'FCF (MMAD)', 'RN Estimé'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest whitespace-nowrap"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.projections.map((r, i) => (
              <tr key={r.year} className="hover:bg-[#0f1929] transition-colors"
                style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : `${C.border}22` }}>
                <td className="px-3 py-2.5 font-black" style={{ color: C.cyan }}>{r.year}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.white }}>{r.ca.toFixed(1)}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.green }}>+{r.growth} %</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.white }}>{r.ebit.toFixed(1)}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.teal }}>{r.margeEbit.toFixed(1)} %</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.gold }}>{r.fcf.toFixed(1)}</td>
                <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: C.green }}>+{r.rn.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Football field chart ──────────────────────────────────────────────────────
function FootballField() {
  // Sort by perAction ascending for the chart
  const sorted = [...DATA.valuation].sort((a, b) => a.perAction - b.perAction);

  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: C.orange, ...mono.style }}>
        ■ FOOTBALL FIELD — VALORISATION PAR MÉTHODE (MAD/ACTION)
      </p>
      <div className="space-y-2.5">
        {sorted.map(m => {
          const maxVal = 900;
          const pct = Math.min(100, (m.perAction / maxVal) * 100);
          const coursePct = (COURS_ACTUEL / maxVal) * 100;
          const isActuel = m.methode.includes('boursier');
          return (
            <div key={m.methode} className="flex items-center gap-3" style={mono.style}>
              <div className="text-[9px] uppercase tracking-wide w-44 text-right flex-shrink-0" style={{ color: isActuel ? C.orange : C.muted }}>
                {m.methode}
              </div>
              <div className="flex-1 relative h-5">
                {/* Background track */}
                <div className="absolute inset-0 rounded-sm" style={{ background: `${C.border}` }} />
                {/* Value bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-sm flex items-center justify-end pr-1"
                  style={{ width: `${pct}%`, background: isActuel ? `${C.orange}44` : `${m.color}55` }}
                />
                {/* Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{ left: `${pct}%`, background: isActuel ? C.orange : m.color }}
                />
                {/* Cours actuel reference line */}
                <div
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${coursePct}%`, background: `${C.orange}88`, zIndex: 10 }}
                />
              </div>
              <div className="text-[10px] font-black tabular-nums w-20 text-right flex-shrink-0"
                style={{ color: isActuel ? C.orange : m.color }}>
                {fmtMAD(m.perAction)}
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: C.border, ...mono.style }}>
          <div className="w-44 text-right flex-shrink-0" />
          <div className="flex-1 relative">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: C.orange }}>
              ↑ Cours actuel: {COURS_ACTUEL} MAD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Valuation table ────────────────────────────────────────────────────────────
function ValuationTable() {
  const sorted = [...DATA.valuation].sort((a, b) => a.perAction - b.perAction);
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Méthode', 'Valeur CP (MMAD)', 'MAD / Action', 'Poids'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const isActuel = r.methode.includes('boursier');
              return (
                <tr key={r.methode} className="hover:bg-[#0f1929] transition-colors"
                  style={{ borderBottom: `1px solid ${C.border}`, background: isActuel ? `${C.orange}08` : 'transparent' }}>
                  <td className="px-3 py-2.5 font-bold" style={{ color: isActuel ? C.orange : C.white }}>
                    {r.methode}{isActuel ? ' ★' : ''}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: C.muted }}>
                    {r.mmad.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums font-black" style={{ color: r.color }}>
                    {r.perAction.toFixed(1)} MAD
                  </td>
                  <td className="px-3 py-2.5" style={{ color: C.muted }}>{r.poids}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Scenarios table ────────────────────────────────────────────────────────────
function ScenariosTable() {
  const colors: Record<string, string> = {
    'Pessimiste': C.red,
    'Central (Base)': C.gold,
    'Optimiste': C.green,
  };
  return (
    <div style={{ background: C.panel }}>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]" style={mono.style}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.panel2 }}>
              {['Scénario', 'Fourchette (MAD/action)', 'Conditions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-black uppercase tracking-widest"
                  style={{ color: C.orange }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.scenarios.map(r => (
              <tr key={r.scenario} className="hover:bg-[#0f1929] transition-colors"
                style={{ borderBottom: `1px solid ${C.border}` }}>
                <td className="px-3 py-2.5 font-black" style={{ color: colors[r.scenario] ?? C.white }}>{r.scenario}</td>
                <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: colors[r.scenario] ?? C.white }}>
                  {r.min} – {r.max} MAD
                </td>
                <td className="px-3 py-2.5 text-[9px]" style={{ color: C.muted }}>{r.conditions}</td>
              </tr>
            ))}
            <tr style={{ borderTop: `1px solid ${C.orange}44`, background: `${C.orange}08` }}>
              <td className="px-3 py-2.5 font-black" style={{ color: C.orange }}>Cours actuel</td>
              <td className="px-3 py-2.5 tabular-nums font-black" style={{ color: C.orange }}>~{COURS_ACTUEL} MAD</td>
              <td className="px-3 py-2.5 text-[9px]" style={{ color: C.muted }}>
                Valorisation marché reflétant scénario intermédiaire/optimiste
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── WACC table ────────────────────────────────────────────────────────────────
function WaccTable() {
  const rows = [
    { label: 'Taux sans risque (Rf)', value: `${DATA.wacc.rf.toFixed(1)} %`, sub: 'BDT 10 ans Maroc', color: C.white },
    { label: 'Prime de risque marché (Rm – Rf)', value: `${DATA.wacc.prime.toFixed(1)} %`, sub: 'Damodaran Emerging Markets', color: C.white },
    { label: 'Bêta sectoriel désendetté (β)', value: `${DATA.wacc.beta.toFixed(2)}`, sub: 'Software — Damodaran | D/E = 0', color: C.white },
    { label: 'Coût des fonds propres (Ke)', value: `${DATA.wacc.ke.toFixed(1)} %`, sub: 'Ke = Rf + β × (Rm – Rf)', color: C.cyan },
    { label: 'Dette financière', value: '0 %', sub: 'Aucune dette → WACC = Ke', color: C.muted },
    { label: 'WACC final', value: `${DATA.wacc.wacc.toFixed(1)} %`, sub: 'Taux d\'actualisation DCF', color: C.orange },
    { label: 'Taux croissance perpétuelle (g)', value: `${DATA.wacc.g.toFixed(1)} %`, sub: 'Croissance nominale LT PIB Maroc', color: C.gold },
  ];

  return (
    <div style={{ background: C.panel }}>
      <div className="divide-y" style={{ borderColor: C.border }}>
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3 hover:bg-[#0f1929] transition-colors"
            style={mono.style}>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold" style={{ color: C.white }}>{r.label}</span>
              <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted }}>{r.sub}</span>
            </div>
            <span className="text-base font-black tabular-nums ml-4 flex-shrink-0" style={{ color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bilan summary ─────────────────────────────────────────────────────────────
function BilanSummary() {
  const b = DATA.bilan;
  const items = [
    { label: 'Capital social', value: `${b.capitalSocial.toFixed(3)} MMAD`, color: C.white },
    { label: 'Réserves accumulées', value: `~${b.reserves.toFixed(0)} MMAD`, color: C.white },
    { label: 'Report à nouveau', value: `${b.reportNouveau.toFixed(3)} MMAD`, color: C.red },
    { label: 'Résultat net 2024', value: `+${b.rnNet2024.toFixed(1)} MMAD`, color: C.green },
    { label: 'ANC — Total Capitaux Propres', value: `${b.anc.toFixed(1)} MMAD`, color: C.cyan, bold: true },
    { label: 'Nombre d\'actions', value: `${b.actions.toLocaleString('fr-MA')}`, color: C.white },
    { label: 'ANC par action', value: `${b.ancPerAction.toFixed(1)} MAD`, color: C.gold, bold: true },
    { label: 'ANCC par action (corrigé)', value: `${b.anccPerAction.toFixed(1)} MAD`, color: C.teal },
    { label: 'Dettes financières', value: '0 (aucune)', color: C.green },
    { label: 'P/B actuel', value: `${(COURS_ACTUEL / b.ancPerAction).toFixed(2)}x`, color: C.orange },
  ];

  return (
    <div className="divide-y" style={{ background: C.panel, borderColor: C.border }}>
      {items.map(it => (
        <div key={it.label} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#0f1929] transition-colors"
          style={mono.style}>
          <span className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>{it.label}</span>
          <span className={`text-[11px] tabular-nums font-${it.bold ? 'black' : 'bold'}`} style={{ color: it.color }}>
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Collapsible wrapper ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: C.border }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#0f1929] transition-colors"
        style={{ background: C.panel2 }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
          ■ {title}
        </span>
        <span className="text-[10px]" style={{ color: C.muted, ...mono.style }}>
          {open ? '▲ Réduire' : '▼ Développer'}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function M2MDonneesPanel() {
  return (
    <div className="flex flex-col" style={{ background: C.bg, ...mono.style }}>

      {/* Company header */}
      <div className="px-5 py-3 border-b flex flex-wrap items-center gap-3"
        style={{ borderColor: C.border, background: C.panel }}>
        <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.cyan, ...sans.style }}>
          M2M GROUP
        </span>
        <span className="text-xs font-bold px-2 py-0.5 border" style={{ color: C.orange, borderColor: `${C.orange}55` }}>
          M2M
        </span>
        <span className="text-[10px] font-bold border px-2 py-0.5" style={{ color: C.muted, borderColor: C.border }}>
          MA0000011678
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
          Fintech · Paiement Électronique · BVC Casablanca
        </span>
        <span className="ml-auto text-[10px] font-bold" style={{ color: C.gold }}>
          Capital: 64,78 MMAD | 647 777 actions
        </span>
      </div>

      <div className="space-y-px" style={{ background: C.border }}>

        {/* KPI Cards */}
        <KpiCards />

        {/* Résultats Financiers */}
        <Section title="Résultats Financiers 2023–2024 — Compte de Résultat Social">
          <IncomeTable />
        </Section>

        <Section title="Comptes Consolidés 2023–2024">
          <ConsolidatedTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: C.border }}>
            <CaBarChart />
            <CaDonut />
          </div>
          <RnChart />
        </Section>

        <Section title="Structure Bilancielle & Capitaux Propres">
          <BilanSummary />
        </Section>

        <Section title="Projections Financières 2025–2029">
          <ProjectionsTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px mt-px" style={{ background: C.border }}>
            <ProjectionsChart />
            <MargeEbitChart />
          </div>
        </Section>

        <Section title="Valorisation — Synthèse des Méthodes">
          <FootballField />
          <div className="border-t" style={{ borderColor: C.border }}>
            <ValuationTable />
          </div>
        </Section>

        <Section title="Scénarios de Valorisation">
          <ScenariosTable />
        </Section>

        <Section title="Paramètres DCF & WACC">
          <WaccTable />
        </Section>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 border-t"
        style={{ borderColor: C.border, background: C.panel2 }}>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>
          Source : Rapport d&apos;évaluation M2M Group — ENCG Meknès S8, Avril 2026 | À fins informationnels uniquement
        </span>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: C.gold, ...mono.style }}>
          ★ DONNÉES AMMC — M2M GROUP | BVC CASABLANCA
        </span>
      </div>

    </div>
  );
}
