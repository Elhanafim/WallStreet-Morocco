import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef, useState } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-sans transition-all duration-150 focus:outline-none select-none tracking-tight';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      style,
      children,
      disabled,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || loading;

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gold-gradient text-white border-transparent hover:shadow-lg hover:brightness-110';
        case 'secondary':
          return 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--gold)]';
        case 'outline':
          return 'bg-transparent text-[var(--gold)] border-[var(--gold)] hover:bg-[var(--gold)] hover:text-white';
        case 'ghost':
          return 'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]';
        case 'danger':
          return 'bg-transparent text-[var(--loss)] border-[var(--loss)] hover:bg-[var(--loss)] hover:text-white';
        case 'gold':
          return 'text-gold-gradient border-[var(--gold)] hover:bg-[var(--gold)] hover:text-white';
        default:
          return '';
      }
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseClasses,
          sizeClasses[size],
          getVariantClasses(),
          'border rounded-xl font-medium transition-all duration-300',
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement...
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
