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
      <div className="w-full rounded-2xl bg-[#112240] border border-[#C9A84C]/12 animate-pulse"
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

  const sections = [
    // ── Hero ──────────────────────────────────────────────────────────────
    <Hero key="hero" />,

    // ── Live Ticker Tape ──────────────────────────────────────────────────
    <div key="ticker" className="bg-[#061020] border-y border-[#C9A84C]/10">
      <TradingViewTicker />
    </div>,

    // ── Live Market Overview ───────────────────────────────────────────────
    <section key="market" className="py-20 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="gold-bar" />
            <div className="inline-flex items-center gap-2 bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full animate-pulse" />
              <span className="text-[#2ECC71] text-xs font-semibold uppercase tracking-wide font-sans">{t('markets.badge')}</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-1 font-display">
              {t('markets.title')}
            </h2>
            <p className="text-[#A8B4C8] text-sm font-sans">
              {t('markets.subtitle')}
            </p>
          </div>
          <Link
            href="/market"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#E8C45A] transition-all whitespace-nowrap font-sans"
          >
            <BarChart2 className="w-4 h-4" />
            {t('markets.cta')}
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-[#C9A84C]/12 shadow-card w-full" style={{ maxWidth: '100%' }}>
          <TradingViewMarketOverview />
        </div>
        <p className="text-center text-xs text-[#A8B4C8]/40 mt-3 font-sans">
          {t('markets.source')}
        </p>
      </div>
    </section>,

    // ── Forex Section ─────────────────────────────────────────────────────
    <section key="forex" className="py-16 bg-[#112240]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="gold-bar" />
          <h2 className="text-2xl font-black text-white mb-1 font-display">
            {t('forex.title')}
          </h2>
          <p className="text-[#A8B4C8] text-sm font-sans">
            {t('forex.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <ForexWidget symbol="FX_IDC:EURMAD" name="EUR / MAD" />
          <ForexWidget symbol="FX_IDC:USDMAD" name="USD / MAD" />
        </div>
        <div className="bg-[#0A1628] border border-[#C9A84C]/12 rounded-2xl px-5 py-4 text-xs text-[#A8B4C8]/60 leading-relaxed font-sans">
          {t('forex.disclaimer')}{' '}
          <a
            href="https://www.bkam.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#C9A84C] transition-colors"
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
    <section key="articles" className="py-20 bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="gold-bar" />
            <h2 className="text-3xl font-black text-white mb-2 font-display">
              {t('articles.title')}
            </h2>
            <p className="text-[#A8B4C8] font-sans">{t('articles.subtitle')}</p>
          </div>
          <Link
            href="/learn"
            className="hidden sm:flex items-center gap-2 text-[#C9A84C] font-semibold text-sm hover:gap-3 transition-all font-sans"
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
            <button className="inline-flex items-center gap-2 text-[#C9A84C] font-semibold border border-[#C9A84C]/40 rounded-xl px-6 py-3 hover:bg-[#C9A84C]/10 transition-colors font-sans">
              {t('articles.cta')} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>,

    // ── OPCVM Preview ──────────────────────────────────────────────────────
    <section key="opcvm" className="py-20 bg-[#112240]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="gold-bar" />
            <h2 className="text-3xl font-black text-white mb-2 font-display">
              {t('opcvm.title')}
            </h2>
            <p className="text-[#A8B4C8] font-sans">{t('opcvm.subtitle')}</p>
          </div>
          <Link
            href="/opcvm"
            className="hidden sm:flex items-center gap-2 text-[#C9A84C] font-semibold text-sm hover:gap-3 transition-all font-sans"
          >
            {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[640px] px-4 sm:px-0">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-[#C9A84C] uppercase tracking-wider px-5 py-3 font-sans">{t('opcvm.headers.fund')}</th>
                  <th className="text-left text-xs font-semibold text-[#C9A84C] uppercase tracking-wider px-5 py-3 font-sans">{t('opcvm.headers.bank')}</th>
                  <th className="text-left text-xs font-semibold text-[#C9A84C] uppercase tracking-wider px-5 py-3 font-sans">{t('opcvm.headers.type')}</th>
                  <th className="text-right text-xs font-semibold text-[#C9A84C] uppercase tracking-wider px-5 py-3 font-sans">{t('opcvm.headers.perf1y')}</th>
                  <th className="text-right text-xs font-semibold text-[#C9A84C] uppercase tracking-wider px-5 py-3 font-sans">{t('opcvm.headers.risk')}</th>
                </tr>
              </thead>
              <tbody>
                {featuredFunds.map((fund) => (
                  <tr
                    key={fund.id}
                    className="bg-[#0A1628] border border-[#C9A84C]/12 rounded-xl hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/4 transition-all duration-200"
                  >
                    <td className="px-5 py-4 rounded-l-xl">
                      <p className="font-semibold text-white text-sm font-sans">{fund.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold bg-[#C9A84C]/10 text-[#C9A84C] px-2.5 py-1 rounded-lg font-sans">
                        {fund.bankCode}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-sans ${
                        fund.type === 'Actions'     ? 'bg-[#2ECC71]/12 text-[#2ECC71]'  :
                        fund.type === 'Obligataire' ? 'bg-[#7C9EBF]/12 text-[#7C9EBF]' :
                        fund.type === 'Monétaire'   ? 'bg-white/8 text-[#A8B4C8]'        :
                        'bg-[#C9A84C]/12 text-[#C9A84C]'
                      }`}>
                        {fund.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-bold text-sm font-mono ${fund.performance1Y >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                        {formatPercent(fund.performance1Y)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right rounded-r-xl">
                      <div className="flex items-center justify-end gap-1">
                        {Array.from({ length: 7 }, (_, j) => (
                          <div
                            key={j}
                            className={`w-2 h-2 rounded-full ${j < fund.risk ? 'bg-[#C9A84C]' : 'bg-[#1A3050]'}`}
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
            <button className="inline-flex items-center gap-2 text-[#C9A84C] font-semibold border border-[#C9A84C]/40 rounded-xl px-6 py-3 hover:bg-[#C9A84C]/10 transition-colors font-sans">
              {t('opcvm.cta')} <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>,
  ];

  return <>{injectEduBanners(sections)}</>;
}
