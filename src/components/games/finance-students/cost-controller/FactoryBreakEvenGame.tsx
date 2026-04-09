'use client';

import React from 'react';
import { 
  Factory, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Coins, 
  ArrowRight, 
  ChevronRight,
  Info,
  Zap,
  LayoutDashboard,
  Wallet,
  Settings2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useFactoryBreakEven, GamePhase, ProductionDecision, PeriodResult, SEASONALITY } from './useFactoryBreakEven';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const formatMAD = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M MAD`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k MAD`;
  return `${v.toFixed(0)} MAD`;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FactoryBreakEvenGame() {
  const {
    state,
    startGame,
    setDecision,
    confirmPlan,
    revealResults,
    nextPeriod,
    resetGame,
  } = useFactoryBreakEven();

  const { phase, period, totalPeriods, cash, costs, currentDecision, lastDemand, inventory, history } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-8 animate-fade-in text-primary">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Factory className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-black font-display mb-3">Factory Break-Even</h1>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Gérez une usine de céramique à Safi. Votre mission est d&apos;ajuster la production et les prix pour maximiser le profit tout en maîtrisant le seuil de rentabilité (Break-Even Point).
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-2">Structure de Coûts</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold"><span>Coûts Fixes</span><span>50k MAD/m</span></div>
              <div className="flex justify-between text-[11px] font-bold"><span>Coût Var/unité</span><span>80 MAD</span></div>
              <div className="flex justify-between text-[11px] font-bold text-secondary"><span>PV unitaire</span><span>150 MAD</span></div>
            </div>
          </div>
          <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-1">Seuil de Rentabilité</h3>
            <p className="text-xl font-black text-primary">~715 unités</p>
            <p className="text-[10px] text-primary/40">Volume critique par mois</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full bg-amber-600 text-white font-bold py-4 rounded-2xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/10 flex items-center justify-center gap-2"
        >
          Démarrer la production <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Status Header ────────────────────────────────────────────────────────
  const statusHeader = (
    <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in shrink-0">
      <div className="bg-primary text-white p-3 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Mois</div>
        <div className="text-2xl font-black font-display">{period} / {totalPeriods}</div>
        <LayoutDashboard className="absolute right-[-10px] bottom-[-10px] w-12 h-12 opacity-10" />
      </div>
      <div className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Trésorerie</div>
        <div className={cn("text-lg font-black", cash >= 100000 ? "text-success" : "text-danger")}>
          {formatMAD(cash)}
        </div>
      </div>
      <div className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Stock</div>
        <div className={cn("text-lg font-black", inventory > 200 ? "text-warning" : "text-primary")}>
          {inventory} <span className="text-[10px] opacity-40">uts</span>
        </div>
      </div>
      <div className="bg-white border border-surface-100 p-3 rounded-2xl shadow-sm text-center">
        <div className="text-[10px] font-bold text-primary/40 uppercase mb-1">Effet Levier</div>
        <div className="text-lg font-black text-secondary">
          {((costs.fixedCosts / (costs.fixedCosts + 300 * costs.variableCostPerUnit)) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );

  // ── Phase 1: Planning ─────────────────────────────────────────────────────
  if (phase === 'plan') {
    const currentPrice = costs.sellingPrice * (1 + currentDecision.priceAdjustment);
    const currentBEP = Math.ceil(costs.fixedCosts / (currentPrice - costs.variableCostPerUnit));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-6 flex justify-between items-end pr-4">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">Planification — Mois {period}</h2>
            <p className="text-sm text-primary/50">Ajustez vos leviers pour optimiser la marge.</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-primary/30 uppercase block">Seuil de rentabilité estimé</span>
            <span className="text-2xl font-black text-primary">{currentBEP} unités</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto pr-2 pb-4">
          {/* Controls */}
          <div className="space-y-6">
            {/* Quantity */}
            <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary/40" />
                  <span className="text-sm font-bold text-primary uppercase">Volume de Production</span>
                </div>
                <span className="text-xl font-black text-primary">{currentDecision.quantity} uts</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={currentDecision.quantity}
                onChange={(e) => setDecision('quantity', parseInt(e.target.value))}
                className="w-full accent-primary h-2"
              />
              <div className="flex justify-between text-[10px] font-bold text-primary/30 mt-2">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white border border-surface-200 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-bold text-primary uppercase">Ajustement Prix</span>
                </div>
                <span className="text-xl font-black text-secondary">{currentPrice.toFixed(0)} MAD</span>
              </div>
              <input
                type="range"
                min="-0.2"
                max="0.4"
                step="0.05"
                value={currentDecision.priceAdjustment}
                onChange={(e) => setDecision('priceAdjustment', parseFloat(e.target.value))}
                className="w-full accent-secondary h-2"
              />
              <div className="flex justify-between text-[10px] font-bold text-primary/30 mt-2 uppercase">
                <span>Promo (-20%)</span>
                <span>Base (150)</span>
                <span>Premium (+40%)</span>
              </div>
            </div>

            {/* Investment */}
            {!costs.capacityInvested && (
              <button
                onClick={() => setDecision('investInCapacity', !currentDecision.investInCapacity)}
                className={cn(
                  "w-full p-4 rounded-3xl border transition-all flex items-center gap-4",
                  currentDecision.investInCapacity
                    ? "bg-primary text-white border-primary shadow-lg"
                    : "bg-surface-50 border-surface-100 text-primary/60 hover:border-primary/30"
                )}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Zap className={cn("w-5 h-5", currentDecision.investInCapacity ? "text-white" : "text-primary/40")} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold uppercase">Modernisation usine</div>
                  <p className="text-[10px] opacity-70">Capex fixe (+15k/m) pour réduire coûts variables (80 → 70 MAD)</p>
                </div>
                <div className="ml-auto">
                  {currentDecision.investInCapacity ? <Badge variant="success">Activé</Badge> : <Badge variant="outline">MAD 0</Badge>}
                </div>
              </button>
            )}
            {costs.capacityInvested && (
              <div className="bg-success text-white p-4 rounded-3xl flex items-center gap-4 border border-success/20">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase">Usine Modernisée</div>
                  <p className="text-[10px] opacity-80">Structure de coûts optimisée active (CV = 70 MAD)</p>
                </div>
              </div>
            )}
          </div>

          {/* Visual Analysis */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-4">Analyse de la Marge de Contribution</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary/60">Prix de vente</span>
                <span className="font-bold">{currentPrice.toFixed(0)} MAD</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary/60">Coût Variable unitaire</span>
                <span className="font-bold text-danger">-{costs.variableCostPerUnit.toFixed(0)} MAD</span>
              </div>
              <div className="pt-2 border-t border-surface-100 flex justify-between items-center text-md font-black">
                <span className="text-primary italic">Marge / unité (MC)</span>
                <span className="text-success">{(currentPrice - costs.variableCostPerUnit).toFixed(0)} MAD</span>
              </div>
            </div>

            <div className="mt-auto bg-surface-50 rounded-2xl p-4 border border-surface-100">
              <div className="flex gap-2 items-start opacity-70 mb-3">
                <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  <strong>Règle d&apos;or :</strong> Tant que vous produisez au-dessus de <strong>{currentBEP}</strong> unités, 
                  chaque unité supplémentaire vendue contribue directement à votre profit net. En dessous, vous perdez de l&apos;argent sur vos coûts fixes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={confirmPlan}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Valider le plan de production <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 2: Demand Reveal ────────────────────────────────────────────────
  if (phase === 'demand_reveal') {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-fade-in text-primary">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-amber-500/5 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-white border-4 border-amber-500/20 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>
        </div>
        <h2 className="text-2xl font-black font-display mb-3">Analyse du Marché...</h2>
        <p className="text-primary/60 mb-10 leading-relaxed">
          Le réseau de distribution remonte les ventes du mois {period}. <br/>
          Saisonnalité actuelle : <span className="font-black text-secondary">x{SEASONALITY[period-1]}</span>
        </p>

        <button
          onClick={revealResults}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          Calculer les marges <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 3: Results ─────────────────────────────────────────────────────
  if (phase === 'results') {
    const lastResult = history[history.length - 1];
    const chartData = [
      { name: 'Produit', qty: lastResult.decision.quantity, fill: '#64748b' },
      { name: 'Vendu', qty: lastResult.unitsSold, fill: '#0f172a' },
      { name: 'Demande', qty: lastResult.demand.actual, fill: '#f59e0b' },
      { name: 'Break-Even', qty: lastResult.breakEvenQty, fill: '#ef4444' },
    ];

    return (
      <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-full">
        {statusHeader}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-primary mb-1">Rapport de Gestion — Mois {period}</h2>
          <p className={cn(
            "text-sm font-bold flex items-center justify-center gap-1",
            lastResult.profit >= 0 ? "text-success" : "text-danger"
          )}>
            Profit net : {lastResult.profit >= 0 ? '+' : ''}{formatMAD(lastResult.profit)}
            {lastResult.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1 overflow-y-auto pr-2">
          {/* Charts */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-6">Volumes vs. Équilibre</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} width={80} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-3 flex-wrap justify-center">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} /> {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* P&L Detail */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm overflow-y-auto">
            <h3 className="text-xs font-bold text-primary/40 uppercase mb-4">Détail financier</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary/60">Chiffre d&apos;affaires ({lastResult.unitsSold} uts)</span>
                <span className="font-bold">{formatMAD(lastResult.revenue)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary/60">Coûts Variables</span>
                <span className="font-bold text-danger">-{formatMAD(lastResult.variableCosts)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary/60">Coûts Fixes (Charges structure)</span>
                <span className="font-bold text-danger">-{formatMAD(lastResult.fixedCosts)}</span>
              </div>
              {lastResult.inventoryCost > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary/60">Coûts de Stockage</span>
                  <span className="font-bold text-danger">-{formatMAD(lastResult.inventoryCost)}</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-surface-100 flex justify-between items-center">
                <span className="text-md font-black text-primary italic">RÉSULTAT NET</span>
                <span className={cn("text-xl font-black", lastResult.profit >= 0 ? "text-success" : "text-danger")}>
                  {lastResult.profit >= 0 ? '+' : ''}{formatMAD(lastResult.profit)}
                </span>
              </div>
            </div>

            {lastResult.decision.quantity > lastResult.unitsSold && (
              <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 leading-normal">
                  <strong>Surproduction :</strong> {lastResult.decision.quantity - lastResult.unitsSold} unités n&apos;ont pas trouvé d&apos;acheteur. 
                  Elles sont stockées pour le mois prochain mais génèrent un coût de détention.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={nextPeriod}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 mb-4"
        >
          Valider et passer au mois suivant <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Phase 4: Summary ──────────────────────────────────────────────────────
  if (phase === 'summary') {
    const totalProfit = history.reduce((s, h) => s + h.profit, 0);
    const avgBEP = Math.round(history.reduce((s, h) => s + h.breakEvenQty, 0) / history.length);
    
    // Performance chart
    const profitData = history.map(h => ({
      name: `M${h.period}`,
      profit: h.profit,
      cumul: history.slice(0, h.period).reduce((s, p) => s + p.profit, 0)
    }));

    return (
      <div className="max-w-4xl mx-auto animate-fade-in text-primary py-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Coins className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl font-black font-display mb-2 text-primary">Bilan Industriel</h1>
          <p className="text-primary/50">Performance de l&apos;usine de céramique sur le semestre.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-surface-200 p-6 rounded-3xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">Trésorerie Finale</div>
            <div className={cn("text-3xl font-black", cash >= 100000 ? "text-success" : "text-danger")}>
              {formatMAD(cash)}
            </div>
            <p className="text-[10px] text-primary/30 mt-1">({totalProfit >= 0 ? '+' : ''}{formatMAD(totalProfit)} de P&L)</p>
          </div>
          <div className="bg-white border border-surface-200 p-6 rounded-3xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-primary/40 uppercase mb-2">BEP Moyen</div>
            <div className="text-3xl font-black text-primary">{avgBEP} uts</div>
            <p className="text-[10px] text-primary/30 mt-1">Point d&apos;équilibre moyen</p>
          </div>
          <div className="bg-primary text-white p-6 rounded-3xl shadow-xl text-center">
            <div className="text-[10px] font-bold opacity-60 uppercase mb-2">Points Contrôleur</div>
            <div className="text-3xl font-black">{Math.max(0, Math.round((cash - 100000) / 100))} pts</div>
            <p className="text-[10px] opacity-40 mt-1">Basé sur l&apos;excédent de cash</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-primary/40 uppercase mb-8">Évolution du Profit Mensuel</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: number) => [formatMAD(v)]}
                  />
                  <Bar dataKey="profit" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="cumul" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-3 h-3 rounded-sm bg-primary" /> Profit du mois</div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Profit cumulé</div>
            </div>
          </div>
        </div>

        {/* Education Recap */}
        <div className="bg-amber-600/5 rounded-3xl p-8 mb-10 border border-amber-600/10">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-amber-600" />
            <h3 className="text-xl font-bold text-amber-600 font-display text-primary">L&apos;œil du Contrôleur</h3>
          </div>
          <div className="space-y-4 text-sm text-primary/70 leading-relaxed font-medium">
            <p>
              Le <strong>seuil de rentabilité</strong> n&apos;est pas une donnée statique, c&apos;est un objectif dynamique que vous influencez par vos décisions :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 list-disc ml-4">
              <li><strong>Volume & Absorption:</strong> Produire davantage permet de mieux répartir les coûts fixes, MAIS attention aux invendus.</li>
              <li><strong>Levier Opérationnel:</strong> L&apos;investissement en capacité (Phase Modernisation) augmente vos risques (plus de coûts fixes) mais décuple vos profits en cas de forte demande (meilleure marge unitaire).</li>
              <li><strong>Pricing:</strong> Une baisse de prix peut abaisser votre marge unitaire et donc reculer votre seuil de rentabilité... à moins que le volume généré par l&apos;élasticité ne l&apos;emporte.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/95 transition-all shadow-xl flex items-center justify-center gap-2 mb-20"
        >
          Lancer un nouveau semestre <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return null;
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
