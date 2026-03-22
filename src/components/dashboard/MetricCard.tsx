import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeSuffix?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  badge?: string;
}

export default function MetricCard({
  label,
  value,
  change,
  changeSuffix = '%',
  icon: Icon,
  iconColor = 'text-secondary',
  iconBg = 'bg-secondary/10',
  trend,
  badge,
}: MetricCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig = {
    up: {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: TrendingUp,
      label: '+',
    },
    down: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      icon: TrendingDown,
      label: '',
    },
    neutral: {
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      icon: Minus,
      label: '',
    },
  };

  const config = trendConfig[resolvedTrend];
  const TrendIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-black text-[#0A2540] mb-3 tracking-tight">{value}</p>

      {change !== undefined && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
          <TrendIcon className={`w-3 h-3 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color}`}>
            {resolvedTrend === 'up' ? '+' : ''}{change.toFixed(2)}{changeSuffix}
          </span>
        </div>
      )}
    </div>
  );
}
