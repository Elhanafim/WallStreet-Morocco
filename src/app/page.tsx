'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart2, Shield, Zap } from 'lucide-react';
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
      style={{ height: '540px', backgroundColor: 'var(--bg-elevated)' }}
    />
  ),
});

// ── Quick access features ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BarChart2 size={18} />,
    title: 'Real-Time Markets',
    description: 'Live prices and charts for all 77 CSE-listed companies.',
    href: '/market',
  },
  {
    icon: <Zap size={18} />,
    title: 'Portfolio Simulator',
    description: 'Test strategies with compound-interest projections.',
    href: '/simulator',
  },
  {
    icon: <BookOpen size={18} />,
    title: 'Investment Academy',
    description: 'Courses and expert analysis on Moroccan markets.',
    href: '/learn',
  },
  {
    icon: <Shield size={18} />,
    title: 'OPCVM Funds',
    description: 'Compare Moroccan mutual funds by performance and risk.',
    href: '/opcvm',
  },
];

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  label,
  title,
  subtitle,
  cta,
  bg = 'transparent',
  bordered = false,
  children,
}: {
  label: string;
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
  bg?: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="py-14"
      style={{
        backgroundColor: bg,
        borderTop: bordered ? '1px solid var(--border)' : undefined,
        borderBottom: bordered ? '1px solid var(--border)' : undefined,
      }}
    >
      <div className="container-max">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-label">{label}</span>
            <h2
              className="font-display font-medium mt-2"
              style={{ fontSize: '28px', color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="font-body text-[14px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {cta && <div className="hidden sm:block">{cta}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 5);

  return (
    <main style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── 1. HERO (background + title + MASI chart) ───────────────────────── */}
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

      {/* ── 3. GLOBAL OVERVIEW — Markets at a Glance ────────────────────────── */}
      <Section
        label="Global Overview"
        title="Markets at a Glance"
        subtitle="Real-time overview of Moroccan and global indices."
        bg="var(--bg-surface)"
        bordered
        cta={
          <Link
            href="/terminal"
            className="flex items-center gap-1.5 font-body text-[13px] font-medium"
            style={{ color: 'var(--gold)' }}
          >
            Advanced Terminal <ArrowRight size={14} />
          </Link>
        }
      >
        <div
          className="overflow-hidden rounded-[10px]"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <TradingViewMarketOverview />
        </div>
      </Section>

      {/* ── 4. BVC INVESTOR DASHBOARD ────────────────────────────────────────── */}
      <Section
        label="BVC Dashboard"
        title="BVC Investor Dashboard"
        subtitle="Key data for individual investors on the Casablanca Stock Exchange."
        bordered
        cta={
          <Link
            href="/market"
            className="flex items-center gap-1.5 font-body text-[13px] font-medium"
            style={{ color: 'var(--gold)' }}
          >
            Full Market View <ArrowRight size={14} />
          </Link>
        }
      >
        <BVCInvestorPulse />
      </Section>

      {/* ── 5. MARKET NEWS + QUICK ACCESS ────────────────────────────────────── */}
      <div
        className="py-14"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* News — 2/3 width */}
            <div className="lg:col-span-2">
              <span className="section-label mb-5 block">Market News</span>
              <MoroccoNewsFeed />
            </div>

            {/* Quick access — 1/3 width */}
            <div>
              <span className="section-label mb-5 block">Quick Start</span>
              <div className="space-y-2.5">
                {FEATURES.map((f) => (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="group flex items-start gap-3.5 p-4 rounded-[9px] transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = 'var(--gold)';
                      el.style.backgroundColor = 'var(--bg-surface)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.borderColor = 'var(--border)';
                      el.style.backgroundColor = 'var(--bg-elevated)';
                    }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-[6px] flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: 'var(--gold-subtle)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(176,125,42,0.2)',
                      }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-body font-semibold text-[13px] mb-0.5"
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
                      size={13}
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

      {/* ── 6. RESEARCH — Expert Analysis ────────────────────────────────────── */}
      <Section
        label="Research"
        title="Expert Analysis"
        subtitle="In-depth articles and education on Moroccan financial markets."
        bordered
        cta={
          <Link
            href="/learn"
            className="flex items-center gap-1.5 font-body text-[13px] font-medium"
            style={{ color: 'var(--gold)' }}
          >
            All Articles <ArrowRight size={14} />
          </Link>
        }
      >
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
      </Section>

      {/* ── 7. FUND SELECTION — OPCVM ────────────────────────────────────────── */}
      <Section
        label="Fund Selection"
        title="OPCVM — Top Funds"
        subtitle="Moroccan mutual funds ranked by 1-year performance."
        bg="var(--bg-surface)"
        bordered
        cta={
          <Link
            href="/opcvm"
            className="flex items-center gap-1.5 font-body text-[13px] font-medium"
            style={{ color: 'var(--gold)' }}
          >
            All Funds <ArrowRight size={14} />
          </Link>
        }
      >
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
                        {fund.performance1Y >= 0 ? '+' : ''}{formatPercent(fund.performance1Y / 100)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {Array.from({ length: 5 }, (_, j) => (
                          <div
                            key={j}
                            className="w-2 h-2 rounded-full"
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
      </Section>

      {/* ── 8. STATS STRIP ────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--navy)' }}>
        <div className="container-max">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            {[
              { value: '77',   label: 'Listed Companies'  },
              { value: 'MASI', label: 'All Shares Index'  },
              { value: '100%', label: 'Free to Use'        },
              { value: '∞',    label: 'Learning Resources' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center py-10 px-4 text-center"
              >
                <span
                  className="font-display font-medium"
                  style={{ fontSize: '32px', color: 'var(--gold-dim)', lineHeight: 1.1 }}
                >
                  {item.value}
                </span>
                <span
                  className="font-body text-[11px] mt-1.5 uppercase tracking-[0.08em]"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. DISCLAIMER ────────────────────────────────────────────────────── */}
      <div className="py-8">
        <div className="container-max">
          <FinancialDisclaimer variant="short" />
        </div>
      </div>
    </main>
  );
}
