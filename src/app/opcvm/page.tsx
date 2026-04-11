'use client';

import { useAmmcData } from '@/hooks/useAmmcData';
import Link from 'next/link';

const FUND_TYPES = [
  { key: 'monetaire',      label: 'Monétaire',   accent: '#C9A84C' },
  { key: 'obligataire_mlt',label: 'Oblig. MLT',  accent: '#7C9EBF' },
  { key: 'obligataire_ct', label: 'Oblig. CT',   accent: '#8B8BCA' },
  { key: 'actions',        label: 'Actions',      accent: '#2ECC71' },
  { key: 'diversifie',     label: 'Diversifié',   accent: '#5BC8CF' },
  { key: 'contractuel',    label: 'Contractuel',  accent: '#E07878' },
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

  const totalFunds   = latest ? Object.values(latest.categories).reduce((acc, c) => acc + (c.nb_fonds || 0), 0) : 0;
  const totalEncours = latest?.aum_total ?? 0;

  return (
    <div className="pt-16 min-h-screen bg-[#0A1628]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0A1628] border-b border-[#C9A84C]/10 py-14 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Moroccan gold bar accent */}
          <div className="gold-bar mb-3" />

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
              Marché des OPCVM
            </h1>
            <span className="text-xs bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 px-2.5 py-1 rounded-full font-semibold font-sans">
              Source AMMC Officielle
            </span>
          </div>

          <p className="text-[#A8B4C8] text-sm mb-5 font-sans">
            Aperçu global et statistiques hebdomadaires du marché marocain des OPCVM.
            {latest?.date && (
              <> · <span className="text-[#C9A84C]">Semaine {latest.week_number} ({latest.date})</span></>
            )}
          </p>

          <Link
            href="/opcvm/ammc"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 border border-[#C9A84C]/30 text-[#C9A84C] mb-8 transition-all hover:bg-[#C9A84C]/10 rounded-lg bg-[#C9A84C]/5 font-sans"
          >
            <span>◈</span>
            <span>Voir le tableau de bord détaillé analytique</span>
            <span>→</span>
          </Link>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Fonds Actifs',    value: totalFunds > 0 ? String(totalFunds) : '—',             sub: 'Toutes les catégories'   },
              { label: 'Flux Net Hebdo',  value: latest ? formatEncours(latest.flows.net_flow) : '—',    sub: 'Souscriptions - Rachats'  },
              { label: 'Encours Global',  value: totalEncours > 0 ? formatEncours(totalEncours) : '—',  sub: 'Actifs sous gestion'      },
              { label: 'Mise à jour',     value: latest ? latest.date : '—',                            sub: 'Fréquence hebdomadaire'   },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[#112240] border border-[#C9A84C]/12 rounded-xl px-4 py-3 geo-corner">
                <p className="text-[#C9A84C] font-black text-lg sm:text-xl mb-0.5 font-mono">{kpi.value}</p>
                <p className="text-white text-xs font-semibold font-sans">{kpi.label}</p>
                <p className="text-[#A8B4C8] text-[10px] mt-0.5 truncate font-sans">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {loading ? (
          <div className="py-20 text-center text-[#A8B4C8]">
            <div className="text-3xl mb-3 animate-pulse">📊</div>
            <p className="font-semibold font-sans">Chargement des statistiques AMMC…</p>
          </div>
        ) : error || !latest ? (
          <div className="py-16 text-center text-[#A8B4C8]">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="font-semibold text-[#E74C3C] font-sans">Données indisponibles</p>
            <button
              onClick={load}
              className="mt-4 text-sm text-[#C9A84C] border border-[#C9A84C]/30 rounded-lg px-4 py-2 hover:bg-[#C9A84C]/10 transition-colors font-sans"
            >
              ↻ Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards by category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FUND_TYPES.map(({ key, label, accent }) => {
                const s = latest.categories[key];
                if (!s || s.aum == null) return null;
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-[#1A3050] bg-[#112240] p-4 hover:border-[#C9A84C]/25 transition-colors"
                    style={{ borderTopColor: accent, borderTopWidth: 2 }}
                  >
                    <p className="font-bold text-xs text-[#A8B4C8] mb-2 font-sans uppercase tracking-wide" style={{ color: accent }}>{label}</p>
                    <p className="text-lg font-black text-white font-mono">{formatEncours(s.aum)}</p>
                    <p className="text-[10px] text-[#A8B4C8] mb-1 font-sans">Encours</p>
                    {s.weekly_growth !== null && (
                      <p className="text-[11px] font-semibold mt-1 font-mono">
                        <span className={s.weekly_growth >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}>
                          {formatPerf(s.weekly_growth)}
                        </span>
                      </p>
                    )}
                    <p className="text-[10px] text-[#A8B4C8] mt-1 font-sans">
                      {s.nb_fonds || '—'} fonds
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Category Table */}
            <div className="bg-[#112240] rounded-2xl border border-[#C9A84C]/12 overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1A3050] flex items-center justify-between">
                <h2 className="font-black text-white text-base font-display">
                  Répartition de l'Encours et Flux
                </h2>
                <button
                  onClick={load}
                  className="text-xs text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10 rounded-lg px-3 py-1.5 transition-colors font-sans"
                >
                  ↻ Actualiser
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="border-b border-[#1A3050]">
                    <tr>
                      {['Catégorie','Fonds','Encours total','Variation hebdo','Souscriptions','Rachats','Flux net'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#C9A84C] bg-[#0A1628] font-sans ${i > 0 ? 'text-right' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FUND_TYPES.map(({ key, label }) => {
                      const c = latest.categories[key];
                      if (!c || c.aum == null) return null;
                      return (
                        <tr key={key} className="border-b border-[#1A3050]/60 hover:bg-[#C9A84C]/4 transition-colors">
                          <td className="px-5 py-3 font-semibold text-white font-sans">{label}</td>
                          <td className="px-5 py-3 text-right text-[#A8B4C8] font-mono">{c.nb_fonds || '—'}</td>
                          <td className="px-5 py-3 text-right font-mono font-medium text-white">
                            {formatEncours(c.aum)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono">
                            <span className={(c.weekly_growth ?? 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}>
                              {formatPerf(c.weekly_growth)}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-[#2ECC71]">
                            +{formatEncours(c.subscriptions)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-[#E74C3C]">
                            -{formatEncours(c.redemptions)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold">
                            <span className={(c.net_flow ?? 0) >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}>
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
            <div className="rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-5 py-4 text-sm space-y-1">
              <p className="text-[#A8B4C8] text-xs font-sans">
                Source : <span className="font-semibold text-white">{latest.source || 'AMMC'}</span>
              </p>
              <p className="text-[#C9A84C] font-medium font-sans">
                ⚠️ Les statistiques sont mises à jour de manière hebdomadaire.
              </p>
              <p className="text-[#A8B4C8] text-xs font-sans">
                Ces informations macro-économiques agrégées sont fournies à des fins éducatives uniquement.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
