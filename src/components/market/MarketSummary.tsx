'use client';
import { TrendingUp } from 'lucide-react';
import { Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('./TradingViewChart'), { ssr: false });

const TOP_GAINERS = [
  { symbol: 'ATW', name: 'Attijariwafa', change: '+2.34%', up: true },
  { symbol: 'IAM', name: 'Maroc Telecom', change: '+1.87%', up: true },
  { symbol: 'CSR', name: 'Cosumar', change: '+1.45%', up: true },
];

const TOP_LOSERS = [
  { symbol: 'ADH', name: 'Addoha', change: '-1.23%', up: false },
  { symbol: 'LHM', name: 'LafargeHolcim', change: '-0.89%', up: false },
  { symbol: 'WAA', name: 'Wafa Assurance', change: '-0.67%', up: false },
];

export default function MarketSummary() {
  return (
    <div className="space-y-6">
      {/* MASI Chart */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-sm">MASI — Indice Principal</h3>
            <p className="text-xs text-primary/50">Bourse de Casablanca · Temps réel via TradingView</p>
          </div>
        </div>
        <div className="p-2">
          <TradingViewChart symbol="CASABLANCA:MASI" height={320} theme="light" interval="D" />
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h4 className="font-bold text-sm text-primary">Meilleures hausses</h4>
          </div>
          <div className="space-y-3">
            {TOP_GAINERS.map((s, i) => (
              <div key={s.symbol} className="flex items-center gap-3">
                <span className="text-xs text-primary/30 w-4 font-mono">{i + 1}</span>
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-black text-success">{s.symbol[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{s.symbol}</p>
                  <p className="text-xs text-primary/50">{s.name}</p>
                </div>
                <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg">{s.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-danger rotate-180" />
            <h4 className="font-bold text-sm text-primary">Plus fortes baisses</h4>
          </div>
          <div className="space-y-3">
            {TOP_LOSERS.map((s, i) => (
              <div key={s.symbol} className="flex items-center gap-3">
                <span className="text-xs text-primary/30 w-4 font-mono">{i + 1}</span>
                <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-black text-danger">{s.symbol[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{s.symbol}</p>
                  <p className="text-xs text-primary/50">{s.name}</p>
                </div>
                <span className="text-sm font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-lg">{s.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
