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
  trend,
  badge,
}: MetricCardProps) {
  const resolvedTrend = trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig = {
    up:      { color: 'var(--gain)', icon: TrendingUp,   prefix: '+' },
    down:    { color: 'var(--loss)', icon: TrendingDown,  prefix: '' },
    neutral: { color: 'var(--text-muted)', icon: Minus,  prefix: '' },
  };

  const config    = trendConfig[resolvedTrend];
  const TrendIcon = config.icon;

  return (
    <div
      className="p-6 transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
      }}
    >
      <div className="flex items-start justify-between mb-5">
        {/* Icon — 20px, no bg color per spec */}
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </div>
        {badge && (
          <span
            className="text-xs px-2 py-0.5"
            style={{
              color: 'var(--gold)',
              backgroundColor: 'rgba(184,151,74,0.08)',
              border: '1px solid rgba(184,151,74,0.2)',
              borderRadius: '4px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Label — Inter 12px */}
      <p
        className="text-xs mb-1"
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
        }}
      >
        {label}
      </p>

      {/* Value — Cormorant Garamond 24px */}
      <p
        className="mb-3"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>

      {change !== undefined && (
        <div className="inline-flex items-center gap-1">
          <TrendIcon className="w-3 h-3" style={{ color: config.color }} />
          <span
            className="text-xs"
            style={{
              color: config.color,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {config.prefix}{change.toFixed(2)}{changeSuffix}
          </span>
        </div>
      )}
    </div>
  );
}
