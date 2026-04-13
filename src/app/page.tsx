'use client';

import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import BVCInvestorPulse from '@/components/home/BVCInvestorPulse';
import StatsSection from '@/components/home/StatsSection';
import MoroccoNewsFeed from '@/components/home/MoroccoNewsFeed';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import ArticleCard from '@/components/learn/ArticleCard';
import Section from '@/components/ui/Section';
import { getFeaturedArticles } from '@/lib/data/articles';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent, cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// TradingView widgets
const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
const TradingViewMarketOverview = dynamic(() => import('@/components/market/TradingViewMarketOverview'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-[var(--bg-elevated)] animate-pulse rounded-xl" />
});

export default function HomePage() {
  const { t } = useTranslation('home');
  const featuredArticles = getFeaturedArticles(6);
  const featuredFunds    = opcvmFunds.slice(0, 4);

  return (
    <main className="bg-[var(--bg-base)]">
      {/* 1. HERO - Full Bleed Editorial */}
      <Hero />

      {/* 2. MARKET TICKER BAR */}
      <div className="bg-[var(--bg-surface)] border-y border-[var(--border)] overflow-hidden">
        <TradingViewTicker />
      </div>

      {/* 3. MARKET INDICATOR DASHBOARD (PULSE) */}
      <div className="py-[var(--space-md)]">
        <BVCInvestorPulse />
      </div>

      {/* 4. MOROCCO NEWS FEED */}
      <div className="container-max pb-[var(--space-xl)]">
        <MoroccoNewsFeed />
      </div>

      {/* 5. STATS STRIP */}
      <StatsSection />

      {/* 6. MARKET OVERVIEW CHART */}
      <div className="py-[var(--space-xl)]">
        <Section
          variant="base"
          title="Vue d'ensemble des marchés"
          subtitle="Analyse graphique en temps réel des principaux indices et actifs financiers."
          cta={
            <Link href="/market" className="inline-flex items-center gap-2 font-body text-[14px] font-medium text-[var(--gold)]">
              Accéder au terminal <ArrowRight size={16} />
            </Link>
          }
        >
          <div className="premium-card p-0 overflow-hidden border-[var(--border)]">
            <TradingViewMarketOverview />
          </div>
        </Section>
      </div>

      {/* 7. FEATURED ARTICLES */}
      <div className="py-[var(--space-xl)] bg-[var(--bg-surface)] border-y border-[var(--border)]">
        <Section
          variant="base"
          title="Analyses & Perspectives"
          subtitle="Dernières publications de nos experts sur le marché financier marocain."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/learn" className="inline-flex items-center gap-2 border border-[var(--gold)] text-[var(--gold)] px-8 py-3 rounded-[6px] font-body text-[14px] font-medium hover:bg-[var(--gold)] hover:text-white transition-all">
              Toutes les analyses <ArrowRight size={16} />
            </Link>
          </div>
        </Section>
      </div>

      {/* 8. OPCVM PREVIEW */}
      <div className="py-[var(--space-xl)]">
        <Section
          variant="base"
          title="OPCVM Selection"
          subtitle="Comparaison des meilleurs fonds des principales banques marocaines."
        >
          <div className="premium-card p-0 border-[var(--border)]">
            <div className="overflow-x-auto">
              <table className="table-fintech min-w-full">
                <thead>
                  <tr>
                    <th className="font-body">Fonds</th>
                    <th className="font-body">Banque</th>
                    <th className="font-body">Type</th>
                    <th className="font-body text-right">Perf. 1 an</th>
                    <th className="font-body text-right">Risque</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredFunds.map((fund) => (
                    <tr key={fund.id}>
                      <td className="font-bold text-[var(--text-primary)]">{fund.name}</td>
                      <td className="text-[var(--text-secondary)]">{fund.bankCode}</td>
                      <td className="text-[var(--text-secondary)]">{fund.type}</td>
                      <td className={cn("text-right font-bold font-mono", fund.performance1Y >= 0 ? "text-[var(--gain)]" : "text-[var(--loss)]")}>
                        {formatPercent(fund.performance1Y / 100)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 5 }, (_, j) => (
                            <div
                              key={j}
                              className={cn("w-1.5 h-1.5 rounded-full transition-all", j < fund.risk ? "bg-[var(--gold)]" : "bg-[var(--border)]")}
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
        </Section>
      </div>

      {/* 9. DISCLAIMER */}
      <div className="container-max py-12 border-t border-[var(--border)]">
        <FinancialDisclaimer variant="short" />
      </div>
    </main>
  );
}
