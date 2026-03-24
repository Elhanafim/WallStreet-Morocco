'use client';

import dynamic from 'next/dynamic';
import { TrendingUp } from 'lucide-react';
import KPIStrip from './KPIStrip';
import HoldingCard from './HoldingCard';
import ScenariosTable from './ScenariosTable';
import MarketTimeline from './MarketTimeline';
import InvestmentThesis from './InvestmentThesis';
import { HOLDINGS, SCENARIOS, MARKET_EVENTS, DCA_TIMELINE } from '@/data/founderPortfolio';

// Lazy-load the chart to avoid blocking initial page render
const PortfolioChart = dynamic(() => import('./PortfolioChart'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-[240px] md:h-[320px] bg-white/5 border border-white/10 rounded-3xl mb-10 animate-pulse"
      aria-hidden="true"
    />
  ),
});

export default function StrategySection() {
  return (
    <section
      className="py-24 bg-gradient-to-br from-primary via-[#112d5e] to-[#0d3060] relative overflow-hidden"
      aria-label="Stratégie et performance — Sélection de titres BVC"
    >
      {/* Background decorative glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ BLOCK 1 — Section header ═════════════════════════════════════════ */}
        <div className="mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span className="text-accent text-xs font-bold uppercase tracking-widest">
              Stratégie &amp; Performance
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                Sélection de titres BVC<br />
                <span className="text-accent">+51% en 17 mois</span>
              </h2>
              {/* Pull quote */}
              <p className="text-white/50 text-sm sm:text-base italic max-w-2xl leading-relaxed">
                &ldquo;100$ par mois. 4 convictions. 17 mois. Une démonstration que la
                concentration sur les mégatendances surperforme le marché de 52 points.&rdquo;
              </p>
            </div>
            {/* Meta tag */}
            <div className="flex-shrink-0 text-right">
              <p className="text-white/30 text-xs leading-relaxed">
                Novembre 2024 → Mars 2026<br />
                DCA · Profil Dynamique
              </p>
            </div>
          </div>
        </div>

        {/* ══ BLOCK 2 — KPI strip ══════════════════════════════════════════════ */}
        <KPIStrip />

        {/* ══ BLOCK 3 — Portfolio chart ════════════════════════════════════════ */}
        <PortfolioChart data={DCA_TIMELINE} />

        {/* ══ BLOCK 4 — Holdings breakdown ═════════════════════════════════════ */}
        <div className="mb-16">
          <div className="mb-6">
            <h3 className="text-white font-black text-xl sm:text-2xl mb-1">
              Les 4 convictions
            </h3>
            <p className="text-white/40 text-sm">
              Pondération égale · 25% chacune · DCA mensuel 25$/valeur
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {HOLDINGS.map((holding, i) => (
              <HoldingCard key={holding.ticker} holding={holding} index={i} />
            ))}
          </div>
        </div>

        {/* ══ BLOCK 5 — Scenarios table ════════════════════════════════════════ */}
        <ScenariosTable scenarios={SCENARIOS} />

        {/* ══ BLOCK 6 — Market timeline ════════════════════════════════════════ */}
        <MarketTimeline events={MARKET_EVENTS} />

        {/* ══ BLOCK 7 — Investment thesis ══════════════════════════════════════ */}
        <InvestmentThesis />

        {/* ══ BLOCK 8 — Legal disclaimer ═══════════════════════════════════════ */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5 text-white/30 text-xs leading-relaxed">
          <p>
            Cette section présente une simulation rétrospective basée sur des données
            historiques reconstituées. Elle est fournie à titre informatif et éducatif
            uniquement. Elle ne constitue pas un conseil en investissement. Les
            performances passées ne préjugent pas des performances futures.
            Investir en bourse comporte un risque de perte en capital.
          </p>
        </div>

      </div>
    </section>
  );
}
