'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Wallet, TrendingUp, BarChart2, ArrowRight, Briefcase, Plus,
  Calendar,
} from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import DashboardDonateWidget from '@/components/donate/DashboardDonateWidget';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Holding {
  id: string;
  assetType: 'STOCK' | 'OPCVM';
  assetSymbol: string;
  assetName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface NamedPortfolio {
  id: string;
  name: string;
  strategy: string;
  createdAt: string;
  holdings: Holding[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMAD(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M MAD`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k MAD`;
  return `${n.toFixed(2)} MAD`;
}

const STRATEGY_LABELS: Record<string, string> = {
  COURT_TERME: 'Court terme',
  LONG_TERME: 'Long terme',
  RETRAITE: 'Retraite',
  EPARGNE: 'Épargne',
  AUTRE: 'Autre',
};

// Use design-token-aligned colors for pie chart
const TYPE_COLORS: Record<string, string> = {
  STOCK: '#B8974A',   // --gold (dark mode value)
  OPCVM: '#7A8BA0',   // --text-secondary
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    />
  );
}

// ─── Portfolio Summary Card ───────────────────────────────────────────────────

function PortfolioSummaryCard({ portfolio }: { portfolio: NamedPortfolio }) {
  const invested = portfolio.holdings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);
  return (
    <div
      className="flex flex-col gap-4 transition-all duration-200 p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
      }}
    >
      <Link href={`/portfolio/${portfolio.id}`} className="flex items-start justify-between">
        <div>
          <p
            className="text-sm leading-tight"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            {portfolio.name}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}
          >
            {STRATEGY_LABELS[portfolio.strategy] ?? portfolio.strategy}
            {' · '}
            {portfolio.holdings.length} position{portfolio.holdings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        >
          <Briefcase className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>
      </Link>

      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {fmtMAD(invested)}
        </span>
        <div className="flex gap-2">
          {(['STOCK', 'OPCVM'] as const).map((t) => {
            const c = portfolio.holdings.filter((h) => h.assetType === t).length;
            if (!c) return null;
            return (
              <span
                key={t}
                className="text-xs"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                }}
              >
                {c} {t === 'STOCK' ? 'Action' : 'OPCVM'}{c > 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      </div>

      <Link
        href={`/portfolio/${portfolio.id}`}
        className="flex items-center justify-center gap-1.5 px-3 py-2 transition-all duration-200"
        style={{
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 400,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter un actif
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const [portfolios, setPortfolios] = useState<NamedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = useCallback(() => {
    fetch('/api/portfolios')
      .then((r) => (r.ok ? r.json() : []))
      .then(setPortfolios)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    const handler = () => fetchPortfolios();
    window.addEventListener('portfolioUpdated', handler);
    return () => window.removeEventListener('portfolioUpdated', handler);
  }, [fetchPortfolios]);

  const allHoldings = portfolios.flatMap((p) => p.holdings);
  const totalInvested = allHoldings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);

  const now = new Date();
  const monthlyContrib = allHoldings
    .filter((h) => {
      const d = new Date(h.purchaseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, h) => s + h.quantity * h.purchasePrice, 0);

  const allocationMap: Record<string, number> = {};
  allHoldings.forEach((h) => {
    allocationMap[h.assetType] = (allocationMap[h.assetType] ?? 0) + h.quantity * h.purchasePrice;
  });
  const pieData = Object.entries(allocationMap).map(([type, value]) => ({
    name: type === 'STOCK' ? 'Actions BVC' : 'OPCVM',
    value: Math.round(value),
    color: TYPE_COLORS[type] ?? 'var(--text-muted)',
  }));

  const recentHoldings = [...allHoldings]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  const previewPortfolios = portfolios.slice(0, 3);
  const hasMore = portfolios.length > 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardDonateWidget />

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            Bonjour, {session?.user?.name?.split(' ')[0] ?? 'Investisseur'}
          </h2>
          <p
            className="mt-0.5"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            {new Date().toLocaleDateString('fr-MA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-2 px-4 py-2.5 transition-colors"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 400,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
          }}
        >
          <Briefcase className="w-4 h-4" />
          Mes Portefeuilles
        </Link>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Skeleton className="xl:col-span-2 h-64" />
            <Skeleton className="h-64" />
          </div>
        </>
      ) : portfolios.length === 0 ? (
        /* ── Empty State ── */
        <div
          className="p-12 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border)',
            borderRadius: '8px',
          }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          >
            <BarChart2 className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3
            className="mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            Aucun portefeuille
          </h3>
          <p
            className="mb-6 max-w-sm mx-auto"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
            }}
          >
            Créez votre premier portefeuille pour commencer à suivre vos investissements BVC et OPCVM.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 transition-colors"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--bg-base)',
              borderRadius: '6px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Plus className="w-4 h-4" />
            Créer un portefeuille
          </Link>
        </div>
      ) : (
        <>
          {/* ── KPI Strip ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard label="Total Investi"      value={fmtMAD(totalInvested)} icon={Wallet}    />
            <MetricCard label="Portefeuilles"      value={`${portfolios.length}`} icon={Briefcase}  />
            <MetricCard label="Positions"          value={`${allHoldings.length}`} icon={TrendingUp} />
            <MetricCard label="Contrib. ce mois"   value={fmtMAD(monthlyContrib)} icon={Calendar}  />
          </div>

          {/* ── Charts + Portfolios ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Portfolio cards preview */}
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  Mes Portefeuilles
                </h3>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewPortfolios.map((p) => (
                  <PortfolioSummaryCard key={p.id} portfolio={p} />
                ))}
                {hasMore && (
                  <Link
                    href="/portfolio"
                    className="flex flex-col items-center justify-center gap-2 min-h-[100px] transition-all duration-200"
                    style={{
                      border: '1px dashed var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>+{portfolios.length - 3} autres</span>
                  </Link>
                )}
                <Link
                  href="/portfolio"
                  className="flex flex-col items-center justify-center gap-2 min-h-[100px] transition-all duration-200"
                  style={{
                    border: '1px dashed var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--gold)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouveau</span>
                </Link>
              </div>
            </div>

            {/* Allocation donut */}
            <div
              className="p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <div className="mb-4">
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  Allocation globale
                </h3>
                <p
                  className="mt-0.5"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Par type d&apos;actif
                </p>
              </div>
              {pieData.length === 0 ? (
                <div
                  className="h-48 flex items-center justify-center"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                  }}
                >
                  Aucune position
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString('fr-MA')} MAD`]}
                        contentStyle={{
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontFamily: 'var(--font-body)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {totalInvested > 0 ? ((item.value / totalInvested) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Recent holdings ── */}
          {recentHoldings.length > 0 && (
            <div
              className="overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <div
                className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  Dernières positions
                </h3>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div style={{ borderTop: '0' }}>
                {recentHoldings.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--gold)',
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        {h.assetSymbol.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {h.assetName}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {h.assetType === 'STOCK' ? 'Action BVC' : 'OPCVM'}
                          {' · '}
                          {new Intl.DateTimeFormat('fr-MA', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(h.purchaseDate))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {(h.quantity * h.purchasePrice).toLocaleString('fr-MA')} MAD
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {h.quantity} × {h.purchasePrice.toLocaleString('fr-MA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
