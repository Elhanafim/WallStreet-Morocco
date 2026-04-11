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
  iconColor = 'text-[#C9A84C]',
  iconBg = 'bg-[#C9A84C]/10',
  trend,
  badge,
}: MetricCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig = {
    up: {
      color: 'text-[#2ECC71]',
      bg:    'bg-[#2ECC71]/10 border border-[#2ECC71]/20',
      icon:  TrendingUp,
    },
    down: {
      color: 'text-[#E74C3C]',
      bg:    'bg-[#E74C3C]/10 border border-[#E74C3C]/20',
      icon:  TrendingDown,
    },
    neutral: {
      color: 'text-[#A8B4C8]',
      bg:    'bg-white/5 border border-white/10',
      icon:  Minus,
    },
  };

  const config = trendConfig[resolvedTrend];
  const TrendIcon = config.icon;

  return (
    <div className="bg-[#112240] rounded-2xl p-6 border border-[#C9A84C]/12 hover:border-[#C9A84C]/25 hover:shadow-card-hover transition-all duration-300 geo-corner">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm text-[#A8B4C8] font-medium mb-1 font-sans">{label}</p>
      <p className="text-2xl font-black text-white mb-3 tracking-tight font-mono">{value}</p>

      {change !== undefined && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
          <TrendIcon className={`w-3 h-3 ${config.color}`} />
          <span className={`text-xs font-semibold ${config.color} font-mono`}>
            {resolvedTrend === 'up' ? '+' : ''}{change.toFixed(2)}{changeSuffix}
          </span>
        </div>
      )}
    </div>
  );
}
