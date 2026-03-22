import dynamic from 'next/dynamic';
import { BarChart2, Globe2, Eye } from 'lucide-react';

const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), { ssr: false });
const WatchlistPanel = dynamic(() => import('@/components/market/WatchlistPanel'), { ssr: false });
const MarketSummary = dynamic(() => import('@/components/market/MarketSummary'), { ssr: false });
const AssetWidget = dynamic(() => import('@/components/market/AssetWidget'), { ssr: false });

const ASSETS = [
  { symbol: 'BCAS:ATW', name: 'Attijariwafa Bank', sector: 'Banque' },
  { symbol: 'BCAS:IAM', name: 'Maroc Telecom', sector: 'Télécoms' },
  { symbol: 'BCAS:BCP', name: 'Banque Pop.', sector: 'Banque' },
  { symbol: 'BCAS:LHM', name: 'LafargeHolcim Maroc', sector: 'Matériaux' },
  { symbol: 'BCAS:CIH', name: 'CIH Bank', sector: 'Banque' },
  { symbol: 'BCAS:CSR', name: 'Cosumar', sector: 'Agroalimentaire' },
];

export const metadata = {
  title: 'Marchés | WallStreet Morocco',
  description: 'Suivez le MASI et les actions marocaines en temps réel',
};

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Ticker tape at top */}
      <div className="bg-primary">
        <TradingViewTicker />
      </div>

      {/* Page header */}
      <div className="bg-primary text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Marchés Marocains</h1>
              <p className="text-white/60 text-sm">Données en temps réel · Bourse de Casablanca</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-success text-sm font-medium">Marché ouvert · MASI en direct</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left: Main content (3 cols) */}
          <div className="xl:col-span-3 space-y-6">
            {/* MASI Advanced Chart */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe2 className="w-5 h-5 text-secondary" />
                  <div>
                    <h2 className="font-bold text-primary">MASI — Graphique Avancé</h2>
                    <p className="text-xs text-primary/50">Indice Marocain de toutes les valeurs</p>
                  </div>
                </div>
                <span className="text-xs bg-success/10 text-success font-semibold px-2 py-1 rounded-full">Live</span>
              </div>
              <TradingViewChart symbol="BCAS:MASI" height={450} theme="light" interval="D" showToolbar={true} />
            </div>

            {/* Market Summary */}
            <MarketSummary />

            {/* Asset grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary/60" />
                <h2 className="font-bold text-primary">Actions Marocaines</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ASSETS.map((asset) => (
                  <AssetWidget key={asset.symbol} {...asset} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Watchlist sidebar (1 col) */}
          <div className="xl:col-span-1">
            <div className="sticky top-4 space-y-4">
              <WatchlistPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
