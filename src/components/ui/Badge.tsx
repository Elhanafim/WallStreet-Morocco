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
  default:   'bg-white/8 text-[#A8B4C8] border border-white/10',
  primary:   'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20',
  secondary: 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20',
  success:   'bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20',
  danger:    'bg-[#E74C3C]/10 text-[#E74C3C] border border-[#E74C3C]/20',
  warning:   'bg-[#F0A500]/10 text-[#F0A500] border border-[#F0A500]/20',
  gold:      'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20',
  outline:   'bg-transparent border border-[#C9A84C]/30 text-[#A8B4C8]',
  premium:   'bg-gradient-gold text-[#0A1628] font-bold border border-[#C9A84C]/30 shadow-sm',
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
            variant === 'primary' && 'bg-primary-900',
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
