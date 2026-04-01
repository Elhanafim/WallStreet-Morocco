'use client';

import { Roboto_Mono, Inter } from 'next/font/google';
import { fmtPct, fmtPrice } from './financials.api';
import type { FinancialsData } from './financials.api';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_ORANGE = '#FF9800';
const BB_MUTED  = '#8B95A1';
const BB_WHITE  = '#FFFFFF';
const BB_CYAN   = '#00E5FF';
const BB_GREEN  = '#00E676';
const BB_RED    = '#FF1744';
const BB_BORDER = '#1E293B';

function pctColor(v: number | null): string {
  if (v == null) return BB_MUTED;
  return v > 0 ? BB_GREEN : v < 0 ? BB_RED : BB_MUTED;
}

interface Props {
  data: FinancialsData;
  loading?: boolean;
}

export default function OverviewBlock({ data, loading }: Props) {
  const { ticker, sector, currentPrice, performance } = data;

  if (loading) {
    return (
      <div
        className="border border-[#1E293B] bg-[#0B101E] p-6 space-y-3 animate-pulse"
        style={robotoMono.style}
      >
        <div className="h-4 bg-[#1E293B] rounded w-1/3 mb-2" />
        <div className="h-3 bg-[#1E293B] rounded w-1/4" />
        <div className="h-3 bg-[#1E293B] rounded w-1/5" />
        <div className="h-3 bg-[#1E293B] rounded w-1/2 mt-4" />
      </div>
    );
  }

  const perfColor = pctColor(performance);

  return (
    <div
      className="border border-[#1E293B] bg-[#0B101E] overflow-hidden"
    >
      {/* Block header */}
      <div
        className="px-5 py-2 border-b border-[#1E293B] bg-[#0A0F1D] flex items-center gap-2"
        style={robotoMono.style}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
          ■ APERÇU FINANCIER
        </span>
        {ticker && (
          <>
            <span style={{ color: BB_BORDER }}>—</span>
            <span className="text-xs font-black tracking-widest" style={{ color: BB_CYAN }}>
              {ticker}
            </span>
          </>
        )}
      </div>

      <div className="p-5 space-y-2" style={robotoMono.style}>
        {/* Fields row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BB_MUTED }}>
              Secteur
            </span>
            <span className="text-sm font-bold" style={{ color: BB_WHITE }}>
              {sector || '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BB_MUTED }}>
              Cours actuel
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color: BB_WHITE }}>
              {currentPrice != null ? `${fmtPrice(currentPrice)} MAD` : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BB_MUTED }}>
              Performance
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: perfColor }}
            >
              {performance != null
                ? `${performance >= 0 ? (performance > 0 ? 'Haussière' : 'Stable') : 'Baissière'} de ${fmtPct(performance)}`
                : '—'}
            </span>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-[11px] pt-3 border-t border-[#1E293B]" style={{ color: BB_MUTED }}>
          Données détaillées disponibles dans les onglets ci-dessus. Cliquez sur &quot;TradingView&quot; pour accéder aux données financières complètes.
        </p>
      </div>
    </div>
  );
}
