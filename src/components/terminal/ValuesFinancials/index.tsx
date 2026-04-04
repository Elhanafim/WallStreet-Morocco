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

// ── Empty state placeholder ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4 text-center"
      style={robotoMono.style}
    >
      <div className="text-4xl" style={{ color: BB_MUTED }}>◈</div>
      <p className="text-sm font-bold" style={{ color: BB_ORANGE }}>
        Sélectionnez une valeur BVC
      </p>
      <p className="text-xs max-w-xs" style={{ color: BB_MUTED }}>
        Naviguez vers <span style={{ color: BB_CYAN }}>Valeurs BVC</span>, sélectionnez un titre, puis revenez ici pour afficher ses données financières.
      </p>
      <p className="text-[10px] mt-2 uppercase tracking-widest" style={{ color: BB_MUTED }}>
        ou tapez un ticker dans la barre CMD
      </p>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4 text-center"
      style={robotoMono.style}
    >
      <div
        className="text-xs font-bold px-4 py-3 border rounded-sm"
        style={{ color: BB_RED, borderColor: `${BB_RED}44`, background: `${BB_RED}10` }}
      >
        ⚠ Données indisponibles — {message}
      </div>
      <button
        onClick={onRetry}
        className="text-xs font-bold px-4 py-2 rounded-sm transition-colors hover:opacity-80"
        style={{
          color: '#000',
          background: BB_ORANGE,
          ...inter.style,
        }}
      >
        ↻ Réessayer
      </button>
    </div>
  );
}

// ── EMPTY data template (used for skeleton while loading) ─────────────────────
const EMPTY_DATA: FinancialsData = {
  ticker: '',
  sector: null,
  currentPrice: null,
  performance: null,
  marketCap: null,
  peRatio: null,
  avgVolume30d: null,
  ytdChange: null,
  estimatedRevenue: null,
  estimatedNetIncome: null,
  indicators: [],
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  /** The currently selected BVC ticker, e.g. "NKL". Null = nothing selected. */
  ticker: string | null;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export default function ValuesFinancials({ ticker }: Props) {
  const [state, setState] = useState<FetchState>('idle');
  const [data, setData] = useState<FinancialsData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (!ticker) {
      setState('idle');
      setData(null);
      return;
    }
    load(ticker);
  }, [ticker, load]);

  const isLoading = state === 'loading';

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: BB_BG, ...robotoMono.style }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-[#1E293B] bg-[#0B101E] flex-shrink-0"
        style={inter.style}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-black uppercase tracking-widest"
            style={{ color: BB_ORANGE }}
          >
            VALEURS FINANCIALS
          </span>
          {ticker && (
            <>
              <span style={{ color: BB_BORDER }}>│</span>
              <span
                className="text-sm font-black tracking-wider"
                style={{ color: BB_CYAN }}
              >
                {ticker}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest animate-pulse"
              style={{ color: BB_ORANGE, ...robotoMono.style }}
            >
              ● CHARGEMENT...
            </span>
          )}
          {state === 'success' && data && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: BB_GREEN, ...robotoMono.style }}
            >
              ● EN DIRECT
            </span>
          )}
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: BB_MUTED, ...robotoMono.style }}
          >
            Source : Bourse de Casablanca
          </span>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="p-6 space-y-5">
        {state === 'idle' && <EmptyState />}

        {state === 'error' && (
          <ErrorState message={errorMsg} onRetry={() => ticker && load(ticker)} />
        )}

        {(isLoading || state === 'success') && (
          <>
            {/* 6 Summary Cards */}
            <SummaryCards
              data={data ?? EMPTY_DATA}
              loading={isLoading}
            />

            {/* Financial Overview Block */}
            <OverviewBlock
              data={data ?? { ...EMPTY_DATA, ticker: ticker ?? '' }}
              loading={isLoading}
            />

            {/* Financial Indicators Table */}
            <div style={robotoMono.style}>
              {/* Table section label */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: BB_ORANGE }}
                >
                  ■ INDICATEURS FINANCIERS
                </span>
                <div className="flex-1 h-px" style={{ background: BB_BORDER }} />
                <span className="text-[10px]" style={{ color: BB_MUTED }}>
                  Données annuelles (exercice le plus récent)
                </span>
              </div>

              <IndicatorsTable
                indicators={data?.indicators ?? []}
                loading={isLoading}
              />
            </div>

            {/* Disclaimer */}
            <p
              className="text-[10px] uppercase tracking-wider text-center pb-4"
              style={{ color: BB_MUTED }}
            >
              ⚠ Les données financières sont fournies à titre indicatif et éducatif uniquement. Source : Bourse de Casablanca
            </p>
          </>
        )}
      </div>
    </div>
  );
}
