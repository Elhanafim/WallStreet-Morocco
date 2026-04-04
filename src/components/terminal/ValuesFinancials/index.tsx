'use client';

import { useState, useEffect, useCallback } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import type { FinancialsData } from './financials.api';
import { fetchFinancials } from './financials.api';
import SummaryCards from './SummaryCards';
import OverviewBlock from './OverviewBlock';
import IndicatorsTable from './IndicatorsTable';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_ORANGE = '#FF9800';
const BB_MUTED  = '#8B95A1';
const BB_RED    = '#FF1744';
const BB_CYAN   = '#00E5FF';
const BB_GREEN  = '#00E676';
const BB_BORDER = '#1E293B';
const BB_PANEL  = '#0B101E';
const BB_BG     = '#040914';
const BB_WHITE  = '#FFFFFF';

type FinTab = 'APERCU' | 'INCOME' | 'BALANCE' | 'CASHFLOW';

const FIN_TABS: { id: FinTab; label: string }[] = [
  { id: 'APERCU',   label: 'APERÇU'             },
  { id: 'INCOME',   label: 'COMPTE DE RÉSULTAT' },
  { id: 'BALANCE',  label: 'BILAN'              },
  { id: 'CASHFLOW', label: 'FLUX DE TRÉSORERIE' },
];

// ── Static financial data (illustrative, source: terminal.risk.ma) ─────────────
const YEARS = ['2021', '2022', '2023', '2024'];

const INCOME_DATA = {
  revenue:   [1240, 1350, 1420, 1580],
  cogs:      [806,  851,  894,  949],
  opex:      [310,  324,  340,  360],
  interest:  [45,   42,   38,   35],
  tax:       [89,   95,   110,  125],
  netIncome: [260,  295,  332,  375],
};

const BALANCE_DATA = {
  immocorp:   [1400, 1560, 1750, 2050],
  immoinc:    [260,  310,  400,  480],
  actifFin:   [300,  330,  350,  380],
  stocks:     [210,  220,  230,  240],
  creances:   [380,  400,  420,  450],
  tresorerie: [300,  300,  300,  290],
  capital:    [500,  500,  500,  500],
  reserves:   [1000, 1205, 1468, 1835],
  dettesCT:   [390,  400,  410,  420],
  dettesLT:   [700,  720,  740,  760],
};

const CASHFLOW_DATA = {
  da:             [85,   95,   105,  115],
  bfr:            [-40,  -35,  -30,  -25],
  capex:          [-180, -200, -220, -250],
  cessions:       [20,   15,   25,   30],
  remboursements: [-50,  -50,  -50,  -50],
  dividendes:     [-95,  -115, -162, -195],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtMDH(n: number): string {
  return n.toLocaleString('fr-MA') + ' MDH';
}

function pctOf(a: number, b: number): string {
  if (!b) return '—';
  return ((a / b) * 100).toFixed(1) + '%';
}

function trend(arr: number[], i: number): number | null {
  if (i === 0) return null;
  const prev = arr[i - 1];
  if (!prev) return null;
  return ((arr[i] - prev) / Math.abs(prev)) * 100;
}

// ── Table primitives ──────────────────────────────────────────────────────────
function StatRow({
  label,
  values,
  highlight = false,
  indent = false,
  isMuted = false,
  isPct = false,
  customValues,
}: {
  label: string;
  values?: number[];
  highlight?: boolean;
  indent?: boolean;
  isMuted?: boolean;
  isPct?: boolean;
  customValues?: string[];
}) {
  return (
    <div
      className="grid items-center px-4 py-2.5 border-b"
      style={{
        gridTemplateColumns: `minmax(200px,1fr) repeat(4, 110px)`,
        gap: '8px',
        borderColor: BB_BORDER,
        background: highlight ? '#0A0F1D' : 'transparent',
      }}
    >
      <span
        className={`text-xs font-bold ${indent ? 'pl-4' : ''} ${highlight ? 'uppercase tracking-wider' : ''}`}
        style={{ color: isMuted ? BB_MUTED : highlight ? BB_ORANGE : BB_WHITE }}
      >
        {label}
      </span>
      {YEARS.map((_, i) => {
        const raw = customValues ? customValues[i] : values ? values[i] : null;
        const display = isPct && values ? pctOf(values[i], values[i]) : raw;
        return (
          <span
            key={i}
            className="text-right text-xs tabular-nums font-bold"
            style={{ color: highlight ? BB_CYAN : isMuted ? BB_MUTED : BB_WHITE }}
          >
            {display ?? '—'}
          </span>
        );
      })}
    </div>
  );
}

function TableHeader() {
  return (
    <div
      className="grid items-center px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10"
      style={{
        gridTemplateColumns: `minmax(200px,1fr) repeat(4, 110px)`,
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

// ── Statement renderers ───────────────────────────────────────────────────────
function IncomeStatement() {
  const { revenue, cogs, opex, interest, tax, netIncome } = INCOME_DATA;
  const grossMargin = YEARS.map((_, i) => revenue[i] - cogs[i]);
  const ebit        = YEARS.map((_, i) => grossMargin[i] - opex[i]);
  const ebt         = YEARS.map((_, i) => ebit[i] - interest[i]);

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      <StatRow label="Chiffre d'affaires (CA)"   values={revenue}     highlight customValues={revenue.map(fmtMDH)} />
      <StatRow label="Coût des ventes (COGS)"    values={cogs}        indent isMuted customValues={cogs.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="Marge brute"               values={grossMargin} customValues={grossMargin.map(fmtMDH)} />
      <StatRow label="Marge brute %"             customValues={YEARS.map((_, i) => pctOf(grossMargin[i], revenue[i]))} isMuted />
      <StatRow label="Charges opérationnelles"   values={opex}        indent isMuted customValues={opex.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="EBIT (Résultat d'exploit.)" values={ebit}       highlight customValues={ebit.map(fmtMDH)} />
      <StatRow label="Marge EBIT %"              customValues={YEARS.map((_, i) => pctOf(ebit[i], revenue[i]))} isMuted />
      <StatRow label="Charges financières"       values={interest}    indent isMuted customValues={interest.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="Résultat avant impôts"     values={ebt}         customValues={ebt.map(fmtMDH)} />
      <StatRow label="Impôts"                    values={tax}         indent isMuted customValues={tax.map(v => `(${fmtMDH(v)})`)} />
      <StatRow label="RÉSULTAT NET"              values={netIncome}   highlight customValues={netIncome.map(fmtMDH)} />
      <StatRow label="Marge nette %"             customValues={YEARS.map((_, i) => pctOf(netIncome[i], revenue[i]))} isMuted />
    </div>
  );
}

function BalanceSheet() {
  const { immocorp, immoinc, actifFin, stocks, creances, tresorerie,
          capital, reserves, dettesCT, dettesLT } = BALANCE_DATA;
  const { netIncome } = INCOME_DATA;

  const totalActifNC  = YEARS.map((_, i) => immocorp[i] + immoinc[i] + actifFin[i]);
  const totalActifC   = YEARS.map((_, i) => stocks[i] + creances[i] + tresorerie[i]);
  const totalActif    = YEARS.map((_, i) => totalActifNC[i] + totalActifC[i]);
  const capitauxProp  = YEARS.map((_, i) => capital[i] + reserves[i] + netIncome[i]);
  const totalDettes   = YEARS.map((_, i) => dettesCT[i] + dettesLT[i]);
  const totalPassif   = YEARS.map((_, i) => capitauxProp[i] + totalDettes[i]);

  const ratioEndettem = YEARS.map((_, i) => pctOf(totalDettes[i], capitauxProp[i]));
  const ratioLiquid   = YEARS.map((_, i) => (totalActifC[i] / dettesCT[i]).toFixed(2) + 'x');
  const roe           = YEARS.map((_, i) => pctOf(netIncome[i], capitauxProp[i]));

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      {/* Actif */}
      <StatRow label="ACTIFS NON COURANTS"    values={totalActifNC}  highlight customValues={totalActifNC.map(fmtMDH)} />
      <StatRow label="Immobilisations corp."  values={immocorp}      indent customValues={immocorp.map(fmtMDH)} />
      <StatRow label="Immobilisations inc."   values={immoinc}       indent customValues={immoinc.map(fmtMDH)} />
      <StatRow label="Actifs financiers"      values={actifFin}      indent customValues={actifFin.map(fmtMDH)} />
      <StatRow label="ACTIFS COURANTS"        values={totalActifC}   highlight customValues={totalActifC.map(fmtMDH)} />
      <StatRow label="Stocks"                 values={stocks}        indent customValues={stocks.map(fmtMDH)} />
      <StatRow label="Créances clients"       values={creances}      indent customValues={creances.map(fmtMDH)} />
      <StatRow label="Trésorerie"             values={tresorerie}    indent customValues={tresorerie.map(fmtMDH)} />
      <StatRow label="TOTAL ACTIF"            values={totalActif}    highlight customValues={totalActif.map(fmtMDH)} />
      {/* Passif */}
      <StatRow label="CAPITAUX PROPRES"       values={capitauxProp}  highlight customValues={capitauxProp.map(fmtMDH)} />
      <StatRow label="Capital social"         values={capital}       indent customValues={capital.map(fmtMDH)} />
      <StatRow label="Réserves"               values={reserves}      indent customValues={reserves.map(fmtMDH)} />
      <StatRow label="Résultat net"           values={netIncome}     indent customValues={netIncome.map(fmtMDH)} />
      <StatRow label="DETTES TOTALES"         values={totalDettes}   highlight customValues={totalDettes.map(fmtMDH)} />
      <StatRow label="Dettes long terme"      values={dettesLT}      indent customValues={dettesLT.map(fmtMDH)} />
      <StatRow label="Dettes court terme"     values={dettesCT}      indent customValues={dettesCT.map(fmtMDH)} />
      <StatRow label="TOTAL PASSIF"           values={totalPassif}   highlight customValues={totalPassif.map(fmtMDH)} />
      {/* Ratios */}
      <StatRow label="── RATIOS ──"           customValues={['', '', '', '']} isMuted />
      <StatRow label="Ratio d'endettement"    customValues={ratioEndettem} />
      <StatRow label="Ratio de liquidité"     customValues={ratioLiquid} />
      <StatRow label="ROE"                    customValues={roe} />
    </div>
  );
}

function CashFlowStatement() {
  const { da, bfr, capex, cessions, remboursements, dividendes } = CASHFLOW_DATA;
  const { netIncome } = INCOME_DATA;

  const operating  = YEARS.map((_, i) => netIncome[i] + da[i] + bfr[i]);
  const investing  = YEARS.map((_, i) => capex[i] + cessions[i]);
  const financing  = YEARS.map((_, i) => remboursements[i] + dividendes[i]);
  const netChange  = YEARS.map((_, i) => operating[i] + investing[i] + financing[i]);
  const fcf        = YEARS.map((_, i) => operating[i] + capex[i]);

  function fmt(n: number): string {
    return (n >= 0 ? '' : '') + fmtMDH(n);
  }

  return (
    <div style={robotoMono.style}>
      <TableHeader />
      {/* Operating */}
      <StatRow label="FLUX D'EXPLOITATION"          highlight customValues={operating.map(fmt)} />
      <StatRow label="Résultat net"                 indent values={netIncome}      customValues={netIncome.map(fmt)} />
      <StatRow label="Amort. & dépréciations"       indent values={da}             customValues={da.map(fmt)} />
      <StatRow label="Variation BFR"                indent values={bfr}            customValues={bfr.map(fmt)} isMuted />
      {/* Investing */}
      <StatRow label="FLUX D'INVESTISSEMENT"        highlight customValues={investing.map(fmt)} />
      <StatRow label="Investissements (CAPEX)"      indent values={capex}          customValues={capex.map(fmt)} isMuted />
      <StatRow label="Cessions d'actifs"            indent values={cessions}       customValues={cessions.map(fmt)} />
      {/* Financing */}
      <StatRow label="FLUX DE FINANCEMENT"          highlight customValues={financing.map(fmt)} />
      <StatRow label="Remboursements dettes"        indent values={remboursements} customValues={remboursements.map(fmt)} isMuted />
      <StatRow label="Dividendes versés"            indent values={dividendes}     customValues={dividendes.map(fmt)} isMuted />
      {/* Summary */}
      <StatRow label="VARIATION NETTE DE TRÉSORERIE" highlight customValues={netChange.map(fmt)} />
      <StatRow label="FREE CASH FLOW"               highlight customValues={fcf.map(fmt)} />
      <StatRow label="Marge FCF %"                  customValues={YEARS.map((_, i) => pctOf(fcf[i], INCOME_DATA.revenue[i]))} isMuted />
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
        Naviguez vers <span style={{ color: BB_CYAN }}>Valeurs BVC</span>, sélectionnez un titre, puis revenez ici pour afficher ses données.
      </p>
      <p className="text-[10px] mt-2 uppercase tracking-widest" style={{ color: BB_MUTED }}>
        ou tapez un ticker dans la barre CMD
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center" style={robotoMono.style}>
      <div
        className="text-xs font-bold px-4 py-3 border rounded-sm"
        style={{ color: BB_RED, borderColor: `${BB_RED}44`, background: `${BB_RED}10` }}
      >
        ⚠ Données indisponibles — {message}
      </div>
      <button
        onClick={onRetry}
        className="text-xs font-bold px-4 py-2 rounded-sm transition-colors hover:opacity-80"
        style={{ color: '#000', background: BB_ORANGE, ...inter.style }}
      >
        ↻ Réessayer
      </button>
    </div>
  );
}

const EMPTY_DATA: FinancialsData = {
  ticker: '', sector: null, currentPrice: null, performance: null,
  marketCap: null, peRatio: null, avgVolume30d: null, ytdChange: null,
  estimatedRevenue: null, estimatedNetIncome: null, indicators: [],
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  ticker: string | null;
}

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

  return (
    <div className="h-full flex flex-col" style={{ background: BB_BG, ...robotoMono.style }}>

      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: BB_BORDER, background: BB_PANEL, ...inter.style }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
            DONNÉES
          </span>
          {ticker && (
            <>
              <span style={{ color: BB_BORDER }}>│</span>
              <span className="text-sm font-black tracking-wider" style={{ color: BB_CYAN }}>{ticker}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse" style={{ color: BB_ORANGE, ...robotoMono.style }}>
              ● CHARGEMENT...
            </span>
          )}
          {state === 'success' && data && (
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_GREEN, ...robotoMono.style }}>
              ● EN DIRECT
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest" style={{ color: BB_MUTED, ...robotoMono.style }}>
            Source : Bourse de Casablanca
          </span>
        </div>
      </div>

      {/* ── Tab bar (shown once a ticker is selected) ── */}
      {ticker && (
        <div
          className="flex items-center border-b flex-shrink-0 overflow-x-auto"
          style={{ borderColor: BB_BORDER, background: '#050b14' }}
        >
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

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto">
        {state === 'idle' && <EmptyState />}
        {state === 'error' && <ErrorState message={errorMsg} onRetry={() => ticker && load(ticker)} />}

        {(isLoading || state === 'success') && (
          <>
            {finTab === 'APERCU' && (
              <div className="p-6 space-y-5">
                <SummaryCards data={data ?? EMPTY_DATA} loading={isLoading} />
                <OverviewBlock data={data ?? { ...EMPTY_DATA, ticker: ticker ?? '' }} loading={isLoading} />
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                      ■ INDICATEURS FINANCIERS
                    </span>
                    <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
                    <span className="text-[10px]" style={{ color: BB_MUTED }}>Données annuelles (exercice le plus récent)</span>
                  </div>
                  <IndicatorsTable indicators={data?.indicators ?? []} loading={isLoading} />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-center pb-4" style={{ color: BB_MUTED }}>
                  ⚠ Les données financières sont fournies à titre indicatif et éducatif uniquement. Source : Bourse de Casablanca
                </p>
              </div>
            )}

            {finTab === 'INCOME' && (
              <div>
                <div
                  className="flex items-center justify-between px-4 py-2 border-b"
                  style={{ borderColor: BB_BORDER, background: '#050b14' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                    ■ COMPTE DE RÉSULTAT — {ticker}
                  </span>
                  <span className="text-[10px]" style={{ color: BB_MUTED }}>Données en MDH · Illustratif</span>
                </div>
                <IncomeStatement />
                <p className="px-4 py-3 text-[10px] uppercase tracking-wider border-t" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
                  ⚠ Données illustratives à titre éducatif uniquement — ne pas utiliser pour des décisions d'investissement.
                </p>
              </div>
            )}

            {finTab === 'BALANCE' && (
              <div>
                <div
                  className="flex items-center justify-between px-4 py-2 border-b"
                  style={{ borderColor: BB_BORDER, background: '#050b14' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                    ■ BILAN COMPTABLE — {ticker}
                  </span>
                  <span className="text-[10px]" style={{ color: BB_MUTED }}>Données en MDH · Illustratif</span>
                </div>
                <BalanceSheet />
                <p className="px-4 py-3 text-[10px] uppercase tracking-wider border-t" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
                  ⚠ Données illustratives à titre éducatif uniquement — ne pas utiliser pour des décisions d'investissement.
                </p>
              </div>
            )}

            {finTab === 'CASHFLOW' && (
              <div>
                <div
                  className="flex items-center justify-between px-4 py-2 border-b"
                  style={{ borderColor: BB_BORDER, background: '#050b14' }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                    ■ FLUX DE TRÉSORERIE — {ticker}
                  </span>
                  <span className="text-[10px]" style={{ color: BB_MUTED }}>Données en MDH · Illustratif</span>
                </div>
                <CashFlowStatement />
                <p className="px-4 py-3 text-[10px] uppercase tracking-wider border-t" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
                  ⚠ Données illustratives à titre éducatif uniquement — ne pas utiliser pour des décisions d'investissement.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
