'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import BVCInvestorPulse from '@/components/home/BVCInvestorPulse';
import ArticleCard from '@/components/learn/ArticleCard';
import { getFeaturedArticles } from '@/lib/data/articles';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// All TradingView widgets — client-side only, no SSR
const TradingViewTicker = dynamic(
  () => import('@/components/market/TradingViewTicker'),
  { ssr: false }
);
const TradingViewMarketOverview = dynamic(
  () => import('@/components/market/TradingViewMarketOverview'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-2xl bg-surface-50 border border-surface-200 animate-pulse"
           style={{ minHeight: '660px' }} />
    ),
  }
);
const AssetWidget = dynamic(() => import('@/components/market/AssetWidget'), { ssr: false });

/** Thin wrapper so we can pass a Forex symbol to AssetWidget without a sector label. */
function ForexWidget({ symbol, name }: { symbol: string; name: string }) {
  return <AssetWidget symbol={symbol} name={name} sector="Forex" />;
}

export default function HomePage() {
  const { t } = useTranslation('home');
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 4);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Live Ticker Tape ────────────────────────────────────── */}
      <div className="bg-primary">
        <TradingViewTicker />
      </div>

      {/* ── Live Market Overview ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-3">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                <span className="text-success text-xs font-semibold uppercase tracking-wide">{t('markets.badge')}</span>
              </div>
              <h2 className="text-3xl font-black text-primary mb-1">
                {t('markets.title')}
              </h2>
              <p className="text-primary/60 text-sm">
                {t('markets.subtitle')}
              </p>
            </div>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 bg-secondary text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-secondary-600 transition-all whitespace-nowrap"
            >
              <BarChart2 className="w-4 h-4" />
              {t('markets.cta')}
            </Link>
          </div>

          {/* TradingView Market Overview — real-time, no static data */}
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-card">
            <TradingViewMarketOverview />
          </div>

          {/* Fallback note */}
          <p className="text-center text-xs text-primary/30 mt-3">
            {t('markets.source')}
          </p>
        </div>
      </section>

      {/* ── Forex Section ────────────────────────────────────────── */}
      <section className="py-16 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-primary mb-1">
              {t('forex.title')}
            </h2>
            <p className="text-primary/60 text-sm">
              {t('forex.subtitle')}
            </p>
          </div>

          {/* Two forex mini widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <ForexWidget symbol="FX_IDC:EURMAD" name="EUR / MAD" />
            <ForexWidget symbol="FX_IDC:USDMAD" name="USD / MAD" />
          </div>

          {/* Disclaimer card */}
          <div className="bg-white border border-surface-200 rounded-2xl px-5 py-4 text-xs text-primary/50 leading-relaxed">
            {t('forex.disclaimer')}{' '}
            <a
              href="https://www.bkam.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              {t('forex.bamLink')}
            </a>.
          </div>
        </div>
      </section>

      {/* ── BVC Investor Dashboard ───────────────────────────────── */}
      <BVCInvestorPulse />

      {/* ── Featured Articles ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">
                {t('articles.title')}
              </h2>
              <p className="text-primary/60">{t('articles.subtitle')}</p>
            </div>
            <Link
              href="/learn"
              className="hidden sm:flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all"
            >
              {t('articles.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/learn">
              <button className="inline-flex items-center gap-2 text-secondary font-semibold border border-secondary rounded-xl px-6 py-3 hover:bg-secondary hover:text-white transition-colors">
                {t('articles.cta')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── OPCVM Preview ────────────────────────────────────────── */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">
                {t('opcvm.title')}
              </h2>
              <p className="text-primary/60">{t('opcvm.subtitle')}</p>
            </div>
            <Link
              href="/opcvm"
              className="hidden sm:flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all"
            >
              {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[640px] px-4 sm:px-0">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">{t('opcvm.headers.fund')}</th>
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">{t('opcvm.headers.bank')}</th>
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">{t('opcvm.headers.type')}</th>
                    <th className="text-right text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">{t('opcvm.headers.perf1y')}</th>
                    <th className="text-right text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">{t('opcvm.headers.risk')}</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredFunds.map((fund) => (
                    <tr
                      key={fund.id}
                      className="bg-white border border-surface-200 rounded-xl hover:border-secondary/30 hover:shadow-sm transition-all duration-200"
                    >
                      <td className="px-5 py-4 rounded-l-xl">
                        <p className="font-semibold text-primary text-sm">{fund.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold bg-primary/5 text-primary px-2.5 py-1 rounded-lg">
                          {fund.bankCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          fund.type === 'Actions'     ? 'bg-success/10 text-success'   :
                          fund.type === 'Obligataire' ? 'bg-secondary/10 text-secondary' :
                          fund.type === 'Monétaire'   ? 'bg-surface-200 text-primary/60' :
                          'bg-accent/10 text-accent-600'
                        }`}>
                          {fund.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-bold text-sm ${fund.performance1Y >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatPercent(fund.performance1Y)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right rounded-r-xl">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 7 }, (_, j) => (
                            <div
                              key={j}
                              className={`w-2 h-2 rounded-full ${j < fund.risk ? 'bg-accent' : 'bg-surface-200'}`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/opcvm">
              <button className="inline-flex items-center gap-2 text-secondary font-semibold border border-secondary rounded-xl px-6 py-3 hover:bg-secondary hover:text-white transition-colors">
                {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
