'use client';

import { Roboto_Mono } from 'next/font/google';
import type { FinancialsData } from './financials.api';
import { fmtMAD, fmtPct, fmtVolume, fmtPrice } from './financials.api';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_ORANGE = '#FF9800';
const BB_GREEN  = '#00E676';
const BB_RED    = '#FF1744';
const BB_MUTED  = '#8B95A1';
const BB_WHITE  = '#FFFFFF';
const BB_BORDER = '#1E293B';

function pctColor(v: number | null): string {
  if (v == null) return BB_MUTED;
  return v > 0 ? BB_GREEN : v < 0 ? BB_RED : BB_MUTED;
}

// ── Card definitions ──────────────────────────────────────────────────────────
interface CardDef {
  label: string;
  subtext?: string;
  getValue: (d: FinancialsData) => string;
  getColor?: (d: FinancialsData) => string;
}

const CARDS: CardDef[] = [
  {
    label: 'Capitalisation',
    subtext: 'Marché primaire',
    getValue: d => fmtMAD(d.marketCap),
  },
  {
    label: 'P/E Ratio',
    subtext: 'TTM',
    getValue: d => d.peRatio != null ? d.peRatio.toFixed(1) : '—',
  },
  {
    label: 'Volume Moyen',
    subtext: 'Derniers 30 jours',
    getValue: d => fmtVolume(d.avgVolume30d),
  },
  {
    label: 'Variation YTD',
    subtext: 'Année en cours',
    getValue: d => fmtPct(d.ytdChange),
    getColor: d => pctColor(d.ytdChange),
  },
  {
    label: 'Revenus',
    subtext: 'Dernier exercice',
    getValue: d => fmtMAD(d.revenue ?? d.estimatedRevenue),
  },
  {
    label: 'Résultat Net',
    subtext: 'Dernier exercice',
    getValue: d => fmtMAD(d.netIncome ?? d.estimatedNetIncome),
  },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="flex flex-col gap-2 p-4 border border-[#1E293B] bg-[#0B101E] animate-pulse"
      style={{ borderLeft: `2px solid ${BB_ORANGE}44` }}
    >
      <div className="h-2 rounded bg-[#1E293B] w-1/2" />
      <div className="h-6 rounded bg-[#1E293B] w-2/3 mt-1" />
      <div className="h-2 rounded bg-[#1E293B] w-1/3 mt-1" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  data: FinancialsData;
  loading?: boolean;
}

export default function SummaryCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1E293B]">
        {CARDS.map(c => <SkeletonCard key={c.label} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1E293B]">
      {CARDS.map(card => {
        const value = card.getValue(data);
        const valueColor = card.getColor ? card.getColor(data) : BB_WHITE;

        return (
          <div
            key={card.label}
            className="flex flex-col gap-1 p-4 bg-[#0B101E] hover:bg-[#0f1929] transition-colors"
            style={{
              borderLeft: `2px solid ${BB_ORANGE}`,
              ...robotoMono.style,
            }}
          >
            {/* Label */}
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: BB_MUTED }}
            >
              {card.label}
            </span>

            {/* Value */}
            <span
              className="text-xl font-black tabular-nums leading-tight truncate"
              style={{ color: valueColor }}
            >
              {value}
            </span>

            {/* Subtext */}
            {card.subtext && (
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: BB_MUTED }}
              >
                {card.subtext}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
