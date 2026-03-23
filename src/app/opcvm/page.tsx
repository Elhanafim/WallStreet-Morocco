import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatPercent } from '@/lib/utils';
import { fetchOpcvmMarketStats } from '@/lib/data/opcvm-stats';
import OpcvmMarketBanner from '@/components/opcvm/OpcvmMarketBanner';
import OpcvmFundList from '@/components/opcvm/OpcvmFundList';

export const metadata = {
  title: 'OPCVM & Fonds | WallStreet Morocco',
  description: 'Comparez les principaux OPCVM des 4 grandes banques marocaines avec des données officielles AMMC.',
};

export default async function OPCVMPage() {
  const marketStats = await fetchOpcvmMarketStats();

  const bestPerformer  = [...opcvmFunds].sort((a, b) => b.performance1Y - a.performance1Y)[0];
  const avgPerf1Y      = opcvmFunds.reduce((s, f) => s + f.performance1Y, 0) / opcvmFunds.length;
  const totalAum       = opcvmFunds.reduce((s, f) => s + (f.totalAssets ?? 0), 0);

  return (
    <div className="pt-16 min-h-screen bg-surface-50">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-hero py-20 px-4 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/2" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            <span className="text-accent text-sm font-semibold">Données AMMC officielles</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            OPCVM &amp; Fonds{' '}
            <span className="gradient-text-gold">marocains</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Comparez les {opcvmFunds.length} principaux fonds des 4 grandes banques marocaines.
            Performances, risques et statistiques de marché en temps réel via l&apos;AMMC.
          </p>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              {
                label: 'Fonds suivis',
                value: `${opcvmFunds.length}`,
                sub: '4 banques',
              },
              {
                label: 'Meilleure perf. 1 an',
                value: formatPercent(bestPerformer.performance1Y),
                sub: bestPerformer.name.split(' ').slice(0, 2).join(' '),
              },
              {
                label: 'Perf. moy. 1 an',
                value: formatPercent(avgPerf1Y),
                sub: 'tous fonds confondus',
              },
              {
                label: 'Actif net suivi',
                value: `${(totalAum / 1e9).toFixed(0)} Mrd`,
                sub: 'MAD (données indicatives)',
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4">
                <p className="text-accent font-black text-xl sm:text-2xl mb-0.5">{kpi.value}</p>
                <p className="text-white/80 text-xs font-semibold">{kpi.label}</p>
                <p className="text-white/40 text-2xs mt-0.5 hidden sm:block">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live AMMC market overview ─────────────────────────────────── */}
      {marketStats && <OpcvmMarketBanner stats={marketStats} />}

      {/* ── Fund list ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-primary">Comparer les fonds</h2>
            <p className="text-primary/50 text-sm mt-0.5">
              Filtrez, triez et comparez tous les OPCVM disponibles
            </p>
          </div>
        </div>

        <OpcvmFundList />

        {/* ── Bottom guide CTA ───────────────────────────────────────── */}
        <div className="mt-16 bg-gradient-hero rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-3 py-1 mb-4">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent text-xs font-semibold">Guide complet</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-3">
                Comment choisir son OPCVM ?
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Notre guide vous explique comment comparer les OPCVM marocains selon vos
                objectifs, votre horizon de placement et votre tolérance au risque.
              </p>
              <Link
                href="/learn/opcvm-guide-complet"
                className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-6 py-3 rounded-xl hover:bg-accent-600 transition-colors shadow-md"
              >
                Lire le guide <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {[
                "Définir votre horizon d'investissement",
                'Évaluer votre tolérance au risque',
                'Comparer les performances sur 3 et 5 ans',
                'Analyser les frais de gestion annuels',
                'Vérifier la liquidité et la fréquence de VL',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 rounded-lg bg-accent text-primary text-xs font-black flex items-center justify-center flex-shrink-0">
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
