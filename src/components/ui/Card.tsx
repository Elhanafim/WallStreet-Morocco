import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'glass' | 'bordered' | 'elevated';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

// All variants use dark bg-surface, 1px border, max 10px radius, no shadows
const variantStyles: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  default:  { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' },
  dark:     { backgroundColor: 'var(--bg-base)',    border: '1px solid var(--border)', borderRadius: '8px' },
  glass:    { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' },
  bordered: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' },
  elevated: { backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      hover = false,
      padding = 'md',
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden',
          paddingClasses[padding],
          hover && 'transition-colors duration-200 cursor-pointer',
          className
        )}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className, style, children, ...props }, ref) => (
    <Tag
      ref={ref as any}
      className={cn('text-lg font-display', className)}
      style={{ color: 'var(--text-primary)', fontWeight: 500, ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
);
CardTitle.displayName = 'CardTitle';

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 flex items-center justify-between', className)}
      style={{ borderTop: '1px solid var(--border)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;
