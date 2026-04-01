'use client';

import { Roboto_Mono } from 'next/font/google';
import type { FinancialIndicator } from './financials.api';
import { fmtMAD, fmtPct } from './financials.api';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_GREEN  = '#00E676';
const BB_RED    = '#FF1744';
const BB_MUTED  = '#8B95A1';
const BB_WHITE  = '#FFFFFF';
const BB_ORANGE = '#FF9800';
const BB_BORDER = '#1E293B';
const BB_PANEL  = '#0B101E';
const BB_BG2    = '#0A0F1D';

const SKELETON_ROWS = [
  "Chiffre d'affaires",
  'EBITDA',
  'Résultat net',
  'Actifs totaux',
  'Capitaux propres',
];

function SkeletonRow() {
  return (
    <div
      className="grid items-center py-4 px-6 border-b border-[#1E293B] animate-pulse"
      style={{
        gridTemplateColumns: 'minmax(200px,1fr) 200px 120px',
        gap: '24px',
      }}
    >
      <div className="h-3 rounded bg-[#1E293B] w-2/3" />
      <div className="h-3 rounded bg-[#1E293B] w-1/2 ml-auto" />
      <div className="h-3 rounded bg-[#1E293B] w-16 ml-auto" />
    </div>
  );
}

interface Props {
  indicators: FinancialIndicator[];
  loading?: boolean;
}

export default function IndicatorsTable({ indicators, loading }: Props) {
  const rows = loading ? SKELETON_ROWS.map(name => ({ name, value: null, trend: null })) : indicators;

  return (
    <div
      className="border border-[#1E293B] bg-[#0B101E] overflow-hidden"
      style={robotoMono.style}
    >
      {/* Table Header */}
      <div
        className="grid items-center px-6 py-3 bg-[#0A0F1D] border-b border-[#1E293B] text-xs font-bold uppercase tracking-widest"
        style={{
          gridTemplateColumns: 'minmax(200px,1fr) 200px 120px',
          gap: '24px',
          color: BB_ORANGE,
        }}
      >
        <span>Indicateur</span>
        <span className="text-right">Valeur</span>
        <span className="text-right">Tendance</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#1E293B]">
        {loading
          ? SKELETON_ROWS.map(name => <SkeletonRow key={name} />)
          : rows.map((row, i) => {
              const trendColor =
                row.trend == null ? BB_MUTED :
                row.trend > 0     ? BB_GREEN :
                                    BB_RED;
              const trendBg =
                row.trend == null ? 'transparent' :
                row.trend > 0     ? '#00e67612' :
                                    '#ff174412';

              return (
                <div
                  key={row.name ?? i}
                  className="grid items-center px-6 py-4 hover:bg-[#0f1929] transition-colors"
                  style={{
                    gridTemplateColumns: 'minmax(200px,1fr) 200px 120px',
                    gap: '24px',
                  }}
                >
                  {/* Indicateur */}
                  <span
                    className="text-sm font-bold"
                    style={{ color: BB_WHITE }}
                  >
                    {row.name}
                  </span>

                  {/* Valeur */}
                  <span
                    className="text-sm font-bold tabular-nums text-right"
                    style={{ color: BB_WHITE }}
                  >
                    {row.value == null ? '—' : fmtMAD(row.value)}
                  </span>

                  {/* Tendance */}
                  <div className="flex justify-end">
                    {row.trend == null ? (
                      <span style={{ color: BB_MUTED }}>—</span>
                    ) : (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-sm tabular-nums"
                        style={{
                          color: trendColor,
                          background: trendBg,
                          border: `1px solid ${trendColor}44`,
                        }}
                      >
                        {row.trend >= 0 ? '▲' : '▼'} {fmtPct(Math.abs(row.trend))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {rows.length === 0 && !loading && (
        <div
          className="px-6 py-12 text-center text-sm"
          style={{ color: BB_MUTED, ...robotoMono.style }}
        >
          Données indisponibles pour cet indicateur.
        </div>
      )}
    </div>
  );
}
