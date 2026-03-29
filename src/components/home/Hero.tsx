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
      <div className="w-8 h-8 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
    </div>
  ),
});

export default function Hero() {
  const { t } = useTranslation('home');

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#3A86FF 1px, transparent 1px), linear-gradient(90deg, #3A86FF 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* ── LEFT: Copy & CTAs ───────────────────────────────────── */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Educational badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
              <BookOpen className="w-3.5 h-3.5 text-secondary" />
              <span className="text-secondary text-sm font-medium">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-4">
              {t('hero.headline1')}{' '}
              <span className="gradient-text-gold">{t('hero.headline2')}</span>
              <br />
              {t('hero.headline3')}
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-4">
              <Link href="/market" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" iconPosition="right" icon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto">
                  {t('hero.cta1')}
                </Button>
              </Link>
              <Link href="/learn" className="w-full sm:w-auto">
                <Button size="lg" variant="gold" className="w-full sm:w-auto">
                  {t('hero.cta2')}
                </Button>
              </Link>
            </div>

            {/* Permanent disclaimer strip */}
            <div className="mb-6 mx-auto lg:mx-0 max-w-xl">
              <p className="text-[11px] text-white/40 leading-relaxed text-center lg:text-left">
                {t('hero.eduNote')}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto lg:mx-0">
              {[
                { value: t('hero.trust1'), icon: '🏢' },
                { value: t('hero.trust2'), icon: '📚' },
                { value: t('hero.trust3'), icon: '📊' },
                { value: t('hero.trust4'), icon: '⚖️' },
              ].map((stat) => (
                <div
                  key={stat.value}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center"
                >
                  <span className="text-base">{stat.icon}</span>
                  <p className="text-white/60 text-[11px] font-medium mt-1 leading-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live TradingView MASI Chart ──────────────────── */}
          <div className="hidden lg:flex flex-col gap-3 animate-slide-up">
            {/* Chart header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest">{t('hero.chartLabel')}</p>
                <p className="text-white font-bold text-lg">{t('hero.chartTitle')}</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span className="text-amber-300 text-xs font-semibold">{t('hero.chartLive')}</span>
              </div>
            </div>

            {/* Chart container */}
            <div
              className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              style={{ height: '400px' }}
            >
              <TradingViewChart
                symbol="CSEMA:MASI"
                height={400}
                theme="light"
                interval="D"
                showToolbar={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-empty:opacity-100">
                <p className="text-white/30 text-sm">{t('hero.chartUnavailable')}</p>
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
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center hover:bg-white/10 transition-colors"
                >
                  <p className="text-accent font-black text-sm">{s.symbol}</p>
                  <p className="text-white/40 text-xs truncate">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Morocco Economic News Feed ───────────────────────────────── */}
        <MoroccoNewsFeed />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
