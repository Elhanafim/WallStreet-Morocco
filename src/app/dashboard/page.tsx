'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Wallet, TrendingUp, BarChart2, PlusCircle, ArrowRight, Calendar,
} from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import AddAssetModal from '@/components/dashboard/AddAssetModal';

interface PortfolioEntry {
  id: string;
  assetName: string;
  assetType: string;
  ticker?: string;
  amountInvested: number;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

const ASSET_COLORS: Record<string, string> = {
  STOCK: '#3A86FF',
  OPCVM: '#8B5CF6',
  ETF: '#10B981',
  BOND: '#F59E0B',
  OTHER: '#6B7280',
};

const ASSET_LABELS: Record<string, string> = {
  STOCK: 'Actions',
  OPCVM: 'OPCVM',
  ETF: 'ETF',
  BOND: 'Obligations',
  OTHER: 'Autre',
};

function formatMAD(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M MAD`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k MAD`;
  return `${value.toFixed(2)} MAD`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  // Calculations
  const totalInvested = portfolio.reduce((sum, e) => sum + e.amountInvested, 0);
  const simulatedGrowthRate = 0.087; // 8.7% simulated annual return
  const estimatedValue = totalInvested * (1 + simulatedGrowthRate);
  const performancePct = totalInvested > 0 ? ((estimatedValue - totalInvested) / totalInvested) * 100 : 0;

  // Monthly contribution (this month)
  const now = new Date();
  const monthlyContrib = portfolio
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amountInvested, 0);

  // Growth chart data — cumulative investment over time
  const sorted = [...portfolio].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cumulative = 0;
  const chartData = sorted.map((e) => {
    cumulative += e.amountInvested;
    return {
      date: new Date(e.date).toLocaleDateString('fr-MA', { month: 'short', day: 'numeric' }),
      investi: Math.round(cumulative),
      valeur: Math.round(cumulative * (1 + simulatedGrowthRate)),
    };
  });

  // Allocation pie data
  const allocationMap: Record<string, number> = {};
  portfolio.forEach((e) => {
    allocationMap[e.assetType] = (allocationMap[e.assetType] ?? 0) + e.amountInvested;
  });
  const pieData = Object.entries(allocationMap).map(([type, value]) => ({
    name: ASSET_LABELS[type] ?? type,
    value: Math.round(value),
    color: ASSET_COLORS[type] ?? '#6B7280',
  }));

  const recent = [...portfolio].slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Chargement...
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white text-sm font-bold rounded-xl hover:bg-[#3A86FF] transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un actif
        </button>
      </div>

      {portfolio.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-[#0A2540]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-[#0A2540]/40" />
          </div>
          <h3 className="text-lg font-black text-[#0A2540] mb-2">Votre portfolio est vide</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Commencez par ajouter vos premiers investissements pour suivre vos performances.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#3A86FF] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter mon premier actif
          </button>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="Total Investi"
              value={formatMAD(totalInvested)}
              icon={Wallet}
              iconColor="text-[#0A2540]"
              iconBg="bg-[#0A2540]/10"
            />
            <MetricCard
              label="Valeur Actuelle"
              value={formatMAD(estimatedValue)}
              change={estimatedValue - totalInvested}
              changeSuffix=" MAD"
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              trend="up"
            />
            <MetricCard
              label="Performance"
              value={`+${performancePct.toFixed(2)}%`}
              change={performancePct}
              icon={BarChart2}
              iconColor="text-[#3A86FF]"
              iconBg="bg-blue-50"
              trend={performancePct >= 0 ? 'up' : 'down'}
              badge="Estimé"
            />
            <MetricCard
              label="Contrib. ce mois"
              value={formatMAD(monthlyContrib)}
              icon={Calendar}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Line Chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-[#0A2540]">Évolution du portefeuille</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Cumul investi vs valeur estimée</p>
                </div>
              </div>
              {chartData.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  Ajoutez plus d&apos;actifs pour voir le graphique
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString('fr-MA')} MAD`,
                        name === 'investi' ? 'Investi' : 'Valeur estimée',
                      ]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="investi" stroke="#0A2540" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="valeur" stroke="#3A86FF" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[#0A2540] rounded" />
                  <span className="text-xs text-gray-500">Investi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-[#3A86FF] rounded border-dashed" style={{ borderTop: '2px dashed #3A86FF', background: 'none' }} />
                  <span className="text-xs text-gray-500">Valeur estimée</span>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-base font-black text-[#0A2540]">Allocation</h3>
                <p className="text-xs text-gray-500 mt-0.5">Par type d&apos;actif</p>
              </div>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
              )}
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-[#0A2540]">{totalInvested > 0 ? ((item.value / totalInvested) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h3 className="text-base font-black text-[#0A2540]">Transactions récentes</h3>
              <Link
                href="/dashboard/portfolio"
                className="text-xs font-semibold text-[#3A86FF] hover:text-[#0A2540] flex items-center gap-1 transition-colors"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recent.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: ASSET_COLORS[entry.assetType] ?? '#6B7280' }}
                    >
                      {entry.assetName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A2540]">{entry.assetName}</p>
                      <p className="text-xs text-gray-400">{ASSET_LABELS[entry.assetType]} • {formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0A2540]">{entry.amountInvested.toLocaleString('fr-MA')} MAD</p>
                    {entry.quantity && (
                      <p className="text-xs text-gray-400">{entry.quantity} unités</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <AddAssetModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchPortfolio(); }}
        />
      )}
    </div>
  );
}
