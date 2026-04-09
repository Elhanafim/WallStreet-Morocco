'use client';

import { useCasablanca, ASSETS, Sector } from './useCasablanca';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts';
import { RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMAD(n: number) {
  return `${Math.round(n).toLocaleString('fr-MA')} MAD`;
}

function pct(n: number, digits = 1) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
}

const SECTOR_LABELS: Record<Sector, string> = {
  banques:      'Banques',
  telecom:      'Télécom',
  immobilier:   'Immobilier',
  btp:          'BTP',
  tourisme:     'Tourisme',
  consommation: 'Conso.',
  industrie:    'Industrie',
  energie:      'Énergie',
  mines:        'Mines',
  cash:         'Liquidités',
};

// ─── Allocation slider ────────────────────────────────────────────────────────

function WeightSlider({
  asset,
  value,
  onChange,
}: {
  asset: typeof ASSETS[0];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
      <span className="text-xl w-7 flex-shrink-0 text-center">{asset.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm font-semibold text-primary truncate">{asset.name}</span>
          <span className="text-sm font-bold text-secondary ml-2 flex-shrink-0">{value}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-secondary h-1.5 rounded"
        />
        <div className="flex justify-between text-xs text-primary/30 mt-0.5">
          <span>{SECTOR_LABELS[asset.sector]}</span>
          <span>Rend. base : {asset.baseReturn}% | Vol : {asset.volatility}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CasablancaGame() {
  const {
    state,
    startGame,
    setWeight,
    proceedToAllocation,
    simulateQuarter,
    nextQuarter,
    resetGame,
    totalReturn,
    benchmarkReturn,
    excessReturn,
    annualizedReturn,
    weightSum,
    maxDrawdown,
    sectorExposure,
  } = useCasablanca();

  const { phase, quarter, totalQuarters, portfolioValue, startingValue, weights, pendingEvent, history, assets } = state;

  const lastResult = history[history.length - 1] ?? null;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 animate-fade-in">
        <div className="text-6xl mb-4">📈</div>
        <h1 className="text-3xl font-black text-primary font-display mb-3">Casablanca Capital</h1>
        <p className="text-primary/60 mb-3 leading-relaxed">
          Vous gérez un <strong>fonds actions de 100 000 MAD</strong> sur <strong>12 trimestres (3 ans)</strong>.
          Investissez dans des titres fictifs inspirés de la Bourse de Casablanca.
        </p>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Chaque trimestre, un événement macro affecte les secteurs différemment. Votre mission : optimiser
          le couple rendement / risque grâce à la diversification.
        </p>

        {/* Mini asset grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {assets.slice(0, 10).map((a) => (
            <div key={a.id} className="bg-surface-50 border border-surface-100 rounded-xl p-2.5 text-center">
              <div className="text-2xl mb-0.5">{a.emoji}</div>
              <div className="text-xs font-bold text-primary">{a.ticker}</div>
              <div className="text-xs text-primary/40">{a.baseReturn}% base</div>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
        >
          Lancer le fonds 🚀
        </button>
      </div>
    );
  }

  // ── News ───────────────────────────────────────────────────────────────────
  if (phase === 'news' && pendingEvent) {
    const impactedSectors = Object.entries(pendingEvent.impact) as [Sector, number][];
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-primary/50 mb-1">
            <span>T{quarter} / T{totalQuarters}</span>
            <span>{formatMAD(portfolioValue)}</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${((quarter - 1) / totalQuarters) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-xs text-primary/50 uppercase tracking-wider mb-2">Actualité macro — Trimestre {quarter}</div>
          <div className="text-5xl mb-3">{pendingEvent.emoji}</div>
          <h2 className="text-2xl font-black text-primary font-display mb-2">{pendingEvent.title}</h2>
          <p className="text-primary/60 text-sm leading-relaxed">{pendingEvent.description}</p>
        </div>

        {impactedSectors.length > 0 && (
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-6">
            <div className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-3">Impact estimé par secteur</div>
            <div className="space-y-1.5">
              {impactedSectors.map(([sector, delta]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm text-primary/70">{SECTOR_LABELS[sector]}</span>
                  <span className={cn('text-sm font-bold', delta >= 0 ? 'text-success' : 'text-danger')}>
                    {pct(delta, 0)} / an
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={proceedToAllocation}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
        >
          Ajuster mon allocation →
        </button>
      </div>
    );
  }

  // ── Allocation ─────────────────────────────────────────────────────────────
  if (phase === 'allocation') {
    const isValid = Math.round(weightSum) === 100;
    const gap = 100 - weightSum;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <h2 className="text-xl font-bold text-primary mb-1">Allocation du portefeuille</h2>
        <p className="text-sm text-primary/50 mb-4">Trimestre {quarter} — Ajustez les pondérations. Total doit être 100%.</p>

        {/* Weight indicator */}
        <div className={cn(
          'flex items-center justify-between rounded-xl border px-4 py-2.5 mb-4 text-sm font-semibold',
          isValid
            ? 'bg-success/10 border-success/25 text-success'
            : 'bg-warning/10 border-warning/25 text-warning'
        )}>
          <span>Total alloué : {weightSum}%</span>
          {!isValid && (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {gap > 0 ? `Il reste ${gap}% à allouer` : `Dépassement de ${-gap}%`}
            </span>
          )}
          {isValid && <span>✓ Prêt à simuler</span>}
        </div>

        {/* Sliders */}
        <div className="bg-white border border-surface-100 rounded-2xl px-4 py-2 mb-5 shadow-card">
          {assets.map((a) => (
            <WeightSlider
              key={a.id}
              asset={a}
              value={weights[a.id] ?? 0}
              onChange={(v) => setWeight(a.id, v)}
            />
          ))}
        </div>

        {/* Sector summary */}
        {Object.keys(sectorExposure).length > 0 && (
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-5">
            <div className="text-xs font-semibold text-primary/50 mb-2 uppercase tracking-wide">Exposition sectorielle</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.entries(sectorExposure) as [Sector, number][]).map(([sector, w]) => (
                <div key={sector} className="flex justify-between text-sm">
                  <span className="text-primary/60">{SECTOR_LABELS[sector]}</span>
                  <span className="font-semibold text-primary">{w}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={simulateQuarter}
          disabled={!isValid}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Simuler le trimestre →
        </button>
      </div>
    );
  }

  // ── Quarterly result ───────────────────────────────────────────────────────
  if (phase === 'quarterly' && lastResult) {
    const r = lastResult;
    const isPositive = r.portfolioReturn >= 0;
    const assetData = assets.map((a) => ({
      ticker: a.ticker,
      ret: r.assetReturns[a.id] ?? 0,
      weight: r.weights[a.id] ?? 0,
    })).filter((d) => d.weight > 0);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">{r.event.emoji}</div>
          <h2 className="text-xl font-bold text-primary mb-1">T{r.quarter} — Résultats</h2>
          <p className="text-primary/50 text-sm">{r.event.title}</p>
        </div>

        {/* Portfolio return highlight */}
        <div className={cn(
          'rounded-2xl border p-5 text-center mb-5',
          isPositive ? 'bg-success/10 border-success/25' : 'bg-danger/10 border-danger/25'
        )}>
          <div className="text-xs text-primary/50 mb-1">Performance du trimestre</div>
          <div className={cn('text-4xl font-black', isPositive ? 'text-success' : 'text-danger')}>
            {pct(r.portfolioReturn)}
          </div>
          <div className="text-sm text-primary/50 mt-1">
            Valeur : {formatMAD(r.portfolioValue)}
          </div>
        </div>

        {/* Asset returns chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3">Performance des lignes (% trimestriel)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={assetData} barCategoryGap="25%">
              <XAxis dataKey="ticker" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Rendement']}
                cursor={{ fill: '#f9fafb' }}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Bar dataKey="ret" name="Rendement" radius={[4, 4, 0, 0]}>
                {assetData.map((d, i) => (
                  <Cell key={i} fill={d.ret >= 0 ? '#059669' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative chart with benchmark */}
        {history.length > 1 && (
          <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
            <h3 className="text-sm font-bold text-primary/70 mb-3">Valeur du fonds vs. MASI simplifié (MAD)</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={[
                { q: 'Départ', v: startingValue, b: startingValue },
                ...history.map((h, i) => ({
                  q: `T${h.quarter}`,
                  v: h.portfolioValue,
                  b: state.benchmark.history[i]?.value ?? startingValue,
                }))
              ]}>
                <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                  formatter={(v: number) => [formatMAD(v)]}
                />
                <ReferenceLine y={startingValue} stroke="#e5e7eb" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="v" stroke="#C8962E" strokeWidth={2} dot={{ r: 3 }} name="Votre fonds" />
                <Line type="monotone" dataKey="b" stroke="#6B7280" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="MASI simpl." />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-accent inline-block rounded" />Votre fonds</span>
              <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-primary/40 inline-block rounded" style={{ borderTop: '1px dashed' }} />MASI simpl.</span>
            </div>
          </div>
        )}

        <button
          onClick={nextQuarter}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Trimestre suivant →
        </button>
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const chartData = [
      { q: 'Départ', v: startingValue, b: startingValue },
      ...history.map((h, i) => ({
        q: `T${h.quarter}`,
        v: h.portfolioValue,
        b: state.benchmark.history[i]?.value ?? startingValue,
      })),
    ];

    const style = (() => {
      const avgEquity = ASSETS.filter((a) => a.sector !== 'cash').reduce((s, a) => s + (history[0]?.weights[a.id] ?? 0), 0);
      const avgRisk   = ASSETS.reduce((s, a) => s + (history[0]?.weights[a.id] ?? 0) * a.volatility / 100, 0);
      if (avgRisk > 18)  return 'Investisseur agressif — portefeuille concentré à fort risque.';
      if (avgRisk < 8)   return 'Investisseur conservateur — préférence pour les actifs défensifs.';
      return 'Investisseur équilibré — bonne diversification entre secteurs.';
    })();

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-primary font-display">Bilan du fonds</h2>
          <p className="text-primary/50 text-sm mt-1">3 ans de gestion — 12 trimestres</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', totalReturn >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20')}>
            <div className="text-xs text-primary/50 mb-1">Rendement total</div>
            <div className={cn('text-xl font-black', totalReturn >= 0 ? 'text-success' : 'text-danger')}>
              {pct(totalReturn)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Valeur finale</div>
            <div className="text-xl font-black text-primary">{formatMAD(portfolioValue)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Rendement annualisé</div>
            <div className={cn('text-xl font-black', annualizedReturn >= 0 ? 'text-success' : 'text-danger')}>
              {pct(annualizedReturn)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Drawdown max</div>
            <div className="text-xl font-black text-danger">-{maxDrawdown}%</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">P&L</div>
            <div className={cn('text-xl font-black', portfolioValue >= startingValue ? 'text-success' : 'text-danger')}>
              {portfolioValue >= startingValue ? '+' : ''}{formatMAD(portfolioValue - startingValue)}
            </div>
          </div>
        </div>

        {/* Benchmark comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', benchmarkReturn >= 0 ? 'bg-surface-50 border-surface-100' : 'bg-surface-50 border-surface-100')}>
            <div className="text-xs text-primary/50 mb-1">MASI simplifié</div>
            <div className={cn('text-lg font-black', benchmarkReturn >= 0 ? 'text-primary' : 'text-danger')}>
              {pct(benchmarkReturn)}
            </div>
          </div>
          <div className={cn('rounded-xl border p-4 text-center', excessReturn >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20')}>
            <div className="text-xs text-primary/50 mb-1">Excès vs. benchmark</div>
            <div className={cn('text-lg font-black', excessReturn >= 0 ? 'text-success' : 'text-danger')}>
              {pct(excessReturn)}
            </div>
          </div>
        </div>

        {/* Value chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3">Évolution du fonds vs. MASI simplifié</h3>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData}>
              <XAxis dataKey="q" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [formatMAD(v)]}
              />
              <ReferenceLine y={startingValue} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="v" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 3 }} name="Votre fonds" />
              <Line type="monotone" dataKey="b" stroke="#6B7280" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="MASI simpl." />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-secondary inline-block rounded" />Votre fonds</span>
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-primary/40 inline-block rounded" />MASI simpl.</span>
          </div>
        </div>

        {/* Quarterly returns table */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5 overflow-x-auto">
          <h3 className="text-sm font-bold text-primary/70 mb-3">Rendements trimestriels</h3>
          <div className="flex gap-2 min-w-max">
            {history.map((r) => (
              <div key={r.quarter} className="text-center w-12">
                <div className="text-xs text-primary/40 mb-1">T{r.quarter}</div>
                <div className={cn('text-xs font-bold', r.portfolioReturn >= 0 ? 'text-success' : 'text-danger')}>
                  {pct(r.portfolioReturn, 1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Style + feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-1">Votre profil</div>
            <div className="font-bold text-primary text-sm">{style}</div>
          </div>
          <div className="bg-secondary/8 border border-secondary/15 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-1">Analyse risque</div>
            <p className="text-sm text-primary/70">
              {maxDrawdown > 20
                ? 'Votre portefeuille a subi de fortes baisses. La diversification réduit ce risque.'
                : maxDrawdown > 10
                ? 'Drawdown modéré — votre diversification a partiellement protégé le capital.'
                : 'Faible drawdown — votre gestion du risque était efficace.'}
            </p>
          </div>
        </div>

        {/* Concept recap */}
        <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 mb-6 text-sm text-primary/60 leading-relaxed">
          <strong className="text-primary">📚 Ce que vous avez pratiqué :</strong>
          <br />
          La <em>diversification</em> (réduction du risque par la répartition sectorielle), le <em>drawdown maximum</em>{' '}
          (mesure de la perte depuis un sommet), et la relation <em>rendement / risque</em> — les actifs les plus
          rémunérateurs sont aussi les plus volatils.
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
