'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase, Plus, Trash2, ArrowRight, TrendingUp,
  DollarSign, BarChart2, X, AlertCircle, Loader2,
} from 'lucide-react';
import ChatHint from '@/components/chat/ChatHint';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import EduBannerInline from '@/components/legal/EduBannerInline';

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

function calcInvested(holdings: Holding[]) {
  return holdings.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);
}

function fmtMAD(n: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency', currency: 'MAD', maximumFractionDigits: 0,
  }).format(n);
}

const STRATEGY_LABELS: Record<string, string> = {
  COURT_TERME: 'Court terme',
  LONG_TERME:  'Long terme',
  RETRAITE:    'Retraite',
  EPARGNE:     'Épargne',
  AUTRE:       'Autre',
};

const STRATEGY_OPTIONS = [
  { value: 'LONG_TERME',  label: 'Long terme' },
  { value: 'COURT_TERME', label: 'Court terme' },
  { value: 'RETRAITE',    label: 'Retraite' },
  { value: 'EPARGNE',     label: 'Épargne' },
  { value: 'AUTRE',       label: 'Autre' },
];

// ─── Create Portfolio Modal ────────────────────────────────────────────────────

function CreatePortfolioModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: NamedPortfolio) => void;
}) {
  const [name, setName] = useState('');
  const [strategy, setStrategy] = useState('LONG_TERME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), strategy }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création.');
        return;
      }
      const portfolio = await res.json();
      onCreated(portfolio);
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-primary">Nouveau portefeuille</h2>
          <button onClick={onClose} className="text-primary/40 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Nom du portefeuille
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Portefeuille Long Terme"
              required
              maxLength={100}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Stratégie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STRATEGY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStrategy(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    strategy === opt.value
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface-50 text-primary/60 border-surface-200 hover:border-secondary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-primary/70 font-semibold text-sm hover:bg-surface-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Création...</>
              ) : (
                <><Plus className="w-4 h-4" /> Créer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({
  portfolio,
  onClose,
  onDeleted,
}: {
  portfolio: NamedPortfolio;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/portfolios/${portfolio.id}`, { method: 'DELETE' });
      onDeleted(portfolio.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-primary mb-2">Supprimer ce portefeuille ?</h2>
        <p className="text-sm text-primary/60 mb-6">
          <strong>&ldquo;{portfolio.name}&rdquo;</strong> et ses{' '}
          {portfolio.holdings.length} position(s) seront définitivement supprimés.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-primary/70 font-semibold text-sm hover:bg-surface-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio Card ────────────────────────────────────────────────────────────

function PortfolioCard({
  portfolio,
  onDelete,
}: {
  portfolio: NamedPortfolio;
  onDelete: (p: NamedPortfolio) => void;
}) {
  const invested = calcInvested(portfolio.holdings);

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-md hover:scale-[1.01] hover:shadow-lg transition-all duration-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-black text-primary text-base leading-tight">{portfolio.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-secondary/70 bg-secondary/10 px-2 py-0.5 rounded-full">
                {STRATEGY_LABELS[portfolio.strategy] ?? portfolio.strategy}
              </span>
              <span className="text-xs text-primary/40">
                {portfolio.holdings.length} position{portfolio.holdings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(portfolio)}
          className="text-primary/20 hover:text-red-500 transition-colors p-1"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-50 rounded-xl p-3">
          <p className="text-xs text-primary/40 mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Total investi
          </p>
          <p className="font-black text-primary text-base">{fmtMAD(invested)}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-3">
          <p className="text-xs text-primary/40 mb-1 flex items-center gap-1">
            <BarChart2 className="w-3 h-3" /> Positions
          </p>
          <p className="font-black text-primary text-base">{portfolio.holdings.length}</p>
        </div>
      </div>

      {/* Asset type breakdown */}
      {portfolio.holdings.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['STOCK', 'OPCVM'] as const).map((type) => {
            const count = portfolio.holdings.filter((h) => h.assetType === type).length;
            if (!count) return null;
            return (
              <span
                key={type}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  type === 'STOCK'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-accent/10 text-accent-700'
                }`}
              >
                {count} {type === 'STOCK' ? 'Action' : 'OPCVM'}{count > 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <Link
        href={`/portfolio/${portfolio.id}`}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-secondary transition-colors text-sm"
      >
        Voir le portefeuille <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
        <TrendingUp className="w-9 h-9 text-secondary" />
      </div>
      <h3 className="text-xl font-black text-primary mb-2">Aucun portefeuille</h3>
      <p className="text-primary/50 text-sm max-w-xs mx-auto mb-8">
        Créez votre premier portefeuille pour commencer à suivre vos investissements BVC et OPCVM.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 bg-secondary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-secondary-600 transition-colors shadow-md"
      >
        <Plus className="w-4 h-4" /> Créer mon premier portefeuille
      </button>
      <ChatHint
        storageKey="wsma_hint_portfolio"
        icon="🤖"
        message="Nouveau ici ? Notre assistant peut vous guider pour construire votre premier portefeuille."
        ctaLabel="Démarrer"
        prefillMessage="Comment ajouter ma première action à mon portefeuille ?"
        variant="card"
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-surface-100 rounded-xl animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-100 rounded-lg animate-pulse w-3/4" />
          <div className="h-3 bg-surface-100 rounded-lg animate-pulse w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-surface-100 rounded-xl animate-pulse" />
        <div className="h-16 bg-surface-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-11 bg-surface-100 rounded-xl animate-pulse" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<NamedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState<NamedPortfolio | null>(null);

  const fetchPortfolios = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolios');
      if (res.ok) setPortfolios(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPortfolios(); }, [fetchPortfolios]);

  const handleCreated = (p: NamedPortfolio) => {
    setPortfolios((prev) => [p, ...prev]);
    setShowCreate(false);
  };

  const handleDeleted = (id: string) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    setToDelete(null);
  };

  return (
    <div className="pt-16 min-h-screen bg-surface-50">

      {/* ── Header ── */}
      <div className="bg-gradient-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 mb-4">
                <Briefcase className="w-3.5 h-3.5 text-accent" />
                <span className="text-white text-xs font-semibold">Portfolio Builder</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                Mes Portefeuilles
              </h1>
              <p className="text-white/60 text-sm">
                Suivez vos positions en actions BVC et fonds OPCVM
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-md text-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Créer un portefeuille
            </button>
          </div>
        </div>
      </div>

      {/* ── Legal disclaimer — required on all financial data pages */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <FinancialDisclaimer variant="full" />
      </div>

      <EduBannerInline />

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : portfolios.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolios.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} onDelete={setToDelete} />
            ))}
            {/* Add more card */}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-white rounded-2xl border-2 border-dashed border-surface-300 hover:border-secondary hover:bg-secondary/5 transition-all duration-200 p-6 flex flex-col items-center justify-center gap-3 text-primary/40 hover:text-secondary min-h-[200px]"
            >
              <Plus className="w-8 h-8" />
              <span className="font-semibold text-sm">Nouveau portefeuille</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreatePortfolioModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {toDelete && (
        <DeleteModal
          portfolio={toDelete}
          onClose={() => setToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
