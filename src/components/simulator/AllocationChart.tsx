'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Allocation } from '@/types';

interface AllocationChartProps {
  allocations: Allocation[];
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Allocation; value: number; name: string }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }} className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{data.name}</span>
        </div>
        <p className="font-medium text-xl mt-1" style={{ color: 'var(--gold)' }}>{data.percentage}%</p>
      </div>
    );
  }
  return null;
}

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AllocationChart({ allocations, title = "Allocation du portefeuille" }: AllocationChartProps) {
  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-primary mb-4">{title}</h4>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={allocations}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="percentage"
            nameKey="name"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {allocations.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2.5 mt-2">
        {allocations.map((allocation) => (
          <div key={allocation.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: allocation.color }}
              />
              <span className="text-sm text-primary font-medium">{allocation.name}</span>
            </div>
            <span className="text-sm font-medium text-primary">{allocation.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
