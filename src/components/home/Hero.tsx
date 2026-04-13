'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2, BookOpen, TrendingUp } from 'lucide-react';

const STATS = [
  { value: '77+',   label: 'Listed Companies'   },
  { value: 'Real-time', label: 'Market Data'     },
  { value: 'MASI',  label: 'Index Coverage'      },
  { value: 'Free',  label: 'For Investors'       },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '560px' }}>

      {/* ── Background: Casablanca Finance City ── */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=85&auto=format&fit=crop"
          alt="Casablanca financial district"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
        />
        {/* Deep directional overlay — left is dark for content, right reveals the city */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, rgba(7,13,26,0.97) 0%, rgba(7,13,26,0.88) 45%, rgba(7,13,26,0.55) 75%, rgba(7,13,26,0.3) 100%)',
          }}
        />
        {/* Subtle bottom fade to bg-base */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }}
        />
      </div>

      {/* ── Top accent line ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--gold) 70%, transparent 100%)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 flex flex-col justify-center" style={{ minHeight: '560px' }}>
        <div className="max-w-[640px] py-20">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'rgba(201,168,76,0.12)',
                border: '1px solid rgba(201,168,76,0.25)',
              }}
            >
              <TrendingUp size={12} style={{ color: 'var(--gold)' }} />
              <span
                className="font-body text-[11.5px] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'var(--gold)' }}
              >
                Casablanca Stock Exchange
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-medium leading-[1.08] text-white mb-5"
            style={{ fontSize: 'clamp(40px, 5vw, 62px)', letterSpacing: '-0.02em' }}
          >
            Morocco's Premier<br />
            <span className="italic" style={{ color: 'var(--gold)' }}>Financial Intelligence</span>
            <br />Platform
          </h1>

          {/* Subtitle */}
          <p
            className="font-body font-light leading-[1.75] mb-10"
            style={{ fontSize: '16px', color: 'rgba(237,240,247,0.72)', maxWidth: '480px' }}
          >
            Real-time market data, portfolio analytics, and institutional-grade research
            tools for investors on the Bourse de Casablanca.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-14">
            <Link
              href="/market"
              className="flex items-center gap-2 font-body font-medium rounded-[6px] transition-all hover:brightness-110"
              style={{
                fontSize: '14px',
                padding: '11px 24px',
                backgroundColor: 'var(--gold)',
                color: '#070D1A',
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
                padding: '11px 24px',
                border: '1.5px solid rgba(237,240,247,0.25)',
                color: 'rgba(237,240,247,0.85)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(237,240,247,0.5)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(237,240,247,0.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(237,240,247,0.25)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              <BookOpen size={15} />
              Learn to Invest
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center gap-1.5 font-body text-[13.5px] font-medium transition-colors"
              style={{ color: 'rgba(201,168,76,0.85)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(201,168,76,0.85)'; }}
            >
              Create free account <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span
                  className="font-display font-medium"
                  style={{ fontSize: '22px', color: 'var(--text-primary)', lineHeight: 1.2 }}
                >
                  {s.value}
                </span>
                <span
                  className="font-body text-[11.5px] uppercase tracking-[0.08em]"
                  style={{ color: 'rgba(237,240,247,0.45)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
