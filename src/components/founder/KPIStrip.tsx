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

  const bgClass =
    variant === 'dominant'
      ? 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
      : variant === 'gold'
      ? 'bg-accent/20 border-accent/40'
      : variant === 'success'
      ? 'bg-emerald-500/15 border-emerald-500/25'
      : 'bg-white/8 border-white/15';

  const valueClass =
    variant === 'dominant'
      ? 'text-emerald-400 text-4xl font-medium'
      : variant === 'gold'
      ? 'text-accent text-2xl font-medium'
      : variant === 'success'
      ? 'text-emerald-400 text-2xl font-medium'
      : 'text-white text-2xl font-medium';

  return (
    <div
      className={`rounded-2xl p-5 border text-center transition-all duration-300 ${bgClass}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(12px)', transitionDelay: `${delay}ms` }}
      aria-label={ariaLabel}
    >
      <p className={valueClass}>
        {format(animated)}{suffix}
      </p>
      <p className="text-white/55 text-xs font-medium mt-1 uppercase tracking-wide">{label}</p>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {live && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        )}
        <p className="text-white/30 text-[10px]">{sub}</p>
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
