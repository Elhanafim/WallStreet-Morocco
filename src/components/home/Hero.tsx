'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2, BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full rounded-[10px] animate-pulse"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
    />
  ),
});

const STATS = [
  { value: '77+',    label: 'Listed Companies' },
  { value: 'MASI',   label: 'Index Coverage'   },
  { value: 'Live',   label: 'Market Data'       },
  { value: 'Free',   label: 'For All Investors' },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '580px' }}>

      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        {/* Strong left overlay for text legibility, lighter right for chart */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(110deg, rgba(8,20,40,0.96) 0%, rgba(8,20,40,0.88) 42%, rgba(8,20,40,0.65) 65%, rgba(8,20,40,0.35) 100%)',
          }}
        />
        {/* Bottom fade to page base */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
        />
      </div>

      {/* ── Gold top line ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold) 25%, var(--gold) 50%, transparent)' }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-10 container-max flex items-center"
        style={{ minHeight: '580px' }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 py-16 items-center">

          {/* ── LEFT: text block ── */}
          <div className="max-w-[560px]">
            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(176,125,42,0.15)',
                border: '1px solid rgba(176,125,42,0.3)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                style={{ backgroundColor: 'var(--gold)' }}
              />
              <span
                className="font-body text-[11.5px] font-semibold tracking-[0.1em] uppercase"
                style={{ color: 'var(--gold)' }}
              >
                Casablanca Stock Exchange
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-medium text-white mb-5"
              style={{
                fontSize: 'clamp(38px, 4.5vw, 58px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
              }}
            >
              Morocco's Premier
              <br />
              <span
                className="italic"
                style={{ color: 'var(--gold)' }}
              >
                Financial Intelligence
              </span>
              <br />
              Platform
            </h1>

            {/* Subtitle */}
            <p
              className="font-body font-light leading-[1.7] mb-9"
              style={{
                fontSize: '15.5px',
                color: 'rgba(237,240,247,0.7)',
                maxWidth: '440px',
              }}
            >
              Real-time market data, portfolio analytics, and
              institutional-grade research tools for investors on the
              Bourse de Casablanca.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                href="/market"
                className="flex items-center gap-2 font-body font-semibold rounded-[6px] transition-all hover:brightness-105"
                style={{
                  fontSize: '14px',
                  padding: '11px 22px',
                  backgroundColor: 'var(--gold)',
                  color: '#fff',
                }}
              >
                <BarChart2 size={15} />
                View Markets
              </Link>
              <Link
                href="/learn"
                className="flex items-center gap-2 font-body font-medium rounded-[6px] transition-all"
                style={{
                  fontSize: '14px',
                  padding: '11px 22px',
                  border: '1.5px solid rgba(237,240,247,0.3)',
                  color: 'rgba(237,240,247,0.88)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = 'rgba(237,240,247,0.55)';
                  el.style.backgroundColor = 'rgba(237,240,247,0.07)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = 'rgba(237,240,247,0.3)';
                  el.style.backgroundColor = 'transparent';
                }}
              >
                <BookOpen size={15} />
                Learn to Invest
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 font-body text-[13px] font-medium transition-opacity hover:opacity-100"
                style={{ color: 'rgba(176,125,42,0.8)', opacity: 0.85 }}
              >
                Free account <ArrowRight size={13} />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span
                    className="font-display font-medium"
                    style={{ fontSize: '20px', color: '#fff', lineHeight: 1.2 }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="font-body text-[10.5px] uppercase tracking-[0.08em]"
                    style={{ color: 'rgba(237,240,247,0.4)' }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: MASI chart ── */}
          <div className="hidden lg:block">
            <div
              className="overflow-hidden rounded-[10px]"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(6px)',
                height: '340px',
              }}
            >
              {/* Mini header */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                    style={{ backgroundColor: '#3DB87A' }}
                  />
                  <span
                    className="font-body text-[12px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    MASI — All Shares Index
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    color: '#3DB87A',
                    backgroundColor: 'rgba(61,184,122,0.12)',
                    border: '1px solid rgba(61,184,122,0.25)',
                  }}
                >
                  LIVE
                </span>
              </div>
              {/* Chart fills remaining height */}
              <div style={{ height: 'calc(340px - 44px)' }}>
                <TradingViewChart
                  symbol="CSEMA:MASI"
                  height={296}
                  theme="dark"
                  interval="D"
                  showToolbar={false}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
