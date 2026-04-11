import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'gold'
  | 'outline'
  | 'premium';

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

// Flat dark badges — 4px radius (spec: no rounded corners > 10px), 1px borders
const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default:   { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  primary:   { backgroundColor: 'rgba(90,122,159,0.1)', border: '1px solid rgba(90,122,159,0.3)', color: 'var(--text-secondary)' },
  secondary: { backgroundColor: 'rgba(90,122,159,0.1)', border: '1px solid rgba(90,122,159,0.3)', color: 'var(--text-secondary)' },
  success:   { backgroundColor: 'rgba(61,171,110,0.08)', border: '1px solid rgba(61,171,110,0.25)', color: 'var(--gain)' },
  danger:    { backgroundColor: 'rgba(217,91,91,0.08)',  border: '1px solid rgba(217,91,91,0.25)',  color: 'var(--loss)' },
  warning:   { backgroundColor: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)', color: '#D4A843' },
  gold:      { backgroundColor: 'rgba(184,151,74,0.08)', border: '1px solid rgba(184,151,74,0.25)', color: 'var(--gold)' },
  outline:   { backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' },
  premium:   { backgroundColor: 'var(--gold)', border: '1px solid var(--gold)', color: 'var(--bg-base)', fontWeight: 500 },
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const dotColors: Partial<Record<BadgeVariant, string>> = {
  success:   'var(--gain)',
  danger:    'var(--loss)',
  warning:   '#D4A843',
  gold:      'var(--gold)',
  secondary: 'var(--text-secondary)',
  primary:   'var(--text-secondary)',
};

const categoryColors: Record<string, BadgeVariant> = {
  'Bases':               'secondary',
  'Actions':             'success',
  'OPCVM':               'gold',
  'Stratégie':           'primary',
  'Politique Monétaire': 'danger',
  'Emploi':              'warning',
  'Inflation':           'warning',
  'Croissance':          'success',
  'Commerce':            'secondary',
  'Marché Boursier':     'primary',
  'Résultats':           'gold',
};

export function getCategoryBadgeVariant(category: string): BadgeVariant {
  return categoryColors[category] || 'default';
}

export const Badge = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
  style,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-sans tracking-wide', sizeClasses[size], className)}
      style={{ borderRadius: '4px', ...variantStyles[variant], ...style }}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColors[variant] ?? 'var(--text-muted)' }}
        />
      )}
      {children}
    </span>
  );
};

export function ImpactBadge({ score }: { score: number }) {
  const configs = {
    1: { label: 'Faible',   variant: 'default'   as BadgeVariant },
    2: { label: 'Bas',      variant: 'secondary'  as BadgeVariant },
    3: { label: 'Modéré',   variant: 'warning'    as BadgeVariant },
    4: { label: 'Élevé',    variant: 'gold'       as BadgeVariant },
    5: { label: 'Critique', variant: 'danger'     as BadgeVariant },
  };
  const config = configs[score as keyof typeof configs] || configs[1];
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function PremiumBadge({ size = 'sm' }: { size?: BadgeSize }) {
  return <Badge variant="premium" size={size}>Premium</Badge>;
}

export default Badge;
