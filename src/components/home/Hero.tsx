'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import MoroccoNewsFeed from './MoroccoNewsFeed';
import { useTranslation } from 'react-i18next';

// Load TradingView chart client-side only — no SSR
const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#C9A84C]/40 border-t-[#C9A84C] rounded-full animate-spin" />
    </div>
  ),
});

export default function Hero() {
  const { t } = useTranslation('home');

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A1628] pt-16">

      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid — Moroccan-inspired geometry */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Diagonal offset accent grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            backgroundPosition: '40px 40px',
          }}
        />
        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#C9A84C]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#112240]/80 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* ── LEFT: Copy & CTAs ───────────────────────────────────── */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Moroccan gold bar */}
            <div className="gold-bar hidden lg:block" />

            {/* Educational badge */}
            <div className="inline-flex items-center gap-2 bg-[#C9A84C]/12 border border-[#C9A84C]/25 rounded-full px-3 py-1.5 mb-4 sm:mb-6 max-w-full">
              <BookOpen className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
              <span className="text-[#C9A84C] text-xs sm:text-sm font-medium truncate font-sans">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-[2rem] sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-3 sm:mb-4 font-display">
              {t('hero.headline1')}{' '}
              <span className="gradient-text-gold">{t('hero.headline2')}</span>
              <br />
              {t('hero.headline3')}
            </h1>

            <p className="text-[#A8B4C8] text-sm sm:text-lg leading-relaxed mb-5 sm:mb-8 max-w-xl mx-auto lg:mx-0 font-sans">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-3 sm:mb-4">
              <Link href="/market" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" iconPosition="right" icon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto">
                  {t('hero.cta1')}
                </Button>
              </Link>
              <Link href="/learn" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t('hero.cta2')}
                </Button>
              </Link>
            </div>

            {/* Permanent disclaimer strip */}
            <div className="mb-4 sm:mb-6 mx-auto lg:mx-0 max-w-xl">
              <p className="text-[10px] sm:text-[11px] text-white/30 leading-relaxed text-center lg:text-left font-sans">
                {t('hero.eduNote')}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 max-w-xl mx-auto lg:mx-0">
              {[
                { value: t('hero.trust1'), icon: '🏢' },
                { value: t('hero.trust2'), icon: '📚' },
                { value: t('hero.trust3'), icon: '📊' },
                { value: t('hero.trust4'), icon: '⚖️' },
              ].map((stat) => (
                <div
                  key={stat.value}
                  className="bg-[#C9A84C]/5 border border-[#C9A84C]/12 rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 text-center"
                >
                  <span className="text-sm sm:text-base">{stat.icon}</span>
                  <p className="text-[#A8B4C8] text-[10px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 leading-tight font-sans">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live TradingView MASI Chart ──────────────────── */}
          <div className="hidden lg:flex flex-col gap-3 animate-slide-up">
            {/* Chart header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[#A8B4C8] text-xs uppercase tracking-widest font-sans">{t('hero.chartLabel')}</p>
                <p className="text-white font-bold text-lg font-display">{t('hero.chartTitle')}</p>
              </div>
              <div className="flex items-center gap-2 bg-[#C9A84C]/12 border border-[#C9A84C]/25 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-pulse" />
                <span className="text-[#C9A84C] text-xs font-semibold font-sans">{t('hero.chartLive')}</span>
              </div>
            </div>

            {/* Chart container */}
            <div
              className="relative bg-[#112240] border border-[#C9A84C]/15 rounded-2xl overflow-hidden shadow-2xl geo-corner"
              style={{ height: '400px' }}
            >
              <TradingViewChart
                symbol="CSEMA:MASI"
                height={400}
                theme="dark"
                interval="D"
                showToolbar={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-empty:opacity-100">
                <p className="text-[#A8B4C8] text-sm font-sans">{t('hero.chartUnavailable')}</p>
              </div>
            </div>

            {/* Quick asset strip below chart */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { symbol: 'ATW', name: 'Attijariwafa' },
                { symbol: 'IAM', name: 'Maroc Telecom' },
                { symbol: 'BCP', name: 'Banque Pop.'   },
              ].map((s) => (
                <div
                  key={s.symbol}
                  className="bg-[#112240] border border-[#C9A84C]/12 rounded-xl px-3 py-2.5 text-center hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/5 transition-all duration-200"
                >
                  <p className="text-[#C9A84C] font-black text-sm font-mono">{s.symbol}</p>
                  <p className="text-[#A8B4C8] text-xs truncate font-sans">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Morocco Economic News Feed — hidden on mobile ───────────── */}
        <div className="hidden sm:block">
          <MoroccoNewsFeed />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-5 h-8 rounded-full border-2 border-[#C9A84C]/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-[#C9A84C]/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
