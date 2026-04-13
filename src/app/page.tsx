'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart2, Shield, Zap, DollarSign } from 'lucide-react';
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
  loading: () => (
    <div
      className="rounded-[10px] animate-pulse"
      style={{ height: '560px', backgroundColor: 'var(--bg-elevated)' }}
    />
  ),
});
const TradingViewForexWidget = dynamic(
  () => import('@/components/market/TradingViewForexWidget'),
  { ssr: false }
);

// ── Platform features ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BarChart2 size={19} />,
    title: 'Real-Time Markets',
    description: 'Live prices, charts, and sector data for all 77 CSE-listed companies.',
    href: '/market',
    cta: 'Open Markets',
  },
  {
    icon: <Zap size={19} />,
    title: 'Portfolio Simulator',
    description: 'Build virtual portfolios and test strategies with historical market data.',
    href: '/simulator',
    cta: 'Launch Simulator',
  },
  {
    icon: <BookOpen size={19} />,
    title: 'Investment Academy',
    description: 'Structured courses and expert analysis on Moroccan financial markets.',
    href: '/learn',
    cta: 'Start Learning',
  },
  {
    icon: <Shield size={19} />,
    title: 'OPCVM Intelligence',
    description: 'Compare mutual funds from all major Moroccan banks by performance and risk.',
    href: '/opcvm',
    cta: 'Compare Funds',
  },
];

// ── FX pairs ─────────────────────────────────────────────────────────────────
const FX_PAIRS = [
  {
    symbol: 'FX_IDC:USDMAD',
    label: 'USD / MAD',
    description: 'US Dollar — Moroccan Dirham',
  },
  {
    symbol: 'FX_IDC:EURMAD',
    label: 'EUR / MAD',
    description: 'Euro — Moroccan Dirham',
  },
  {
    symbol: 'FX_IDC:GBPMAD',
    label: 'GBP / MAD',
    description: 'British Pound — Moroccan Dirham',
  },
];

export default function HomePage() {
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 5);

  return (
    <main style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. LIVE TICKER ──────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <TradingViewTicker />
      </div>

      {/* ── 3. MARKET PULSE ─────────────────────────────────────────────────── */}
      <div className="py-12" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-max">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-label">Market Pulse</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '28px', color: 'var(--text-primary)' }}
              >
                Bourse de Casablanca
              </h2>
              <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Key indicators and top movers — refreshed every 5 minutes.
              </p>
            </div>
            <Link
              href="/market"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              Full Market View <ArrowRight size={14} />
            </Link>
          </div>
          <BVCInvestorPulse />
        </div>
      </div>

      {/* ── 4. NEWS + QUICK ACCESS GRID ──────────────────────────────────────── */}
      <div className="py-14" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* News (2/3) */}
            <div className="lg:col-span-2">
              <span className="section-label mb-5 block">Market News</span>
              <MoroccoNewsFeed />
            </div>

            {/* Platform access (1/3) */}
            <div>
              <span className="section-label mb-5 block">Quick Access</span>
              <div className="space-y-2.5">
                {FEATURES.map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="group flex items-start gap-3.5 p-4 rounded-[9px] transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-strong)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-xs)';
                    }}
                  >
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-[7px] flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: 'var(--gold-subtle)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(176,125,42,0.18)',
                      }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-body font-medium text-[13.5px] mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {f.title}
                      </p>
                      <p
                        className="font-body text-[12px] leading-[1.5]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {f.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                      style={{ color: 'var(--gold)' }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. FOREX MARKET ─────────────────────────────────────────────────── */}
      <div
        className="py-14"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container-max">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-label">FX Market</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '28px', color: 'var(--text-primary)' }}
              >
                Forex Market (MAD)
              </h2>
              <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Moroccan Dirham exchange rates against major currencies — live data.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                style={{ backgroundColor: 'var(--gain)' }}
              />
              <span className="font-body text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Live · FX rates
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FX_PAIRS.map((pair) => (
              <TradingViewForexWidget
                key={pair.symbol}
                symbol={pair.symbol}
                label={pair.label}
                description={pair.description}
                height={220}
              />
            ))}
          </div>

          <p
            className="font-body text-[11.5px] mt-4"
            style={{ color: 'var(--text-muted)' }}
          >
            Exchange rates are indicative and may be delayed. Not financial advice.
          </p>
        </div>
      </div>

      {/* ── 6. GLOBAL MARKET OVERVIEW ───────────────────────────────────────── */}
      <div className="py-14" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-max">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-label">Global Overview</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '28px', color: 'var(--text-primary)' }}
              >
                Markets at a Glance
              </h2>
              <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Real-time overview of Moroccan and global indices.
              </p>
            </div>
            <Link
              href="/terminal"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              Advanced Terminal <ArrowRight size={14} />
            </Link>
          </div>
          <div
            className="overflow-hidden rounded-[10px]"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <TradingViewMarketOverview />
          </div>
        </div>
      </div>

      {/* ── 7. FEATURED ARTICLES ─────────────────────────────────────────────── */}
      <div
        className="py-14"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container-max">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-label">Research</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '28px', color: 'var(--text-primary)' }}
              >
                Expert Analysis
              </h2>
              <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                In-depth articles and education on Moroccan financial markets.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-9 flex justify-center">
            <Link href="/learn" className="btn-outline">
              Browse All Research <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 8. OPCVM TABLE ───────────────────────────────────────────────────── */}
      <div className="py-14" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container-max">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-label">Fund Selection</span>
              <h2
                className="font-display font-medium mt-2"
                style={{ fontSize: '28px', color: 'var(--text-primary)' }}
              >
                OPCVM — Top Funds
              </h2>
              <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Moroccan mutual funds ranked by 1-year performance.
              </p>
            </div>
            <Link
              href="/opcvm"
              className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-medium"
              style={{ color: 'var(--gold)' }}
            >
              All Funds <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-[10px]"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="overflow-x-auto">
              <table className="table-fintech w-full">
                <thead>
                  <tr>
                    <th>Fund</th>
                    <th>Bank</th>
                    <th>Type</th>
                    <th className="text-right">1Y Perf.</th>
                    <th className="text-right">Risk</th>
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
                          className="inline-flex items-center px-2 py-0.5 rounded-[4px] font-body text-[11px] font-medium"
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
                        <span className={fund.performance1Y >= 0 ? 'chip-gain' : 'chip-loss'}>
                          {fund.performance1Y >= 0 ? '+' : ''}
                          {formatPercent(fund.performance1Y / 100)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 5 }, (_, j) => (
                            <div
                              key={j}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  j < fund.risk ? 'var(--gold)' : 'var(--border-strong)',
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

      {/* ── 9. STATS STRIP ────────────────────────────────────────────────────── */}
      <div
        className="py-0"
        style={{ backgroundColor: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="container-max">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            {[
              { value: '77',     label: 'Listed Companies'       },
              { value: 'MASI',   label: 'All Shares Index'       },
              { value: '100%',   label: 'Free to Use'            },
              { value: '∞',      label: 'Learning Resources'     },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center py-10 px-4 text-center"
              >
                <span
                  className="font-display font-medium"
                  style={{ fontSize: '34px', color: 'var(--gold-dim)', lineHeight: 1.1 }}
                >
                  {item.value}
                </span>
                <span
                  className="font-body text-[11.5px] mt-1.5 uppercase tracking-[0.08em]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 10. DISCLAIMER ───────────────────────────────────────────────────── */}
      <div className="py-8">
        <div className="container-max">
          <FinancialDisclaimer variant="short" />
        </div>
      </div>
    </main>
  );
}
