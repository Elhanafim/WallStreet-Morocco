import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Star, Lock, BookOpen, BarChart2, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import MarketTicker from '@/components/home/MarketTicker';
import StatsSection from '@/components/home/StatsSection';
import ArticleCard from '@/components/learn/ArticleCard';
import { getFeaturedArticles } from '@/lib/data/articles';
import { listedStocks } from '@/lib/data/stocks';
import { opcvmFunds } from '@/lib/data/opcvm';
import { formatCurrency, formatPercent, getChangeBgColor } from '@/lib/utils';

const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });

export default function HomePage() {
  const featuredArticles = getFeaturedArticles(6);
  const topStocks = listedStocks.slice(0, 6);
  const featuredFunds = opcvmFunds.slice(0, 4);

  return (
    <>
      <Hero />
      <div className="bg-primary">
        <TradingViewTicker />
      </div>
      <MarketTicker />

      {/* Market Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">
                Aperçu du marché
              </h2>
              <p className="text-primary/60">Cours en temps réel de la Bourse de Casablanca</p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/market"
                className="flex items-center gap-2 bg-secondary text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-secondary-600 transition-all"
              >
                <BarChart2 className="w-4 h-4" />
                Voir les marchés en direct
              </Link>
              <Link
                href="/learn"
                className="flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all"
              >
                Toutes les valeurs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white border border-surface-200 rounded-2xl p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2">
                      <span className="text-accent font-black text-xs">{stock.symbol.slice(0, 3)}</span>
                    </div>
                    <p className="font-bold text-primary text-sm">{stock.symbol}</p>
                    <p className="text-primary/50 text-xs">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-lg">{stock.price.toFixed(2)}</p>
                    <p className="text-primary/40 text-xs">MAD</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary/40">
                    Vol: {stock.volume.toLocaleString('fr-MA')}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getChangeBgColor(stock.changePercent)}`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSection />

      {/* Featured Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">
                Dernières analyses
              </h2>
              <p className="text-primary/60">Guides, stratégies et analyses par nos experts</p>
            </div>
            <Link
              href="/learn"
              className="hidden sm:flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all"
            >
              Tous les articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/learn">
              <button className="inline-flex items-center gap-2 text-secondary font-semibold border border-secondary rounded-xl px-6 py-3 hover:bg-secondary hover:text-white transition-colors">
                Tous les articles <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* OPCVM Preview */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-primary mb-2">
                OPCVM en vedette
              </h2>
              <p className="text-primary/60">Les meilleurs fonds de placement marocains</p>
            </div>
            <Link
              href="/opcvm"
              className="hidden sm:flex items-center gap-2 text-secondary font-semibold text-sm hover:gap-3 transition-all"
            >
              Tous les OPCVM <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[640px] px-4 sm:px-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border border-surface-200 rounded-xl">
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3.5 first:rounded-l-xl">Fonds</th>
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3.5">Banque</th>
                    <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3.5">Type</th>
                    <th className="text-right text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3.5">Perf. 1 an</th>
                    <th className="text-right text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3.5 last:rounded-r-xl">Risque</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {featuredFunds.map((fund, i) => (
                    <tr
                      key={fund.id}
                      className="bg-white border border-surface-200 rounded-xl hover:border-secondary/30 hover:shadow-sm transition-all duration-200"
                    >
                      <td className="px-5 py-4 first:rounded-l-xl">
                        <p className="font-semibold text-primary text-sm">{fund.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold bg-primary/5 text-primary px-2.5 py-1 rounded-lg">
                          {fund.bankCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          fund.type === 'Actions' ? 'bg-success/10 text-success' :
                          fund.type === 'Obligataire' ? 'bg-secondary/10 text-secondary' :
                          fund.type === 'Monétaire' ? 'bg-surface-200 text-primary/60' :
                          'bg-accent/10 text-accent-600'
                        }`}>
                          {fund.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-bold text-sm ${fund.performance1Y >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatPercent(fund.performance1Y)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right last:rounded-r-xl">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 7 }, (_, j) => (
                            <div
                              key={j}
                              className={`w-2 h-2 rounded-full ${j < fund.risk ? 'bg-accent' : 'bg-surface-200'}`}
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

          <div className="mt-6 text-center">
            <Link href="/opcvm">
              <button className="inline-flex items-center gap-2 text-secondary font-semibold border border-secondary rounded-xl px-6 py-3 hover:bg-secondary hover:text-white transition-colors sm:hidden">
                Tous les OPCVM <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent text-sm font-semibold">Premium — À partir de 9€/mois</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Passez à la vitesse{' '}
                <span className="gradient-text-gold">supérieure</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Accédez aux analyses approfondies, aux alertes marchés, aux recommandations
                d&apos;achat/vente et au simulateur avancé.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/premium">
                  <button className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-8 py-4 rounded-xl hover:bg-accent-600 transition-colors shadow-md hover:shadow-glow-gold text-lg">
                    Voir les offres Premium
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-lg">
                    Créer un compte gratuit
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Lock, label: 'Analyses exclusives', desc: '50+ analyses par mois' },
                  { icon: BarChart2, label: 'Données avancées', desc: 'Historique complet 10 ans' },
                  { icon: Star, label: 'Alertes marchés', desc: 'Notifications en temps réel' },
                  { icon: BookOpen, label: 'Cours complets', desc: 'Formation vidéo incluse' },
                ].map((feature) => (
                  <div key={feature.label} className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent mb-3" />
                    <p className="text-white font-bold text-sm mb-1">{feature.label}</p>
                    <p className="text-white/50 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
