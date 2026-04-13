'use client';

import Link from 'next/link';
import { ArrowRight, BarChart2, TrendingUp, ShieldCheck, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import BVCInvestorPulse from '@/components/home/BVCInvestorPulse';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import ArticleCard from '@/components/learn/ArticleCard';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getFeaturedArticles } from '@/lib/data/articles';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent, cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { injectEduBanners } from '@/utils/injectEduBanners';

// TradingView widgets
const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
const TradingViewMarketOverview = dynamic(() => import('@/components/market/TradingViewMarketOverview'), {
  ssr: false,
  loading: () => <Card variant="glass" className="h-[660px] animate-pulse" />
});
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
    <div key="ticker" className="glass-surface border-y border-[var(--border)] overflow-hidden">
      <TradingViewTicker />
    </div>,

    // ── Live Market Overview ───────────────────────────────────────────────
    <Section
      key="market"
      variant="base"
      badge={t('markets.badge')}
      title={t('markets.title')}
      subtitle={t('markets.subtitle')}
      cta={
        <Button variant="secondary" icon={<BarChart2 className="w-4 h-4" />}>
          <Link href="/market">{t('markets.cta')}</Link>
        </Button>
      }
    >
      <Card variant="glass" className="p-0 overflow-hidden border-[var(--border)]">
        <TradingViewMarketOverview />
      </Card>
      <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs font-medium">
        <Globe className="w-3.5 h-3.5" />
        {t('markets.source')}
      </div>
    </Section>,

    // ── Forex Section ─────────────────────────────────────────────────────
    <Section
      key="forex"
      variant="surface"
      title={t('forex.title')}
      subtitle={t('forex.subtitle')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ForexWidget symbol="FX_IDC:EURMAD" name="EUR / MAD" />
        <ForexWidget symbol="FX_IDC:USDMAD" name="USD / MAD" />
      </div>
      <Card variant="outline" className="flex items-start gap-3 p-4 bg-[var(--bg-elevated)]/50">
        <ShieldCheck className="w-5 h-5 text-[var(--gold)] shrink-0" />
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          {t('forex.disclaimer')}{' '}
          <a href="https://www.bkam.ma" target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] hover:underline font-bold">
            {t('forex.bamLink')}
          </a>.
        </p>
      </Card>
    </Section>,

    // ── BVC Investor Dashboard ─────────────────────────────────────────────
    <BVCInvestorPulse key="pulse" />,

    // ── Financial disclaimer ───────────────────────────────────────────────
    <div key="disclaimer" className="container-max py-6 border-t border-[var(--border)]">
      <FinancialDisclaimer variant="short" />
    </div>,

    // ── Featured Articles ──────────────────────────────────────────────────
    <Section
      key="articles"
      variant="base"
      title={t('articles.title')}
      subtitle={t('articles.subtitle')}
      cta={
        <Button variant="ghost" className="hidden sm:flex" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
          <Link href="/learn">{t('articles.cta')}</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      <div className="mt-12 text-center sm:hidden">
        <Button variant="secondary" fullWidth>
          <Link href="/learn">{t('articles.cta')}</Link>
        </Button>
      </div>
    </Section>,

    // ── OPCVM Preview ──────────────────────────────────────────────────────
    <Section
      key="opcvm"
      variant="surface"
      title={t('opcvm.title')}
      subtitle={t('opcvm.subtitle')}
      cta={
        <Button variant="ghost" className="hidden sm:flex" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
          <Link href="/opcvm">{t('opcvm.cta')}</Link>
        </Button>
      }
    >
      <Card variant="glass" className="p-0 overflow-x-auto border-[var(--border)]">
        <table className="table-fintech min-w-full">
          <thead>
            <tr>
              <th>{t('opcvm.headers.fund')}</th>
              <th>{t('opcvm.headers.bank')}</th>
              <th>{t('opcvm.headers.type')}</th>
              <th className="text-right">{t('opcvm.headers.perf1y')}</th>
              <th className="text-right">{t('opcvm.headers.risk')}</th>
            </tr>
          </thead>
          <tbody>
            {featuredFunds.map((fund) => (
              <tr key={fund.id} className="group">
                <td className="font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                  {fund.name}
                </td>
                <td>
                  <Badge variant="outline" size="xs">{fund.bankCode}</Badge>
                </td>
                <td>
                  <Badge 
                    variant={fund.type === 'Actions' ? 'success' : fund.type === 'Obligataire' ? 'primary' : 'default'} 
                    size="xs"
                  >
                    {fund.type}
                  </Badge>
                </td>
                <td className="text-right font-bold font-mono">
                  <span className={fund.performance1Y >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}>
                    {formatPercent(fund.performance1Y)}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {Array.from({ length: 7 }, (_, j) => (
                      <div
                        key={j}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-500",
                          j < fund.risk ? "bg-[var(--gold)]" : "bg-[var(--border)]"
                        )}
                        style={{ delay: `${j * 50}ms` }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="mt-12 text-center sm:hidden">
        <Button variant="secondary" fullWidth>
          <Link href="/opcvm">{t('opcvm.cta')}</Link>
        </Button>
      </div>
    </Section>,
  ];

  return <main className="bg-[var(--bg-base)] text-[var(--text-primary)]">{injectEduBanners(sections)}</main>;
}
