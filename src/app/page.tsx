'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import BVCInvestorPulse from '@/components/home/BVCInvestorPulse';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import ArticleCard from '@/components/learn/ArticleCard';
import { getFeaturedArticles } from '@/lib/data/articles';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { injectEduBanners } from '@/utils/injectEduBanners';

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
      <div
        className="w-full animate-pulse"
        style={{
          minHeight: '660px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}
      />
    ),
  }
);
const AssetWidget = dynamic(() => import('@/components/market/AssetWidget'), { ssr: false });

function ForexWidget({ symbol, name }: { symbol: string; name: string }) {
  return <AssetWidget symbol={symbol} name={name} sector="Forex" />;
}

export default function HomePage() {
  const { t } = useTranslation('home');
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 4);

  const sections = [
    // ── Hero ──────────────────────────────────────────────────────────────
    <Hero key="hero" />,

    // ── Live Ticker Tape ──────────────────────────────────────────────────
    <div key="ticker" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
      <TradingViewTicker />
    </div>,

    // ── Live Market Overview ───────────────────────────────────────────────
    <section key="market" className="py-20" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-3"
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
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--gain)', fontFamily: 'var(--font-sans)' }}
              >
                {t('markets.badge')}
              </span>
            </div>
            <h2
              className="text-3xl mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {t('markets.title')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {t('markets.subtitle')}
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
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
            <BarChart2 className="w-4 h-4" />
            {t('markets.cta')}
          </Link>
        </div>
        <div
          className="overflow-hidden w-full"
          style={{ border: '1px solid var(--border)', borderRadius: '8px' }}
        >
          <TradingViewMarketOverview />
        </div>
        <p
          className="text-center text-xs mt-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
        >
          {t('markets.source')}
        </p>
      </div>
    </section>,

    // ── Forex Section ─────────────────────────────────────────────────────
    <section key="forex" className="py-16" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2
            className="text-2xl mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            {t('forex.title')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
            {t('forex.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <ForexWidget symbol="FX_IDC:EURMAD" name="EUR / MAD" />
          <ForexWidget symbol="FX_IDC:USDMAD" name="USD / MAD" />
        </div>
        <div
          className="px-4 py-3 text-xs leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t('forex.disclaimer')}{' '}
          <a
            href="https://www.bkam.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('forex.bamLink')}
          </a>.
        </div>
      </div>
    </section>,

    // ── BVC Investor Dashboard ─────────────────────────────────────────────
    <BVCInvestorPulse key="pulse" />,

    // ── Financial disclaimer ───────────────────────────────────────────────
    <div key="disclaimer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <FinancialDisclaimer variant="short" />
    </div>,

    // ── Featured Articles ──────────────────────────────────────────────────
    <section key="articles" className="py-20" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-3xl mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {t('articles.title')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {t('articles.subtitle')}
            </p>
          </div>
          <Link
            href="/learn"
            className="hidden sm:flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
          >
            {t('articles.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t('articles.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>,

    // ── OPCVM Preview ──────────────────────────────────────────────────────
    <section key="opcvm" className="py-20" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-3xl mb-2"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {t('opcvm.title')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {t('opcvm.subtitle')}
            </p>
          </div>
          <Link
            href="/opcvm"
            className="hidden sm:flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
          >
            {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{ borderCollapse: 'collapse', minWidth: '640px' }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  t('opcvm.headers.fund'),
                  t('opcvm.headers.bank'),
                  t('opcvm.headers.type'),
                  t('opcvm.headers.perf1y'),
                  t('opcvm.headers.risk'),
                ].map((h, i) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-xs font-medium uppercase tracking-widest"
                    style={{
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                      textAlign: i >= 3 ? 'right' : 'left',
                      backgroundColor: 'var(--bg-elevated)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featuredFunds.map((fund) => (
                <tr
                  key={fund.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  className="transition-colors"
                  onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--bg-elevated)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                >
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                  >
                    {fund.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5"
                      style={{
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {fund.bankCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5"
                      style={{
                        color: fund.type === 'Actions' ? 'var(--gain)' : fund.type === 'Obligataire' ? 'var(--text-secondary)' : 'var(--text-muted)',
                        backgroundColor: 'transparent',
                        border: `1px solid ${fund.type === 'Actions' ? 'rgba(61,171,110,0.3)' : 'var(--border)'}`,
                        borderRadius: '4px',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {fund.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: fund.performance1Y >= 0 ? 'var(--gain)' : 'var(--loss)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {formatPercent(fund.performance1Y)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {Array.from({ length: 7 }, (_, j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: j < fund.risk ? 'var(--text-muted)' : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/opcvm"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>,
  ];

  return <>{injectEduBanners(sections)}</>;
}
