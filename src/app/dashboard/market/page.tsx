'use client';
import dynamic from 'next/dynamic';
import { TrendingUp, Activity } from 'lucide-react';

const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), { ssr: false });
const WatchlistPanel = dynamic(() => import('@/components/market/WatchlistPanel'), { ssr: false });
const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });

export default function DashboardMarketPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-primary">Marchés</h1>
        <p className="text-primary/50 text-sm mt-1">Suivi en temps réel via TradingView</p>
      </div>

      {/* Ticker */}
      <div className="rounded-xl overflow-hidden border border-surface-200">
        <TradingViewTicker />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* MASI chart — 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-3">
            <Activity className="w-4 h-4 text-secondary" />
            <div>
              <h3 className="font-bold text-primary text-sm">MASI Index</h3>
              <p className="text-xs text-primary/50">Bourse de Casablanca</p>
            </div>
            <span className="ml-auto text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">Live</span>
          </div>
          <TradingViewChart symbol="CASABLANCA:MASI" height={380} theme="light" interval="D" />
        </div>

        {/* Watchlist — 1 col */}
        <div className="xl:col-span-1">
          <WatchlistPanel />
        </div>
      </div>

      {/* ATW and IAM charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { symbol: 'CASABLANCA:ATW', name: 'Attijariwafa Bank' },
          { symbol: 'CASABLANCA:IAM', name: 'Maroc Telecom' },
        ].map(({ symbol, name }) => (
          <div key={symbol} className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="font-bold text-sm text-primary">{name}</span>
              <span className="ml-auto text-xs text-primary/40">{symbol.split(':')[1]}</span>
            </div>
            <TradingViewChart symbol={symbol} height={280} theme="light" interval="D" showToolbar={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
