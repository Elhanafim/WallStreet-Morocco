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
    surface: 'bg-[var(--bg-surface)]',
    elevated: 'bg-[var(--bg-elevated)]',
  };

  return (
    <section
      id={id}
      className={cn('py-16 sm:py-24 transition-colors', bgStyles[variant], className)}
    >
      <div className={cn('container-max', containerClassName)}>
        {(title || subtitle || badge || cta) && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fadeIn">
            <div className="max-w-2xl">
              {badge && <span className="section-label">{badge}</span>}
              {title && (
                <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 text-balance">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-[var(--text-secondary)] font-body max-w-xl text-balance">
                  {subtitle}
                </p>
              )}
            </div>
            {cta && <div className="flex-shrink-0">{cta}</div>}
          </div>
        )}
        <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          {children}
        </div>
      </div>
    </section>
  );
}
