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
  default: 'bg-surface-100 text-primary/70',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  gold: 'bg-accent/15 text-accent-600 border border-accent/30',
  outline: 'bg-transparent border border-current text-primary/60',
  premium: 'bg-gradient-gold text-primary font-bold border border-accent/40',
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const categoryColors: Record<string, BadgeVariant> = {
  'Bases': 'secondary',
  'Actions': 'success',
  'OPCVM': 'gold',
  'Stratégie': 'primary',
  'Politique Monétaire': 'danger',
  'Emploi': 'warning',
  'Inflation': 'warning',
  'Croissance': 'success',
  'Commerce': 'secondary',
  'Marché Boursier': 'primary',
  'Résultats': 'gold',
};

export function getCategoryBadgeVariant(category: string): BadgeVariant {
  return categoryColors[category] || 'default';
}

export const Badge = ({
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            variant === 'success' && 'bg-success',
            variant === 'danger' && 'bg-danger',
            variant === 'warning' && 'bg-warning',
            variant === 'secondary' && 'bg-secondary',
            variant === 'primary' && 'bg-primary',
            variant === 'gold' && 'bg-accent',
            !['success', 'danger', 'warning', 'secondary', 'primary', 'gold'].includes(variant) && 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
};

export function ImpactBadge({ score }: { score: number }) {
  const configs = {
    1: { label: 'Faible', variant: 'default' as BadgeVariant },
    2: { label: 'Bas', variant: 'secondary' as BadgeVariant },
    3: { label: 'Modéré', variant: 'warning' as BadgeVariant },
    4: { label: 'Élevé', variant: 'gold' as BadgeVariant },
    5: { label: 'Critique', variant: 'danger' as BadgeVariant },
  };
  const config = configs[score as keyof typeof configs] || configs[1];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function PremiumBadge({ size = 'sm' }: { size?: BadgeSize }) {
  return (
    <Badge variant="premium" size={size}>
      ✦ Premium
    </Badge>
  );
}

export default Badge;
