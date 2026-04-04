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

// ── Ticker-seeded illustrative financial data ─────────────────────────────────
// Each ticker produces unique but consistent numbers (deterministic hash).
// Source pattern: iamleblanc/StocksMA — same approach as terminal.risk.ma.

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Returns a scale multiplier in [min, max] seeded by ticker + salt */
function scale(ticker: string, salt: number, min = 0.3, max = 4.5): number {
  const n = djb2(ticker + salt) % 10000;
  return min + (n / 10000) * (max - min);
}

function seededIncome(ticker: string) {
  const s = scale(ticker, 1);
  const revenue   = [1240, 1350, 1420, 1580].map(v => Math.round(v * s));
  const cogs      = revenue.map(v => Math.round(v * 0.65));
  const opex      = revenue.map(v => Math.round(v * 0.22));
  const interest  = [45, 42, 38, 35].map(v => Math.round(v * s * 0.6));
  const tax       = revenue.map((v, i) => {
    const ebit = v - cogs[i] - opex[i];
    return Math.max(0, Math.round(ebit * 0.28));
  });
  const netIncome = revenue.map((v, i) => {
    const ebit = v - cogs[i] - opex[i];
    return Math.max(0, Math.round(ebit - interest[i] - tax[i]));
  });
  return { revenue, cogs, opex, interest, tax, netIncome };
}

function seededBalance(ticker: string, netIncome: number[]) {
  const s = scale(ticker, 2);
  const immocorp   = [1400, 1560, 1750, 2050].map(v => Math.round(v * s));
  const immoinc    = [260,  310,  400,  480 ].map(v => Math.round(v * s * 0.8));
  const actifFin   = [300,  330,  350,  380 ].map(v => Math.round(v * s * 0.7));
  const stocks     = [210,  220,  230,  240 ].map(v => Math.round(v * s));
  const creances   = [380,  400,  420,  450 ].map(v => Math.round(v * s));
  const tresorerie = [300,  300,  300,  290 ].map(v => Math.round(v * s * 0.5));
  const capital    = [500,  500,  500,  500 ].map(v => Math.round(v * s * 0.9));
  const reserves   = [1000, 1205, 1468, 1835].map(v => Math.round(v * s));
  const dettesCT   = [390,  400,  410,  420 ].map(v => Math.round(v * s * 0.75));
  const dettesLT   = [700,  720,  740,  760 ].map(v => Math.round(v * s * 0.9));
  return { immocorp, immoinc, actifFin, stocks, creances, tresorerie, capital, reserves, dettesCT, dettesLT, netIncome };
}

function seededCashflow(ticker: string, netIncome: number[]) {
  const s = scale(ticker, 3, 0.4, 4.0);
  return {
    da:             [85,   95,   105,  115 ].map(v => Math.round(v * s)),
    bfr:            [-40,  -35,  -30,  -25 ].map(v => Math.round(v * s)),
    capex:          [-180, -200, -220, -250].map(v => Math.round(v * s)),
    cessions:       [20,   15,   25,   30  ].map(v => Math.round(v * s * 0.5)),
    remboursements: [-50,  -50,  -50,  -50 ].map(v => Math.round(v * s)),
    dividendes:     [-95,  -115, -162, -195].map(v => Math.round(v * s * 0.6)),
    netIncome,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const YEARS = ['2021', '2022', '2023', '2024'];

function fmtMDH(n: number): string {
  return n.toLocaleString('fr-MA') + ' M';
}

function pctOf(a: number, b: number): string {
  if (!b) return '—';
  return ((a / b) * 100).toFixed(1) + '%';
}

function pctColor(v: number | null): string {
  if (v == null) return BB_MUTED;
  return v > 0 ? BB_GREEN : v < 0 ? BB_RED : BB_MUTED;
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

// ── Table helpers ─────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div
      className="grid items-center px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10"
      style={{
        gridTemplateColumns: `minmax(200px,1fr) repeat(4, 100px)`,
        gap: '8px',
        borderColor: BB_BORDER,
        background: '#050b14',
        color: BB_MUTED,
      }}
    >
      <span>Indicateur</span>
      {YEARS.map(y => (
        <span key={y} className="text-right" style={{ color: BB_ORANGE }}>{y}</span>
      ))}
    </div>
  );
}

function StatRow({
  label, customValues, highlight = false, indent = false, isMuted = false,
}: {
  label: string;
  customValues: string[];
  highlight?: boolean;
  indent?: boolean;
  isMuted?: boolean;
}) {
  return (
    <div
      className="grid items-center px-4 py-2.5 border-b"
      style={{
        gridTemplateColumns: `minmax(200px,1fr) repeat(4, 100px)`,
        gap: '8px',
        borderColor: BB_BORDER,
        background: highlight ? '#0A0F1D' : 'transparent',
      }}
    >
      <span
        className={`text-xs font-bold ${indent ? 'pl-5' : ''} ${highlight ? 'uppercase tracking-wider' : ''}`}
        style={{ color: isMuted ? BB_MUTED : highlight ? BB_ORANGE : BB_WHITE }}
      >
        {label}
      </span>
      {customValues.map((v, i) => (
        <span key={i} className="text-right text-xs tabular-nums font-bold" style={{ color: highlight ? BB_CYAN : isMuted ? BB_MUTED : BB_WHITE }}>
          {v}
        </span>
      ))}
    </div>
  );
}

// ── Financial statement renderers ─────────────────────────────────────────────
function IncomeStatement({ ticker }: { ticker: string }) {
  const { revenue, cogs, opex, interest, tax, netIncome } = seededIncome(ticker);
  const grossMargin = YEARS.map((_, i) => revenue[i] - cogs[i]);
  const ebit        = YEARS.map((_, i) => grossMargin[i] - opex[i]);
  const ebt         = YEARS.map((_, i) => ebit[i] - interest[i]);

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      <StatRow label="Chiffre d'affaires (CA)"      highlight customValues={revenue.map(fmtMDH)} />
      <StatRow label="Coût des ventes"               indent isMuted customValues={cogs.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="Marge brute"                   customValues={grossMargin.map(fmtMDH)} />
      <StatRow label="Marge brute %"                 isMuted customValues={YEARS.map((_, i) => pctOf(grossMargin[i], revenue[i]))} />
      <StatRow label="Charges opérationnelles"       indent isMuted customValues={opex.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="EBIT (Résultat d'exploitation)" highlight customValues={ebit.map(fmtMDH)} />
      <StatRow label="Marge EBIT %"                  isMuted customValues={YEARS.map((_, i) => pctOf(ebit[i], revenue[i]))} />
      <StatRow label="Charges financières"           indent isMuted customValues={interest.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="Résultat avant impôts"         customValues={ebt.map(fmtMDH)} />
      <StatRow label="Impôts sur le résultat"        indent isMuted customValues={tax.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="RÉSULTAT NET"                  highlight customValues={netIncome.map(fmtMDH)} />
      <StatRow label="Marge nette %"                 isMuted customValues={YEARS.map((_, i) => pctOf(netIncome[i], revenue[i]))} />
    </div>
  );
}

function BalanceSheet({ ticker }: { ticker: string }) {
  const { netIncome } = seededIncome(ticker);
  const b = seededBalance(ticker, netIncome);

  const totalActifNC = YEARS.map((_, i) => b.immocorp[i] + b.immoinc[i] + b.actifFin[i]);
  const totalActifC  = YEARS.map((_, i) => b.stocks[i] + b.creances[i] + b.tresorerie[i]);
  const totalActif   = YEARS.map((_, i) => totalActifNC[i] + totalActifC[i]);
  const capitProp    = YEARS.map((_, i) => b.capital[i] + b.reserves[i] + b.netIncome[i]);
  const totalDettes  = YEARS.map((_, i) => b.dettesCT[i] + b.dettesLT[i]);
  const totalPassif  = YEARS.map((_, i) => capitProp[i] + totalDettes[i]);

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      <StatRow label="ACTIFS NON COURANTS"   highlight customValues={totalActifNC.map(fmtMDH)} />
      <StatRow label="Immobilisations corp." indent    customValues={b.immocorp.map(fmtMDH)} />
      <StatRow label="Immobilisations inc."  indent    customValues={b.immoinc.map(fmtMDH)} />
      <StatRow label="Actifs financiers"     indent    customValues={b.actifFin.map(fmtMDH)} />
      <StatRow label="ACTIFS COURANTS"       highlight customValues={totalActifC.map(fmtMDH)} />
      <StatRow label="Stocks"                indent    customValues={b.stocks.map(fmtMDH)} />
      <StatRow label="Créances clients"      indent    customValues={b.creances.map(fmtMDH)} />
      <StatRow label="Trésorerie"            indent    customValues={b.tresorerie.map(fmtMDH)} />
      <StatRow label="TOTAL ACTIF"           highlight customValues={totalActif.map(fmtMDH)} />
      <StatRow label="CAPITAUX PROPRES"      highlight customValues={capitProp.map(fmtMDH)} />
      <StatRow label="Capital social"        indent    customValues={b.capital.map(fmtMDH)} />
      <StatRow label="Réserves"              indent    customValues={b.reserves.map(fmtMDH)} />
      <StatRow label="Résultat de l'exercice" indent   customValues={b.netIncome.map(fmtMDH)} />
      <StatRow label="DETTES TOTALES"        highlight customValues={totalDettes.map(fmtMDH)} />
      <StatRow label="Dettes long terme"     indent    customValues={b.dettesLT.map(fmtMDH)} />
      <StatRow label="Dettes court terme"    indent    customValues={b.dettesCT.map(fmtMDH)} />
      <StatRow label="TOTAL PASSIF"          highlight customValues={totalPassif.map(fmtMDH)} />
      <StatRow label="── RATIOS CLÉS ──"     isMuted   customValues={['', '', '', '']} />
      <StatRow label="Ratio d'endettement"   customValues={YEARS.map((_, i) => pctOf(totalDettes[i], capitProp[i]))} />
      <StatRow label="Ratio de liquidité"    customValues={YEARS.map((_, i) => (totalActifC[i] / b.dettesCT[i]).toFixed(2) + 'x')} />
      <StatRow label="ROE (Rentab. cap. prop.)" customValues={YEARS.map((_, i) => pctOf(b.netIncome[i], capitProp[i]))} />
    </div>
  );
}

function CashFlowStatement({ ticker }: { ticker: string }) {
  const { netIncome } = seededIncome(ticker);
  const cf = seededCashflow(ticker, netIncome);

  const operating = YEARS.map((_, i) => cf.netIncome[i] + cf.da[i] + cf.bfr[i]);
  const investing  = YEARS.map((_, i) => cf.capex[i] + cf.cessions[i]);
  const financing  = YEARS.map((_, i) => cf.remboursements[i] + cf.dividendes[i]);
  const fcf        = YEARS.map((_, i) => operating[i] + cf.capex[i]);
  const { revenue } = seededIncome(ticker);

  function fmt(n: number): string { return fmtMDH(n); }

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      <StatRow label="FLUX D'EXPLOITATION"         highlight customValues={operating.map(fmt)} />
      <StatRow label="Résultat net"                indent    customValues={cf.netIncome.map(fmt)} />
      <StatRow label="Amortissements & dépréciations" indent customValues={cf.da.map(fmt)} />
      <StatRow label="Variation BFR"              indent isMuted customValues={cf.bfr.map(fmt)} />
      <StatRow label="FLUX D'INVESTISSEMENT"       highlight customValues={investing.map(fmt)} />
      <StatRow label="Investissements (CAPEX)"    indent isMuted customValues={cf.capex.map(fmt)} />
      <StatRow label="Cessions d'actifs"           indent    customValues={cf.cessions.map(fmt)} />
      <StatRow label="FLUX DE FINANCEMENT"         highlight customValues={financing.map(fmt)} />
      <StatRow label="Remboursements dettes"      indent isMuted customValues={cf.remboursements.map(fmt)} />
      <StatRow label="Dividendes versés"          indent isMuted customValues={cf.dividendes.map(fmt)} />
      <StatRow label="VARIATION NETTE TRÉSORERIE" highlight customValues={YEARS.map((_, i) => fmt(operating[i] + investing[i] + financing[i]))} />
      <StatRow label="FREE CASH FLOW (FCF)"        highlight customValues={fcf.map(fmt)} />
      <StatRow label="Marge FCF %"                 isMuted   customValues={YEARS.map((_, i) => pctOf(fcf[i], revenue[i]))} />
    </div>
  );
}

// ── PROFIL tab ────────────────────────────────────────────────────────────────
function ProfilTab({ data }: { data: FinancialsData }) {
  const fields: { label: string; value: string | null; accent?: boolean }[] = [
    { label: 'Raison sociale',  value: data.companyName,   accent: true },
    { label: 'Ticker BVC',      value: data.ticker,        accent: true },
    { label: 'Code ISIN',       value: data.isin },
    { label: 'Secteur BVC',     value: data.sector },
    { label: 'Cours actuel',    value: data.currentPrice != null ? `${fmtPrice(data.currentPrice)} MAD` : null },
    { label: 'Capitalisation',  value: data.marketCap != null ? fmtMAD(data.marketCap) : null },
    { label: 'P/E Ratio (TTM)', value: data.peRatio != null ? data.peRatio.toFixed(1) + 'x' : null },
    { label: 'Prix / Valeur comptable', value: data.priceToBook != null ? data.priceToBook.toFixed(2) + 'x' : null },
    { label: 'BPA (12 mois)',   value: data.eps != null ? `${data.eps.toFixed(2)} MAD` : null },
    { label: 'Rend. dividende', value: data.dividendYield != null ? fmtPct(data.dividendYield) : null },
    { label: 'Dividende / action', value: data.dividendRate != null ? `${data.dividendRate.toFixed(2)} MAD` : null },
    { label: 'Plus haut 52 sem.', value: data.week52High != null ? `${data.week52High.toFixed(2)} MAD` : null },
    { label: 'Plus bas 52 sem.', value: data.week52Low != null ? `${data.week52Low.toFixed(2)} MAD` : null },
  ];

  return (
    <div className="p-5 space-y-5" style={robotoMono.style}>
      {/* Identity card */}
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

      {/* Description */}
      {data.companyDesc && (
        <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: BB_ORANGE }}>■ PRÉSENTATION</p>
          <p className="text-sm leading-relaxed" style={{ color: BB_WHITE }}>{data.companyDesc}</p>
        </div>
      )}

      {/* 52-week range */}
      {data.week52High != null && data.week52Low != null && data.currentPrice != null && (
        <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>■ FOURCHETTE 52 SEMAINES</p>
          <Week52Bar price={data.currentPrice} low={data.week52Low} high={data.week52High} />
        </div>
      )}

      <p className="text-[10px] uppercase tracking-wider" style={{ color: BB_MUTED }}>
        ⚠ Données indicatives. Source: iamleblanc/StocksMA · Yahoo Finance · Bourse de Casablanca.
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
  ticker: '', isin: null, sector: null, companyName: null, companyDesc: null,
  currentPrice: null, performance: null, marketCap: null, peRatio: null,
  avgVolume30d: null, ytdChange: null, week52High: null, week52Low: null,
  priceToBook: null, eps: null, dividendYield: null, dividendRate: null,
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

                {/* Extended quote metrics */}
                {!isLoading && (d.priceToBook != null || d.eps != null || d.dividendYield != null) && (
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
                )}

                {/* 52-week range bar */}
                {!isLoading && d.week52High != null && d.week52Low != null && d.currentPrice != null && (
                  <div className="border p-4" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>■ FOURCHETTE 52 SEMAINES</p>
                    <Week52Bar price={d.currentPrice} low={d.week52Low} high={d.week52High} />
                  </div>
                )}

                {/* Indicators table */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ INDICATEURS SÉANCE</span>
                    <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
                  </div>
                  <IndicatorsTable indicators={d.indicators} loading={isLoading} />
                </div>

                <p className="text-[10px] uppercase tracking-wider text-center pb-4" style={{ color: BB_MUTED }}>
                  ⚠ Données indicatives à titre éducatif uniquement.
                </p>
              </div>
            )}

            {/* ─ PROFIL ─ */}
            {finTab === 'PROFIL' && <ProfilTab data={d} />}

            {/* ─ Statements ─ */}
            {(['INCOME', 'BALANCE', 'CASHFLOW'] as FinTab[]).includes(finTab) && ticker && (
              <div>
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: BB_BORDER, background: '#050b14' }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                    ■ {finTab === 'INCOME' ? 'COMPTE DE RÉSULTAT' : finTab === 'BALANCE' ? 'BILAN COMPTABLE' : 'FLUX DE TRÉSORERIE'} — {ticker}
                  </span>
                  <span className="text-[10px]" style={{ color: BB_MUTED }}>En MDH · Illustratif · 2021–2024</span>
                </div>
                {finTab === 'INCOME'   && <IncomeStatement   ticker={ticker} />}
                {finTab === 'BALANCE'  && <BalanceSheet       ticker={ticker} />}
                {finTab === 'CASHFLOW' && <CashFlowStatement  ticker={ticker} />}
                <p className="px-4 py-3 text-[10px] uppercase tracking-wider border-t" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
                  ⚠ Données illustratives générées à titre éducatif — ne pas utiliser pour des décisions d'investissement.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
