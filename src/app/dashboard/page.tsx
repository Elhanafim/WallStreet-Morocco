'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Wallet, TrendingUp, BarChart2, ArrowRight, Briefcase, Plus,
  Calendar, DollarSign,
} from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';

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

const TYPE_COLORS: Record<string, string> = {
  STOCK: '#3A86FF',
  OPCVM: '#8B5CF6',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ─── Portfolio Summary Card ───────────────────────────────────────────────────

function PortfolioSummaryCard({ portfolio }: { portfolio: NamedPortfolio }) {
  const invested = portfolio.holdings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);
  return (
    <Link
      href={`/portfolio/${portfolio.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-black text-[#0A2540] leading-tight">{portfolio.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {STRATEGY_LABELS[portfolio.strategy] ?? portfolio.strategy} · {portfolio.holdings.length} position{portfolio.holdings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-8 h-8 bg-[#3A86FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-[#3A86FF]" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-black text-[#0A2540]">{fmtMAD(invested)}</span>
        <div className="flex gap-1.5">
          {(['STOCK', 'OPCVM'] as const).map((t) => {
            const c = portfolio.holdings.filter((h) => h.assetType === t).length;
            if (!c) return null;
            return (
              <span
                key={t}
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${TYPE_COLORS[t]}18`, color: TYPE_COLORS[t] }}
              >
                {c} {t === 'STOCK' ? 'Action' : 'OPCVM'}{c > 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const [portfolios, setPortfolios] = useState<NamedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolios')
      .then((r) => (r.ok ? r.json() : []))
      .then(setPortfolios)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Aggregated stats across all portfolios ──
  const allHoldings = portfolios.flatMap((p) => p.holdings);
  const totalInvested = allHoldings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);

  // This month contributions
  const now = new Date();
  const monthlyContrib = allHoldings
    .filter((h) => {
      const d = new Date(h.purchaseDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, h) => s + h.quantity * h.purchasePrice, 0);

  // Allocation donut by type
  const allocationMap: Record<string, number> = {};
  allHoldings.forEach((h) => {
    allocationMap[h.assetType] = (allocationMap[h.assetType] ?? 0) + h.quantity * h.purchasePrice;
  });
  const pieData = Object.entries(allocationMap).map(([type, value]) => ({
    name: type === 'STOCK' ? 'Actions BVC' : 'OPCVM',
    value: Math.round(value),
    color: TYPE_COLORS[type] ?? '#6B7280',
  }));

  // Recent holdings across all portfolios (latest 5)
  const recentHoldings = [...allHoldings]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  const previewPortfolios = portfolios.slice(0, 3);
  const hasMore = portfolios.length > 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0A2540]">
            Bonjour, {session?.user?.name?.split(' ')[0] ?? 'Investisseur'} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white text-sm font-bold rounded-xl hover:bg-[#3A86FF] transition-colors shadow-sm"
        >
          <Briefcase className="w-4 h-4" />
          Mes Portefeuilles
        </Link>
      </div>

      {loading ? (
        /* ── Skeleton ── */
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
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-[#0A2540]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-[#0A2540]/40" />
          </div>
          <h3 className="text-lg font-black text-[#0A2540] mb-2">Aucun portefeuille</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Créez votre premier portefeuille pour commencer à suivre vos investissements BVC et OPCVM.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#3A86FF] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un portefeuille
          </Link>
        </div>
      ) : (
        <>
          {/* ── KPI Strip ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Total Investi"
              value={fmtMAD(totalInvested)}
              icon={Wallet}
              iconColor="text-[#0A2540]"
              iconBg="bg-[#0A2540]/10"
            />
            <MetricCard
              label="Portefeuilles"
              value={`${portfolios.length}`}
              icon={Briefcase}
              iconColor="text-[#3A86FF]"
              iconBg="bg-blue-50"
            />
            <MetricCard
              label="Positions"
              value={`${allHoldings.length}`}
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Contrib. ce mois"
              value={fmtMAD(monthlyContrib)}
              icon={Calendar}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>

          {/* ── Charts + Portfolios ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Portfolio cards preview */}
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#0A2540]">Mes Portefeuilles</h3>
                <Link
                  href="/portfolio"
                  className="text-xs font-semibold text-[#3A86FF] hover:text-[#0A2540] flex items-center gap-1 transition-colors"
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
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3A86FF] hover:bg-blue-50/30 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#3A86FF] min-h-[100px]"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-semibold">+{portfolios.length - 3} autres</span>
                  </Link>
                )}
                <Link
                  href="/portfolio"
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3A86FF] hover:bg-blue-50/30 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#3A86FF] min-h-[100px]"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs font-semibold">Nouveau</span>
                </Link>
              </div>
            </div>

            {/* Allocation donut */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h3 className="text-base font-black text-[#0A2540]">Allocation globale</h3>
                <p className="text-xs text-gray-500 mt-0.5">Par type d&apos;actif</p>
              </div>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
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
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-[#0A2540]">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <h3 className="text-base font-black text-[#0A2540]">Dernières positions</h3>
                <Link
                  href="/portfolio"
                  className="text-xs font-semibold text-[#3A86FF] hover:text-[#0A2540] flex items-center gap-1 transition-colors"
                >
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentHoldings.map((h) => (
                  <div key={h.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[h.assetType] ?? '#6B7280' }}
                      >
                        {h.assetSymbol.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{h.assetName}</p>
                        <p className="text-xs text-gray-400">
                          {h.assetType === 'STOCK' ? 'Action BVC' : 'OPCVM'} ·{' '}
                          {new Intl.DateTimeFormat('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(h.purchaseDate))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0A2540]">
                        {(h.quantity * h.purchasePrice).toLocaleString('fr-MA')} MAD
                      </p>
                      <p className="text-xs text-gray-400">{h.quantity} × {h.purchasePrice.toLocaleString('fr-MA')}</p>
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
