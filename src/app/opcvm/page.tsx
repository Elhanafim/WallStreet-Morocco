'use client';

import { useAmmcData } from '@/hooks/useAmmcData';
import Link from 'next/link';
import { BarChart2, RefreshCw, AlertTriangle } from 'lucide-react';

const FUND_TYPES = [
  { key: 'monetaire',     label: 'Monétaire'   },
  { key: 'obligataire_mlt', label: 'Oblig. MLT' },
  { key: 'obligataire_ct',  label: 'Oblig. CT'  },
  { key: 'actions',       label: 'Actions'     },
  { key: 'diversifie',    label: 'Diversifié'  },
  { key: 'contractuel',   label: 'Contractuel' },
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Page header */}
      <div
        className="py-12 px-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            >
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1
                  className="text-3xl sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
                >
                  Marché des OPCVM
                </h1>
                <span
                  className="text-xs px-2.5 py-1"
                  style={{
                    color: 'var(--gold)',
                    backgroundColor: 'rgba(184,151,74,0.08)',
                    border: '1px solid rgba(184,151,74,0.2)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Source AMMC Officielle
                </span>
              </div>
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                Aperçu global et statistiques hebdomadaires du marché marocain des OPCVM.
                {latest?.date && (
                  <> · <span style={{ color: 'var(--text-secondary)' }}>Semaine {latest.week_number} ({latest.date})</span></>
                )}
              </p>
            </div>
          </div>

          <Link
            href="/opcvm/ammc"
            className="inline-flex items-center gap-2 text-xs px-4 py-2 mb-8 transition-colors"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-elevated)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
          >
            <span>◈</span>
            <span>Voir le tableau de bord détaillé analytique</span>
            <span>→</span>
          </Link>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Fonds Actifs',   value: totalFunds > 0 ? String(totalFunds) : '—', sub: 'Toutes les catégories' },
              { label: 'Flux Net Hebdo', value: latest ? formatEncours(latest.flows.net_flow) : '—', sub: 'Souscriptions - Rachats' },
              { label: 'Encours Global', value: totalEncours > 0 ? formatEncours(totalEncours) : '—', sub: 'Actifs sous gestion' },
              { label: 'Mise à jour',    value: latest ? latest.date : '—', sub: 'Fréquence hebdomadaire' },
            ].map(kpi => (
              <div
                key={kpi.label}
                className="px-4 py-3"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              >
                <p
                  className="text-xl mb-0.5"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {kpi.value}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  {kpi.label}
                </p>
                <p
                  className="text-[10px] mt-0.5 truncate"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                >
                  {kpi.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="py-20 text-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--border)', borderTopColor: 'transparent' }}
            />
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            >
              Chargement des statistiques AMMC…
            </p>
          </div>
        ) : error || !latest ? (
          <div className="py-16 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p
              className="text-sm font-medium mb-4"
              style={{ color: 'var(--loss)', fontFamily: 'var(--font-sans)' }}
            >
              Données indisponibles
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 transition-colors"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-elevated)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards by category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FUND_TYPES.map(({ key, label }) => {
                const s = latest.categories[key];
                if (!s || s.aum == null) return null;
                return (
                  <div
                    key={key}
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  >
                    <p
                      className="text-xs font-medium mb-2"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-lg mb-0.5"
                      style={{
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {formatEncours(s.aum)}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                    >
                      Encours
                    </p>
                    {s.weekly_growth !== null && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        <span style={{ color: (s.weekly_growth ?? 0) >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                          {formatPerf(s.weekly_growth)}
                        </span>
                      </p>
                    )}
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
                    >
                      {s.nb_fonds || '—'} fonds
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Category Table */}
            <div
              className="overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <h2
                  className="text-base font-medium"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  Répartition de l&apos;Encours et Flux
                </h2>
                <button
                  onClick={load}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '5px',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-base)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Actualiser
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                      {['Catégorie', 'Fonds', 'Encours total', 'Variation hebdo', 'Souscriptions', 'Rachats', 'Flux net'].map((h, i) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-xs font-medium uppercase tracking-widest"
                          style={{
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-sans)',
                            textAlign: i === 0 ? 'left' : 'right',
                          }}
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
                        <tr
                          key={key}
                          style={{ borderBottom: '1px solid var(--border)' }}
                          className="transition-colors"
                          onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--bg-elevated)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                        >
                          <td
                            className="px-5 py-3 text-sm font-medium"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                          >
                            {label}
                          </td>
                          <td
                            className="px-5 py-3 text-right text-sm"
                            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                          >
                            {c.nb_fonds || '—'}
                          </td>
                          <td
                            className="px-5 py-3 text-right text-sm"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                          >
                            {formatEncours(c.aum)}
                          </td>
                          <td className="px-5 py-3 text-right text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: (c.weekly_growth ?? 0) >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                              {formatPerf(c.weekly_growth)}
                            </span>
                          </td>
                          <td
                            className="px-5 py-3 text-right text-sm"
                            style={{ color: 'var(--gain)', fontFamily: 'var(--font-mono)' }}
                          >
                            +{formatEncours(c.subscriptions)}
                          </td>
                          <td
                            className="px-5 py-3 text-right text-sm"
                            style={{ color: 'var(--loss)', fontFamily: 'var(--font-mono)' }}
                          >
                            -{formatEncours(c.redemptions)}
                          </td>
                          <td className="px-5 py-3 text-right text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: (c.net_flow ?? 0) >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
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
            <div
              className="px-5 py-4 space-y-1"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderLeft: '2px solid var(--gold)',
                borderRadius: '6px',
              }}
            >
              <p
                className="text-xs"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                Source : <span className="font-medium">{latest.source || 'AMMC'}</span>
              </p>
              <p
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                Les statistiques sont mises à jour de manière hebdomadaire.
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
              >
                Ces informations macro-économiques agrégées sont fournies à des fins éducatives uniquement.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
