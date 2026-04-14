'use client';

import { useEffect, useRef, useState } from 'react';
import { MarketEvent } from '@/data/founderPortfolio';

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

function dotColor(type: MarketEvent['type']): string {
  switch (type) {
    case 'peak':    return '#B8974A'; // gold
    case 'positive': return '#0D7A4E'; // gain green
    case 'danger':  return '#D95B5B'; // loss red
    default:        return '#3A86FF'; // blue
  }
}

function textStyle(type: MarketEvent['type']): React.CSSProperties {
  switch (type) {
    case 'peak':    return { color: 'var(--gold)' };
    case 'positive': return { color: 'var(--gain)' };
    case 'danger':  return { color: 'var(--loss)' };
    default:        return { color: 'var(--text-secondary)' };
  }
}

interface MarketTimelineProps {
  events: MarketEvent[];
}

export default function MarketTimeline({ events }: MarketTimelineProps) {
  const [ref, inView] = useInView();

  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  return (
    <div ref={ref} className="mb-16">
      {/* Header */}
      <div className="mb-8">
        <h3 className="font-medium text-xl sm:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Le contexte de marché en 17 mois
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Novembre 2024 → Mars 2026 · Bourse de Casablanca
        </p>
      </div>

      {/* ── Desktop horizontal timeline (sm+) ─────────────────────────────────── */}
      <div className="hidden sm:block relative py-10">
        {/* Horizontal connector line */}
        <div
          className="absolute left-0 right-0 h-px"
          style={{ top: '50%', background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-5 gap-1">
          {events.map((event, i) => {
            const isAbove = i % 2 === 0;
            const delay = prefersReduced ? 0 : i * 200;

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.4s ease-out',
                  transitionDelay: `${delay}ms`,
                }}
              >
                {/* Top content area */}
                <div
                  className={`w-full text-center px-2 pb-3 ${isAbove ? 'min-h-[72px]' : 'min-h-[72px] invisible pointer-events-none select-none'}`}
                  aria-hidden={!isAbove}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {event.date}
                  </p>
                  <p className="text-xs leading-tight font-medium" style={textStyle(event.type)}>
                    {event.desc}
                  </p>
                </div>

                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 z-10 transition-transform duration-300"
                  style={{
                    background: dotColor(event.type),
                    border: '2px solid var(--bg-elevated)',
                    boxShadow: `0 0 8px ${dotColor(event.type)}60`,
                    transform: inView ? 'scale(1)' : 'scale(0)',
                    transitionDelay: `${delay}ms`,
                  }}
                  aria-hidden="true"
                />

                {/* Bottom content area */}
                <div
                  className={`w-full text-center px-2 pt-3 ${!isAbove ? 'min-h-[72px]' : 'min-h-[72px] invisible pointer-events-none select-none'}`}
                  aria-hidden={isAbove}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                    {event.date}
                  </p>
                  <p className="text-xs leading-tight font-medium" style={textStyle(event.type)}>
                    {event.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile vertical timeline (< sm) ─────────────────────────────────── */}
      <div className="block sm:hidden">
        <ol className="relative space-y-0" aria-label="Chronologie du marché">
          {events.map((event, i) => {
            const delay = prefersReduced ? 0 : i * 200;
            return (
              <li
                key={i}
                className="flex gap-4"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: 'opacity 0.4s ease-out',
                  transitionDelay: `${delay}ms`,
                }}
              >
                {/* Left: dot + connector */}
                <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      background: dotColor(event.type),
                      border: '2px solid var(--bg-elevated)',
                      boxShadow: `0 0 6px ${dotColor(event.type)}50`,
                    }}
                    aria-hidden="true"
                  />
                  {i < events.length - 1 && (
                    <div className="w-px flex-1 mt-1.5 mb-0 min-h-[32px]" style={{ backgroundColor: 'var(--border)' }} aria-hidden="true" />
                  )}
                </div>
                {/* Right: text */}
                <div className="pb-6">
                  <p className="text-[10px] font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    {event.date}
                  </p>
                  <p className="text-sm leading-snug font-medium" style={textStyle(event.type)}>
                    {event.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
