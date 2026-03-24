'use client';

import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
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
      <p className="text-white/40 text-xs">{/* loading */}</p>
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Copy & CTAs ───────────────────────────────────── */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-secondary text-sm font-medium">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
              {t('hero.headline1')}{' '}
              <span className="gradient-text-gold">{t('hero.headline2')}</span>
              <br />
              {t('hero.headline3')}
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/auth/signup">
                <Button size="lg" variant="primary" iconPosition="right" icon={<ArrowRight className="w-5 h-5" />}>
                  {t('hero.cta1')}
                </Button>
              </Link>
              <Link href="/market">
                <Button size="lg" variant="gold">
                  {t('hero.cta2')}
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-success" />
                {t('hero.trust1')}
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block" />
              <span>{t('hero.trust2')}</span>
              <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block" />
              <span>{t('hero.trust3')}</span>
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
              <div className="flex items-center gap-2 bg-success/20 border border-success/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                <span className="text-success text-xs font-semibold">{t('hero.chartLive')}</span>
              </div>
            </div>

            {/* Chart container */}
            <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                 style={{ height: '400px' }}>
              <TradingViewChart
                symbol="CSEMA:MASI"
                height={400}
                theme="light"
                interval="D"
                showToolbar={false}
              />

              {/* Fallback overlay if widget area is empty */}
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
                <div key={s.symbol}
                     className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center hover:bg-white/10 transition-colors">
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
