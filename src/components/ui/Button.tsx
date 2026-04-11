import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

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

// All buttons: 6px radius, no shadows, Inter weight 400/500
const baseClasses =
  'inline-flex items-center justify-center gap-2 font-sans transition-colors duration-150 focus:outline-none select-none tracking-tight';

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    border: '1px solid var(--gold)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    fontWeight: 400,
  },
  secondary: {
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-elevated)',
    fontWeight: 400,
  },
  outline: {
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    fontWeight: 400,
  },
  ghost: {
    border: '1px solid transparent',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    fontWeight: 400,
  },
  danger: {
    border: '1px solid rgba(217,91,91,0.4)',
    borderRadius: '6px',
    color: 'var(--loss)',
    backgroundColor: 'rgba(217,91,91,0.06)',
    fontWeight: 400,
  },
  gold: {
    border: '1px solid var(--gold)',
    borderRadius: '6px',
    color: 'var(--gold)',
    backgroundColor: 'rgba(184,151,74,0.06)',
    fontWeight: 400,
  },
};

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
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseClasses,
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        style={{ ...variantStyles[variant], ...style }}
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
