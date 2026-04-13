'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { SimulatorResult } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PortfolioChartProps {
  data: SimulatorResult[];
  monthlyAmount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary border border-secondary/30 rounded-xl p-4 shadow-2xl min-w-[200px]">
        <p className="text-accent font-medium text-sm mb-3">Année {label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 mb-1.5">
            <span className="flex items-center gap-1.5 text-white/70 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-white font-medium text-xs">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function PortfolioChart({ data, monthlyAmount }: PortfolioChartProps) {
  const chartData = data.map((d) => ({
    year: d.year,
    'Valeur totale': Math.round(d.value),
    'Capital investi': Math.round(d.contributions),
    'Plus-values': Math.round(d.returns),
  }));

  const finalValue = data[data.length - 1]?.value || 0;
  const totalContributions = data[data.length - 1]?.contributions || 0;
  const totalGains = finalValue - totalContributions;
  const gainPercent = totalContributions > 0 ? ((totalGains / totalContributions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-primary/5 rounded-xl p-3 text-center">
          <p className="text-primary/50 text-xs mb-1">Capital investi</p>
          <p className="text-primary font-medium text-sm">
            {formatCurrency(totalContributions)}
          </p>
        </div>
        <div className="bg-success/10 rounded-xl p-3 text-center">
          <p className="text-success/70 text-xs mb-1">Valeur finale</p>
          <p className="text-success font-medium text-sm">
            {formatCurrency(finalValue)}
          </p>
        </div>
        <div className="bg-accent/10 rounded-xl p-3 text-center">
          <p className="text-accent/70 text-xs mb-1">Plus-values</p>
          <p className="text-accent font-medium text-sm">
            +{gainPercent}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3A86FF" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickFormatter={(val) => `An ${val}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickFormatter={(val) => {
              if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
              if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
              return val.toString();
            }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="Capital investi"
            stroke="#D4AF37"
            strokeWidth={2}
            fill="url(#colorContributions)"
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: '#D4AF37' }}
          />
          <Area
            type="monotone"
            dataKey="Valeur totale"
            stroke="#3A86FF"
            strokeWidth={2.5}
            fill="url(#colorValue)"
            dot={false}
            activeDot={{ r: 5, fill: '#3A86FF', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
