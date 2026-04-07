'use client';

import { useState, useEffect, useCallback } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import type { FinancialsData } from './financials.api';
import { fetchFinancials, fmtMAD, fmtPct, fmtPrice } from './financials.api';
import SummaryCards from './SummaryCards';
import IndicatorsTable from './IndicatorsTable';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const inter      = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_ORANGE = '#FF9800';
const BB_MUTED  = '#8B95A1';
const BB_RED    = '#FF1744';
const BB_CYAN   = '#00E5FF';
const BB_GREEN  = '#00E676';
const BB_BORDER = '#1E293B';
const BB_PANEL  = '#0B101E';
const BB_BG     = '#040914';
const BB_WHITE  = '#FFFFFF';
const BB_YELLOW = '#FFD700';

type FinTab = 'APERCU' | 'INCOME' | 'BALANCE' | 'CASHFLOW' | 'PROFIL';

const FIN_TABS: { id: FinTab; label: string }[] = [
  { id: 'APERCU',   label: 'APERÇU'             },
  { id: 'PROFIL',   label: 'PROFIL'             },
  { id: 'INCOME',   label: 'COMPTE DE RÉSULTAT' },
  { id: 'BALANCE',  label: 'BILAN'              },
  { id: 'CASHFLOW', label: 'FLUX DE TRÉSORERIE' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pctColor(v: number | null): string {
  if (v == null) return BB_MUTED;
  return v > 0 ? BB_GREEN : v < 0 ? BB_RED : BB_MUTED;
}

function fmtNum(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—';
  return v.toFixed(decimals);
}

function fmtPctVal(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

// ── 52-week range bar ─────────────────────────────────────────────────────────
function Week52Bar({ price, low, high }: { price: number | null; low: number | null; high: number | null }) {
  if (!price || !low || !high || high === low) return null;
  const pct = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
  return (
    <div style={robotoMono.style}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Plus bas 52s</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Plus haut 52s</span>
      </div>
      <div className="relative h-2 w-full rounded-none" style={{ background: BB_BORDER }}>
        <div className="absolute inset-y-0 left-0 rounded-none" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${BB_RED}, ${BB_GREEN})` }} />
        <div
          className="absolute top-1/2 w-2 h-4 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${pct}%`, background: BB_WHITE, boxShadow: `0 0 4px ${BB_ORANGE}` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] tabular-nums font-bold" style={{ color: BB_RED }}>{low.toFixed(2)}</span>
        <span className="text-[10px]" style={{ color: BB_MUTED }}>{pct.toFixed(0)}e centile</span>
        <span className="text-[11px] tabular-nums font-bold" style={{ color: BB_GREEN }}>{high.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ── Performance strip ─────────────────────────────────────────────────────────
function PerformanceStrip({ d }: { d: FinancialsData }) {
  const periods = [
    { label: 'Semaine',  value: d.perfW   },
    { label: '1 Mois',   value: d.perf1M  },
    { label: '3 Mois',   value: d.perf3M  },
    { label: '6 Mois',   value: d.perf6M  },
    { label: 'YTD',      value: d.perfYTD },
    { label: '1 An',     value: d.perfY   },
  ].filter(p => p.value != null);

  if (periods.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ PERFORMANCE</span>
        <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
      </div>
      <div className={`grid gap-px bg-[#1E293B]`} style={{ gridTemplateColumns: `repeat(${periods.length}, 1fr)` }}>
        {periods.map(p => (
          <div key={p.label} className="flex flex-col items-center gap-1 p-3 bg-[#0B101E]" style={{ borderLeft: `2px solid ${pctColor(p.value)}33` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: BB_MUTED }}>{p.label}</span>
            <span className="text-base font-black tabular-nums" style={{ color: pctColor(p.value), ...robotoMono.style }}>
              {fmtPctVal(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Technical signals ─────────────────────────────────────────────────────────
function TechnicalSignals({ d }: { d: FinancialsData }) {
  if (d.rsi == null && d.adx == null && d.recommendAll == null) return null;

  const rec = d.recommendAll;
  const recLabel = rec == null ? null
    : rec > 0.5  ? 'FORT ACHAT'
    : rec > 0.1  ? 'ACHETER'
    : rec < -0.5 ? 'FORTE VENTE'
    : rec < -0.1 ? 'VENDRE'
    : 'NEUTRE';
  const recColor = recLabel == null ? BB_MUTED
    : recLabel.includes('ACHAT') ? BB_GREEN
    : recLabel.includes('VENTE') ? BB_RED
    : BB_MUTED;

  const rsiColor = d.rsi == null ? BB_MUTED
    : d.rsi > 70 ? BB_RED
    : d.rsi < 30 ? BB_GREEN
    : BB_WHITE;

  const adxStrength = d.adx == null ? null
    : d.adx > 50 ? 'TRÈS FORT'
    : d.adx > 25 ? 'FORT'
    : 'FAIBLE';

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ SIGNAUX TECHNIQUES</span>
        <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1E293B]">
        {recLabel != null && (
          <div className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${recColor}55` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Signal global</span>
            <span className="text-sm font-black uppercase tracking-wide" style={{ color: recColor }}>{recLabel}</span>
            <span className="text-[10px]" style={{ color: BB_MUTED }}>{rec != null ? rec.toFixed(3) : ''}</span>
          </div>
        )}
        {d.rsi != null && (
          <div className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${rsiColor}55` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>RSI (14)</span>
            <span className="text-xl font-black tabular-nums" style={{ color: rsiColor }}>{d.rsi.toFixed(1)}</span>
            <span className="text-[10px]" style={{ color: BB_MUTED }}>
              {d.rsi > 70 ? 'Suracheté' : d.rsi < 30 ? 'Survendu' : 'Neutre'}
            </span>
          </div>
        )}
        {d.adx != null && (
          <div className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${BB_ORANGE}55` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>ADX</span>
            <span className="text-xl font-black tabular-nums" style={{ color: BB_ORANGE }}>{d.adx.toFixed(1)}</span>
            <span className="text-[10px]" style={{ color: BB_MUTED }}>Tendance {adxStrength}</span>
          </div>
        )}
        {d.macd != null && (
          <div className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${d.macd >= 0 ? BB_GREEN : BB_RED}55` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>MACD</span>
            <span className="text-xl font-black tabular-nums" style={{ color: d.macd >= 0 ? BB_GREEN : BB_RED }}>{d.macd.toFixed(4)}</span>
            <span className="text-[10px]" style={{ color: BB_MUTED }}>{d.macd >= 0 ? 'Haussier' : 'Baissier'}</span>
          </div>
        )}
      </div>
      {d.beta != null && (
        <div className="mt-px flex items-center gap-4 p-3 bg-[#0B101E] border border-[#1E293B]">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Bêta (1 an)</span>
          <span className="text-sm font-black tabular-nums" style={{ color: BB_WHITE }}>{d.beta.toFixed(3)}</span>
          <span className="text-[10px]" style={{ color: BB_MUTED }}>
            {d.beta > 1.2 ? '↑ Plus volatil que le marché' : d.beta < 0.8 ? '↓ Moins volatil que le marché' : '≈ En ligne avec le marché'}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Margins / Profitability ───────────────────────────────────────────────────
function MarginsBlock({ d }: { d: FinancialsData }) {
  const metrics = [
    { label: 'Marge opération.',  value: d.operatingMarginPct, fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Marge nette',       value: d.netMarginPct,       fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Marge brute',       value: d.grossMarginPct,     fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'ROE',               value: d.roe,                fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'ROA',               value: d.roa,                fmt: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Dette / Capitaux',  value: d.debtToEquity,       fmt: (v: number) => `${v.toFixed(2)}x` },
    { label: 'Ratio liquidité',   value: d.currentRatio,       fmt: (v: number) => `${v.toFixed(2)}x` },
  ].filter(m => m.value != null);

  if (metrics.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ MARGES & RENTABILITÉ</span>
        <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1E293B]">
        {metrics.map(m => (
          <div key={m.label} className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${BB_YELLOW}44` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>{m.label}</span>
            <span className="text-xl font-black tabular-nums" style={{ color: BB_WHITE }}>{m.fmt(m.value!)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Financial statement helpers ───────────────────────────────────────────────
function SectionHeader({ title, source }: { title: string; source?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-t shadow-sm mt-4 first:mt-0" style={{
      borderColor: '#1E293B', background: 'linear-gradient(90deg, #050b14 0%, #0B101E 100%)',
    }}>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_WHITE }}>
        <span style={{ color: BB_ORANGE, marginRight: 8 }}>■</span>{title}
      </span>
      {source && (
        <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded flex items-center gap-1" style={{ color: BB_MUTED, background: '#111827' }}>
          • {source}
        </span>
      )}
    </div>
  );
}

function MetricRow({ label, value, subtext, highlight = false, indent = 0, valueColor, format = 'number' }: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  indent?: 0 | 1 | 2;
  valueColor?: string;
  format?: 'number' | 'bold' | 'pct';
}) {
  const pl = indent === 1 ? 'pl-8' : indent === 2 ? 'pl-[52px] relative before:content-[""] before:absolute before:left-8 before:top-1/2 before:w-3 before:h-px before:bg-[#334155]' : 'pl-4';
  
  return (
    <div className="flex items-end justify-between py-2 hover:bg-[#0F172A] group relative transition-colors"
      style={{ background: highlight ? '#0B101E' : 'transparent' }}>
      <div className={`flex items-baseline gap-2 ${pl}`}>
        <span
          className={`text-[11px] ${highlight ? 'font-bold uppercase tracking-wider' : ''}`}
          style={{ color: highlight ? BB_ORANGE : BB_MUTED }}
        >
          {label}
        </span>
        {subtext && <span className="text-[9px] font-mono opacity-60" style={{ color: BB_MUTED }}>{subtext}</span>}
      </div>
      <div className="flex-1 border-b border-dotted border-[#334155] mx-4 mb-2 opacity-30 group-hover:opacity-100 hidden sm:block transition-opacity" />
      <span className={`text-[12px] pr-4 tabular-nums ${format === 'bold' || highlight ? 'font-black' : 'font-medium'}`} style={{ color: valueColor ?? (highlight ? BB_WHITE : '#E2E8F0') }}>
        {value}
      </span>
    </div>
  );
}

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center" style={robotoMono.style}>
      <span className="text-2xl mb-2 opacity-50" style={{ color: BB_MUTED }}>Ø</span>
      <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: BB_MUTED }}>Données non disponibles</span>
      <span className="text-[9px] mt-1 opacity-70" style={{ color: BB_MUTED }}>Les états financiers pour cette période ne sont pas publiés complets.</span>
    </div>
  );
}

// ── Financial statement tabs ──────────────────────────────────────────────────
function IncomeStatementTab({ d }: { d: FinancialsData }) {
  const hasData = d.revenue != null || d.netIncome != null || d.grossProfit != null;
  if (!hasData) return <NoData />;
  const source = d.ammcData ? 'AMMC Officiel (2024)' : 'TradingView (FY/TTM)';

  return (
    <div style={robotoMono.style} className="pb-8">
      <SectionHeader title="Activités & Ventes" source={source} />
      {d.revenue      != null && <MetricRow label="Chiffre d'affaires" subtext="TOTAL REVENUE" value={fmtMAD(d.revenue)} highlight />}
      {d.grossProfit  != null && <MetricRow label="Marge brute" subtext="GROSS PROFIT" value={fmtMAD(d.grossProfit)} indent={1} />}
      {d.grossMarginPct != null && <MetricRow label="Marge brute %" value={`${d.grossMarginPct.toFixed(1)}%`} indent={2} />}
      
      <SectionHeader title="Performances Opérationnelles" />
      {d.ebitda       != null && <MetricRow label="EBITDA" subtext="Rép. avant impôts & amort." value={fmtMAD(d.ebitda)} highlight />}
      {d.operatingIncome != null && <MetricRow label="Résultat d'exploitation" subtext="OPERATING INCOME" value={fmtMAD(d.operatingIncome)} highlight />}
      {d.operatingMarginPct != null && <MetricRow label="Marge opérationnelle %"  value={`${d.operatingMarginPct.toFixed(1)}%`} indent={1} />}
      
      <SectionHeader title="Bottom Line" />
      {d.netIncome    != null && <MetricRow label="Résultat Net" subtext="NET INCOME" value={fmtMAD(d.netIncome)} highlight valueColor={d.netIncome >= 0 ? BB_GREEN : BB_RED} />}
      {d.netMarginPct != null && <MetricRow label="Marge nette %" value={`${d.netMarginPct.toFixed(1)}%`} indent={1} />}
      {d.eps          != null && <MetricRow label="Bénéfice par action (BPA)" subtext="MAD/action" value={`${d.eps.toFixed(4)}`} indent={1} />}

      <SectionHeader title="Ratios de Rentabilité" />
      {d.roe != null && <MetricRow label="Rentabilité des capitaux propres" subtext="ROE" value={`${d.roe.toFixed(1)}%`} />}
      {d.roa != null && <MetricRow label="Rentabilité des actifs" subtext="ROA" value={`${d.roa.toFixed(1)}%`} />}
    </div>
  );
}

function BalanceSheetTab({ d }: { d: FinancialsData }) {
  const hasData = d.totalAssets != null || d.totalDebt != null;
  if (!hasData) return <NoData />;
  const source = d.ammcData ? 'AMMC Officiel (2024)' : 'TradingView (FY)';

  return (
    <div style={robotoMono.style} className="pb-8">
      <SectionHeader title="Actifs (Assets)" source={source} />
      {d.totalAssets != null && <MetricRow label="Total Actif" subtext="TOTAL ASSETS" value={fmtMAD(d.totalAssets)} highlight />}
      {d.cashFromOperations != null /* Using as proxy if strictly missing pure cash equivalents in DB */ && <div className="h-2" />}

      <SectionHeader title="Passifs & Dettes (Liabilities)" />
      {d.totalDebt != null && <MetricRow label="Dettes totales" subtext="TOTAL DEBT" value={fmtMAD(d.totalDebt)} highlight valueColor={BB_RED} />}
      {d.currentRatio != null && <MetricRow label="Ratio de liquidité courante" value={`${d.currentRatio.toFixed(2)}x`} indent={1} />}

      <SectionHeader title="Capitaux Engagés (Equity)" />
      {d.stockholdersEquity != null && <MetricRow label="Capitaux propres" subtext="STOCKHOLDERS EQUITY" value={fmtMAD(d.stockholdersEquity)} highlight />}
      {d.debtToEquity       != null && <MetricRow label="Ratio dette / capitaux" subtext="GEARING" value={`${d.debtToEquity.toFixed(2)}x`} indent={1} />}
      
      <SectionHeader title="Valorisation & Capital" />
      {d.priceToBook        != null && <MetricRow label="Prix / Valeur comptable" subtext="P/B RATIO" value={`${d.priceToBook.toFixed(2)}x`} />}
      {d.sharesOutstanding  != null && <MetricRow label="Nombre d'actions" value={d.sharesOutstanding.toLocaleString('fr-MA')} />}
    </div>
  );
}

function CashFlowTab({ d }: { d: FinancialsData }) {
  const hasData = d.cashFromOperations != null || d.freeCashFlow != null;
  if (!hasData) return <NoData />;
  const source = d.ammcData ? 'AMMC Officiel (2024)' : 'TradingView (FY)';

  const fcfYield = (d.freeCashFlow != null && d.marketCap != null && d.marketCap > 0)
    ? (d.freeCashFlow / d.marketCap) * 100
    : null;

  return (
    <div style={robotoMono.style} className="pb-8">
      <SectionHeader title="Analyse des Flux" source={source} />
      {d.cashFromOperations != null && <MetricRow label="Flux d'exploitation" subtext="OPERATING CASH" value={fmtMAD(d.cashFromOperations)} valueColor={d.cashFromOperations >= 0 ? BB_GREEN : BB_RED} />}
      {d.cashFromInvesting  != null && <MetricRow label="Flux d'investissement" subtext="CAPEX / INVESTMENTS" value={fmtMAD(d.cashFromInvesting)} valueColor={d.cashFromInvesting  >= 0 ? BB_GREEN : BB_RED} />}
      {d.cashFromFinancing  != null && <MetricRow label="Flux de financement" subtext="DEBT & EQUITY FINANCING" value={fmtMAD(d.cashFromFinancing)} valueColor={d.cashFromFinancing  >= 0 ? BB_GREEN : BB_RED} />}
      
      <SectionHeader title="Trésorerie Disponible" />
      {d.freeCashFlow       != null && <MetricRow label="Free Cash Flow" subtext="FCF" value={fmtMAD(d.freeCashFlow)} highlight valueColor={d.freeCashFlow >= 0 ? BB_GREEN : BB_RED} />}
      {fcfYield             != null && <MetricRow label="Rendement FCF" subtext="FCF YIELD" value={`${fcfYield.toFixed(1)}%`} indent={1} />}
    </div>
  );
}

// ── PROFIL tab ────────────────────────────────────────────────────────────────
function ProfilTab({ data }: { data: FinancialsData }) {
  const fields: { label: string; value: string | null; accent?: boolean }[] = [
    { label: 'Raison sociale',        value: data.companyName,   accent: true },
    { label: 'Ticker BVC',            value: data.ticker,        accent: true },
    { label: 'Code ISIN',             value: data.isin },
    { label: 'Secteur BVC',           value: data.sector },
    { label: 'Sous-secteur',          value: data.industry },
    { label: 'Cours actuel',          value: data.currentPrice != null ? `${fmtPrice(data.currentPrice)} MAD` : null },
    { label: 'Capitalisation',        value: data.marketCap != null ? fmtMAD(data.marketCap) : null },
    { label: 'P/E Ratio (TTM)',        value: data.peRatio != null ? data.peRatio.toFixed(1) + 'x' : null },
    { label: 'Prix / Valeur comptable', value: data.priceToBook != null ? data.priceToBook.toFixed(2) + 'x' : null },
    { label: 'BPA (12 mois)',          value: data.eps != null ? `${data.eps.toFixed(4)} MAD` : null },
    { label: 'Rend. dividende',        value: data.dividendYield != null ? fmtPct(data.dividendYield) : null },
    { label: 'Dividende / action',     value: data.dividendRate != null ? `${data.dividendRate.toFixed(2)} MAD` : null },
    { label: 'Nbre actions',           value: data.sharesOutstanding != null ? data.sharesOutstanding.toLocaleString('fr-MA') : null },
    { label: 'Chiffre d\'affaires',   value: data.revenue != null ? fmtMAD(data.revenue) : null },
    { label: 'Résultat net',          value: data.netIncome != null ? fmtMAD(data.netIncome) : null },
    { label: 'EBITDA',                value: data.ebitda != null ? fmtMAD(data.ebitda) : null },
    { label: 'Plus haut 52 sem.',     value: data.week52High != null ? `${data.week52High.toFixed(2)} MAD` : null },
    { label: 'Plus bas 52 sem.',      value: data.week52Low != null ? `${data.week52Low.toFixed(2)} MAD` : null },
    { label: 'Bêta (1 an)',           value: data.beta != null ? data.beta.toFixed(3) : null },
  ];

  return (
    <div className="p-5 space-y-5" style={robotoMono.style}>
      <div className="border" style={{ borderColor: BB_BORDER }}>
        <div className="px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: BB_BORDER, background: '#050b14', color: BB_ORANGE }}>
          ■ FICHE SOCIÉTÉ — {data.ticker}
        </div>
        <div className="divide-y divide-[#1E293B]">
          {fields.map(({ label, value, accent }) => value != null && (
            <div key={label} className="flex items-center justify-between px-4 py-3 hover:bg-[#0B101E]">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BB_MUTED }}>{label}</span>
              <span className="text-sm font-black tabular-nums" style={{ color: accent ? BB_CYAN : BB_WHITE }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {data.companyDesc && (
        <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: BB_ORANGE }}>■ PRÉSENTATION</p>
          <p className="text-sm leading-relaxed" style={{ color: BB_WHITE }}>{data.companyDesc}</p>
        </div>
      )}

      {data.week52High != null && data.week52Low != null && data.currentPrice != null && (
        <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>■ FOURCHETTE 52 SEMAINES</p>
          <Week52Bar price={data.currentPrice} low={data.week52Low} high={data.week52High} />
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wider" style={{ color: BB_MUTED }}>
        Source: Bourse de Casablanca · TradingView · iamleblanc/StocksMA
      </p>
    </div>
  );
}

// ── Empty / Error states ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center" style={robotoMono.style}>
      <div className="text-4xl" style={{ color: BB_MUTED }}>◈</div>
      <p className="text-sm font-bold" style={{ color: BB_ORANGE }}>Sélectionnez une valeur BVC</p>
      <p className="text-xs max-w-xs" style={{ color: BB_MUTED }}>
        Naviguez vers <span style={{ color: BB_CYAN }}>Valeurs BVC</span>, sélectionnez un titre puis revenez ici pour consulter les données.
      </p>
      <p className="text-[10px] mt-2 uppercase tracking-widest" style={{ color: BB_MUTED }}>ou tapez un ticker dans la barre CMD</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center" style={robotoMono.style}>
      <div className="text-xs font-bold px-4 py-3 border" style={{ color: BB_RED, borderColor: `${BB_RED}44`, background: `${BB_RED}10` }}>
        ⚠ Données indisponibles — {message}
      </div>
      <button onClick={onRetry} className="text-xs font-bold px-4 py-2 hover:opacity-80" style={{ color: '#000', background: BB_ORANGE, ...inter.style }}>
        ↻ Réessayer
      </button>
    </div>
  );
}

const EMPTY_DATA: FinancialsData = {
  ticker: '', isin: null, sector: null, industry: null,
  companyName: null, companyDesc: null,
  currentPrice: null, performance: null, marketCap: null, peRatio: null,
  avgVolume30d: null, ytdChange: null, week52High: null, week52Low: null,
  priceToBook: null, eps: null, dividendYield: null, dividendRate: null,
  sharesOutstanding: null, revenue: null, netIncome: null, ebitda: null,
  grossProfit: null, operatingIncome: null,
  totalAssets: null, totalDebt: null, stockholdersEquity: null,
  freeCashFlow: null, cashFromOperations: null, cashFromInvesting: null, cashFromFinancing: null,
  grossMarginPct: null, operatingMarginPct: null, netMarginPct: null,
  roe: null, roa: null, debtToEquity: null, currentRatio: null, beta: null,
  perfW: null, perf1M: null, perf3M: null, perf6M: null, perfY: null, perfYTD: null,
  rsi: null, adx: null, macd: null, recommendAll: null,
  estimatedRevenue: null, estimatedNetIncome: null, indicators: [],
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props { ticker: string | null; }
type FetchState = 'idle' | 'loading' | 'success' | 'error';

export default function ValuesFinancials({ ticker }: Props) {
  const [state,    setState]    = useState<FetchState>('idle');
  const [data,     setData]     = useState<FinancialsData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [finTab,   setFinTab]   = useState<FinTab>('APERCU');

  const load = useCallback(async (t: string) => {
    setState('loading');
    setErrorMsg('');
    try {
      const result = await fetchFinancials(t);
      setData(result);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (!ticker) { setState('idle'); setData(null); return; }
    load(ticker);
  }, [ticker, load]);

  const isLoading = state === 'loading';
  const d = data ?? EMPTY_DATA;

  return (
    <div className="h-full flex flex-col" style={{ background: BB_BG, ...robotoMono.style }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: BB_BORDER, background: BB_PANEL, ...inter.style }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>DONNÉES</span>
          {ticker && (
            <>
              <span style={{ color: BB_BORDER }}>│</span>
              <span className="text-sm font-black tracking-wider" style={{ color: BB_CYAN }}>{ticker}</span>
              {d.sector && (
                <>
                  <span style={{ color: BB_BORDER }}>│</span>
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: BB_MUTED }}>{d.sector}</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse" style={{ color: BB_ORANGE, ...robotoMono.style }}>
              ● CHARGEMENT...
            </span>
          )}
          {state === 'success' && (
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_GREEN, ...robotoMono.style }}>
              ● EN DIRECT
            </span>
          )}
          {d.isin && (
            <span className="text-[10px] font-mono px-2 py-0.5 border" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
              {d.isin}
            </span>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      {ticker && (
        <div className="flex items-center border-b flex-shrink-0 overflow-x-auto" style={{ borderColor: BB_BORDER, background: '#050b14' }}>
          {FIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFinTab(tab.id)}
              className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors"
              style={{
                color: finTab === tab.id ? BB_ORANGE : BB_MUTED,
                borderBottom: finTab === tab.id ? `2px solid ${BB_ORANGE}` : '2px solid transparent',
                background: 'transparent',
                ...robotoMono.style,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {state === 'idle'  && <EmptyState />}
        {state === 'error' && <ErrorState message={errorMsg} onRetry={() => ticker && load(ticker)} />}

        {(isLoading || state === 'success') && (
          <>
            {/* ─ APERÇU ─ */}
            {finTab === 'APERCU' && (
              <div className="p-5 space-y-5">
                {/* Summary cards */}
                <SummaryCards data={d} loading={isLoading} />

                {/* Performance strip */}
                {!isLoading && <PerformanceStrip d={d} />}

                {/* Extended valuation metrics */}
                {!isLoading && (d.priceToBook != null || d.eps != null || d.dividendYield != null) && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ VALORISATION</span>
                      <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1E293B]">
                      {[
                        { label: 'Prix / Valeur comptable', value: d.priceToBook != null ? d.priceToBook.toFixed(2) + 'x' : null },
                        { label: 'BPA (12 mois)',            value: d.eps != null ? `${d.eps.toFixed(2)} MAD` : null },
                        { label: 'Rend. dividende',          value: d.dividendYield != null ? fmtPct(d.dividendYield) : null, color: BB_GREEN },
                        { label: 'Dividende / action',       value: d.dividendRate != null ? `${d.dividendRate.toFixed(2)} MAD` : null },
                      ].filter(c => c.value != null).map(card => (
                        <div key={card.label} className="flex flex-col gap-1 p-4 bg-[#0B101E]" style={{ borderLeft: `2px solid ${BB_YELLOW}44` }}>
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>{card.label}</span>
                          <span className="text-xl font-black tabular-nums" style={{ color: card.color ?? BB_WHITE, ...robotoMono.style }}>{card.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical signals */}
                {!isLoading && <TechnicalSignals d={d} />}

                {/* Margins */}
                {!isLoading && <MarginsBlock d={d} />}

                {/* 52-week range bar */}
                {!isLoading && d.week52High != null && d.week52Low != null && d.currentPrice != null && (
                  <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>■ FOURCHETTE 52 SEMAINES</p>
                    <Week52Bar price={d.currentPrice} low={d.week52Low} high={d.week52High} />
                  </div>
                )}

                {/* Indicators table (BVC session data) */}
                {d.indicators.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ INDICATEURS SÉANCE</span>
                      <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
                    </div>
                    <IndicatorsTable indicators={d.indicators} loading={isLoading} />
                  </div>
                )}

                <p className="text-[10px] uppercase tracking-wider text-center pb-4" style={{ color: BB_MUTED }}>
                  Source: Bourse de Casablanca · TradingView · Données en temps réel
                </p>
              </div>
            )}

            {/* ─ PROFIL ─ */}
            {finTab === 'PROFIL' && <ProfilTab data={d} />}

            {/* ─ Statements ─ */}
            {finTab === 'INCOME'   && <IncomeStatementTab d={d} />}
            {finTab === 'BALANCE'  && <BalanceSheetTab    d={d} />}
            {finTab === 'CASHFLOW' && <CashFlowTab        d={d} />}
          </>
        )}
      </div>
    </div>
  );
}
