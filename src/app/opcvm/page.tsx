import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent } from '@/lib/utils';
import { fetchOpcvmMarketStats } from '@/lib/data/opcvm-stats';
import OpcvmMarketBanner from '@/components/opcvm/OpcvmMarketBanner';
import OpcvmFundList from '@/components/opcvm/OpcvmFundList';
import Link from 'next/link';

export const metadata = {
  title: 'OPCVM & Fonds | WallStreet Morocco',
  description: 'Comparez les principaux OPCVM des 4 grandes banques marocaines.',
};

export default async function OPCVMPage() {
  // Fetch live market stats from AMMC (cached 24h, fails gracefully)
  const marketStats = await fetchOpcvmMarketStats();

  const bestPerformer1Y  = [...opcvmFunds].sort((a, b) => b.performance1Y - a.performance1Y)[0];
  const avgPerformance1Y = opcvmFunds.reduce((sum, f) => sum + f.performance1Y, 0) / opcvmFunds.length;

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="bg-gradient-hero py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-black text-white mb-4">
            OPCVM & Fonds{' '}
            <span className="gradient-text-gold">marocains</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Comparez les {opcvmFunds.length} principaux OPCVM des 4 grandes banques
            marocaines. Performances, risques et conditions d&apos;investissement.
          </p>

          {/* Static quick stats (from local data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'OPCVM suivis',    value: `${opcvmFunds.length}` },
              { label: 'Meilleur 1 an',   value: formatPercent(bestPerformer1Y.performance1Y) },
              { label: 'Perf. moy. 1 an', value: formatPercent(avgPerformance1Y) },
              { label: 'Banques',          value: '4' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/20 rounded-xl p-4">
                <p className="text-accent font-black text-xl">{stat.value}</p>
                <p className="text-white/60 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Live AMMC market banner — only shown when fetch succeeds */}
          {marketStats && <OpcvmMarketBanner stats={marketStats} />}
        </div>
      </div>

      {/* ── Fund list (filters + cards) — client component ──────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <OpcvmFundList />

        {/* ── How to choose guide ──────────────────────────────── */}
        <div className="mt-16 bg-gradient-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          </div>
          <div className="relative grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-black text-white mb-4">
                Comment choisir son OPCVM ?
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Notre guide complet vous explique comment comparer les OPCVM marocains
                selon vos objectifs, votre horizon et votre tolérance au risque.
              </p>
              <Link
                href="/learn/opcvm-guide-complet"
                className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-6 py-3 rounded-xl hover:bg-accent-600 transition-colors shadow-md"
              >
                Lire le guide complet
              </Link>
            </div>
            <div className="space-y-3">
              {[
                "Définir votre horizon d'investissement",
                'Évaluer votre tolérance au risque',
                'Comparer les performances 3 et 5 ans',
                'Analyser les frais de gestion',
                'Vérifier la liquidité du fonds',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                  <span className="w-7 h-7 rounded-lg bg-accent text-primary text-xs font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-white/80 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
