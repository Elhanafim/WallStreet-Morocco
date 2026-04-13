import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: 'premium' | 'glass' | 'outline';
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hoverable = true,
  variant = 'premium',
  onClick,
}: CardProps) {
  const variants = {
    premium: 'premium-card',
    glass: 'glass-surface rounded-2xl p-6',
    outline: 'border border-[var(--border)] rounded-2xl p-6 bg-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        variants[variant],
        hoverable && variant !== 'premium' && 'hover:border-[var(--gold)] hover:shadow-lg transition-all',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
