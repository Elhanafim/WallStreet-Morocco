'use client';

/**
 * AmmcDonneesPanel — 9-bloc financial dashboard for BVC-listed companies.
 * Renders inside the DONNÉES tab of ValuesFinancials.
 * All monetary data expected in MDH (millions of MAD).
 */

import { useState } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { AmmcCompanyData } from '@/types/ammc';

const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#040914',
  panel:    '#0B101E',
  panel2:   '#0A0F1D',
  border:   '#1E293B',
  orange:   '#FF9800',
  green:    '#00E676',
  red:      '#FF1744',
  yellow:   '#FFD700',
  cyan:     '#00E5FF',
  muted:    '#8B95A1',
  white:    '#FFFFFF',
  // Chart bars
  blue1:    '#1E3A5F',
  gold:     '#C9A84C',
  teal:     '#0E9F8E',
};

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtMdh(v: number | null | undefined, decimals = 1): string {
  if (v == null) return '—';
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(decimals)} Md MDH`;
  return `${v.toFixed(decimals)} MDH`;
}
function fmtPct(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}
function fmtX(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v.toFixed(2)}x`;
}
function fmtDh(v: number | null | undefined, unit = 'DH'): string {
  if (v == null) return '—';
  return `${v.toFixed(2)} ${unit}`;
}
function pctColor(v: number | null): string {
  if (v == null) return C.muted;
  return v > 0 ? C.green : v < 0 ? C.red : C.muted;
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange }}>
        ■ {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
  );
}

function NoDataBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-6 border" style={{ borderColor: C.border }}>
      <span className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>
        {label} — données non disponibles
      </span>
    </div>
  );
}

// ── Tooltip custom ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border px-3 py-2" style={{ background: C.panel, borderColor: C.border, ...mono.style }}>
      <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.orange }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-[11px]" style={{ color: p.color }}>
          {p.name}: {fmtMdh(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── BLOC 1: KPI Cards ─────────────────────────────────────────────────────────
function KpiCards({ d }: { d: AmmcCompanyData }) {
  const cards = [
    {
      label: "Chiffre d'Affaires",
      value: fmtMdh(d.revenue),
      growth: d.revenueGrowthPct,
      sub: d.revenueN1 ? `N-1: ${fmtMdh(d.revenueN1)}` : undefined,
    },
    {
      label: 'EBITDA',
      value: fmtMdh(d.ebitda),
      growth: d.ebitdaGrowthPct,
      sub: d.margeEbitdaPct ? `Marge: ${d.margeEbitdaPct.toFixed(1)}%` : undefined,
    },
    {
      label: 'RNPG',
      value: fmtMdh(d.rnpg),
      growth: d.rnpgGrowthPct,
      sub: d.margeNettePct ? `Marge nette: ${d.margeNettePct.toFixed(1)}%` : undefined,
    },
    {
      label: 'Dividende / Action',
      value: d.dividendeParAction != null ? fmtDh(d.dividendeParAction) : '—',
      growth: null,
      sub: d.payoutRatioPct ? `Payout: ${d.payoutRatioPct.toFixed(1)}%` : undefined,
    },
    {
      label: 'Free Cash Flow',
      value: fmtMdh(d.freeCashFlow),
      growth: null,
      sub: d.cfo ? `CFO: ${fmtMdh(d.cfo)}` : undefined,
      valueColor: d.freeCashFlow != null ? (d.freeCashFlow >= 0 ? C.green : C.red) : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px" style={{ background: C.border }}>
      {cards.map(card => (
        <div key={card.label} className="flex flex-col gap-1.5 p-4" style={{ background: C.panel, borderLeft: `2px solid ${C.orange}` }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>
            {card.label}
          </span>
          <span className="text-lg font-black tabular-nums leading-tight" style={{ color: card.valueColor ?? C.white, ...mono.style }}>
            {card.value}
          </span>
          {card.growth != null && (
            <span className="text-[11px] font-bold tabular-nums" style={{ color: pctColor(card.growth), ...mono.style }}>
              {card.growth >= 0 ? '▲ +' : '▼ '}{Math.abs(card.growth).toFixed(1)}%
            </span>
          )}
          {card.sub && (
            <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>
              {card.sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── BLOC 2: 3-Year Trend ──────────────────────────────────────────────────────
function TrendCharts({ d }: { d: AmmcCompanyData }) {
  const hasRevHistory = d.historical.revenue.some(p => p.value != null);
  const hasRnpgHistory = d.historical.rnpg.some(p => p.value != null);
  if (!hasRevHistory && !hasRnpgHistory) return null;

  // Bar chart data: revenue / ebitda / rnpg
  const barData = d.historical.revenue.map((rev, i) => ({
    year: rev.year,
    "Chiffre d'affaires": rev.value,
    "EBITDA": d.historical.ebitda[i]?.value ?? null,
    "RNPG": d.historical.rnpg[i]?.value ?? null,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: C.border }}>
      {/* Bar chart */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
          ■ RÉSULTATS — ÉVOLUTION 2 ANS (MDH)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} stroke={C.border} />
            <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}Md` : `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'Roboto Mono', color: C.muted }} />
            <Bar dataKey="Chiffre d'affaires" fill={C.blue1} radius={[2, 2, 0, 0]} />
            <Bar dataKey="EBITDA" fill={C.gold} radius={[2, 2, 0, 0]} />
            <Bar dataKey="RNPG" fill={C.teal} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Margin line chart */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
          ■ MARGES — ÉVOLUTION (%)
        </p>
        {(() => {
          const marginData = d.historical.revenue.map((rev, i) => {
            const ca = rev.value;
            const rnpg = d.historical.rnpg[i]?.value;
            const ebitda = d.historical.ebitda[i]?.value;
            return {
              year: rev.year,
              'Marge nette %': ca && rnpg ? parseFloat(((rnpg / ca) * 100).toFixed(1)) : null,
              'Marge EBITDA %': ca && ebitda ? parseFloat(((ebitda / ca) * 100).toFixed(1)) : null,
            };
          });
          return (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={marginData}>
                <CartesianGrid vertical={false} stroke={C.border} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'Roboto Mono', color: C.muted }} />
                <Line type="monotone" dataKey="Marge nette %" stroke={C.teal} strokeWidth={2} dot={{ fill: C.teal, r: 3 }} />
                <Line type="monotone" dataKey="Marge EBITDA %" stroke={C.gold} strokeWidth={2} dot={{ fill: C.gold, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          );
        })()}
      </div>
    </div>
  );
}

// ── BLOC 3: Bilan snapshot ────────────────────────────────────────────────────
function BilanSnapshot({ d }: { d: AmmcCompanyData }) {
  if (!d.totalActif && !d.capitauxPropres) return null;

  const totalPassif = d.totalPassif ?? d.totalActif;
  const cp = d.capitauxPropresGroupe ?? d.capitauxPropres ?? 0;
  const dlt = d.dettesFinancieresLT ?? 0;
  const dct = d.dettesFinancieresCT ?? 0;
  const other = Math.max(0, (totalPassif ?? 0) - cp - dlt - dct);

  const donutData = [
    { name: 'Capitaux propres', value: cp > 0 ? cp : 0, color: C.teal },
    { name: 'Dettes LT', value: dlt, color: C.gold },
    { name: 'Dettes CT', value: dct, color: C.red },
    { name: 'Autres passifs', value: other, color: '#334155' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: C.border }}>
      {/* Donut: passif structure */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
          ■ STRUCTURE DU PASSIF
        </p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
                formatter={(v: number) => fmtMdh(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5">
            {donutData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>{item.name}</span>
                <span className="text-[9px] font-bold tabular-nums ml-auto" style={{ color: C.white, ...mono.style }}>{fmtMdh(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actif breakdown */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
          ■ BILAN — INDICATEURS CLÉS
        </p>
        <div className="space-y-2" style={mono.style}>
          {[
            { label: 'Total Actif',       value: fmtMdh(d.totalActif), color: C.white },
            { label: 'Capitaux Propres',  value: fmtMdh(d.capitauxPropresGroupe ?? d.capitauxPropres), color: C.teal },
            { label: 'Dettes LT',         value: fmtMdh(d.dettesFinancieresLT), color: C.gold },
            { label: 'Dettes CT',         value: fmtMdh(d.dettesFinancieresCT), color: C.red },
            { label: 'Trésorerie Actif',  value: fmtMdh(d.tresorerieActif), color: C.green },
            { label: 'Dette Nette',       value: fmtMdh(d.detteNette), color: d.detteNette != null ? (d.detteNette > 0 ? C.red : C.green) : C.muted },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: C.border }}>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>{row.label}</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BLOC 4: Cash Flow ─────────────────────────────────────────────────────────
function CashFlowBloc({ d }: { d: AmmcCompanyData }) {
  if (!d.cfo && !d.freeCashFlow) return null;

  const cfData = [
    { name: 'CFO', value: d.cfo, color: d.cfo != null && d.cfo >= 0 ? C.green : C.red },
    { name: 'CAPEX', value: d.capex ? -d.capex : null, color: C.red },
    { name: 'CFF', value: d.cff, color: d.cff != null && d.cff >= 0 ? C.teal : C.gold },
    { name: 'Dividendes', value: d.dividendesPaies ? -d.dividendesPaies : null, color: C.gold },
    { name: 'FCF', value: d.freeCashFlow, color: d.freeCashFlow != null && d.freeCashFlow >= 0 ? C.cyan : C.red },
  ].filter(c => c.value != null);

  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ FLUX DE TRÉSORERIE (MDH)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px" style={{ background: C.border }}>
        {cfData.map(cf => (
          <div key={cf.name} className="flex flex-col gap-1 p-3" style={{ background: C.panel2 }}>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>{cf.name}</span>
            <span className="text-base font-black tabular-nums" style={{ color: cf.color, ...mono.style }}>
              {fmtMdh(cf.value)}
            </span>
            <div className="h-1 rounded-sm mt-1" style={{
              background: cf.value != null && cf.value >= 0 ? C.green : C.red,
              width: cf.value != null ? `${Math.min(100, Math.abs(cf.value) / 50 * 100)}%` : '0%',
              minWidth: '4px',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BLOC 5: Ratios table ──────────────────────────────────────────────────────
type Signal = '🟢' | '🟡' | '🔴' | '⚪';

interface RatioConfig {
  label: string;
  value: number | null;
  format: (v: number) => string;
  signal: (v: number) => Signal;
  interpretation: (v: number) => string;
}

function getSignal(v: number | null, fn: (v: number) => Signal): Signal {
  return v != null ? fn(v) : '⚪';
}

function RatiosTable({ d }: { d: AmmcCompanyData }) {
  const ratios: RatioConfig[] = [
    {
      label: 'Marge EBITDA',
      value: d.margeEbitdaPct,
      format: (v: number) => `${v.toFixed(1)}%`,
      signal: (v: number) => v > 30 ? '🟢' : v > 15 ? '🟡' : '🔴',
      interpretation: (v: number) => v > 30 ? 'Excellente' : v > 15 ? 'Correcte' : 'Faible',
    },
    {
      label: 'Marge nette (RNPG)',
      value: d.margeNettePct,
      format: (v: number) => `${v.toFixed(1)}%`,
      signal: (v: number) => v > 15 ? '🟢' : v > 5 ? '🟡' : '🔴',
      interpretation: (v: number) => v > 15 ? 'Très bonne' : v > 5 ? 'Correcte' : 'Faible',
    },
    {
      label: 'ROE',
      value: d.roe,
      format: (v: number) => `${v.toFixed(1)}%`,
      signal: (v: number) => (v >= 10 && v <= 40) ? '🟢' : (v > 0 && v < 10) ? '🔴' : '🟡',
      interpretation: (v: number) => (v >= 10 && v <= 40) ? 'Saine' : v > 40 ? 'Élevé — vérifier levier' : 'Faible',
    },
    {
      label: 'Dette Nette / EBITDA',
      value: d.detteNetteEbitda,
      format: (v: number) => `${v.toFixed(2)}x`,
      signal: (v: number) => v < 2 ? '🟢' : v < 4 ? '🟡' : '🔴',
      interpretation: (v: number) => v < 2 ? 'Saine' : v < 4 ? 'Modérée' : 'Élevée',
    },
    {
      label: 'Free Cash Flow',
      value: d.freeCashFlow,
      format: (v: number) => fmtMdh(v),
      signal: (v: number) => v > 0 ? '🟢' : '🔴',
      interpretation: (v: number) => v > 0 ? 'Positif' : 'Négatif',
    },
    {
      label: 'Payout Ratio',
      value: d.payoutRatioPct,
      format: (v: number) => `${v.toFixed(1)}%`,
      signal: (v: number) => (v >= 40 && v <= 70) ? '🟢' : v > 70 ? '🟡' : '🟡',
      interpretation: (v: number) => (v >= 40 && v <= 70) ? 'Équilibré' : v > 80 ? 'Généreux' : 'Bas',
    },
    {
      label: 'CAPEX / CA',
      value: d.capexIntensityPct,
      format: (v: number) => `${v.toFixed(1)}%`,
      signal: (v: number) => v < 10 ? '🟢' : v < 20 ? '🟡' : '🔴',
      interpretation: (v: number) => v < 10 ? 'Maîtrisé' : v < 20 ? 'Modéré' : 'Intensif',
    },
    {
      label: 'Ratio Endettement',
      value: d.ratioEndettement,
      format: (v: number) => `${v.toFixed(2)}x`,
      signal: (v: number) => v < 1 ? '🟢' : v < 2 ? '🟡' : '🔴',
      interpretation: (v: number) => v < 1 ? 'Faible' : v < 2 ? 'Modéré' : 'Élevé',
    },
  ].filter(r => r.value != null);

  if (ratios.length === 0) return null;

  return (
    <div style={{ background: C.panel }}>
      <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, background: C.panel2 }}>
        <div className="grid text-[9px] font-bold uppercase tracking-widest" style={{
          color: C.orange, ...mono.style,
          gridTemplateColumns: '1fr 100px 160px 30px',
          gap: '8px',
        }}>
          <span>Ratio</span>
          <span className="text-right">Valeur</span>
          <span>Interprétation</span>
          <span>Signal</span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: C.border }}>
        {ratios.map(r => {
          const sig = getSignal(r.value, r.signal);
          const interp = r.value != null ? r.interpretation(r.value) : '';
          const sigColor = sig === '🟢' ? C.green : sig === '🔴' ? C.red : C.yellow;
          return (
            <div key={r.label} className="px-4 py-3 grid hover:bg-[#0f1929] transition-colors" style={{
              gridTemplateColumns: '1fr 100px 160px 30px',
              gap: '8px',
              ...mono.style,
            }}>
              <span className="text-[11px] font-bold" style={{ color: C.white }}>{r.label}</span>
              <span className="text-[11px] tabular-nums font-black text-right" style={{ color: C.white }}>
                {r.value != null ? r.format(r.value) : '—'}
              </span>
              <span className="text-[10px] font-bold" style={{ color: sigColor }}>{interp}</span>
              <span className="text-xs">{sig}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── BLOC 6: Income statement detail ──────────────────────────────────────────
function IncomeDetail({ d }: { d: AmmcCompanyData }) {
  const [open, setOpen] = useState(false);

  const rows: { label: string; v24: number | null; v23?: number | null; highlight?: boolean; indent?: boolean; color?: string }[] = [
    { label: "Chiffre d'affaires (CA)", v24: d.revenue, v23: d.revenueN1, highlight: true },
    { label: 'EBITDA', v24: d.ebitda, v23: d.ebitdaN1, highlight: true },
    { label: "Résultat d'exploitation (EBIT)", v24: d.ebit, indent: true },
    { label: 'Résultat financier', v24: d.resultatFinancier, indent: true,
      color: d.resultatFinancier != null ? (d.resultatFinancier >= 0 ? C.green : C.red) : undefined },
    { label: 'Résultat avant impôt', v24: d.resultatAvantImpot, highlight: true },
    { label: 'Résultat Net', v24: d.resultatNet, indent: true },
    { label: 'RNPG', v24: d.rnpg, v23: d.rnpgN1, highlight: true,
      color: d.rnpg != null ? (d.rnpg >= 0 ? C.green : C.red) : undefined },
    { label: 'BPA (EPS)', v24: d.eps },
    { label: 'Dividende / Action', v24: d.dividendeParAction },
    { label: 'Charges Personnel', v24: d.chargesPersonnel, indent: true },
    { label: 'Dotations & Amortissements', v24: d.dotationsAmortissements, indent: true },
  ].filter(r => r.v24 != null);

  if (rows.length === 0) return null;

  return (
    <div style={{ background: C.panel }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#0f1929] transition-colors"
        style={{ ...mono.style }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange }}>
          ■ COMPTE DE RÉSULTAT DÉTAILLÉ
        </span>
        <span className="text-[10px]" style={{ color: C.muted }}>{open ? '▲' : '▼'} {open ? 'Réduire' : 'Développer'}</span>
      </button>

      {open && (
        <>
          <div className="grid px-4 py-2 border-t border-b text-[9px] font-bold uppercase tracking-widest"
            style={{ borderColor: C.border, background: C.panel2, color: C.orange, ...mono.style,
              gridTemplateColumns: '1fr 120px 120px 70px' }}>
            <span>Indicateur</span>
            <span className="text-right">2024 (MDH)</span>
            <span className="text-right">2023 (MDH)</span>
            <span className="text-right">Var. %</span>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {rows.map(row => {
              const varPct = row.v23 && row.v23 !== 0
                ? ((row.v24! - row.v23) / Math.abs(row.v23)) * 100
                : null;
              return (
                <div key={row.label} className={`grid px-4 py-2.5 hover:bg-[#0f1929] transition-colors ${row.indent ? 'pl-8' : ''}`}
                  style={{ gridTemplateColumns: '1fr 120px 120px 70px', ...mono.style }}>
                  <span className={`text-[11px] ${row.highlight ? 'font-bold uppercase tracking-wide' : ''}`}
                    style={{ color: row.highlight ? C.orange : C.muted }}>
                    {row.label}
                  </span>
                  <span className="text-[11px] tabular-nums text-right font-bold" style={{ color: row.color ?? C.white }}>
                    {row.label === 'BPA (EPS)' || row.label === 'Dividende / Action'
                      ? fmtDh(row.v24)
                      : fmtMdh(row.v24)}
                  </span>
                  <span className="text-[11px] tabular-nums text-right" style={{ color: C.muted }}>
                    {row.v23 != null ? fmtMdh(row.v23) : '—'}
                  </span>
                  <span className="text-[10px] tabular-nums text-right font-bold" style={{ color: pctColor(varPct) }}>
                    {varPct != null ? `${varPct >= 0 ? '+' : ''}${varPct.toFixed(1)}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── BLOC 7: ESG ───────────────────────────────────────────────────────────────
function EsgBloc({ d }: { d: AmmcCompanyData }) {
  const { esg } = d;
  const hasData = esg.effectif != null || esg.femmesPct != null || esg.recrutements != null;
  if (!hasData) return null;

  const genderData = esg.femmesPct != null ? [
    { name: 'Femmes', value: esg.femmesPct, color: C.teal },
    { name: 'Hommes', value: esg.hommesPct ?? 100 - esg.femmesPct, color: C.blue1 },
  ] : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: C.border }}>
      {/* Gender */}
      {genderData.length > 0 && (
        <div className="p-4 flex flex-col items-center gap-2" style={{ background: C.panel }}>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>Genre</p>
          <div className="flex items-center gap-4">
            <PieChart width={80} height={80}>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
                {genderData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-1">
              {genderData.map(g => (
                <div key={g.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: g.color }} />
                  <span className="text-[9px]" style={{ color: C.muted, ...mono.style }}>{g.name}</span>
                  <span className="text-[9px] font-bold" style={{ color: C.white, ...mono.style }}>{g.value?.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Effectif metrics */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: C.orange, ...mono.style }}>Social</p>
        <div className="space-y-1.5" style={mono.style}>
          {[
            { label: 'Effectif', value: esg.effectif?.toLocaleString('fr-MA') },
            { label: 'Recrutements', value: esg.recrutements?.toLocaleString('fr-MA') },
            { label: 'Démissions', value: esg.demissions?.toLocaleString('fr-MA') },
            { label: 'Accidents travail', value: esg.accidentsTravail?.toString() },
          ].filter(r => r.value != null).map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-[9px] uppercase" style={{ color: C.muted }}>{row.label}</span>
              <span className="text-[9px] font-bold" style={{ color: C.white }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental */}
      <div className="p-4" style={{ background: C.panel }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: C.orange, ...mono.style }}>Environnement / Employé</p>
        <div className="space-y-1.5" style={mono.style}>
          {[
            { label: 'Papier (kg)', value: esg.papierParEmployeKg?.toFixed(1) },
            { label: 'Énergie (kWh)', value: esg.energieParEmployeKwh?.toFixed(0) },
            { label: 'Eau (m³)', value: esg.eauParEmployeM3?.toFixed(1) },
          ].filter(r => r.value != null).map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-[9px] uppercase" style={{ color: C.muted }}>{row.label}</span>
              <span className="text-[9px] font-bold" style={{ color: C.white }}>{row.value}</span>
            </div>
          ))}
          {!esg.papierParEmployeKg && !esg.energieParEmployeKwh && (
            <span className="text-[9px]" style={{ color: C.muted }}>N/D dans ce rapport</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BLOC 8: Alertes investisseur ──────────────────────────────────────────────
interface Alert { type: 'success' | 'warning' | 'danger'; msg: string }

function buildAlerts(d: AmmcCompanyData): Alert[] {
  const alerts: Alert[] = [];

  // Positives
  if (d.revenueGrowthPct != null && d.revenueGrowthPct > 5)
    alerts.push({ type: 'success', msg: `CA en croissance de ${d.revenueGrowthPct.toFixed(1)}% — dynamique commerciale solide` });
  if (d.freeCashFlow != null && d.freeCashFlow > 0)
    alerts.push({ type: 'success', msg: `Free Cash Flow positif: ${fmtMdh(d.freeCashFlow)}` });
  if (d.detteNette != null && d.detteNette < 0)
    alerts.push({ type: 'success', msg: `Trésorerie nette positive: ${fmtMdh(Math.abs(d.detteNette))} MDH` });
  if (d.margeEbitdaPct != null && d.margeEbitdaPct > 30)
    alerts.push({ type: 'success', msg: `Marge EBITDA excellente: ${d.margeEbitdaPct.toFixed(1)}%` });
  if (d.dividendeParAction != null && d.dividendeParAction > 0)
    alerts.push({ type: 'success', msg: `Dividende distribué: ${fmtDh(d.dividendeParAction)} / action` });

  // Caution
  if (d.payoutRatioPct != null && d.payoutRatioPct > 80)
    alerts.push({ type: 'warning', msg: `Payout ratio élevé: ${d.payoutRatioPct.toFixed(1)}% — peu de bénéfice réinvesti` });
  if (d.roe != null && d.roe > 60)
    alerts.push({ type: 'warning', msg: `ROE très élevé (${d.roe.toFixed(1)}%) — vérifier le levier financier` });
  if (d.detteNetteEbitda != null && d.detteNetteEbitda > 3)
    alerts.push({ type: 'warning', msg: `Dette nette / EBITDA: ${d.detteNetteEbitda.toFixed(2)}x — endettement élevé` });
  if (d.revenueGrowthPct != null && d.revenueGrowthPct < -5)
    alerts.push({ type: 'warning', msg: `CA en recul de ${Math.abs(d.revenueGrowthPct).toFixed(1)}% — surveiller la tendance` });

  // Dangers
  if (d.freeCashFlow != null && d.freeCashFlow < 0)
    alerts.push({ type: 'danger', msg: `Free Cash Flow négatif: ${fmtMdh(d.freeCashFlow)} — consommation de cash` });
  if (d.rnpg != null && d.rnpg < 0)
    alerts.push({ type: 'danger', msg: `RNPG négatif: ${fmtMdh(d.rnpg)} — exercice déficitaire` });
  if (d.capitauxPropres != null && d.capitauxPropres < 0)
    alerts.push({ type: 'danger', msg: `Capitaux propres négatifs — fonds propres insuffisants` });

  return alerts;
}

function AlertsBloc({ d }: { d: AmmcCompanyData }) {
  const alerts = buildAlerts(d);
  if (alerts.length === 0) return null;

  const icon = { success: '✅', warning: '⚠️', danger: '🔴' };
  const color = { success: C.green, warning: C.yellow, danger: C.red };
  const bg    = { success: '#00e67608', warning: '#ffd70008', danger: '#ff174408' };

  return (
    <div className="p-4" style={{ background: C.panel }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: C.orange, ...mono.style }}>
        ■ ALERTES & SIGNAUX INVESTISSEUR
      </p>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2 border" style={{
            borderColor: `${color[a.type]}44`,
            background: bg[a.type],
          }}>
            <span className="text-xs flex-shrink-0 mt-0.5">{icon[a.type]}</span>
            <span className="text-[11px] font-bold leading-relaxed" style={{ color: color[a.type], ...mono.style }}>
              {a.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quality badge ─────────────────────────────────────────────────────────────
function QualityBadge({ d }: { d: AmmcCompanyData }) {
  const pct = d.extractionQuality.fieldsCoveredPct;
  const color = pct >= 70 ? C.green : pct >= 40 ? C.yellow : C.red;
  const bars = Math.round(pct / 10);
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: C.border, background: C.panel2 }}>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>
        Qualité extraction AMMC:
      </span>
      <span className="font-bold tabular-nums text-[9px]" style={{ color, ...mono.style }}>
        {'█'.repeat(bars)}{'░'.repeat(10 - bars)} {pct.toFixed(0)}%
      </span>
      {d.extractionQuality.warnings.length > 0 && (
        <span className="text-[9px]" style={{ color: C.yellow, ...mono.style }}>
          ⚠ {d.extractionQuality.warnings[0]}
        </span>
      )}
      <span className="ml-auto text-[9px] uppercase" style={{ color: C.muted, ...mono.style }}>
        Source: Rapport Annuel AMMC {d.annee}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  ammcData: AmmcCompanyData;
}

export default function AmmcDonneesPanel({ ammcData: d }: Props) {
  return (
    <div className="flex flex-col" style={{ background: C.bg, ...mono.style }}>

      {/* Company header */}
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: C.border, background: C.panel }}>
        <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.cyan, ...sans.style }}>
          {d.companyName}
        </span>
        <span className="text-xs font-bold px-2 py-0.5 border" style={{ color: C.orange, borderColor: `${C.orange}55` }}>
          {d.ticker}
        </span>
        {d.sector && (
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
            {d.sector}
          </span>
        )}
        <span className="ml-auto text-[10px] font-bold" style={{ color: C.muted }}>
          Exercice {d.annee}
        </span>
      </div>

      <div className="space-y-px" style={{ background: C.border }}>

        {/* BLOC 1: KPI Cards */}
        <KpiCards d={d} />

        {/* BLOC 2: Trend charts */}
        <TrendCharts d={d} />

        {/* BLOC 3: Bilan snapshot */}
        <BilanSnapshot d={d} />

        {/* BLOC 4: Cash flow */}
        <CashFlowBloc d={d} />

        {/* BLOC 5: Ratios table */}
        <div style={{ background: C.panel }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, background: C.panel2 }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
              ■ RATIOS & INDICATEURS FINANCIERS
            </p>
          </div>
          <RatiosTable d={d} />
        </div>

        {/* BLOC 6: Income detail (collapsible) */}
        <IncomeDetail d={d} />

        {/* BLOC 7: ESG */}
        {(d.esg.effectif != null || d.esg.femmesPct != null) && (
          <div style={{ background: C.panel }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: C.border, background: C.panel2 }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
                ■ TABLEAU DE BORD ESG
              </p>
            </div>
            <EsgBloc d={d} />
          </div>
        )}

        {/* BLOC 8: Alerts */}
        <AlertsBloc d={d} />

      </div>

      {/* Quality footer */}
      <QualityBadge d={d} />

    </div>
  );
}
