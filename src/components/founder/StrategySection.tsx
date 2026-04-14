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
      className="w-full h-[240px] md:h-[320px] rounded-[12px] mb-10 animate-pulse"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      aria-hidden="true"
    />
  ),
});

export default function StrategySection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      aria-label="Stratégie et performance — Sélection de titres BVC"
    >
      {/* Background decorative glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: 'rgba(184,151,74,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" style={{ backgroundColor: 'rgba(15,45,82,0.04)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ BLOCK 0 — Legal disclaimer (must appear BEFORE any figures) ══════ */}
        <div className="mb-10 rounded-[10px] p-5" style={{ backgroundColor: 'rgba(176,125,42,0.08)', borderLeft: '4px solid var(--gold)', border: '1px solid rgba(184,151,74,0.3)' }}>
          <p className="font-medium text-sm mb-2" style={{ color: 'var(--warning)' }}>⚠️ AVERTISSEMENT IMPORTANT</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--warning)' }}>Les performances passées ne préjugent pas des performances futures.</strong>{' '}
            Cette section présente une simulation rétrospective à titre éducatif uniquement.
            Elle ne constitue PAS un conseil en investissement. L'investissement comporte un risque
            de perte en capital, pouvant aller jusqu'à la totalité des sommes investies. Les
            chiffres présentés sont issus d'une modélisation sur données historiques et ne constituent
            pas une promesse ou une garantie de résultats futurs. WallStreet Morocco n'est pas
            agréé par l'AMMC (Autorité Marocaine du Marché des Capitaux).
          </p>
        </div>

        {/* ══ BLOCK 1 — Section header ═════════════════════════════════════════ */}
        <div className="mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
              Stratégie &amp; Performance
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight mb-3" style={{ color: 'var(--navy)' }}>
                Sélection de titres BVC<br />
                <span style={{ color: 'var(--gold)' }}>+51% en 17 mois</span>
              </h2>
              {/* Pull quote */}
              <p className="text-sm sm:text-base italic max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                &ldquo;100$ par mois. 4 convictions. 17 mois. Une démonstration que la
                concentration sur les mégatendances surperforme le marché de 52 points.&rdquo;
              </p>
            </div>
            {/* Meta tag */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
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
            <h3 className="font-medium text-xl sm:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Les 4 convictions
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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

        {/* ══ BLOCK 8 — Legal disclaimer (repeated at bottom) ══════════════════ */}
        <div className="rounded-[10px] p-5 text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p>
            <strong style={{ color: 'var(--text-secondary)' }}>Simulation rétrospective à titre éducatif uniquement.</strong>{' '}
            Les performances affichées (+51%) sont basées sur une modélisation DCA appliquée à des
            données historiques reconstituées. La répartition par actif est indicative. Le benchmark
            MASI DCA est calculé au taux annuel de ~8%. <strong style={{ color: 'var(--text-secondary)' }}>Les performances
            passées ne préjugent pas des performances futures.</strong> Investir en bourse comporte
            un risque de perte en capital. Contenu éducatif uniquement — pas un conseil en
            investissement. WallStreet Morocco n'est pas agréé par l'AMMC.
          </p>
        </div>

      </div>
    </section>
  );
}
