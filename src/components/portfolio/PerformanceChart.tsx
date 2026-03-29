'use client';
import { useState, useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { DailySnapshot } from '@/services/performanceService';

type Range = '1M' | '3M' | 'All';

const RANGES: { label: string; value: Range }[] = [
  { label: '1 mois', value: '1M' },
  { label: '3 mois', value: '3M' },
  { label: 'Tout', value: 'All' },
];

function fmtMAD(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return n.toFixed(0);
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload.find((p) => p.name === 'Valeur actuelle')?.value ?? 0;
  const cost = payload.find((p) => p.name === 'Capital investi')?.value ?? 0;
  const gain = value - cost;
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
  const positive = gain >= 0;
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-primary/60 mb-2">{label ? fmtDate(label) : ''}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-primary/50">Valeur</span>
          <span className="font-bold text-primary">{fmtMAD(value)} MAD</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-primary/50">Investi</span>
          <span className="font-semibold text-primary/70">{fmtMAD(cost)} MAD</span>
        </div>
        <div className={`flex justify-between gap-4 pt-1 border-t border-surface-100 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          <span>G/P</span>
          <span className="font-bold">{positive ? '+' : ''}{fmtMAD(gain)} ({positive ? '+' : ''}{gainPct.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  snapshots: DailySnapshot[];
  totalCost: number;
}

const PerformanceChart = memo(function PerformanceChart({ snapshots, totalCost }: Props) {
  const [range, setRange] = useState<Range>('3M');

  const filtered = useMemo(() => {
    if (snapshots.length === 0) return [];
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    if (range === 'All') return sorted;
    const now = new Date();
    const cutoff = new Date(now);
    if (range === '1M') cutoff.setMonth(now.getMonth() - 1);
    else cutoff.setMonth(now.getMonth() - 3);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const result = sorted.filter((s) => s.date >= cutoffStr);
    return result.length >= 2 ? result : sorted.slice(-2);
  }, [snapshots, range]);

  const latestValue = filtered.at(-1)?.totalValue ?? totalCost;
  const overallGain = latestValue - totalCost;
  const positive = overallGain >= 0;

  const gradientId = positive ? 'gradGreen' : 'gradRed';
  const fillColor = positive ? '#10b981' : '#ef4444';
  const strokeColor = positive ? '#059669' : '#dc2626';

  if (snapshots.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 text-center">
        <p className="text-sm text-primary/40">
          Le graphique de performance s&apos;affichera après 2 jours de données.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-sm text-primary">Performance du portefeuille</h3>
          <p className={`text-xs mt-0.5 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? '+' : ''}{fmtMAD(overallGain)} MAD ({positive ? '+' : ''}{totalCost > 0 ? ((overallGain / totalCost) * 100).toFixed(2) : '0.00'}%) depuis l&apos;origine
          </p>
        </div>
        <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                range === r.value
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-primary/40 hover:text-primary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => fmtDate(v)}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => fmtMAD(v)}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={totalCost}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="totalCost"
            name="Capital investi"
            stroke="#cbd5e1"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="totalValue"
            name="Valeur actuelle"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default PerformanceChart;
