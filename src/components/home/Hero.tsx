'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';
import MoroccoNewsFeed from './MoroccoNewsFeed';
import { useTranslation } from 'react-i18next';

// Load TradingView chart client-side only — no SSR
const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--border)', borderTopColor: 'transparent' }}
      />
    </div>
  ),
});

export default function Hero() {
  const { t } = useTranslation('home');

  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
      style={{ minHeight: 'calc(100vh - 160px)' }}
    >
      {/* Zone 1: Casablanca photo background */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=1920&q=90&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay: gradient from 0.85 at top to 0.95 at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(8,15,30,0.85) 0%, rgba(8,15,30,0.95) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT: Copy & CTAs */}
          <div className="text-center lg:text-left animate-fade-in">

            {/* Educational badge */}
            <div
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-xs"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                {t('hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-4 leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {t('hero.headline1')}{' '}
              <span style={{ color: 'var(--gold)' }}>{t('hero.headline2')}</span>
              <br />
              {t('hero.headline3')}
            </h1>

            <p
              className="text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            >
              {t('hero.subtitle')}
            </p>

            {/* CTAs — gold border = 1 of 3 gold uses on this page */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-6">
              <Link
                href="/market"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--gold)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(184,151,74,0.08)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent')}
              >
                {t('hero.cta1')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-elevated)',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
              >
                {t('hero.cta2')}
              </Link>
            </div>

            <p
              className="text-[11px] leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              {t('hero.eduNote')}
            </p>
          </div>

          {/* RIGHT: Live TradingView MASI Chart */}
          <div className="hidden lg:flex flex-col gap-3 animate-slide-up">
            <div className="flex items-center justify-between px-1">
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-0.5"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('hero.chartLabel')}
                </p>
                <p
                  className="text-base font-medium"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {t('hero.chartTitle')}
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-elevated)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--gain)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: 'var(--gain)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('hero.chartLive')}
                </span>
              </div>
            </div>

            {/* Chart container */}
            <div
              className="relative overflow-hidden"
              style={{
                height: '380px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <TradingViewChart
                symbol="CSEMA:MASI"
                height={380}
                theme="dark"
                interval="D"
                showToolbar={false}
              />
            </div>

            {/* Quick asset strip */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { symbol: 'ATW', name: 'Attijariwafa' },
                { symbol: 'IAM', name: 'Maroc Telecom' },
                { symbol: 'BCP', name: 'Banque Pop.' },
              ].map((s) => (
                <div
                  key={s.symbol}
                  className="px-3 py-2.5 text-center transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {s.symbol}
                  </p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                  >
                    {s.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Morocco Economic News Feed */}
        <div className="hidden sm:block">
          <MoroccoNewsFeed />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="w-0.5 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--text-muted)' }}
          />
        </div>
      </div>
    </section>
  );
}
