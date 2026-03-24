'use client';

/**
 * AddToPortfolioModal — reusable "Ajouter à mon portefeuille" modal.
 * Used by: Marchés page, OPCVM page, Portfolio detail, Dashboard.
 * Never duplicate this component — there is exactly ONE implementation.
 */

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  X, Plus, Loader2, AlertCircle, CheckCircle, ChevronDown,
  RefreshCw, Pencil, Lock,
} from 'lucide-react';
import {
  fetchPrice,
  getMarketStatus,
  formatChange,
  formatPriceTime,
  formatSourceLabel,
  sourceColorClass,
  type BVCPrice,
  type MarketStatus,
} from '@/lib/bvcPriceService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModalAsset {
  ticker: string;       // e.g. "ATW" or opcvm fund id
  name: string;
  type: 'stock' | 'opcvm';
  symbol?: string;      // TradingView symbol (optional)
  nav?: number;         // OPCVM last known NAV
}

export interface ModalHolding {
  id: string;
  portfolioId: string;
  assetType: 'STOCK' | 'OPCVM';
  assetSymbol: string;
  assetName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface AddToPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ModalAsset;
  defaultPortfolioId?: string;
  onSuccess?: (holding: ModalHolding) => void;
}

interface Portfolio {
  id: string;
  name: string;
  strategy: string;
}

type PriceStatus =
  | { status: 'loading' }
  | { status: 'success'; data: BVCPrice; editable: boolean }
  | { status: 'manual' }
  | { status: 'static'; nav: number };

// ── Helpers ───────────────────────────────────────────────────────────────────

const STRATEGY_LABELS: Record<string, string> = {
  COURT_TERME: 'Court terme',
  LONG_TERME: 'Long terme',
  RETRAITE: 'Retraite',
  EPARGNE: 'Épargne',
  AUTRE: 'Autre',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function PriceField({
  asset,
  priceStatus,
  priceInput,
  onPriceChange,
  onRetry,
  marketStatus,
}: {
  asset: ModalAsset;
  priceStatus: PriceStatus;
  priceInput: string;
  onPriceChange: (v: string) => void;
  onRetry: () => void;
  marketStatus: MarketStatus | null;
}) {
  if (asset.type === 'opcvm') {
    return (
      <div>
        <label className="block text-sm font-semibold text-primary mb-1.5">
          Valeur Liquidative (MAD)
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={priceInput}
          onChange={(e) => onPriceChange(e.target.value)}
          aria-label="Valeur Liquidative en MAD"
          className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
        />
        <p className="text-xs text-primary/40 mt-1">
          VL hebdomadaire — consultez la valeur officielle sur{' '}
          <a
            href="https://www.wafabourse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-secondary"
          >
            wafabourse.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-1.5">
        Prix actuel (MAD)
      </label>

      {priceStatus.status === 'loading' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 animate-pulse">
          <Loader2 className="w-4 h-4 text-primary/30 animate-spin flex-shrink-0" />
          <div className="h-4 bg-surface-200 rounded w-24" />
          <span className="text-xs text-primary/30 ml-auto">Chargement du prix…</span>
        </div>
      )}

      {priceStatus.status === 'success' && (
        <div className="space-y-2">
          {/* Main price row */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span
              className="font-bold text-primary text-sm"
              aria-label="Prix actuel en MAD"
            >
              {priceStatus.data.lastPrice.toLocaleString('fr-MA')} MAD
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                priceStatus.data.changePercent >= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {priceStatus.data.changePercent >= 0 ? '▲' : '▼'}{' '}
              {formatChange(priceStatus.data)}
            </span>
            {priceStatus.data.timestamp && (
              <span className="text-xs text-primary/40 ml-auto">
                {formatPriceTime(priceStatus.data.timestamp)}
              </span>
            )}
            <button
              type="button"
              onClick={handleEditPrice}
              title="Modifier le prix"
              className="text-primary/30 hover:text-secondary transition-colors ml-1"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* OHLC + volume row */}
          {(priceStatus.data.open > 0 || priceStatus.data.volume > 0) && (
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { label: 'Ouv.', value: priceStatus.data.open },
                { label: 'Haut', value: priceStatus.data.high },
                { label: 'Bas', value: priceStatus.data.low },
                { label: 'Réf.', value: priceStatus.data.referencePrice },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-50 rounded-lg px-2 py-1.5 border border-surface-100">
                  <p className="text-[10px] text-primary/40 font-medium">{label}</p>
                  <p className="text-xs font-semibold text-primary">
                    {value > 0 ? value.toLocaleString('fr-MA') : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
          {priceStatus.data.volume > 0 && (
            <p className="text-xs text-primary/40 px-1">
              Vol. : {priceStatus.data.volume.toLocaleString('fr-MA')} titres
            </p>
          )}

          {/* Source label */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sourceColorClass(priceStatus.data.source)}`} />
            <p className="text-xs text-primary/40">
              {formatSourceLabel(priceStatus.data.source)}
              {marketStatus?.delayMinutes ? ` · Différé ${marketStatus.delayMinutes} min` : ''}
            </p>
          </div>

          {priceStatus.editable && (
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={priceInput}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="Modifier le prix manuellement"
              aria-label="Prix actuel en MAD"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-primary focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
            />
          )}
        </div>
      )}

      {priceStatus.status === 'manual' && (
        <div className="space-y-2">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">
                Prix indisponible — Bourse de Casablanca ne répond pas.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Entrez le prix manuellement pour continuer.
              </p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="text-amber-600 hover:text-amber-800 transition-colors flex-shrink-0"
              title="Réessayer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={priceInput}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="ex. 412.50"
            required
            aria-label="Prix actuel en MAD"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-amber-300 text-primary focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function MarketBadge({ marketStatus }: { marketStatus: MarketStatus | null }) {
  if (!marketStatus) return null;
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
        marketStatus.open
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-600'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          marketStatus.open ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
        }`}
      />
      {marketStatus.open
        ? `Marché ouvert · Différé ${marketStatus.delayMinutes} min`
        : 'Marché fermé · Dernier cours disponible'}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function AddToPortfolioModal({
  isOpen,
  onClose,
  asset,
  defaultPortfolioId,
  onSuccess,
}: AddToPortfolioModalProps) {
  const { data: session, status: authStatus } = useSession();

  // Form state
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>(
    defaultPortfolioId ?? ''
  );
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  const [quantity, setQuantity] = useState('1');
  const [priceInput, setPriceInput] = useState('');
  const [priceStatus, setPriceStatus] = useState<PriceStatus>({ status: 'loading' });
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const firstInputRef = useRef<HTMLSelectElement>(null);

  // ── Load portfolios & price on open ──────────────────────────────────────

  useEffect(() => {
    if (!isOpen || authStatus !== 'authenticated') return;

    // Reset state
    setQuantity('1');
    setPriceInput('');
    setSubmitError('');
    setSuccessMsg('');
    setCreatingNew(false);
    setNewPortfolioName('');
    setPriceStatus({ status: 'loading' });

    // Fetch portfolios
    setPortfoliosLoading(true);
    fetch('/api/portfolios')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Portfolio[]) => {
        setPortfolios(data);
        if (defaultPortfolioId) {
          setSelectedPortfolioId(defaultPortfolioId);
        } else if (data.length > 0) {
          setSelectedPortfolioId(data[0].id);
        } else {
          setCreatingNew(true);
        }
      })
      .catch(() => setPortfolios([]))
      .finally(() => setPortfoliosLoading(false));

    // Fetch market status
    getMarketStatus().then(setMarketStatus).catch(() => {});

    // Fetch price
    if (asset.type === 'opcvm') {
      const nav = asset.nav ?? 0;
      setPriceInput(nav > 0 ? String(nav) : '');
      setPriceStatus({ status: 'static', nav });
    } else {
      loadPrice();
    }
  }, [isOpen, asset.ticker, asset.type]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPrice() {
    setPriceStatus({ status: 'loading' });
    const data = await fetchPrice(asset.ticker);
    if (data && data.available && data.lastPrice > 0) {
      setPriceInput(String(data.lastPrice));
      setPriceStatus({ status: 'success', data, editable: false });
    } else {
      setPriceStatus({ status: 'manual' });
    }
  }

  function handleEditPrice() {
    if (priceStatus.status === 'success') {
      setPriceStatus({ ...priceStatus, editable: true });
    }
  }

  // ── Trap Escape key ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Derived values ────────────────────────────────────────────────────────

  const resolvedPrice = (() => {
    const n = parseFloat(priceInput);
    return isNaN(n) || n <= 0 ? null : n;
  })();

  const qty = (() => {
    const n = parseFloat(quantity);
    return isNaN(n) || n <= 0 ? null : n;
  })();

  const estimatedTotal =
    resolvedPrice !== null && qty !== null ? resolvedPrice * qty : null;

  const portfolioValid =
    creatingNew ? newPortfolioName.trim().length > 0 : !!selectedPortfolioId;

  const canSubmit =
    portfolioValid &&
    resolvedPrice !== null &&
    qty !== null &&
    !submitting &&
    authStatus === 'authenticated';

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError('');
    setSubmitting(true);

    try {
      let portfolioId = selectedPortfolioId;
      let portfolioName = portfolios.find((p) => p.id === portfolioId)?.name ?? '';

      // Create portfolio if needed
      if (creatingNew) {
        const res = await fetch('/api/portfolios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPortfolioName.trim(), strategy: 'AUTRE' }),
        });
        if (!res.ok) {
          const d = await res.json();
          setSubmitError(d.error || 'Erreur lors de la création du portefeuille.');
          return;
        }
        const created: Portfolio = await res.json();
        portfolioId = created.id;
        portfolioName = created.name;
        setPortfolios((prev) => [created, ...prev]);
        setSelectedPortfolioId(created.id);
        setCreatingNew(false);
      }

      // Add holding — use the price at submit time
      const purchasePrice = resolvedPrice!;
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType: asset.type === 'stock' ? 'STOCK' : 'OPCVM',
          assetSymbol: asset.ticker,
          assetName: asset.name,
          quantity: qty!,
          purchasePrice,
          purchaseDate: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setSubmitError(d.error || "Erreur lors de l'ajout.");
        return;
      }

      const holding: ModalHolding = await res.json();

      // Success state
      setSuccessMsg(`${asset.name} ajouté à ${portfolioName}`);

      // Emit global event for Dashboard / Portfolio pages to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('portfolioUpdated', { detail: { holding, portfolioId } })
        );
      }

      // Call parent callback
      onSuccess?.(holding);

      // Auto-close after 1.5 s
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1_500);
    } catch {
      setSubmitError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  // Unauthenticated view
  if (authStatus === 'unauthenticated') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Connexion requise"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary/40" />
          </div>
          <h2 className="text-lg font-black text-primary mb-2">Connectez-vous pour investir</h2>
          <p className="text-sm text-primary/50 mb-6">
            Créez un compte gratuit pour ajouter des actifs à votre portefeuille.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-primary/70 font-semibold text-sm"
            >
              Fermer
            </button>
            <a
              href="/auth/login"
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-white font-bold text-sm text-center hover:bg-secondary-600 transition-colors"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success view
  if (successMsg) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)' }}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-black text-primary mb-1">Position ajoutée !</h2>
          <p className="text-sm text-primary/60">{successMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,37,64,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Ajouter à mon portefeuille"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-base font-black text-primary">Ajouter à mon portefeuille</h2>
          <button
            onClick={onClose}
            className="text-primary/40 hover:text-primary transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* ── Asset info ── */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              asset.type === 'stock' ? 'bg-secondary/10' : 'bg-accent/10'
            }`}>
              <span className={`text-sm font-black ${
                asset.type === 'stock' ? 'text-secondary' : 'text-accent-700'
              }`}>
                {asset.ticker[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-primary text-sm truncate">{asset.name}</p>
              <p className="text-xs text-primary/40">{asset.ticker}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
              asset.type === 'stock'
                ? 'bg-secondary/10 text-secondary'
                : 'bg-accent/10 text-accent-700'
            }`}>
              {asset.type === 'stock' ? 'Action BVC' : 'OPCVM'}
            </span>
          </div>

          {/* ── Market status ── */}
          {asset.type === 'stock' && <MarketBadge marketStatus={marketStatus} />}

          {/* ── Price field ── */}
          <PriceField
            asset={asset}
            priceStatus={priceStatus}
            priceInput={priceInput}
            onPriceChange={setPriceInput}
            onRetry={loadPrice}
            marketStatus={marketStatus}
          />

          {/* ── Portfolio selection ── */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Sélectionner le portefeuille
            </label>

            {portfoliosLoading ? (
              <div className="h-11 bg-surface-100 rounded-xl animate-pulse" />
            ) : portfolios.length === 0 && !creatingNew ? (
              <div className="space-y-2">
                <p className="text-xs text-primary/50">
                  Vous n&apos;avez pas encore de portefeuille. Nommez votre premier :
                </p>
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  placeholder="ex. Mon Portefeuille BVC"
                  maxLength={100}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {!creatingNew ? (
                  <div className="relative">
                    <select
                      ref={firstInputRef}
                      value={selectedPortfolioId}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setCreatingNew(true);
                          setSelectedPortfolioId('');
                        } else {
                          setSelectedPortfolioId(e.target.value);
                        }
                      }}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-surface-200 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
                    >
                      {portfolios.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{STRATEGY_LABELS[p.strategy] ? ` (${STRATEGY_LABELS[p.strategy]})` : ''}
                        </option>
                      ))}
                      <option value="__new__">+ Créer un nouveau portefeuille...</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 pointer-events-none" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newPortfolioName}
                      onChange={(e) => setNewPortfolioName(e.target.value)}
                      placeholder="Nom du nouveau portefeuille"
                      maxLength={100}
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {portfolios.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setCreatingNew(false); setSelectedPortfolioId(portfolios[0].id); }}
                        className="text-xs text-secondary hover:underline"
                      >
                        ← Choisir un portefeuille existant
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Quantity ── */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Quantité
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.000001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                aria-label="Quantité à acheter"
                className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <span className="text-sm text-primary/40 whitespace-nowrap">
                {asset.type === 'stock' ? 'actions' : 'parts'}
              </span>
            </div>
          </div>

          {/* ── Purchase date (read-only) ── */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Date d&apos;achat
            </label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-sm text-primary/60">
              <span>
                {new Date().toLocaleDateString('fr-MA', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-primary/30">(aujourd&apos;hui)</span>
              <span className="ml-auto text-primary/30 text-xs">🔒</span>
            </div>
          </div>

          {/* ── Estimated total ── */}
          {estimatedTotal !== null && (
            <div className="bg-surface-50 rounded-xl px-4 py-3 border border-surface-200">
              <p className="text-xs text-primary/50 mb-1">Valeur totale estimée</p>
              <p className="font-black text-primary text-base">
                {estimatedTotal.toLocaleString('fr-MA', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                MAD
              </p>
              {resolvedPrice !== null && qty !== null && (
                <p className="text-xs text-primary/40 mt-0.5">
                  {resolvedPrice.toLocaleString('fr-MA')} × {qty}
                </p>
              )}
            </div>
          )}

          {/* ── Submit error ── */}
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-primary/70 font-semibold text-sm hover:bg-surface-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ajout...</>
              ) : (
                <><Plus className="w-4 h-4" /> Ajouter au portefeuille</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
