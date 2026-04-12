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

    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            border: '1px solid var(--gold)',
            color: isHovered ? 'var(--bg-surface)' : 'var(--gold)',
            backgroundColor: isHovered ? 'var(--gold)' : 'transparent',
            borderRadius: '6px',
            fontWeight: 500,
          };
        case 'secondary':
          return {
            border: '1px solid var(--border)',
            color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            backgroundColor: isHovered ? 'var(--bg-elevated)' : 'transparent',
            borderRadius: '6px',
            fontWeight: 400,
          };
        case 'outline':
          return {
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            fontWeight: 400,
          };
        case 'ghost':
          return {
            border: '1px solid transparent',
            color: 'var(--text-secondary)',
            backgroundColor: isHovered ? 'var(--bg-elevated)' : 'transparent',
            borderRadius: '6px',
            fontWeight: 400,
          };
        case 'danger':
          return {
            border: '1px solid var(--loss)',
            color: isHovered ? 'var(--bg-surface)' : 'var(--loss)',
            backgroundColor: isHovered ? 'var(--loss)' : 'transparent',
            borderRadius: '6px',
            fontWeight: 500,
          };
        case 'gold':
          return {
            border: '1px solid var(--gold)',
            color: isHovered ? 'var(--bg-surface)' : 'var(--gold)',
            backgroundColor: isHovered ? 'var(--gold)' : 'transparent',
            borderRadius: '6px',
            fontWeight: 500,
          };
        default:
          return {};
      }
    };

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
        style={{ ...getVariantStyles(), ...style }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
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
