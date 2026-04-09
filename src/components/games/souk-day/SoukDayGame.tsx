'use client';

import { useSoukDay, PriceLevel, PRICE_RATIO, PRICE_LABELS } from './useSoukDay';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from 'recharts';
import { ArrowLeft, RefreshCw, ShoppingBag, Star, TrendingUp, TrendingDown, AlertTriangle, Gift } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMAD(n: number) {
  return `${n.toLocaleString('fr-MA')} MAD`;
}

function ReputationMeter({ value }: { value: number }) {
  const color = value > 70 ? 'bg-success' : value > 40 ? 'bg-accent' : 'bg-danger';
  const label = value > 70 ? 'Excellente' : value > 40 ? 'Correcte' : 'Mauvaise';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-primary/50">Réputation</span>
          <span className="font-semibold text-primary">{Math.round(value)}/100 — {label}</span>
        </div>
        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', color)}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const PRICE_BUTTON_STYLES: Record<PriceLevel, { color: string; selected: string }> = {
  base:           { color: 'border-primary/30 hover:border-primary bg-white hover:bg-surface-50',         selected: 'border-primary bg-primary text-white shadow-md' },
  small_discount: { color: 'border-amber-300 hover:border-amber-500 bg-amber-50 hover:bg-amber-100',     selected: 'border-amber-500 bg-amber-500 text-white shadow-md' },
  big_discount:   { color: 'border-red-300 hover:border-red-500 bg-red-50 hover:bg-red-100',             selected: 'border-red-500 bg-red-500 text-white shadow-md' },
  premium:        { color: 'border-accent/40 hover:border-accent bg-accent/5 hover:bg-accent/15',        selected: 'border-accent bg-accent text-white shadow-md' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SoukDayGame() {
  const {
    state, startGame, setProductPrice, togglePromotion, confirmPrep,
    setPendingPrice, confirmSale, nextCustomer, nextDay, resetGame,
    totalProfit, totalRevenue, totalCOGS, bestProductOverall,
  } = useSoukDay();

  const { phase, day, totalDays, round, totalRounds, cash, reputation,
          products, currentCustomer, currentEvent, lastResult, pendingPrice,
          dayHistory, startingCash } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 animate-fade-in">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="text-3xl font-black text-primary font-display mb-3">Souk Day</h1>
        <p className="text-primary/60 mb-2 leading-relaxed">
          Vous êtes vendeur au souk de Marrakech. Gérez votre étal sur <strong>{totalDays} jours</strong> — chaque
          jour, vous choisissez vos prix le matin, puis servez <strong>{totalRounds} clients</strong>.
        </p>
        <p className="text-primary/60 mb-3 leading-relaxed">
          La météo, les festivals et votre <strong>réputation</strong> influencent le profil et le budget de vos clients.
          Maximisez votre bénéfice cumulé !
        </p>

        {/* Products preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {products.map((p) => (
            <div key={p.id} className="bg-surface-50 border border-surface-100 rounded-xl p-3 text-center">
              <div className="text-3xl mb-1">{p.emoji}</div>
              <div className="text-xs font-semibold text-primary truncate">{p.name}</div>
              <div className="text-xs text-primary/50 mt-0.5">Base : {p.basePrice} MAD</div>
              <div className="text-xs text-primary/40">Coût : {p.unitCost} MAD</div>
            </div>
          ))}
        </div>

        {/* Game rules */}
        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-8 text-left text-sm text-primary/60 space-y-1.5">
          <div className="font-bold text-primary text-xs uppercase tracking-wider mb-2">Comment jouer</div>
          <div>🌅 <strong>Matin :</strong> Choisissez vos prix et une promotion optionnelle.</div>
          <div>🛒 <strong>Journée :</strong> Servez 12 clients — adaptez votre prix à chaque profil.</div>
          <div>📊 <strong>Soir :</strong> Consultez votre bilan et passez au jour suivant.</div>
          <div>⭐ <strong>Réputation :</strong> Vendez bien pour attirer de meilleurs clients.</div>
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

  // ── Prep Phase ─────────────────────────────────────────────────────────────
  if (phase === 'prep' && currentEvent) {
    const promotedProduct = products.find((p) => p.isPromoted);

    return (
      <div className="max-w-2xl mx-auto px-4 animate-fade-in">
        {/* Day header */}
        <div className="text-center mb-6">
          <div className="text-xs text-primary/50 uppercase tracking-wider mb-1">
            Jour {day} / {totalDays}
          </div>
          <h2 className="text-2xl font-black text-primary font-display">Préparation du matin</h2>
          <p className="text-primary/50 text-sm mt-1">
            Caisse : <strong className="text-primary">{formatMAD(cash)}</strong> — Réputation : <strong className="text-primary">{Math.round(reputation)}/100</strong>
          </p>
        </div>

        {/* Event card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{currentEvent.emoji}</span>
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Événement du jour</div>
              <div className="font-bold text-lg">{currentEvent.title}</div>
            </div>
          </div>
          <p className="text-white/70 text-sm">{currentEvent.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {currentEvent.trafficMultiplier !== 1.0 && (
              <span className={cn('px-2 py-1 rounded-full font-semibold',
                currentEvent.trafficMultiplier > 1 ? 'bg-success/30 text-green-200' : 'bg-danger/30 text-red-200'
              )}>
                Traffic {currentEvent.trafficMultiplier > 1 ? '+' : ''}{Math.round((currentEvent.trafficMultiplier - 1) * 100)}%
              </span>
            )}
            {currentEvent.costMultiplier !== 1.0 && (
              <span className="bg-danger/30 text-red-200 px-2 py-1 rounded-full font-semibold">
                Coût +{Math.round((currentEvent.costMultiplier - 1) * 100)}%
              </span>
            )}
            {currentEvent.budgetMultiplier !== 1.0 && (
              <span className="bg-success/30 text-green-200 px-2 py-1 rounded-full font-semibold">
                Budget client +{Math.round((currentEvent.budgetMultiplier - 1) * 100)}%
              </span>
            )}
            {currentEvent.touristBoost && (
              <span className="bg-secondary/40 text-blue-200 px-2 py-1 rounded-full font-semibold">
                🚌 Plus de touristes
              </span>
            )}
          </div>
        </div>

        {/* Price setting per product */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-3">
            Fixez vos prix pour la journée
          </div>
          <div className="space-y-3">
            {products.map((product) => {
              const actualCost = Math.round(product.unitCost * currentEvent.costMultiplier);
              return (
                <div key={product.id} className="bg-white border border-surface-100 rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{product.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-primary text-sm">{product.name}</div>
                      <div className="text-xs text-primary/40">
                        Coût : {actualCost} MAD{currentEvent.costMultiplier !== 1 ? ' ⚠️' : ''} — Stock : {product.maxStock}
                      </div>
                    </div>
                    <button
                      onClick={() => togglePromotion(product.id)}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-all',
                        product.isPromoted
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-white text-primary/50 border-surface-200 hover:border-accent/50'
                      )}
                    >
                      <Gift className="w-3 h-3" />
                      Promo
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['big_discount', 'small_discount', 'base', 'premium'] as PriceLevel[]).map((level) => {
                      const price = Math.round(product.basePrice * PRICE_RATIO[level]);
                      const margin = Math.round(((price - actualCost) / price) * 100);
                      const isSelected = product.priceLevel === level;
                      return (
                        <button
                          key={level}
                          onClick={() => setProductPrice(product.id, level)}
                          className={cn(
                            'rounded-lg border-2 p-2 text-center transition-all duration-200 text-xs',
                            isSelected ? PRICE_BUTTON_STYLES[level].selected : PRICE_BUTTON_STYLES[level].color
                          )}
                        >
                          <div className={cn('font-bold', isSelected ? '' : 'text-primary')}>{price}</div>
                          <div className={cn('opacity-70', isSelected ? '' : 'text-primary/50')}>{margin}%</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotion notice */}
        {promotedProduct && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-sm">
            <Gift className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-primary/70">
              Promotion du jour sur <strong>{promotedProduct.name}</strong> : achat ×2 → −10% sur le prix total.
            </span>
          </div>
        )}

        <button
          onClick={confirmPrep}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors shadow-md"
        >
          Ouvrir l&apos;étal — Jour {day} →
        </button>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  if (phase === 'playing' && currentCustomer && currentEvent) {
    const product = products.find((p) => p.id === currentCustomer.preferredProductId)!;
    const unitPrice = Math.round(product.basePrice * PRICE_RATIO[pendingPrice]);
    const actualCost = Math.round(product.unitCost * currentEvent.costMultiplier);
    const qty = Math.min(currentCustomer.quantity, product.currentStock);
    const promoActive = product.isPromoted && qty >= 2;
    const totalPrice = Math.round(unitPrice * qty * (promoActive ? 0.90 : 1.0));
    const projectedProfit = product.currentStock > 0 ? totalPrice - (actualCost * qty) : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 animate-fade-in">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-primary/50 mb-1">
            <span>Jour {day} — Client {round} / {totalRounds}</span>
            <span>Caisse : {formatMAD(cash)}</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${((round - 1) / totalRounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Reputation bar */}
        <div className="mb-5">
          <ReputationMeter value={reputation} />
        </div>

        {/* Customer card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{currentCustomer.emoji}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-0.5">{currentCustomer.name}</h2>
              <p className="text-white/70 text-sm mb-3">{currentCustomer.typeLabel}</p>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Souhaite acheter :</span>
                <span className="text-white font-semibold">
                  {product.emoji} {product.name}
                  {currentCustomer.quantity > 1 && <span className="text-white/60 ml-1">(×{currentCustomer.quantity})</span>}
                </span>
              </div>
            </div>
            {product.currentStock <= 3 && (
              <span className="text-xs bg-white/20 text-white/80 px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {product.currentStock}
              </span>
            )}
          </div>
        </div>

        {/* Price choice */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-primary/60 uppercase tracking-wide mb-3">
            Choisissez votre prix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['big_discount', 'small_discount', 'base', 'premium'] as PriceLevel[]).map((level) => {
              const price = Math.round(product.basePrice * PRICE_RATIO[level]);
              const margin = Math.round(((price - actualCost) / price) * 100);
              const isSelected = pendingPrice === level;
              return (
                <button
                  key={level}
                  onClick={() => setPendingPrice(level)}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left transition-all duration-200',
                    isSelected ? PRICE_BUTTON_STYLES[level].selected : PRICE_BUTTON_STYLES[level].color
                  )}
                >
                  <div className={cn('font-bold text-lg', isSelected ? 'text-white' : 'text-primary')}>
                    {price} MAD
                  </div>
                  <div className={cn('text-sm font-semibold mb-0.5', isSelected ? 'text-white/90' : 'text-primary/80')}>
                    {PRICE_LABELS[level].label}
                  </div>
                  <div className={cn('text-xs', isSelected ? 'text-white/70' : 'text-primary/50')}>
                    Marge : {margin}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Projected outcome */}
        <div className="text-center text-sm text-primary/50 mb-5">
          {product.currentStock > 0 ? (
            <>
              Si la vente aboutit → bénéfice de{' '}
              <span className={cn('font-bold', projectedProfit > 0 ? 'text-success' : 'text-danger')}>
                {projectedProfit >= 0 ? '+' : ''}{projectedProfit} MAD
              </span>
              {promoActive && <span className="text-accent ml-1">(promo −10%)</span>}
            </>
          ) : (
            <span className="text-danger font-semibold">Rupture de stock !</span>
          )}
        </div>

        {/* Confirm */}
        <button
          onClick={confirmSale}
          disabled={product.currentStock <= 0}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.currentStock <= 0 ? 'Rupture de stock !' : `Vendre à ${totalPrice} MAD →`}
        </button>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && lastResult && currentCustomer) {
    const { sold, revenue, cogs, profit, message, reputationDelta, quantity } = lastResult;
    return (
      <div className="max-w-md mx-auto px-4 text-center py-8 animate-fade-in">
        <div className="text-5xl mb-3">{sold ? '✅' : '❌'}</div>
        <h2 className="text-xl font-bold text-primary mb-2">
          {sold ? 'Vente réussie !' : 'Client reparti…'}
        </h2>
        <p className="text-primary/60 text-sm mb-6">{message}</p>

        {sold && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Prix vendu</div>
              <div className="font-bold text-primary">{revenue} MAD</div>
            </div>
            <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Coût</div>
              <div className="font-bold text-primary">{cogs} MAD</div>
            </div>
            <div className="bg-success/10 border border-success/20 rounded-xl p-3">
              <div className="text-xs text-primary/50 mb-1">Bénéfice</div>
              <div className="font-bold text-success">+{profit} MAD</div>
            </div>
          </div>
        )}

        {/* Reputation change */}
        <div className={cn(
          'flex items-center justify-center gap-2 text-sm mb-5 px-3 py-2 rounded-xl border',
          reputationDelta >= 0
            ? 'bg-success/5 border-success/15 text-success'
            : 'bg-danger/5 border-danger/15 text-danger'
        )}>
          <Star className="w-3.5 h-3.5" />
          Réputation {reputationDelta >= 0 ? '+' : ''}{reputationDelta}
        </div>

        <div className="flex items-center justify-between text-sm text-primary/50 mb-6 bg-surface-50 rounded-xl px-4 py-2">
          <span>Caisse actuelle</span>
          <span className="font-bold text-primary">{formatMAD(cash)}</span>
        </div>

        <button
          onClick={nextCustomer}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          {round < totalRounds ? 'Client suivant →' : 'Fin de journée →'}
        </button>
      </div>
    );
  }

  // ── Day Summary ────────────────────────────────────────────────────────────
  if (phase === 'day_summary') {
    const latestDay = dayHistory[dayHistory.length - 1];
    if (!latestDay) return null;

    const { grossProfit, totalRevenue: dayRev, salesCount, lostCount, stockoutCount } = latestDay;
    const profitColor = grossProfit >= 0 ? 'text-success' : 'text-danger';
    const profitBg = grossProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20';

    const chartData = products.map((p) => ({ name: p.name.split(' ')[0], sold: p.unitsSold }));

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">{latestDay.event.emoji}</div>
          <h2 className="text-2xl font-black text-primary font-display">Fin du jour {day}</h2>
          <p className="text-primary/50 text-sm mt-1">{latestDay.event.title}</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', profitBg)}>
            <div className="text-xs text-primary/50 mb-1">Bénéfice brut</div>
            <div className={cn('text-xl font-black', profitColor)}>
              {grossProfit >= 0 ? '+' : ''}{formatMAD(grossProfit)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">CA du jour</div>
            <div className="text-xl font-black text-primary">{formatMAD(dayRev)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Ventes</div>
            <div className="text-xl font-black text-primary">{salesCount} / {totalRounds}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Clients perdus</div>
            <div className="text-xl font-black text-primary">{lostCount}</div>
          </div>
        </div>

        {/* Reputation */}
        <div className="mb-5">
          <ReputationMeter value={reputation} />
        </div>

        {/* Products chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Unités vendues
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

        {/* Stockout warning */}
        {stockoutCount > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-warning">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {stockoutCount} rupture{stockoutCount > 1 ? 's' : ''} de stock aujourd&apos;hui — vous avez perdu des ventes potentielles.
          </div>
        )}

        <button
          onClick={nextDay}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
        >
          {day < totalDays ? `Préparer le jour ${day + 1} →` : 'Voir le bilan final →'}
        </button>
      </div>
    );
  }

  // ── Game Over ──────────────────────────────────────────────────────────────
  if (phase === 'game_over') {
    const profitColor = totalProfit >= 0 ? 'text-success' : 'text-danger';
    const profitBg = totalProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20';

    const chartData = dayHistory.map((d) => ({
      name: `Jour ${d.day}`,
      profit: d.grossProfit,
      cumul: dayHistory.slice(0, d.day).reduce((s, x) => s + x.grossProfit, 0),
    }));

    const totalSales = dayHistory.reduce((s, d) => s + d.salesCount, 0);
    const totalLost = dayHistory.reduce((s, d) => s + d.lostCount, 0);
    const avgMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCOGS) / totalRevenue) * 100) : 0;

    const feedback = (() => {
      if (totalProfit > 300) return '🌟 Excellent ! Vous êtes un vrai commerçant du souk — maîtrise du prix et du volume.';
      if (totalProfit > 100) return '👍 Bonne performance ! Vous avez su équilibrer prix et satisfaction client.';
      if (totalProfit > 0) return '💪 Résultat positif, mais il y a de la marge d\'amélioration.';
      return '📉 Résultat négatif — vos prix étaient peut-être mal calibrés ou vous avez trop bradé.';
    })();

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-primary font-display">Bilan du souk</h2>
          <p className="text-primary/50 text-sm mt-1">{totalDays} jours de commerce</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', profitBg)}>
            <div className="text-xs text-primary/50 mb-1">Bénéfice total</div>
            <div className={cn('text-xl font-black', profitColor)}>
              {totalProfit >= 0 ? '+' : ''}{formatMAD(totalProfit)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">CA total</div>
            <div className="text-xl font-black text-primary">{formatMAD(totalRevenue)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Marge moyenne</div>
            <div className="text-xl font-black text-primary">{avgMargin}%</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Conversion</div>
            <div className="text-xl font-black text-primary">{totalSales}/{totalSales + totalLost}</div>
          </div>
        </div>

        {/* Daily profit chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3">Résultat par jour (MAD)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [formatMAD(v)]}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="profit" stroke="#1D4ED8" strokeWidth={2} dot={{ r: 4 }} name="Bénéfice" />
              <Line type="monotone" dataKey="cumul" stroke="#C8962E" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Cumulé" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-secondary inline-block rounded" />Journalier</span>
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-accent inline-block rounded" />Cumulé</span>
          </div>
        </div>

        {/* Reputation + feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-2">Réputation finale</div>
            <ReputationMeter value={reputation} />
          </div>
          <div className="bg-secondary/8 border border-secondary/15 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-1">Analyse</div>
            <p className="text-sm text-primary/70">{feedback}</p>
          </div>
        </div>

        {/* Concept recap */}
        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-6 text-sm text-primary/60 leading-relaxed">
          <strong className="text-primary">📚 Ce que vous avez pratiqué :</strong>
          <br />
          Le <em>chiffre d&apos;affaires</em> (CA = prix × quantités), le <em>coût des marchandises vendues</em>{' '}
          (CMV), la <em>marge brute</em> (CA − CMV), et l&apos;impact de la <em>réputation</em> sur la willingness-to-pay
          des clients. La stratégie de prix optimale dépend du profil client et du contexte du jour.
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
