'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart2, Shield, Zap, Users } from 'lucide-react';
import Hero from '@/components/home/Hero';
import BVCInvestorPulse from '@/components/home/BVCInvestorPulse';
import MoroccoNewsFeed from '@/components/home/MoroccoNewsFeed';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import ArticleCard from '@/components/learn/ArticleCard';
import { getFeaturedArticles } from '@/lib/data/articles';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent, cn } from '@/lib/utils';

const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
const TradingViewMarketOverview = dynamic(() => import('@/components/market/TradingViewMarketOverview'), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-[10px]" style={{ backgroundColor: 'var(--bg-elevated)' }} />,
});

// ── Feature highlights ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BarChart2 size={20} />,
    title: 'Real-Time Markets',
    description: 'Live prices, charts, and order-book data for all 77 companies listed on the Bourse de Casablanca.',
    href: '/market',
    cta: 'Open Markets',
  },
  {
    icon: <Zap size={20} />,
    title: 'Portfolio Simulator',
    description: 'Build and track virtual portfolios. Test strategies with historical data before risking real capital.',
    href: '/simulator',
    cta: 'Launch Simulator',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Investment Academy',
    description: 'Structured courses, interactive games, and expert analysis tailored to Moroccan markets.',
    href: '/learn',
    cta: 'Start Learning',
  },
  {
    icon: <Shield size={20} />,
    title: 'OPCVM Intelligence',
    description: 'Compare mutual funds from all major Moroccan banks with performance data and risk ratings.',
    href: '/opcvm',
    cta: 'Compare Funds',
  },
];

export default function HomePage() {
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 5);

  return (
    <main style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. MARKET TICKER ────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <TradingViewTicker />
      </div>

      {/* ── 3. LIVE MARKET INDICATORS ───────────────────────────────────────── */}
      <div className="py-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="section-label">Market Pulse</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '26px', color: 'var(--text-primary)' }}
              >
                Bourse de Casablanca — Live Indicators
              </h2>
            </div>
            <Link
              href="/market"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium transition-colors"
              style={{ color: 'var(--gold)' }}
            >
              Full Market View <ArrowRight size={14} />
            </Link>
          </div>
          <BVCInvestorPulse />
        </div>
      </div>

      {/* ── 4. NEWS & FEATURES GRID ─────────────────────────────────────────── */}
      <div className="py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* News (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <span className="section-label">Market News</span>
              </div>
              <MoroccoNewsFeed />
            </div>

            {/* Quick nav (1/3 width) */}
            <div>
              <span className="section-label mb-6 block">Quick Access</span>
              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="group flex items-start gap-4 p-4 rounded-[8px] transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-strong)';
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--bg-surface)';
                    }}
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-[7px] flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: 'var(--gold-subtle)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(201,168,76,0.2)',
                      }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-body font-medium text-[14px] mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {f.title}
                      </p>
                      <p
                        className="font-body text-[12.5px] leading-[1.5]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {f.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200"
                      style={{ color: 'var(--gold)' }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. MARKET OVERVIEW CHART ─────────────────────────────────────────── */}
      <div
        className="py-16"
        style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="section-label">Global Overview</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '26px', color: 'var(--text-primary)' }}
              >
                Markets at a Glance
              </h2>
              <p
                className="font-body text-[14px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Real-time overview of major indices and Moroccan assets.
              </p>
            </div>
            <Link
              href="/terminal"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              Open Terminal <ArrowRight size={14} />
            </Link>
          </div>
          <div
            className="overflow-hidden rounded-[10px]"
            style={{ border: '1px solid var(--border)' }}
          >
            <TradingViewMarketOverview />
          </div>
        </div>
      </div>

      {/* ── 6. FEATURED ARTICLES ─────────────────────────────────────────────── */}
      <div className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="section-label">Research & Analysis</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '26px', color: 'var(--text-primary)' }}
              >
                Expert Perspectives
              </h2>
              <p
                className="font-body text-[14px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                In-depth analysis and education on Moroccan financial markets.
              </p>
            </div>
            <Link
              href="/learn"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              All Articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/learn"
              className="btn-outline"
            >
              Browse All Research <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 7. OPCVM TABLE ───────────────────────────────────────────────────── */}
      <div
        className="py-16"
        style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="section-label">Fund Selection</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '26px', color: 'var(--text-primary)' }}
              >
                OPCVM — Top Performing Funds
              </h2>
              <p
                className="font-body text-[14px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                Moroccan mutual funds ranked by 1-year performance.
              </p>
            </div>
            <Link
              href="/opcvm"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              View All Funds <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-[10px]"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="overflow-x-auto">
              <table className="table-fintech">
                <thead>
                  <tr>
                    <th>Fund</th>
                    <th>Bank</th>
                    <th>Type</th>
                    <th className="text-right">1Y Performance</th>
                    <th className="text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredFunds.map((fund) => (
                    <tr key={fund.id}>
                      <td>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {fund.name}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{fund.bankCode}</td>
                      <td>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {fund.type}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className={cn(
                            'font-mono text-[13px] font-medium px-2 py-0.5 rounded-[4px]',
                            fund.performance1Y >= 0
                              ? 'text-[var(--gain)] bg-[var(--gain-bg)]'
                              : 'text-[var(--loss)] bg-[var(--loss-bg)]'
                          )}
                        >
                          {fund.performance1Y >= 0 ? '+' : ''}{formatPercent(fund.performance1Y / 100)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 5 }, (_, j) => (
                            <div
                              key={j}
                              className="w-2 h-2 rounded-full transition-all"
                              style={{
                                backgroundColor: j < fund.risk ? 'var(--gold)' : 'var(--border-strong)',
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
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/opcvm" className="btn-outline">
              Explore All OPCVM Funds <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 8. SOCIAL PROOF STRIP ────────────────────────────────────────────── */}
      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--border)' }}>
            {[
              { value: '77',     label: 'Casablanca-Listed Stocks' },
              { value: 'MASI',   label: 'Morocco All Shares Index'  },
              { value: '100%',   label: 'Free to Use'               },
              { value: '∞',      label: 'Learning Resources'        },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center py-8 px-4 text-center"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <span
                  className="font-display font-medium"
                  style={{ fontSize: '32px', color: 'var(--gold)', lineHeight: 1.1 }}
                >
                  {item.value}
                </span>
                <span
                  className="font-body text-[12px] mt-1.5 uppercase tracking-[0.07em]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. DISCLAIMER ────────────────────────────────────────────────────── */}
      <div
        className="py-8"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <FinancialDisclaimer variant="short" />
        </div>
      </div>
    </main>
  );
}
