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
      className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'translateY(0)'
          : prefersReduced
          ? 'translateY(0)'
          : 'translateY(24px)',
        transitionDelay: prefersReduced ? '0ms' : `${delay}ms`,
        transitionDuration: '400ms',
        borderColor: inView ? `${holding.color}30` : 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: holding.color, opacity: 0.7 }}
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
            <p className="text-white/70 text-xs font-medium mt-0.5 truncate">
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
        <p className="text-white/40 text-[11px] uppercase tracking-wide font-medium">
          {holding.sector}
        </p>
      </div>

      {/* Price grid */}
      <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/8 pt-3">
        <div>
          <p className="text-white/35 text-[9px] uppercase tracking-wide mb-0.5">Prix entrée</p>
          <p className="text-white/70 text-sm font-medium">{fmt(holding.priceNov2024)} MAD</p>
        </div>
        <div>
          <p className="text-white/35 text-[9px] uppercase tracking-wide mb-0.5">Prix actuel</p>
          <p className="text-white font-medium text-sm">{fmt(holding.priceMar2026)} MAD</p>
        </div>
        <div>
          <p className="text-white/35 text-[9px] uppercase tracking-wide mb-0.5">Perf. P/P</p>
          <p className="text-emerald-400 font-medium text-base">+{holding.perfPointToPoint}%</p>
        </div>
        <div>
          <p className="text-white/35 text-[9px] uppercase tracking-wide mb-0.5">DCA est.</p>
          <p className="text-emerald-300 font-medium text-base">+{holding.dcaReturn}%</p>
        </div>
      </div>

      {/* Weight bar */}
      <div className="px-5 pb-2">
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
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
        <p className="text-white/40 text-[11px] italic leading-snug">
          {holding.rationale}
        </p>
      </div>
    </div>
  );
}
