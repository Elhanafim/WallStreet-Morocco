import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  cta?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: 'base' | 'surface' | 'elevated';
  id?: string;
}

export default function Section({
  children,
  title,
  subtitle,
  badge,
  cta,
  className,
  containerClassName,
  variant = 'base',
  id,
}: SectionProps) {
  const bgStyles = {
    base: 'bg-[var(--bg-base)]',
    surface: 'bg-[var(--bg-surface)] border-y border-[var(--border)]',
    elevated: 'bg-[var(--bg-elevated)] border-y border-[var(--border)]',
  };

  return (
    <section
      id={id}
      className={cn('py-[var(--space-xl)] transition-colors', bgStyles[variant], className)}
    >
      <div className={cn('container-max', containerClassName)}>
        {(title || subtitle || badge || cta) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fadeIn">
            <div className="max-w-3xl">
              {badge && <span className="section-label mb-6">{badge}</span>}
              {title && (
                <h2 className="font-display text-[32px] md:text-[42px] font-medium text-[var(--text-primary)] leading-[1.1] mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="font-body text-[16px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
                  {subtitle}
                </p>
              )}
            </div>
            {cta && <div className="flex-shrink-0">{cta}</div>}
          </div>
        )}
        <div className="animate-fadeIn">
          {children}
        </div>
      </div>
    </section>
  );
}
