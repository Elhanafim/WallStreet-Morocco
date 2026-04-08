'use client';

/**
 * MarketIndicators — "Indicateurs de Marché" terminal panel.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  BANNER: 4 KPI cards  +  collapsible Analyse AMMC 2024  │
 *  ├──────────────────────────────┬──────────────────────────┤
 *  │  Volume transactions 5 ans   │  AUM fonds collectifs    │
 *  │  (AreaChart + gradient)      │  (Donut + bar legend)    │
 *  ├──────────────────────────────┴──────────────────────────┤
 *  │  Observations DataGrid — sortable                       │
 *  └─────────────────────────────────────────────────────────┘
 *
 * Data: /public/data/ammc-indicators-2024.json
 * Hook: useAmmcIndicators()
 */

import { useState, useMemo } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAmmcIndicators } from '@/hooks/useAmmcIndicators';
import type { EnrichedObservation } from '@/types/ammc-indicators';

const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      '#040914',
  panel:   '#070E1C',
  panel2:  '#0B101E',
  glass:   'rgba(11,16,30,0.85)',
  border:  '#1E293B',
  border2: '#263448',
  orange:  '#FF9800',
  gold:    '#C9A84C',
  cyan:    '#00E5FF',
  green:   '#00E676',
  red:     '#FF1744',
  muted:   '#8B95A1',
  muted2:  '#4A5568',
  white:   '#FFFFFF',
  teal:    '#0E9F8E',
  blue:    '#2563EB',
  purple:  '#7C3AED',
  indigo:  '#4338CA',
};

const AUM_COLORS = [C.teal, C.blue, C.purple, C.gold];

// ── Number formatters ─────────────────────────────────────────────────────────
function fmtMMDH(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)} Md MDH`;
  if (v >= 1)    return `${v.toFixed(2)} Md MDH`;
  return `${(v * 1000).toFixed(0)} M MDH`;
}

function fmtMDH(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)} Md MDH`;
  return `${v.toFixed(2)} MDH`;
}

function fmtValue(value: number, unit: string): string {
  if (unit === '%')      return `${value.toFixed(2)}%`;
  if (unit === 'MMDH')   return fmtMMDH(value);
  if (unit === 'MDH')    return fmtMDH(value);
  if (unit === 'nombre') return value.toLocaleString('fr-MA');
  return `${value.toFixed(2)} ${unit}`;
}

function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

function yoyColor(v: number): string {
  return v > 0 ? C.green : v < 0 ? C.red : C.muted;
}

// ── Shared sub-atoms ──────────────────────────────────────────────────────────
function SectionHeader({ label, badge }: { label: string; badge?: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b flex-shrink-0"
      style={{ borderColor: C.border, background: 'linear-gradient(90deg, #050b18 0%, #0B101E 100%)' }}
    >
      <span
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ color: C.orange, ...mono.style }}
      >
        ■ {label}
      </span>
      {badge && (
        <span
          className="text-[9px] font-bold px-2 py-0.5 border"
          style={{ color: C.gold, borderColor: `${C.gold}55`, ...mono.style }}
        >
          {badge}
        </span>
      )}
      <div className="flex-1 h-px" style={{ background: C.border }} />
      <span className="text-[9px]" style={{ color: C.muted2, ...mono.style }}>
        AMMC · RAPPORT ANNUEL 2024
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full gap-3" style={mono.style}>
      <span
        className="text-[10px] font-bold uppercase tracking-widest animate-pulse"
        style={{ color: C.orange }}
      >
        ● CHARGEMENT INDICATEURS AMMC...
      </span>
    </div>
  );
}

// ── 1. KPI Banner ─────────────────────────────────────────────────────────────
const KPI_CONFIG = [
  {
    id:      'masi_annual_performance',
    label:   'MASI 2024',
    sub:     'Performance annuelle',
    unit:    '%',
    yoyId:   null,
    accent:  C.green,
    prefix:  '+',
  },
  {
    id:      'total_market_cap',
    label:   'CAPITALISATION',
    sub:     'Bourse de Casablanca',
    unit:    'MDH',
    yoyId:   'total_market_cap_2023',
    accent:  C.cyan,
    prefix:  '',
  },
  {
    id:      'total_transaction_volume',
    label:   'VOLUME TRANSACTIONS',
    sub:     'Volume global annuel',
    unit:    'MMDH',
    yoyId:   null,
    accent:  C.orange,
    prefix:  '',
  },
  {
    id:      'liquidity_ratio',
    label:   'RATIO LIQUIDITÉ',
    sub:     'Plus haut depuis 2011',
    unit:    '%',
    yoyId:   null,
    accent:  C.gold,
    prefix:  '',
  },
];

// Known YoY values from the report
const YOY: Record<string, number> = {
  masi_annual_performance:  22.16,
  total_market_cap:         20.18,
  total_transaction_volume: 52.29,
  liquidity_ratio:          0,       // no prior year data
};

function KpiBanner({
  onToggleAnalysis,
  showAnalysis,
}: {
  onToggleAnalysis: () => void;
  showAnalysis: boolean;
}) {
  const { getLatest, status } = useAmmcIndicators();

  return (
    <div
      className="flex items-stretch border-b flex-shrink-0"
      style={{ borderColor: C.border, background: C.border, gap: '1px' }}
    >
      {KPI_CONFIG.map(cfg => {
        const obs = getLatest(cfg.id);
        const yoy = YOY[cfg.id] ?? null;

        return (
          <div
            key={cfg.id}
            className="flex-1 flex flex-col gap-1.5 p-4 transition-colors hover:brightness-110"
            style={{
              background:  C.panel2,
              borderLeft:  `2px solid ${cfg.accent}`,
              minWidth:    0,
            }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-widest truncate"
              style={{ color: C.muted, ...mono.style }}
            >
              {cfg.label}
            </span>
            <span
              className="text-xl font-black tabular-nums leading-none"
              style={{ color: cfg.accent, ...mono.style }}
            >
              {status === 'loading' ? '—' : obs ? fmtValue(obs.value, obs.unit) : '—'}
            </span>
            {yoy != null && yoy !== 0 && (
              <span
                className="text-[11px] font-bold tabular-nums"
                style={{ color: yoyColor(yoy), ...mono.style }}
              >
                {yoy > 0 ? '▲' : '▼'} {fmtPct(yoy)} vs 2023
              </span>
            )}
            <span className="text-[9px] truncate" style={{ color: C.muted2, ...sans.style }}>
              {cfg.sub}
            </span>
          </div>
        );
      })}

      {/* Analyse toggle */}
      <button
        onClick={onToggleAnalysis}
        className="flex flex-col items-center justify-center gap-1.5 px-5 transition-all hover:brightness-125 flex-shrink-0"
        style={{
          background:  showAnalysis ? '#0f1e10' : C.panel2,
          borderLeft:  `2px solid ${showAnalysis ? C.green : C.border2}`,
          minWidth:    80,
        }}
        title="Analyse de marché AMMC 2024"
      >
        <span
          className="text-[18px] leading-none"
          style={{ color: showAnalysis ? C.green : C.muted }}
        >
          {showAnalysis ? '◀' : '▶'}
        </span>
        <span
          className="text-[8px] font-black uppercase tracking-widest text-center"
          style={{ color: showAnalysis ? C.green : C.muted, ...mono.style }}
        >
          ANALYSE
        </span>
      </button>
    </div>
  );
}

// ── 2. Collapsible analysis panel ─────────────────────────────────────────────
const ANALYSIS_SECTIONS = [
  {
    title: '1. Marché Boursier',
    color: C.cyan,
    items: [
      { label: 'MASI',                value: '+22.16%',           note: 'Hausse significative, surpasse les marchés frontières' },
      { label: 'Capitalisation',      value: '752,44 Md MAD',     note: '+20,18% vs fin 2023. Bancaire : >34% du total' },
      { label: 'Volume global',       value: '99 Md MAD',         note: '+52,29% sur un an' },
      { label: 'Ratio de liquidité',  value: '12,45%',            note: 'Plus haut niveau depuis 2011' },
    ],
  },
  {
    title: '2. Gestion Collective',
    color: C.teal,
    items: [
      { label: 'OPCVM Actif Net',     value: '653,23 Md MAD',     note: 'Collecte nette positive, 589 fonds' },
      { label: 'OPCVM Actions',       value: '+24%',              note: 'Croissance annuelle' },
      { label: 'OPCI (Immobilier)',   value: '109,34 Md MAD',     note: '55 OPCI, essor confirmé' },
      { label: 'OPCC (Capital inv.)', value: '+24%',              note: 'Croissance robuste' },
    ],
  },
  {
    title: '3. Prêt de Titres',
    color: C.gold,
    items: [
      { label: 'Volume annuel',       value: '347,47 Md MAD',     note: '+10,25% — record absolu' },
      { label: 'Encours',             value: '36,3 Md MAD',       note: 'Stratégies de gestion en hausse' },
    ],
  },
];

function AnalysisPanel() {
  return (
    <div
      className="h-full overflow-y-auto flex-shrink-0"
      style={{ width: 340, background: '#040c14', borderLeft: `1px solid ${C.border}` }}
    >
      <div
        className="px-4 py-2.5 border-b sticky top-0"
        style={{ borderColor: C.border, background: '#040c14' }}
      >
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange, ...mono.style }}>
          ■ NOTE ANALYTIQUE — AMMC 2024
        </span>
      </div>

      <div className="p-4 space-y-5">
        {ANALYSIS_SECTIONS.map(sec => (
          <div key={sec.title}>
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: sec.color, ...mono.style }}
            >
              {sec.title}
            </p>
            <div className="space-y-1">
              {sec.items.map(item => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-3 py-1.5 border-b"
                  style={{ borderColor: C.border }}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold" style={{ color: C.white, ...mono.style }}>{item.label}</p>
                    <p className="text-[9px] leading-tight mt-0.5" style={{ color: C.muted, ...sans.style }}>{item.note}</p>
                  </div>
                  <span
                    className="text-[10px] font-black tabular-nums flex-shrink-0"
                    style={{ color: sec.color, ...mono.style }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          className="mt-4 p-3 border-l-2 text-[9px] leading-relaxed"
          style={{ borderColor: C.gold, background: '#0d1a0a', color: C.muted, ...sans.style }}
        >
          La diversification des produits (OPCI, OPCC) et l&apos;amélioration de la liquidité
          boursière font de 2024 une année charnière pour l&apos;attractivité du hub financier marocain.
        </div>

        <p className="text-[8px] uppercase tracking-widest" style={{ color: C.muted2, ...mono.style }}>
          Source: Rapport Annuel AMMC 2024 · Ch. II · pp. 54–75
        </p>
      </div>
    </div>
  );
}

// ── 3. Volume line/area chart ─────────────────────────────────────────────────
function VolumeChart() {
  const { getTimeSeries, status } = useAmmcIndicators();

  const data = useMemo(() => {
    const series = getTimeSeries('total_transaction_volume');
    return series.map(o => ({ year: String(o.year), value: o.value }));
  }, [getTimeSeries]);

  const CustomTooltip = ({
    active, payload, label,
  }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="border px-3 py-2"
        style={{ background: C.panel2, borderColor: C.border, ...mono.style }}
      >
        <p className="text-[10px] font-black uppercase mb-1" style={{ color: C.orange }}>{label}</p>
        <p className="text-[12px] font-bold" style={{ color: C.cyan }}>
          {fmtMMDH(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: C.panel }}>
      <SectionHeader label="Volume Transactionnel — Évolution 5 Ans" badge="MMDH" />
      <div className="flex-1 p-4">
        {status === 'loading' ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-[10px] animate-pulse" style={{ color: C.muted, ...mono.style }}>CHARGEMENT...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C.border} strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}`}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={C.cyan}
                strokeWidth={2.5}
                fill="url(#volGrad)"
                dot={{ fill: C.cyan, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: C.orange, stroke: C.panel2, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini stats row */}
      <div
        className="grid grid-cols-3 border-t gap-px"
        style={{ borderColor: C.border, background: C.border }}
      >
        {[
          { label: '2020',  value: '55,78 Md',  color: C.muted  },
          { label: '2023',  value: '65,05 Md',  color: C.muted  },
          { label: '2024',  value: '99,06 Md',  color: C.cyan   },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-0.5 py-2" style={{ background: C.panel2 }}>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>{s.label}</span>
            <span className="text-[11px] font-black tabular-nums" style={{ color: s.color, ...mono.style }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. AUM donut + bar chart ──────────────────────────────────────────────────
const AUM_IDS = [
  { id: 'opcvm_total_aum',  label: 'OPCVM',  short: 'OPCVM' },
  { id: 'opci_total_aum',   label: 'OPCI',   short: 'OPCI'  },
  { id: 'fpct_total_aum',   label: 'FPCT',   short: 'FPCT'  },
  { id: 'opcc_total_aum',   label: 'OPCC',   short: 'OPCC'  },
];

const OPCVM_BREAKDOWN = [
  { label: 'Monetaire / Obl.', value: 523.20, color: C.teal   },  // 653.23 - 53.56 - 76.47
  { label: 'Diversifiés',      value: 76.47,  color: C.blue   },
  { label: 'Actions',          value: 53.56,  color: C.cyan   },
];

function AumChart() {
  const { getLatest, status } = useAmmcIndicators();
  const [hovered, setHovered] = useState<string | null>(null);

  const donutData = useMemo(() => AUM_IDS.map((cfg, i) => {
    const obs = getLatest(cfg.id);
    return { name: cfg.label, value: obs?.value ?? 0, color: AUM_COLORS[i] };
  }), [getLatest]);

  const total = donutData.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="border px-3 py-2"
        style={{ background: C.panel2, borderColor: C.border, ...mono.style }}
      >
        <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: C.orange }}>{payload[0].name}</p>
        <p className="text-[12px] font-bold" style={{ color: C.white }}>{fmtMMDH(payload[0].value)}</p>
        <p className="text-[9px]" style={{ color: C.muted }}>
          {total > 0 ? `${((payload[0].value / total) * 100).toFixed(1)}% du total` : ''}
        </p>
      </div>
    );
  };

  const barData = OPCVM_BREAKDOWN.map(d => ({ name: d.label, value: d.value }));

  return (
    <div className="flex flex-col h-full" style={{ background: C.panel }}>
      <SectionHeader label="Actif Net — Fonds Collectifs 2024" badge="MMDH" />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Donut section */}
        <div className="flex items-center gap-4 p-4 flex-shrink-0">
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            {status !== 'loading' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={54}
                    dataKey="value"
                    strokeWidth={0}
                    paddingAngle={2}
                    onMouseEnter={e => setHovered((e as unknown as {name:string}).name)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {donutData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        opacity={hovered === null || hovered === entry.name ? 1 : 0.35}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {donutData.map((d, i) => {
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 cursor-default"
                  onMouseEnter={() => setHovered(d.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="w-2 h-2 flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[9px] flex-1 truncate" style={{ color: hovered === d.name ? C.white : C.muted, ...mono.style }}>
                    {d.name}
                  </span>
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: d.color, ...mono.style }}>
                    {fmtMMDH(d.value)}
                  </span>
                  <span className="text-[9px] w-10 text-right" style={{ color: C.muted, ...mono.style }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
            <div className="mt-1 pt-1.5 border-t flex justify-between" style={{ borderColor: C.border }}>
              <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: C.muted, ...mono.style }}>TOTAL</span>
              <span className="text-[10px] font-black" style={{ color: C.white, ...mono.style }}>{fmtMMDH(total)}</span>
            </div>
          </div>
        </div>

        {/* OPCVM breakdown bar chart */}
        <div className="flex-1 px-4 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: C.teal, ...mono.style }}>
            OPCVM — Répartition par type
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <XAxis
                type="number"
                tick={{ fill: C.muted, fontSize: 8, fontFamily: 'Roboto Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }}
                axisLine={false}
                tickLine={false}
                width={84}
              />
              <Tooltip
                contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
                formatter={(v: number) => fmtMMDH(v)}
              />
              {OPCVM_BREAKDOWN.map((d, i) => (
                <Bar key={i} dataKey="value" fill={d.color} radius={[0, 2, 2, 0]} barSize={10}>
                  {barData.map((_, j) => (
                    <Cell key={j} fill={OPCVM_BREAKDOWN[j]?.color ?? C.teal} />
                  ))}
                </Bar>
              )).slice(0, 1)}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── 5. Observations datagrid ──────────────────────────────────────────────────
type SortKey = 'label_fr' | 'year' | 'value' | 'unit' | 'category';
type SortDir = 'asc' | 'desc';

const CATEGORY_COLORS: Record<string, string> = {
  'Marche boursier':   C.cyan,
  'Gestion collective': C.teal,
  'Supervision':        C.gold,
};

function ObservationsGrid() {
  const { enriched, status } = useAmmcIndicators();
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter,  setFilter]  = useState('');

  const rows = useMemo(() => {
    let list = filter.trim()
      ? enriched.filter(o =>
          o.label_fr.toLowerCase().includes(filter.toLowerCase()) ||
          o.category.toLowerCase().includes(filter.toLowerCase()) ||
          String(o.year).includes(filter)
        )
      : [...enriched];

    list.sort((a, b) => {
      let av: string | number = a[sortKey as keyof EnrichedObservation] as string | number;
      let bv: string | number = b[sortKey as keyof EnrichedObservation] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [enriched, sortKey, sortDir, filter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: C.muted2 }}> ↕</span>;
    return <span style={{ color: C.orange }}> {sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const cols: { key: SortKey; label: string; align: 'left' | 'right'; width: string }[] = [
    { key: 'label_fr',  label: 'Indicateur',   align: 'left',  width: 'minmax(160px,1fr)' },
    { key: 'category',  label: 'Catégorie',    align: 'left',  width: '160px'             },
    { key: 'year',      label: 'Année',        align: 'right', width: '70px'              },
    { key: 'value',     label: 'Valeur',       align: 'right', width: '140px'             },
    { key: 'unit',      label: 'Unité',        align: 'left',  width: '72px'              },
  ];

  const gridTemplate = cols.map(c => c.width).join(' ');

  return (
    <div className="flex flex-col" style={{ background: C.panel }}>
      <SectionHeader label="Tableau de Bord — Observations" badge={`${rows.length} lignes`} />

      {/* Search filter */}
      <div className="px-4 py-2 border-b flex items-center gap-3" style={{ borderColor: C.border }}>
        <span className="text-[10px] font-bold" style={{ color: C.muted, ...mono.style }}>FILTRE</span>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Indicateur, catégorie, année…"
          className="flex-1 bg-transparent outline-none text-[11px]"
          style={{
            color: C.white,
            borderBottom: `1px solid ${C.border2}`,
            paddingBottom: '2px',
            ...mono.style,
          }}
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            className="text-[10px] hover:opacity-80"
            style={{ color: C.muted }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Header row */}
      <div
        className="grid px-4 py-2 text-[9px] font-black uppercase tracking-widest border-b flex-shrink-0"
        style={{ gridTemplateColumns: gridTemplate, borderColor: C.border, background: '#040d1a', gap: '12px', ...mono.style }}
      >
        {cols.map(col => (
          <button
            key={col.key}
            onClick={() => toggleSort(col.key)}
            className={`flex items-center gap-0.5 hover:opacity-90 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}
            style={{ color: sortKey === col.key ? C.orange : C.muted }}
          >
            {col.label}
            <SortIndicator col={col.key} />
          </button>
        ))}
      </div>

      {/* Data rows */}
      <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
        {status === 'loading' && (
          <div className="flex items-center justify-center py-10">
            <span className="text-[10px] animate-pulse" style={{ color: C.muted, ...mono.style }}>CHARGEMENT...</span>
          </div>
        )}
        {status === 'ready' && rows.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <span className="text-[10px]" style={{ color: C.muted, ...mono.style }}>Aucun résultat</span>
          </div>
        )}
        {rows.map((row, i) => {
          const catColor = CATEGORY_COLORS[row.category] ?? C.muted;
          const isLatest = row.year === 2024;
          return (
            <div
              key={`${row.indicator_id}-${row.year}`}
              className="grid px-4 py-2.5 border-b hover:bg-[#0F1A2A] transition-colors"
              style={{
                gridTemplateColumns: gridTemplate,
                borderColor: C.border,
                background: i % 2 === 0 ? C.panel : C.panel2,
                gap: '12px',
                ...mono.style,
              }}
            >
              <span
                className="text-[11px] font-medium truncate pr-2"
                style={{ color: isLatest ? C.white : C.muted }}
                title={row.label_fr}
              >
                {row.label_fr}
              </span>
              <span className="text-[9px] font-bold truncate" style={{ color: catColor }}>
                {row.subcategory || row.category}
              </span>
              <span
                className="text-[10px] tabular-nums text-right font-bold"
                style={{ color: isLatest ? C.gold : C.muted2 }}
              >
                {row.year}
              </span>
              <span
                className="text-[11px] font-bold tabular-nums text-right"
                style={{ color: isLatest ? C.cyan : C.white }}
              >
                {fmtValue(row.value, row.unit)}
              </span>
              <span className="text-[9px]" style={{ color: C.muted2 }}>
                {row.unit}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2 border-t flex items-center justify-between"
        style={{ borderColor: C.border, background: '#040d1a' }}
      >
        <span className="text-[9px]" style={{ color: C.muted2, ...mono.style }}>
          {enriched.filter(o => o.year === 2024).length} observations 2024 · {enriched.length} total
        </span>
        <span className="text-[9px]" style={{ color: C.muted2, ...mono.style }}>
          SOURCE: AMMC RAPPORT ANNUEL 2024 · EXTRACTION 2026-04-08
        </span>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export default function MarketIndicators() {
  const { status } = useAmmcIndicators();
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (status === 'error') {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-3"
        style={{ background: C.bg, ...mono.style }}
      >
        <span className="text-[11px] font-bold uppercase" style={{ color: C.red }}>
          ⚠ Données AMMC indisponibles
        </span>
        <span className="text-[9px]" style={{ color: C.muted }}>
          /public/data/ammc-indicators-2024.json introuvable
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: C.bg, ...mono.style }}
    >
      {/* ── Header strip ── */}
      <div
        className="flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: C.border, background: C.panel2 }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: C.orange, ...mono.style }}
          >
            INDICATEURS DE MARCHÉ
          </span>
          <span style={{ color: C.border }}>│</span>
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>
            AMMC · RAPPORT ANNUEL 2024
          </span>
        </div>
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest animate-pulse"
              style={{ color: C.orange, ...mono.style }}
            >
              ● CHARGEMENT...
            </span>
          )}
          {status === 'ready' && (
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: C.green, ...mono.style }}
            >
              ● DONNÉES CHARGÉES
            </span>
          )}
          <span
            className="text-[9px] px-2 py-0.5 border font-bold"
            style={{ color: C.gold, borderColor: `${C.gold}55`, ...mono.style }}
          >
            FY 2024
          </span>
        </div>
      </div>

      {/* ── KPI Banner ── */}
      <KpiBanner onToggleAnalysis={() => setShowAnalysis(v => !v)} showAnalysis={showAnalysis} />

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto min-w-0">

          {/* Charts row */}
          <div
            className="grid flex-shrink-0 border-b"
            style={{
              borderColor: C.border,
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              background: C.border,
              minHeight: 280,
            }}
          >
            <VolumeChart />
            <AumChart />
          </div>

          {/* DataGrid */}
          <ObservationsGrid />
        </div>

        {/* Analysis side panel — slide in */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300"
          style={{ width: showAnalysis ? 340 : 0 }}
        >
          {showAnalysis && <AnalysisPanel />}
        </div>
      </div>
    </div>
  );
}
