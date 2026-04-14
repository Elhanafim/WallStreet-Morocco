'use client';

import { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_META } from '@/data/founderPortfolio';

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
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

function useCountUp(target: number, duration: number, enabled: boolean, delay = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let raf: number;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(animate);
        else setValue(target);
      };
      raf = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, enabled, delay]);

  return value;
}

// ─── Individual KPI card ──────────────────────────────────────────────────────

interface KPICardProps {
  target: number;
  format: (v: number) => string;
  suffix?: string;
  label: string;
  sub: string;
  variant: 'default' | 'gold' | 'dominant' | 'success';
  live?: boolean;
  inView: boolean;
  delay?: number;
  ariaLabel: string;
}

function KPICard({
  target, format, suffix = '', label, sub, variant, live, inView, delay = 0, ariaLabel,
}: KPICardProps) {
  const animated = useCountUp(target, 1800, inView, delay);

  const cardStyle =
    variant === 'dominant'
      ? { backgroundColor: 'rgba(13,122,78,0.08)', border: '1px solid rgba(13,122,78,0.25)', boxShadow: '0 0 30px rgba(13,122,78,0.08)' }
      : variant === 'gold'
      ? { backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }
      : variant === 'success'
      ? { backgroundColor: 'rgba(13,122,78,0.06)', border: '1px solid rgba(13,122,78,0.2)' }
      : { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' };

  const valueStyle =
    variant === 'dominant'
      ? { color: 'var(--gain)', fontSize: '1.875rem', fontWeight: 500 }
      : variant === 'gold'
      ? { color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 500 }
      : variant === 'success'
      ? { color: 'var(--gain)', fontSize: '1.5rem', fontWeight: 500 }
      : { color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 500 };

  return (
    <div
      className="rounded-[10px] p-5 text-center transition-all duration-300"
      style={{ ...cardStyle, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(12px)', transitionDelay: `${delay}ms` } as React.CSSProperties}
      aria-label={ariaLabel}
    >
      <p style={valueStyle as React.CSSProperties}>
        {format(animated)}{suffix}
      </p>
      <p className="text-xs font-medium mt-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {live && (
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gain)' }} aria-hidden="true" />
        )}
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
      </div>
    </div>
  );
}

// ─── Strip ────────────────────────────────────────────────────────────────────

export default function KPIStrip() {
  const [ref, inView] = useInView(0.2);

  const fmt = (v: number) => v.toLocaleString('fr-FR');
  const fmtDec = (v: number, divisor: number) =>
    (v / divisor).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
    >
      <KPICard
        target={PORTFOLIO_META.totalInvested}
        format={(v) => `$${fmt(v)}`}
        label="Total investi"
        sub={`${PORTFOLIO_META.durationMonths} × 100$`}
        variant="default"
        inView={inView}
        delay={0}
        ariaLabel={`Total investi : $1 700`}
      />
      <KPICard
        target={PORTFOLIO_META.finalValue}
        format={(v) => `$${fmt(v)}`}
        label="Valeur actuelle"
        sub="au 24 mars 2026"
        variant="gold"
        live
        inView={inView}
        delay={80}
        ariaLabel={`Valeur actuelle : $2 628 au 24 mars 2026`}
      />
      <KPICard
        target={PORTFOLIO_META.performancePercent * 10}
        format={(v) => `+${fmtDec(v, 10)}%`}
        label="Performance DCA"
        sub={`vs benchmark +${PORTFOLIO_META.benchmarkMASI.toLocaleString('fr-FR')}%`}
        variant="dominant"
        inView={inView}
        delay={400}
        ariaLabel={`Performance DCA : +54,6% vs benchmark MASI +2,1%`}
      />
      <KPICard
        target={PORTFOLIO_META.outperformance * 10}
        format={(v) => `+${fmtDec(v, 10)} pts`}
        label="Surperformance"
        sub="vs MASI DCA"
        variant="success"
        inView={inView}
        delay={160}
        ariaLabel={`Surperformance : +52,5 points vs MASI DCA`}
      />
      <KPICard
        target={PORTFOLIO_META.absoluteGain}
        format={(v) => `+$${fmt(v)}`}
        label="Plus-value absolue"
        sub="gain net estimé"
        variant="success"
        inView={inView}
        delay={80}
        ariaLabel={`Plus-value absolue : +$928 gain net estimé`}
      />
      <KPICard
        target={PORTFOLIO_META.durationMonths}
        format={(v) => `${v}`}
        suffix=" mois"
        label="Durée"
        sub="Nov 2024 → Mar 2026"
        variant="default"
        inView={inView}
        delay={0}
        ariaLabel={`Durée : 17 mois, novembre 2024 à mars 2026`}
      />
    </div>
  );
}
