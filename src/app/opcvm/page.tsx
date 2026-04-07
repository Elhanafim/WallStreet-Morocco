'use client';

import { useAmmcData } from '@/hooks/useAmmcData';
import Link from 'next/link';

const FUND_TYPES = [
  { key: 'monetaire', label: 'Monétaire', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'obligataire_mlt', label: 'Oblig. MLT', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'obligataire_ct', label: 'Oblig. CT', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'actions', label: 'Actions', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'diversifie', label: 'Diversifié', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { key: 'contractuel', label: 'Contractuel', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

function formatEncours(val: number | null | undefined): string {
  if (val == null) return '—';
  if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(2)} Mrd MAD`;
  return `${val.toFixed(0)} MDH`;
}

function formatPerf(val: number | null | undefined, decimals = 2): string {
  if (val == null) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${(val * 100).toFixed(decimals)}%`;
}

export default function OpcvmPage() {
  const { latest, loading, error, load } = useAmmcData();

  const totalFunds = latest ? Object.values(latest.categories).reduce((acc, c) => acc + (c.nb_fonds || 0), 0) : 0;
  const totalEncours = latest?.aum_total ?? 0;
  
  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Marché des OPCVM
            </h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              Source AMMC Officielle
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Aperçu global et statistiques hebdomadaires du marché marocain des OPCVM.
            {latest?.date && <> · <span className="text-blue-400">Semaine {latest.week_number} ({latest.date})</span></>}
          </p>

          <Link
            href="/terminal?tab=OPCVM"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 border mb-6 transition-colors hover:bg-amber-500/10 rounded-lg bg-blue-900/40"
            style={{ borderColor: '#FF8C0066', color: '#FF8C00' }}
          >
            <span>◈</span>
            <span>Voir le tableau de bord détaillé analytique</span>
            <span>→</span>
          </Link>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Fonds Actifs', value: totalFunds > 0 ? String(totalFunds) : '—', sub: 'Toutes les catégories' },
              { label: 'Flux Net Hebdo', value: latest ? formatEncours(latest.flows.net_flow) : '—', sub: 'Souscriptions - Rachats' },
              { label: 'Encours Global', value: totalEncours > 0 ? formatEncours(totalEncours) : '—', sub: 'Actifs sous gestion' },
              { label: 'Mise à jour', value: latest ? latest.date : '—', sub: 'Fréquence hebdomadaire' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <p className="text-blue-300 font-black text-lg sm:text-xl mb-0.5">{kpi.value}</p>
                <p className="text-white/80 text-xs font-semibold">{kpi.label}</p>
                <p className="text-white/40 text-[10px] mt-0.5 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
             <div className="text-3xl mb-3 animate-pulse">📊</div>
             <p className="font-semibold">Chargement des statistiques AMMC…</p>
          </div>
        ) : error || !latest ? (
          <div className="py-16 text-center text-slate-500">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="font-semibold text-red-600 dark:text-red-400">Données indisponibles</p>
            <button onClick={load} className="mt-4 text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
              ↻ Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards by category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FUND_TYPES.map(({ key, label, color }) => {
                const s = latest.categories[key];
                if (!s || s.aum == null) return null;
                return (
                  <div key={key} className={`rounded-xl border p-4 ${color} bg-opacity-60`}>
                    <p className="font-black text-sm mb-2">{label}</p>
                    <p className="text-xl font-black">{formatEncours(s.aum)}</p>
                    <p className="text-xs opacity-70 mb-2">Encours</p>
                    {s.weekly_growth !== null && (
                      <p className="text-[11px] font-semibold mt-1">
                        Var: <span className={s.weekly_growth >= 0 ? 'text-emerald-700' : 'text-red-700'}>{formatPerf(s.weekly_growth)}</span>
                      </p>
                    )}
                    <p className="text-[11px] opacity-80 mt-1">
                      Fonds: {s.nb_fonds || '—'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Simplifed Category Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                <h2 className="font-black text-slate-800 dark:text-white text-base">
                  Répartition de l'Encours et Flux
                </h2>
                <button
                  onClick={load}
                  className="text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-1.5 transition-colors"
                >
                  ↻ Actualiser
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Catégorie</th>
                      <th className="px-5 py-3 text-right">Fonds</th>
                      <th className="px-5 py-3 text-right">Encours total</th>
                      <th className="px-5 py-3 text-right">Variation hebdo</th>
                      <th className="px-5 py-3 text-right">Souscriptions</th>
                      <th className="px-5 py-3 text-right">Rachats</th>
                      <th className="px-5 py-3 text-right font-bold">Flux net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {FUND_TYPES.map(({ key, label }) => {
                      const c = latest.categories[key];
                      if (!c || c.aum == null) return null;
                      return (
                        <tr key={key} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{label}</td>
                          <td className="px-5 py-3 text-right text-slate-500">{c.nb_fonds || '—'}</td>
                          <td className="px-5 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                            {formatEncours(c.aum)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono">
                            <span className={(c.weekly_growth ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}>
                              {formatPerf(c.weekly_growth)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                             +{formatEncours(c.subscriptions)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-red-600 dark:text-red-400">
                             -{formatEncours(c.redemptions)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold">
                             <span className={(c.net_flow ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                               {(c.net_flow ?? 0) >= 0 ? '+' : ''}{formatEncours(c.net_flow)}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source block */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 px-5 py-4 text-sm space-y-1">
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                Source : <span className="font-semibold">{latest.source || 'AMMC'}</span>
              </p>
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Les statistiques sont mises à jour de manière hebdomadaire.
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs">
                Ces informations macro-économiques agrégées sont fournies à des fins éducatives uniquement.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
