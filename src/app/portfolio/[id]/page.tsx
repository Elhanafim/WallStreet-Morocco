'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, X, Search, TrendingUp, TrendingDown,
  Minus, DollarSign, BarChart2, Briefcase, Loader2, AlertCircle,
  ChevronRight, BadgeInfo, Download, FileText, CheckCircle, Wifi, WifiOff, Pencil,
} from 'lucide-react';
import { STOCK_ASSETS, OPCVM_ASSETS, type CatalogueAsset, type OpcvmAsset } from '@/lib/data/assets';
import { fetchLivePrice, sourceLabel, type PriceResult } from '@/lib/priceService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Holding {
  id: string;
  assetType: 'STOCK' | 'OPCVM';
  assetSymbol: string;
  assetName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string | null;
  createdAt: string;
}

interface NamedPortfolio {
  id: string;
  name: string;
  strategy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMAD(n: number, compact = false) {
  if (compact && Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)} M MAD`;
  }
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency', currency: 'MAD', maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

const STRATEGY_LABELS: Record<string, string> = {
  COURT_TERME: 'Court terme',
  LONG_TERME:  'Long terme',
  RETRAITE:    'Retraite',
  EPARGNE:     'Épargne',
  AUTRE:       'Autre',
};

/** For a holding, we use purchasePrice as both cost and current price (no live feed). */
function calcPerf(h: Holding) {
  const cost         = h.quantity * h.purchasePrice;
  const currentValue = cost;
  const gainLoss     = 0;
  const gainLossPct  = 0;
  return { cost, currentValue, gainLoss, gainLossPct };
}

function totalStats(holdings: Holding[]) {
  const totalCost  = holdings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);
  return { totalCost, totalValue: totalCost, totalGain: 0, totalGainPct: 0 };
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(holdings: Holding[], portfolioName: string) {
  const header = ['Actif', 'Type', 'Symbole', 'Quantité', "Prix d'achat (MAD)", "Date d'achat", 'Valeur investie (MAD)', 'Notes'];
  const rows = holdings.map((h) => [
    h.assetName,
    h.assetType === 'STOCK' ? 'Action BVC' : 'OPCVM',
    h.assetSymbol,
    String(h.quantity),
    String(h.purchasePrice),
    new Date(h.purchaseDate).toLocaleDateString('fr-MA'),
    String(h.quantity * h.purchasePrice),
    h.notes ?? '',
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${portfolioName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── G/P display cell ─────────────────────────────────────────────────────────

function GpCell({ value, pct }: { value: number; pct: number }) {
  if (value === 0) return <span className="text-primary/30 text-sm">—</span>;
  const pos = value > 0;
  const Icon = pos ? TrendingUp : TrendingDown;
  return (
    <div className={`flex flex-col items-end ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
      <span className="text-sm font-bold flex items-center gap-0.5">
        <Icon className="w-3.5 h-3.5" />
        {pos ? '+' : ''}{fmtMAD(value)}
      </span>
      <span className="text-xs">
        {pos ? '+' : ''}{pct.toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Notes popover ────────────────────────────────────────────────────────────

function NotesCell({ notes }: { notes?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!notes) return <span className="text-primary/20 text-xs">—</span>;
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-secondary hover:text-secondary-600 transition-colors"
        title="Voir la note"
      >
        <FileText className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-surface-200 rounded-xl shadow-lg p-3 z-10 text-left">
          <p className="text-xs text-primary leading-relaxed">{notes}</p>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-primary/30 hover:text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteHoldingModal({
  holding,
  portfolioId,
  onClose,
  onDeleted,
}: {
  holding: Holding;
  portfolioId: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/portfolios/${portfolioId}/holdings/${holding.id}`, {
        method: 'DELETE',
      });
      onDeleted(holding.id);
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
        <h2 className="text-lg font-black text-primary mb-2">Supprimer cette position ?</h2>
        <p className="text-sm text-primary/60 mb-6">
          <strong>{holding.assetName}</strong> ({holding.quantity} × {fmtMAD(holding.purchasePrice)})
          sera supprimé définitivement.
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

// ─── Price field state machine ────────────────────────────────────────────────

type PriceState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'trying_next'; attempt: number }
  | { status: 'success'; result: PriceResult }
  | { status: 'manual' };

// ─── Add Holding Panel ────────────────────────────────────────────────────────

function AddHoldingPanel({
  portfolioId,
  onClose,
  onAdded,
}: {
  portfolioId: string;
  onClose: () => void;
  onAdded: (h: Holding) => void;
}) {
  const [step, setStep]               = useState<1 | 2>(1);
  const [tab, setTab]                 = useState<'stock' | 'opcvm'>('stock');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<CatalogueAsset | null>(null);
  const [quantity, setQuantity]       = useState('');
  const [price, setPrice]             = useState('');
  const [priceState, setPriceState]   = useState<PriceState>({ status: 'idle' });
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // ── Filtered asset list ──
  const assets = useMemo(() => {
    const pool = tab === 'stock' ? STOCK_ASSETS : OPCVM_ASSETS;
    const q = search.toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.symbol.toLowerCase().includes(q) ||
        ('sector' in a && a.sector.toLowerCase().includes(q)) ||
        ('manager' in a && a.manager.toLowerCase().includes(q)) ||
        ('category' in a && a.category.toLowerCase().includes(q))
    );
  }, [tab, search]);

  // ── Select asset ──
  const handleSelect = (asset: CatalogueAsset) => {
    setSelected(asset);
    setQuantity('');
    setNotes('');
    setError('');

    if (asset.type === 'opcvm') {
      // OPCVM: use static NAV as editable reference
      setPrice(String((asset as OpcvmAsset).nav));
      setPriceState({ status: 'idle' });
    } else {
      // Stock: kick off the live price fallback chain
      setPrice('');
      setPriceState({ status: 'loading' });
      fetchLivePrice(asset.symbol).then((result) => {
        if (result.success) {
          setPrice(String(result.price));
          setPriceState({ status: 'success', result });
        } else {
          setPriceState({ status: 'manual' });
        }
      });
    }

    setStep(2);
  };

  const estimatedTotal = useMemo(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) return q * p;
    return null;
  }, [quantity, price]);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const q = parseFloat(quantity);
    // Use the fetched price if available, else what user typed
    const resolvedPrice = priceState.status === 'success' && !price
      ? priceState.result.price
      : parseFloat(price);
    const p = resolvedPrice;
    if (!q || q <= 0 || !p || p <= 0) {
      setError('Quantité et prix doivent être supérieurs à 0.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetType:     selected.type === 'stock' ? 'STOCK' : 'OPCVM',
          assetSymbol:   selected.symbol,
          assetName:     selected.name,
          quantity:      q,
          purchasePrice: p,
          purchaseDate:  purchaseDate,
          notes:         notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'ajout.");
        return;
      }
      const holding = await res.json();
      onAdded(holding);
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(10,37,64,0.4)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setSelected(null); }}
                className="text-primary/40 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-black text-primary text-lg">
              {step === 1 ? 'Choisir un actif' : 'Détails de la position'}
            </h2>
          </div>
          <button onClick={onClose} className="text-primary/40 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 py-3 gap-2 border-b border-surface-50">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-secondary' : 'bg-surface-200'
              }`}
            />
          ))}
        </div>

        {/* ── STEP 1: Asset selection ── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Tabs */}
            <div className="px-6 pt-4 pb-3">
              <div className="flex bg-surface-100 rounded-xl p-1">
                {(['stock', 'opcvm'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setSearch(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t ? 'bg-white shadow-sm text-primary' : 'text-primary/50 hover:text-primary'
                    }`}
                  >
                    {t === 'stock' ? '📈 Actions BVC' : '🏦 OPCVM'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tab === 'stock' ? 'Rechercher par nom, symbole, secteur...' : 'Rechercher par nom, gestionnaire...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>
              <p className="text-xs text-primary/30 mt-1.5 pl-1">
                {assets.length} résultat{assets.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Asset list */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-1">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelect(asset)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-surface-50 border border-transparent hover:border-surface-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      asset.type === 'stock' ? 'bg-secondary/10' : 'bg-accent/10'
                    }`}>
                      <span className={`text-xs font-black ${
                        asset.type === 'stock' ? 'text-secondary' : 'text-accent-700'
                      }`}>
                        {asset.symbol.split(':').pop()?.[0] ?? asset.symbol[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-primary text-sm leading-tight truncate">{asset.name}</p>
                      <p className="text-xs text-primary/40 mt-0.5">
                        {asset.type === 'stock'
                          ? `${asset.symbol} · ${'sector' in asset ? asset.sector : ''}`
                          : `${'managerCode' in asset ? asset.managerCode : ''} · ${'category' in asset ? asset.category : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {asset.type === 'opcvm' && (
                      <span className="text-xs font-bold text-primary/50 bg-surface-100 px-2 py-0.5 rounded-full">
                        {(asset as OpcvmAsset).nav.toLocaleString('fr-MA')} MAD
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-primary/20 group-hover:text-primary/50 transition-colors" />
                  </div>
                </button>
              ))}

              {assets.length === 0 && (
                <div className="text-center py-10 text-primary/40">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun actif trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Quantity + price + date + notes ── */}
        {step === 2 && selected && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-4 flex-1 space-y-4">

              {/* Selected asset recap */}
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                selected.type === 'stock'
                  ? 'bg-secondary/5 border-secondary/20'
                  : 'bg-accent/5 border-accent/20'
              }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selected.type === 'stock' ? 'bg-secondary/15' : 'bg-accent/15'
                }`}>
                  <span className={`text-sm font-black ${
                    selected.type === 'stock' ? 'text-secondary' : 'text-accent-700'
                  }`}>
                    {selected.symbol.split(':').pop()?.[0] ?? selected.symbol[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-primary text-sm leading-tight">{selected.name}</p>
                  <p className="text-xs text-primary/40 mt-0.5">
                    {selected.type === 'stock'
                      ? `${selected.symbol} · ${'sector' in selected ? selected.sector : ''}`
                      : `${'manager' in selected ? selected.manager : ''} · ${'category' in selected ? selected.category : ''}`}
                  </p>
                </div>
                <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  selected.type === 'stock'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-accent/10 text-accent-700'
                }`}>
                  {selected.type === 'stock' ? 'BVC' : 'OPCVM'}
                </span>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  Prix d&apos;achat (MAD)
                  {selected.type === 'opcvm' && (
                    <span className="ml-2 text-xs font-normal text-primary/40">
                      · VL de référence pré-remplie
                    </span>
                  )}
                </label>

                {/* ── Price states (stocks only) ── */}
                {selected.type === 'stock' && priceState.status === 'loading' && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-sm text-primary/50 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                    Récupération du prix en cours…
                  </div>
                )}

                {selected.type === 'stock' && priceState.status === 'success' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-emerald-700">{fmtMAD(priceState.result.price)}</span>
                      <span className="text-emerald-600/70 text-xs">
                        · {sourceLabel(priceState.result.source)}
                        · {new Date(priceState.result.timestamp).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPriceState({ status: 'manual' })}
                        className="ml-auto text-emerald-600/60 hover:text-emerald-700"
                        title="Modifier le prix"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input type="hidden" value={price} />
                  </div>
                )}

                {selected.type === 'stock' && priceState.status === 'manual' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
                      Prix en temps réel indisponible — saisissez votre prix d&apos;achat manuellement.
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0.001"
                      step="0.01"
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border border-amber-300 text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                    />
                  </div>
                )}

                {/* OPCVM always editable */}
                {selected.type === 'opcvm' && (
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0.001"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                  />
                )}

                {/* OPCVM info note */}
                {selected.type === 'opcvm' && (
                  <p className="text-xs text-primary/40 mt-1.5 flex items-center gap-1">
                    <BadgeInfo className="w-3 h-3" />
                    VL hebdomadaire — non disponible en temps réel.{' '}
                    <a
                      href="https://www.wafabourse.com/fr/opc-maroc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-secondary"
                    >
                      Consulter la VL sur Wafa Bourse →
                    </a>
                  </p>
                )}
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  Quantité {selected.type === 'opcvm' ? '(parts)' : '(actions)'}
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={selected.type === 'opcvm' ? '0.001' : '1'}
                  min="0.001"
                  step={selected.type === 'opcvm' ? '0.001' : '1'}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                />
              </div>

              {/* Date d'achat */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  Date d&apos;achat
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                />
              </div>

              {/* Notes (optional) */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-1.5">
                  Note <span className="text-primary/40 font-normal">(optionnel, 200 car. max)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ex. Achat sur renforcement, cible long terme..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-primary placeholder-primary/30 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm resize-none"
                />
                <p className="text-xs text-primary/30 text-right mt-0.5">{notes.length}/200</p>
              </div>

              {/* Estimated total */}
              {estimatedTotal !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs text-primary/50 mb-0.5">Valeur totale estimée</p>
                  <p className="text-xl font-black text-emerald-600">{fmtMAD(estimatedTotal)}</p>
                  <p className="text-xs text-primary/30 mt-0.5">
                    {parseFloat(quantity)} × {fmtMAD(parseFloat(price))}
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="px-6 py-4 border-t border-surface-100">
              <button
                type="submit"
                disabled={
                loading ||
                !quantity ||
                parseFloat(quantity) <= 0 ||
                (priceState.status === 'loading') ||
                (!price && priceState.status !== 'success') ||
                (!!price && parseFloat(price) <= 0)
              }
                className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-secondary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Ajouter la position</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Holdings Table ────────────────────────────────────────────────────────────

function HoldingsTable({
  holdings,
  portfolioId,
  onDeleted,
}: {
  holdings: Holding[];
  portfolioId: string;
  onDeleted: (id: string) => void;
}) {
  const [toDelete, setToDelete] = useState<Holding | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead className="bg-surface-50 border-b border-surface-100">
              <tr>
                {['Actif', 'Type', 'Symbole', 'Qté', "Prix d'achat", "Date d'achat", 'Valeur investie', 'G/P', 'Note', ''].map((h, i) => (
                  <th
                    key={h + i}
                    className={`px-4 py-3.5 text-xs font-semibold text-primary/50 uppercase tracking-wider ${
                      i === 0 ? 'text-left' : i >= 8 ? 'text-center' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {holdings.map((h) => {
                const { cost, gainLoss, gainLossPct } = calcPerf(h);
                return (
                  <tr key={h.id} className="hover:bg-surface-50 transition-colors">
                    {/* Actif */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          h.assetType === 'STOCK' ? 'bg-secondary/10' : 'bg-accent/10'
                        }`}>
                          <span className={`text-xs font-black ${
                            h.assetType === 'STOCK' ? 'text-secondary' : 'text-accent-700'
                          }`}>
                            {h.assetSymbol.split(':').pop()?.[0] ?? h.assetSymbol[0]}
                          </span>
                        </div>
                        <span className="font-semibold text-primary text-sm leading-tight max-w-[140px] truncate">
                          {h.assetName}
                        </span>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        h.assetType === 'STOCK'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-accent/10 text-accent-700'
                      }`}>
                        {h.assetType === 'STOCK' ? 'Action' : 'OPCVM'}
                      </span>
                    </td>
                    {/* Symbole */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-mono text-primary/50 bg-surface-100 px-2 py-0.5 rounded-md">
                        {h.assetType === 'STOCK'
                          ? h.assetSymbol.split(':')[1] ?? h.assetSymbol
                          : h.assetSymbol}
                      </span>
                    </td>
                    {/* Qté */}
                    <td className="px-4 py-3.5 text-right text-sm font-semibold text-primary">
                      {h.quantity.toLocaleString('fr-MA')}
                    </td>
                    {/* Prix d'achat */}
                    <td className="px-4 py-3.5 text-right text-sm text-primary/70">
                      {fmtMAD(h.purchasePrice)}
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5 text-right text-sm text-primary/50">
                      {fmtDate(h.purchaseDate)}
                    </td>
                    {/* Valeur investie */}
                    <td className="px-4 py-3.5 text-right text-sm font-bold text-primary">
                      {fmtMAD(cost)}
                    </td>
                    {/* G/P */}
                    <td className="px-4 py-3.5 text-right">
                      <GpCell value={gainLoss} pct={gainLossPct} />
                    </td>
                    {/* Notes */}
                    <td className="px-4 py-3.5 text-center">
                      <NotesCell notes={h.notes} />
                    </td>
                    {/* Delete */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setToDelete(h)}
                        className="text-primary/20 hover:text-red-500 transition-colors p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* No live data notice */}
        <div className="px-5 py-3 border-t border-surface-50 flex items-center gap-2 bg-surface-50/50">
          <BadgeInfo className="w-3.5 h-3.5 text-primary/30 flex-shrink-0" />
          <p className="text-xs text-primary/40">
            Prix en temps réel non disponibles — G/P calculé dès qu&apos;un prix mis à jour est disponible.
            La colonne &ldquo;Valeur investie&rdquo; reflète votre prix d&apos;achat × quantité.
          </p>
        </div>
      </div>

      {toDelete && (
        <DeleteHoldingModal
          holding={toDelete}
          portfolioId={portfolioId}
          onClose={() => setToDelete(null)}
          onDeleted={(id) => { onDeleted(id); setToDelete(null); }}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [portfolio, setPortfolio]   = useState<NamedPortfolio | null>(null);
  const [holdings, setHoldings]     = useState<Holding[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [showPanel, setShowPanel]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pfRes, holdRes] = await Promise.all([
        fetch(`/api/portfolios`),
        fetch(`/api/portfolios/${params.id}/holdings`),
      ]);

      if (holdRes.status === 404 || holdRes.status === 403) {
        setNotFound(true);
        return;
      }

      if (pfRes.ok) {
        const all: NamedPortfolio[] = await pfRes.json();
        const found = all.find((p) => p.id === params.id);
        if (found) setPortfolio(found);
        else setNotFound(true);
      }

      if (holdRes.ok) {
        setHoldings(await holdRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Refresh when another page adds a holding to this portfolio ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.portfolioId === params.id) {
        fetchData();
      }
    };
    window.addEventListener('portfolioUpdated', handler);
    return () => window.removeEventListener('portfolioUpdated', handler);
  }, [params.id, fetchData]);

  const handleHoldingAdded = (h: Holding) => {
    setHoldings((prev) => [h, ...prev]);
    setShowPanel(false);
    // Notify Dashboard and other pages
    window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: { portfolioId: params.id } }));
  };

  const handleHoldingDeleted = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  const { totalCost } = useMemo(() => totalStats(holdings), [holdings]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-secondary animate-spin" />
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div className="pt-16 min-h-screen bg-surface-50 flex items-center justify-center text-center px-4">
        <div>
          <div className="w-16 h-16 bg-surface-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-primary/30" />
          </div>
          <h2 className="text-xl font-black text-primary mb-2">Portefeuille introuvable</h2>
          <p className="text-primary/50 text-sm mb-6">Ce portefeuille n&apos;existe pas ou ne vous appartient pas.</p>
          <Link href="/portfolio" className="inline-flex items-center gap-2 bg-secondary text-white font-bold px-5 py-3 rounded-xl text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-surface-50">

      {/* ── Header ── */}
      <div className="bg-gradient-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back */}
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Mes portefeuilles
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{portfolio.name}</h1>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-semibold text-accent bg-accent/20 px-3 py-1 rounded-full">
                  {STRATEGY_LABELS[portfolio.strategy] ?? portfolio.strategy}
                </span>
                <span className="text-white/50 text-sm">
                  {holdings.length} position{holdings.length !== 1 ? 's' : ''} · Créé le {fmtDate(portfolio.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {holdings.length > 0 && (
                <button
                  onClick={() => exportCSV(holdings, portfolio.name)}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20 transition-colors text-sm"
                  title="Exporter CSV"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              )}
              <button
                onClick={() => setShowPanel(true)}
                className="flex items-center gap-2 bg-accent text-primary font-bold px-5 py-3 rounded-xl hover:bg-accent-600 transition-colors shadow-md text-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter un actif
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: DollarSign, label: 'Capital investi', value: fmtMAD(totalCost, true) },
              { icon: BarChart2,  label: 'Positions',        value: String(holdings.length) },
              { icon: TrendingUp, label: 'Actions BVC',      value: String(holdings.filter((h) => h.assetType === 'STOCK').length) },
              { icon: Minus,      label: 'OPCVM',            value: String(holdings.filter((h) => h.assetType === 'OPCVM').length) },
            ].map((k) => (
              <div key={k.label} className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                <k.icon className="w-4 h-4 text-white/40 mx-auto mb-2" />
                <p className="text-white font-black text-xl leading-none">{k.value}</p>
                <p className="text-white/50 text-xs mt-1">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Holdings ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {holdings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-200 shadow-card">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-lg font-black text-primary mb-2">Aucune position</h3>
            <p className="text-primary/50 text-sm max-w-xs mx-auto mb-6">
              Ajoutez vos premières actions BVC ou parts OPCVM pour commencer à suivre votre portefeuille.
            </p>
            <button
              onClick={() => setShowPanel(true)}
              className="inline-flex items-center gap-2 bg-secondary text-white font-bold px-5 py-3 rounded-xl hover:bg-secondary-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Ajouter un actif
            </button>
          </div>
        ) : (
          <HoldingsTable
            holdings={holdings}
            portfolioId={params.id}
            onDeleted={handleHoldingDeleted}
          />
        )}
      </div>

      {/* ── Add Holding Panel ── */}
      {showPanel && (
        <AddHoldingPanel
          portfolioId={params.id}
          onClose={() => setShowPanel(false)}
          onAdded={handleHoldingAdded}
        />
      )}
    </div>
  );
}
