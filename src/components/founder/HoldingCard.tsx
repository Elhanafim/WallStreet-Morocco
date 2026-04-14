'use client';

import { useEffect, useRef, useState } from 'react';
import { Holding } from '@/data/founderPortfolio';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

interface HoldingCardProps {
  holding: Holding;
  index: number; // 0-3, controls stagger delay
}

export default function HoldingCard({ holding, index }: HoldingCardProps) {
  const [ref, inView] = useInView();
  const delay = index * 150;

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const fmt = (v: number) =>
    v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  return (
    <div
      ref={ref}
      className="group rounded-[12px] overflow-hidden hover:-translate-y-1 transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: inView ? `1px solid ${holding.color}30` : '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'translateY(0)'
          : prefersReduced
          ? 'translateY(0)'
          : 'translateY(24px)',
        transitionDelay: prefersReduced ? '0ms' : `${delay}ms`,
        transitionDuration: '400ms',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: holding.color, opacity: 0.8 }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">
            {holding.icon}
          </span>
          <div className="min-w-0">
            <p
              className="text-base font-medium leading-none"
              style={{ color: holding.color }}
            >
              {holding.ticker}
            </p>
            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {holding.name}
            </p>
          </div>
        </div>
        <span
          className="flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border"
          style={{ color: holding.color, borderColor: `${holding.color}50`, background: `${holding.color}15` }}
        >
          {holding.weight}%
        </span>
      </div>

      {/* Sector */}
      <div className="px-5 pb-3">
        <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>
          {holding.sector}
        </p>
      </div>

      {/* Price grid */}
      <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>Prix entrée</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{fmt(holding.priceNov2024)} MAD</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>Prix actuel</p>
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{fmt(holding.priceMar2026)} MAD</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>Perf. P/P</p>
          <p className="font-medium text-base" style={{ color: 'var(--gain)' }}>+{holding.perfPointToPoint}%</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>DCA est.</p>
          <p className="font-medium text-base" style={{ color: 'var(--gain)' }}>+{holding.dcaReturn}%</p>
        </div>
      </div>

      {/* Weight bar */}
      <div className="px-5 pb-2">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: inView ? `${holding.weight}%` : '0%',
              background: holding.color,
              transitionDelay: prefersReduced ? '0ms' : `${delay + 300}ms`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Rationale */}
      <div className="px-5 pb-4 pt-2">
        <p className="text-[11px] italic leading-snug" style={{ color: 'var(--text-muted)' }}>
          {holding.rationale}
        </p>
      </div>
    </div>
  );
}
