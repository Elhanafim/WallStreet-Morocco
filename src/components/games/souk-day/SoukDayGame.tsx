'use client';

import { useSoukDay, PriceLevel } from './useSoukDay';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PRICE_OPTIONS: { level: PriceLevel; label: string; sublabel: string; color: string }[] = [
  { level: 'base',           label: 'Prix normal',   sublabel: '100% du prix de base', color: 'border-primary/30 hover:border-primary bg-white hover:bg-surface-50' },
  { level: 'small_discount', label: '−15% de remise', sublabel: 'Petite réduction',    color: 'border-amber-300 hover:border-amber-500 bg-amber-50 hover:bg-amber-100' },
  { level: 'big_discount',   label: '−30% de remise', sublabel: 'Grosse réduction',    color: 'border-red-300 hover:border-red-500 bg-red-50 hover:bg-red-100' },
];

const SELECTED_COLOR: Record<PriceLevel, string> = {
  base:           'border-primary bg-primary text-white shadow-md',
  small_discount: 'border-amber-500 bg-amber-500 text-white shadow-md',
  big_discount:   'border-red-500 bg-red-500 text-white shadow-md',
};

function formatMAD(n: number) {
  return `${n.toLocaleString('fr-MA')} MAD`;
}

export default function SoukDayGame() {
  const { state, startGame, setPendingPrice, confirmSale, nextCustomer, resetGame, totalProfit, bestProduct, mostUsedPrice } =
    useSoukDay();

  const { phase, round, totalRounds, cash, products, currentCustomer, lastResult, pendingPrice } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-3xl font-black text-primary font-display mb-3">Souk Day</h1>
        <p className="text-primary/60 mb-2 leading-relaxed">
          Vous êtes vendeur au souk. La journée commence avec <strong>500 MAD en caisse</strong> et un
          étal rempli de produits.
        </p>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Chaque client a un profil différent — certains paient plein tarif, d&apos;autres cherchent une
          remise. À vous de fixer le bon prix pour maximiser votre bénéfice sur <strong>{totalRounds} clients</strong>.
        </p>

        {/* Products preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {products.map((p) => (
            <div key={p.id} className="bg-surface-50 border border-surface-100 rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">{p.emoji}</div>
              <div className="text-xs font-semibold text-primary truncate">{p.name}</div>
              <div className="text-xs text-primary/50 mt-0.5">Base : {p.basePrice} MAD</div>
              <div className="text-xs text-primary/40">Coût : {p.unitCost} MAD</div>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
        >
          Ouvrir le souk 🎉
        </button>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  if (phase === 'playing' && currentCustomer) {
    const product = products.find((p) => p.id === currentCustomer.preferredProductId)!;
    const chosenPrice = Math.round(product.basePrice * ({ base: 1, small_discount: 0.85, big_discount: 0.70 }[pendingPrice]));
    const projectedProfit = product.stock > 0 ? chosenPrice - product.unitCost : 0;

    return (
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-primary/50 mb-1">
            <span>Client {round} / {totalRounds}</span>
            <span>Caisse : {formatMAD(cash)}</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${((round - 1) / totalRounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Customer card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{currentCustomer.emoji}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-0.5">{currentCustomer.name}</h2>
              <p className="text-white/70 text-sm mb-3">{currentCustomer.behaviorLabel}</p>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Souhaite acheter :</span>
                <span className="text-white font-semibold">
                  {product.emoji} {product.name}
                </span>
              </div>
            </div>
            {product.stock <= 3 && (
              <span className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded-full">
                Stock : {product.stock}
              </span>
            )}
          </div>
        </div>

        {/* Price choice */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-primary/60 uppercase tracking-wide mb-3">
            Choisissez votre prix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRICE_OPTIONS.map((opt) => {
              const price = Math.round(product.basePrice * ({ base: 1, small_discount: 0.85, big_discount: 0.70 }[opt.level]));
              const margin = Math.round(((price - product.unitCost) / price) * 100);
              const isSelected = pendingPrice === opt.level;
              return (
                <button
                  key={opt.level}
                  onClick={() => setPendingPrice(opt.level)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all duration-200',
                    isSelected ? SELECTED_COLOR[opt.level] : opt.color
                  )}
                >
                  <div className={cn('font-bold text-lg', isSelected ? 'text-white' : 'text-primary')}>
                    {price} MAD
                  </div>
                  <div className={cn('text-sm font-semibold mb-0.5', isSelected ? 'text-white/90' : 'text-primary/80')}>
                    {opt.label}
                  </div>
                  <div className={cn('text-xs', isSelected ? 'text-white/70' : 'text-primary/50')}>
                    Marge : {margin}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Projected outcome pill */}
        <div className="text-center text-sm text-primary/50 mb-5">
          Si la vente aboutit → bénéfice de{' '}
          <span className={cn('font-bold', projectedProfit > 0 ? 'text-success' : 'text-danger')}>
            +{projectedProfit} MAD
          </span>
        </div>

        {/* Confirm button */}
        <button
          onClick={confirmSale}
          disabled={product.stock <= 0}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock <= 0 ? 'Rupture de stock !' : `Vendre à ${chosenPrice} MAD →`}
        </button>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && lastResult && currentCustomer) {
    const { sold, chosenPrice, profit, message } = lastResult;
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8">
        <div className="text-5xl mb-3">{sold ? '✅' : '❌'}</div>
        <h2 className="text-xl font-bold text-primary mb-2">
          {sold ? 'Vente réussie !' : 'Client reparti…'}
        </h2>
        <p className="text-primary/60 text-sm mb-6">{message}</p>

        {sold && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Prix vendu</div>
              <div className="font-bold text-primary">{chosenPrice} MAD</div>
            </div>
            <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Coût</div>
              <div className="font-bold text-primary">{lastResult.cogs} MAD</div>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Bénéfice</div>
              <div className="font-bold text-success">+{profit} MAD</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-primary/50 mb-6 bg-surface-50 rounded-xl px-4 py-2">
          <span>Caisse actuelle</span>
          <span className="font-bold text-primary">{formatMAD(cash)}</span>
        </div>

        <button
          onClick={nextCustomer}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Client suivant →
        </button>
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const chartData = products.map((p) => ({ name: p.name.split(' ')[0], sold: p.unitsSold }));
    const pricingFeedback = (() => {
      if (mostUsedPrice === 'big_discount') return 'Vous avez beaucoup bradé vos prix — pensez à la valeur de vos produits.';
      if (mostUsedPrice === 'base') return 'Vous avez maintenu vos prix — mais avez peut-être perdu des clients sensibles au prix.';
      return 'Bon équilibre entre remises et prix plein — stratégie intelligente !';
    })();

    const profitColor = totalProfit >= 0 ? 'text-success' : 'text-danger';
    const profitBg    = totalProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20';

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-primary font-display">Fin de journée</h2>
          <p className="text-primary/50 text-sm mt-1">Voici le bilan de votre souk</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', profitBg)}>
            <div className="text-xs text-primary/50 mb-1">Bénéfice net</div>
            <div className={cn('text-xl font-black', profitColor)}>
              {totalProfit >= 0 ? '+' : ''}{formatMAD(totalProfit)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Chiffre d&apos;affaires</div>
            <div className="text-xl font-black text-primary">{formatMAD(state.totalRevenue)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Coût marchandises</div>
            <div className="text-xl font-black text-primary">{formatMAD(state.totalCOGS)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Clients perdus</div>
            <div className="text-xl font-black text-primary">{state.lostCustomers}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Unités vendues par produit
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar dataKey="sold" name="Unités" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={['#1D4ED8', '#C8962E', '#059669', '#7C3AED'][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best product + feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {bestProduct && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">{bestProduct.emoji}</span>
              <div>
                <div className="text-xs text-primary/50">Produit le plus vendu</div>
                <div className="font-bold text-primary">{bestProduct.name}</div>
                <div className="text-sm text-primary/60">{bestProduct.unitsSold} unités</div>
              </div>
            </div>
          )}
          <div className="bg-secondary/8 border border-secondary/15 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-1">Analyse de votre stratégie</div>
            <p className="text-sm text-primary/70">{pricingFeedback}</p>
          </div>
        </div>

        {/* Concept recap */}
        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-6 text-sm text-primary/60 leading-relaxed">
          <strong className="text-primary">📚 Ce que vous avez pratiqué :</strong>
          <br />
          Le <em>chiffre d&apos;affaires</em> (CA = prix × quantités vendues), le <em>coût des marchandises vendues</em>{' '}
          (CMV) et le <em>bénéfice brut</em> (CA − CMV). La marge dépend autant du volume vendu que du prix unitaire.
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetGame}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Rejouer
          </button>
          <Link
            href="/learn/games"
            className="flex-1 flex items-center justify-center gap-2 bg-surface-100 text-primary font-bold py-3 rounded-xl hover:bg-surface-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Autres jeux
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
