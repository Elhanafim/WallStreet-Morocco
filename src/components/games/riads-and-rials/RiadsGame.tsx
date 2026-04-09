'use client';

import {
  useRiads,
  PriceLevel,
  MaintenanceLevel,
  MarketingLevel,
} from './useRiads';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RefreshCw, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMAD(n: number) {
  return `${Math.round(n).toLocaleString('fr-MA')} MAD`;
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn('w-3.5 h-3.5', s <= Math.round(rating) ? 'text-accent fill-accent' : 'text-primary/20')}
        />
      ))}
    </span>
  );
}

// ─── Radio-button group ────────────────────────────────────────────────────────

interface OptionGroup<T extends string> {
  value: T;
  label: string;
  sublabel: string;
  color: string;
  selectedColor: string;
}

function OptionRow<T extends string>({
  label,
  options,
  current,
  onChange,
}: {
  label: string;
  options: OptionGroup<T>[];
  current: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 text-sm',
              current === opt.value ? opt.selectedColor : opt.color
            )}
          >
            <div className={cn('font-bold text-xs', current === opt.value ? '' : 'text-primary')}>{opt.label}</div>
            <div className={cn('text-xs mt-0.5 opacity-75', current === opt.value ? '' : 'text-primary/50')}>{opt.sublabel}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Option configs ────────────────────────────────────────────────────────────

const PRICE_OPTIONS: OptionGroup<PriceLevel>[] = [
  { value: 'low',    label: 'Économique',  sublabel: '480 MAD/nuit',  color: 'border-surface-200 hover:border-surface-300 bg-white',        selectedColor: 'border-emerald-500 bg-emerald-500 text-white' },
  { value: 'medium', label: 'Standard',    sublabel: '720 MAD/nuit',  color: 'border-surface-200 hover:border-surface-300 bg-white',        selectedColor: 'border-secondary bg-secondary text-white' },
  { value: 'high',   label: 'Prestige',    sublabel: '1 050 MAD/nuit',color: 'border-surface-200 hover:border-surface-300 bg-white',        selectedColor: 'border-accent bg-accent text-white' },
];

const MAINT_OPTIONS: OptionGroup<MaintenanceLevel>[] = [
  { value: 'low',    label: 'Minimal',    sublabel: '2 000 MAD',  color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-red-500 bg-red-500 text-white' },
  { value: 'medium', label: 'Régulier',   sublabel: '5 500 MAD',  color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-secondary bg-secondary text-white' },
  { value: 'high',   label: 'Premium',    sublabel: '10 000 MAD', color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-emerald-500 bg-emerald-500 text-white' },
];

const MARKET_OPTIONS: OptionGroup<MarketingLevel>[] = [
  { value: 'none',   label: 'Aucun',      sublabel: '0 MAD / 0%',         color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-primary bg-primary text-white' },
  { value: 'local',  label: 'Local',      sublabel: '2 000 MAD fixe',      color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-secondary bg-secondary text-white' },
  { value: 'global', label: 'Plateformes',sublabel: '18% de commission',   color: 'border-surface-200 hover:border-surface-300 bg-white', selectedColor: 'border-accent bg-accent text-white' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function RiadsGame() {
  const { state, startGame, setDecision, confirmMonth, nextMonth, resetGame, totalProfit, lastMonth } =
    useRiads();

  const { phase, month, totalMonths, rooms, priceLevel, maintenanceLevel, marketingLevel,
          maintenanceScore, guestRating, cash, monthHistory, currentEvent } = state;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4">
        <div className="text-6xl mb-4">🏡</div>
        <h1 className="text-3xl font-black text-primary font-display mb-3">Riads & Rials</h1>
        <p className="text-primary/60 mb-3 leading-relaxed">
          Vous gérez un <strong>riad de 8 chambres à Marrakech</strong>. Votre objectif : maximiser le
          bénéfice cumulé sur 12 mois en jonglant entre tarification, maintenance et marketing.
        </p>
        <p className="text-primary/60 mb-8 leading-relaxed">
          Chaque mois, un événement de saison affecte la demande. Vos décisions ont des effets à long terme — la
          maintenance d&apos;aujourd&apos;hui protège votre note client de demain.
        </p>

        {/* Stats preview */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Chambres',        value: '8' },
            { label: 'Budget initial',  value: '30 000 MAD' },
            { label: 'Durée',           value: '12 mois' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-50 border border-surface-100 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-primary">{s.value}</div>
              <div className="text-xs text-primary/50 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={startGame}
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
        >
          Ouvrir le riad 🏡
        </button>
      </div>
    );
  }

  // ── Decision ───────────────────────────────────────────────────────────────
  if (phase === 'decision' && currentEvent) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-primary/50 mb-1">
            <span>Mois {month} / {totalMonths}</span>
            <span>Trésorerie : {formatMAD(cash)}</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${((month - 1) / totalMonths) * 100}%` }}
            />
          </div>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-primary/50">Note clients</span>
            <div className="flex items-center gap-1.5">
              <StarRating rating={guestRating} />
              <span className="text-sm font-bold text-primary">{guestRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-primary/50">État du riad</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 w-16 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', maintenanceScore > 60 ? 'bg-success' : maintenanceScore > 35 ? 'bg-warning' : 'bg-danger')}
                  style={{ width: `${maintenanceScore}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">{Math.round(maintenanceScore)}%</span>
            </div>
          </div>
        </div>

        {/* Event card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-5 mb-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{currentEvent.emoji}</span>
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Événement du mois</div>
              <div className="font-bold text-lg">{currentEvent.title}</div>
            </div>
          </div>
          <p className="text-white/70 text-sm">{currentEvent.description}</p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className={cn('px-2 py-1 rounded-full font-semibold', currentEvent.occupancyDelta >= 0 ? 'bg-success/30 text-green-200' : 'bg-danger/30 text-red-200')}>
              Occupation {currentEvent.occupancyDelta >= 0 ? '+' : ''}{currentEvent.occupancyDelta}%
            </span>
            <span className={cn('px-2 py-1 rounded-full font-semibold', currentEvent.adrlDelta >= 0 ? 'bg-success/30 text-green-200' : 'bg-danger/30 text-red-200')}>
              Tarif {currentEvent.adrlDelta >= 0 ? '+' : ''}{currentEvent.adrlDelta}%
            </span>
          </div>
        </div>

        {/* Decisions */}
        <OptionRow<PriceLevel>
          label="Tarif par nuit"
          options={PRICE_OPTIONS}
          current={priceLevel}
          onChange={(v) => setDecision('priceLevel', v)}
        />
        <OptionRow<MaintenanceLevel>
          label="Budget maintenance"
          options={MAINT_OPTIONS}
          current={maintenanceLevel}
          onChange={(v) => setDecision('maintenanceLevel', v)}
        />
        <OptionRow<MarketingLevel>
          label="Marketing"
          options={MARKET_OPTIONS}
          current={marketingLevel}
          onChange={(v) => setDecision('marketingLevel', v)}
        />

        <button
          onClick={confirmMonth}
          className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent/90 transition-colors shadow-md mt-2"
        >
          Simuler {currentEvent ? `— ${currentEvent.title}` : 'ce mois'} →
        </button>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (phase === 'results' && lastMonth) {
    const r = lastMonth;
    const isProfit = r.profit >= 0;
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-2">{r.event.emoji}</div>
        <h2 className="text-xl font-bold text-primary mb-1">{r.monthName} — résultats</h2>
        <p className="text-primary/50 text-sm mb-6">{r.event.title}</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-left">
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
            <div className="text-xs text-primary/50 mb-0.5">Taux d'occupation</div>
            <div className="text-xl font-black text-primary">{pct(r.occupancy)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
            <div className="text-xs text-primary/50 mb-0.5">Tarif moyen / nuit</div>
            <div className="text-xl font-black text-primary">{r.adr} MAD</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
            <div className="text-xs text-primary/50 mb-0.5">Revenus</div>
            <div className="text-xl font-black text-primary">{formatMAD(r.revenue)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-3">
            <div className="text-xs text-primary/50 mb-0.5">Charges</div>
            <div className="text-xl font-black text-primary">{formatMAD(r.expenses)}</div>
          </div>
        </div>

        {/* Profit highlight */}
        <div className={cn('rounded-xl border p-4 mb-5', isProfit ? 'bg-success/10 border-success/25' : 'bg-danger/10 border-danger/25')}>
          <div className="text-xs text-primary/50 mb-1">Résultat du mois</div>
          <div className={cn('text-3xl font-black', isProfit ? 'text-success' : 'text-danger')}>
            {isProfit ? '+' : ''}{formatMAD(r.profit)}
          </div>
          <div className="text-xs text-primary/50 mt-1">
            Cumulé : {r.cumulativeProfit >= 0 ? '+' : ''}{formatMAD(r.cumulativeProfit)}
          </div>
        </div>

        {/* Rating update */}
        <div className="flex items-center justify-between bg-surface-50 border border-surface-100 rounded-xl px-4 py-3 mb-6">
          <span className="text-sm text-primary/60">Note clients</span>
          <div className="flex items-center gap-2">
            <StarRating rating={r.guestRating} />
            <span className="text-sm font-bold text-primary">{r.guestRating.toFixed(1)}</span>
          </div>
        </div>

        <button
          onClick={nextMonth}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Mois suivant →
        </button>
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const chartData = monthHistory.map((r) => ({
      name: r.monthName.slice(0, 3),
      profit: r.profit,
      cumul: r.cumulativeProfit,
    }));

    const totalRevenue  = monthHistory.reduce((s, r) => s + r.revenue, 0);
    const totalExpenses = monthHistory.reduce((s, r) => s + r.expenses, 0);
    const avgOccupancy  = monthHistory.reduce((s, r) => s + r.occupancy, 0) / monthHistory.length;
    const finalRating   = monthHistory[monthHistory.length - 1]?.guestRating ?? 3;

    const profitMonths = monthHistory.filter((r) => r.profit >= 0).length;

    const feedback = (() => {
      if (totalProfit > 80_000)  return 'Excellent ! Votre riad est très rentable — superbe gestion.';
      if (totalProfit > 30_000)  return 'Bonne performance ! Vous avez su équilibrer charges et revenus.';
      if (totalProfit > 0)       return 'Résultat positif, mais de l\'optimisation est possible.';
      return 'Résultat négatif — la maintenance insuffisante ou un marketing mal calibré ont pénalisé la performance.';
    })();

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-3xl font-black text-primary font-display">Bilan annuel</h2>
          <p className="text-primary/50 text-sm mt-1">12 mois de gestion de votre riad</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={cn('rounded-xl border p-4 text-center', totalProfit >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20')}>
            <div className="text-xs text-primary/50 mb-1">Bénéfice net</div>
            <div className={cn('text-xl font-black', totalProfit >= 0 ? 'text-success' : 'text-danger')}>
              {totalProfit >= 0 ? '+' : ''}{formatMAD(totalProfit)}
            </div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">CA total</div>
            <div className="text-xl font-black text-primary">{formatMAD(totalRevenue)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Occupation moy.</div>
            <div className="text-xl font-black text-primary">{pct(avgOccupancy)}</div>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4 text-center">
            <div className="text-xs text-primary/50 mb-1">Note finale</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <StarRating rating={finalRating} />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-surface-100 rounded-2xl p-4 mb-5">
          <h3 className="text-sm font-bold text-primary/70 mb-3">Résultat mensuel (MAD)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [formatMAD(v)]}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="profit" stroke="#1D4ED8" strokeWidth={2} dot={{ r: 3 }} name="Résultat mensuel" />
              <Line type="monotone" dataKey="cumul"  stroke="#C8962E" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Cumulé" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-secondary inline-block rounded" />Mensuel</span>
            <span className="flex items-center gap-1.5 text-xs text-primary/50"><span className="w-4 h-0.5 bg-accent inline-block rounded border-dashed" />Cumulé</span>
          </div>
        </div>

        {/* Stats + feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-4">
            <div className="text-xs text-primary/50 mb-1">Mois bénéficiaires</div>
            <div className="text-2xl font-black text-primary">{profitMonths} / 12</div>
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
          Le <em>RevPAR</em> (Revenue Per Available Room = occupation × tarif), l&apos;impact des <em>charges fixes</em> sur
          la rentabilité, et la valeur de la <em>réputation</em> (note client) comme actif invisible.
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
