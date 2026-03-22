'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  PlusCircle, Trash2, ChevronUp, ChevronDown, ChevronsUpDown,
  TrendingUp, Building2, BarChart3, Landmark, Package, AlertTriangle,
} from 'lucide-react';
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

type SortField = 'assetName' | 'assetType' | 'amountInvested' | 'date';
type SortDir = 'asc' | 'desc';

const ASSET_COLORS: Record<string, string> = {
  STOCK: '#3A86FF',
  OPCVM: '#8B5CF6',
  ETF: '#10B981',
  BOND: '#F59E0B',
  OTHER: '#6B7280',
};

const ASSET_LABELS: Record<string, string> = {
  STOCK: 'Action',
  OPCVM: 'OPCVM',
  ETF: 'ETF',
  BOND: 'Obligation',
  OTHER: 'Autre',
};

const AssetIcons: Record<string, React.ReactNode> = {
  STOCK: <TrendingUp className="w-3.5 h-3.5" />,
  OPCVM: <Building2 className="w-3.5 h-3.5" />,
  ETF: <BarChart3 className="w-3.5 h-3.5" />,
  BOND: <Landmark className="w-3.5 h-3.5" />,
  OTHER: <Package className="w-3.5 h-3.5" />,
};

function formatMAD(v: number) {
  return v.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SortIcon({ field, active, dir }: { field: string; active: string; dir: SortDir }) {
  if (active !== field) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />;
  return dir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#3A86FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#3A86FF]" />;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) setPortfolio(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...portfolio].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'amountInvested') {
        comparison = a.amountInvested - b.amountInvested;
      } else if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [portfolio, sortField, sortDir]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portfolio/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setPortfolio((prev) => prev.filter((e) => e.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Summary stats
  const totalInvested = portfolio.reduce((s, e) => s + e.amountInvested, 0);
  const estimatedValue = totalInvested * 1.087;
  const gain = estimatedValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
  const assetCount = portfolio.length;
  const typeCount = new Set(portfolio.map((e) => e.assetType)).size;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0A2540]">Mon Portfolio</h2>
          <p className="text-sm text-gray-500 mt-0.5">{assetCount} actif{assetCount !== 1 ? 's' : ''} · {typeCount} type{typeCount !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A2540] text-white text-sm font-bold rounded-xl hover:bg-[#3A86FF] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un actif
        </button>
      </div>

      {/* Summary Stats */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total investi', value: formatMAD(totalInvested), color: 'text-[#0A2540]' },
            { label: 'Valeur estimée', value: formatMAD(estimatedValue), color: 'text-emerald-600' },
            { label: 'Gain estimé', value: `+${formatMAD(gain)}`, color: 'text-emerald-600' },
            { label: 'Performance', value: `+${gainPct.toFixed(2)}%`, color: 'text-[#3A86FF]' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-base font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {portfolio.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-14 h-14 bg-[#0A2540]/5 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-[#0A2540]/30" />
          </div>
          <h3 className="text-lg font-black text-[#0A2540] mb-2">Aucun actif pour l&apos;instant</h3>
          <p className="text-gray-500 text-sm mb-6">Ajoutez vos premiers investissements pour les suivre ici.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#3A86FF] transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter un actif
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[
                    { key: 'assetName', label: 'Actif' },
                    { key: 'assetType', label: 'Type' },
                    { key: 'amountInvested', label: 'Investi' },
                    { key: null, label: 'Qté' },
                    { key: null, label: 'Prix achat' },
                    { key: null, label: 'Valeur est.' },
                    { key: null, label: 'Perf.' },
                    { key: 'date', label: 'Date' },
                    { key: null, label: '' },
                  ].map(({ key, label }) => (
                    <th
                      key={label || 'actions'}
                      className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${key ? 'cursor-pointer hover:text-[#0A2540] select-none' : ''}`}
                      onClick={key ? () => handleSort(key as SortField) : undefined}
                    >
                      <div className="flex items-center gap-1.5">
                        {label}
                        {key && <SortIcon field={key} active={sortField} dir={sortDir} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((entry) => {
                  const simValue = entry.amountInvested * 1.087;
                  const simGain = ((simValue - entry.amountInvested) / entry.amountInvested) * 100;
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: ASSET_COLORS[entry.assetType] ?? '#6B7280' }}
                          >
                            {entry.assetName[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0A2540]">{entry.assetName}</p>
                            {entry.ticker && (
                              <p className="text-xs text-gray-400">{entry.ticker}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: (ASSET_COLORS[entry.assetType] ?? '#6B7280') + '18',
                            color: ASSET_COLORS[entry.assetType] ?? '#6B7280',
                          }}
                        >
                          {AssetIcons[entry.assetType]}
                          {ASSET_LABELS[entry.assetType] ?? entry.assetType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#0A2540] whitespace-nowrap">
                        {entry.amountInvested.toLocaleString('fr-MA')} MAD
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {entry.quantity != null ? entry.quantity.toLocaleString('fr-MA') : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {entry.purchasePrice != null ? `${entry.purchasePrice.toLocaleString('fr-MA')} MAD` : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-emerald-600 whitespace-nowrap">
                        {simValue.toLocaleString('fr-MA', { maximumFractionDigits: 0 })} MAD
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          +{simGain.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setDeleteId(entry.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showModal && (
        <AddAssetModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchPortfolio(); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-[#0A2540] text-center mb-2">Supprimer cet actif ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
