'use client';

import { useState } from 'react';
import { X, TrendingUp, Building2, BarChart3, Landmark, Package } from 'lucide-react';

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const assetTypes = [
  { value: 'STOCK', label: 'Action', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'OPCVM', label: 'OPCVM', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'ETF', label: 'ETF', icon: BarChart3, color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'BOND', label: 'Obligation', icon: Landmark, color: 'text-amber-500', bg: 'bg-amber-50' },
  { value: 'OTHER', label: 'Autre', icon: Package, color: 'text-gray-500', bg: 'bg-gray-50' },
];

export default function AddAssetModal({ onClose, onSuccess }: AddAssetModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    assetName: '',
    assetType: 'STOCK',
    ticker: '',
    amountInvested: '',
    quantity: '',
    purchasePrice: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName.trim()) { setError('Le nom de l\'actif est requis'); return; }
    if (!form.amountInvested || parseFloat(form.amountInvested) <= 0) { setError('Le montant investi doit être positif'); return; }

    setIsLoading(true);
    try {
      const payload: any = {
        assetName: form.assetName.trim(),
        assetType: form.assetType,
        amountInvested: parseFloat(form.amountInvested),
        date: form.date,
      };
      if (form.ticker.trim()) payload.ticker = form.ticker.trim().toUpperCase();
      if (form.quantity) payload.quantity = parseFloat(form.quantity);
      if (form.purchasePrice) payload.purchasePrice = parseFloat(form.purchasePrice);
      if (form.notes.trim()) payload.notes = form.notes.trim();

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'ajout');
        return;
      }

      onSuccess();
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-medium text-[#0A2540]">Ajouter un actif</h2>
            <p className="text-sm text-gray-500 mt-0.5">Enregistrez un nouvel investissement</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium text-[#0A2540] mb-2">Type d&apos;actif</label>
            <div className="grid grid-cols-5 gap-2">
              {assetTypes.map(({ value, label, icon: Icon, color, bg }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('assetType', value)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                    form.assetType === value
                      ? 'border-[#3A86FF] bg-blue-50 text-[#3A86FF]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${form.assetType === value ? 'bg-blue-100' : bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${form.assetType === value ? 'text-[#3A86FF]' : color}`} />
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium text-[#0A2540] mb-1.5">
              Nom de l&apos;actif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.assetName}
              onChange={(e) => update('assetName', e.target.value)}
              placeholder="ex: Attijariwafa Bank, CDG Trésor..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
            />
          </div>

          {/* Ticker */}
          <div>
            <label className="block text-sm font-medium text-[#0A2540] mb-1.5">Ticker / Code (optionnel)</label>
            <input
              type="text"
              value={form.ticker}
              onChange={(e) => update('ticker', e.target.value)}
              placeholder="ex: ATW, IAM..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all uppercase"
            />
          </div>

          {/* Amount + Quantity row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1.5">
                Montant investi (MAD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amountInvested}
                onChange={(e) => update('amountInvested', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1.5">Quantité (optionnel)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
              />
            </div>
          </div>

          {/* Purchase Price + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1.5">Prix d&apos;achat (optionnel)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => update('purchasePrice', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#0A2540] mb-1.5">Notes (optionnel)</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Raison de l'investissement, stratégie..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0A2540] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-[#0A2540] text-white text-sm font-medium hover:bg-[#3A86FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ajout...
                </>
              ) : (
                'Ajouter l\'actif'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
