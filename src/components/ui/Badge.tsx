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

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)]',
  primary:   'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]',
  secondary: 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]',
  success:   'bg-[var(--bg-elevated)] border-[var(--gain)] text-[var(--gain)]',
  danger:    'bg-[var(--bg-elevated)] border-[var(--loss)] text-[var(--loss)]',
  warning:   'bg-[var(--bg-elevated)] border-[var(--gold)] text-[var(--gold)]',
  gold:      'bg-[var(--bg-elevated)] border-[var(--gold)] text-[var(--gold)]',
  outline:   'bg-transparent border-[var(--border)] text-[var(--text-muted)]',
  premium:   'bg-gold-gradient border-transparent text-white font-medium',
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] leading-none',
  sm: 'px-2 py-0.5 text-[11px] leading-tight',
  md: 'px-2.5 py-1 text-[12px] leading-normal',
};

const dotColors: Partial<Record<BadgeVariant, string>> = {
  success:   'var(--gain)',
  danger:    'var(--loss)',
  warning:   'var(--gold)',
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
      className={cn(
        'inline-flex items-center gap-1.5 font-body tracking-tight font-medium border rounded-md transition-all',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={style}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
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
