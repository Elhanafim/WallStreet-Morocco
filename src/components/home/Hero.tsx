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
    <section className="relative w-full overflow-hidden flex items-center" style={{ height: '520px' }}>
      {/* PHOTO BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=1920&q=90&auto=format&fit=crop"
          alt="Casablanca night skyline"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        {/* EDITORIAL OVERLAY */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to bottom, rgba(8,15,30,0.55) 0%, rgba(8,15,30,0.80) 100%)' 
          }} 
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-[var(--space-md)]">
        <div className="max-w-[680px]">
          {/* Eyebrow */}
          <span className="block font-body text-[12px] font-medium tracking-[0.12em] uppercase text-[var(--gold-light)] mb-4">
            {t('hero.badge')}
          </span>

          {/* Main Heading */}
          <h1 className="font-display text-[56px] font-medium leading-[1.1] text-white mb-6">
            {t('hero.headline1')} <span className="italic">{t('hero.headline2')}</span>
            <br />
            {t('hero.headline3')}
          </h1>

          {/* Subtitle */}
          <p className="font-body text-[16px] font-light leading-[1.7] text-[rgba(255,255,255,0.78)] mb-10 max-w-[520px]">
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/market"
              className="bg-[var(--gold)] text-[var(--bg-base)] px-7 py-3 rounded-[6px] font-body text-[14px] font-medium transition-all hover:brightness-110"
            >
              {t('hero.cta1')}
            </Link>
            <Link
              href="/learn"
              className="bg-transparent border-[1.5px] border-[rgba(255,255,255,0.6)] text-white px-7 py-3 rounded-[6px] font-body text-[14px] font-medium transition-all hover:bg-white/10"
            >
              {t('hero.cta2')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
