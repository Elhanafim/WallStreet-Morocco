'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { fetchMovers, BVCMovers, getMarketStatus } from '@/lib/bvcPriceService';

const TradingViewChart = dynamic(() => import('./TradingViewChart'), { ssr: false });

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function MoverRow({ rank, symbol, name, changePercent, up }: {
  rank: number;
  symbol: string;
  name: string;
  changePercent: number;
  up: boolean;
}) {
  const sign = changePercent >= 0 ? '+' : '';
  const label = `${sign}${changePercent.toFixed(2)}%`;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-primary/30 w-4 font-mono">{rank}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${up ? 'bg-success/10' : 'bg-danger/10'}`}>
        <span className={`text-xs font-black ${up ? 'text-success' : 'text-danger'}`}>{symbol[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary">{symbol}</p>
        <p className="text-xs text-primary/50 truncate">{name}</p>
      </div>
      <span className={`text-sm font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${up ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
        {label}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-4 h-3 bg-surface-200 rounded" />
      <div className="w-8 h-8 bg-surface-200 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-surface-200 rounded w-16" />
        <div className="h-2.5 bg-surface-200 rounded w-24" />
      </div>
      <div className="h-5 w-14 bg-surface-200 rounded-lg" />
    </div>
  );
}

export default function MarketSummary() {
  const [movers, setMovers] = useState<BVCMovers | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMovers();
    if (data) {
      setMovers(data);
      setLastUpdate(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        load();
        timerRef.current = setInterval(load, REFRESH_INTERVAL);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    timerRef.current = setInterval(load, REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [load]);

  const marketStatus = getMarketStatus();
  const gainers = movers?.gainers.slice(0, 5) ?? [];
  const losers = movers?.losers.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {/* MASI Chart */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-sm">MSI20 — Indice Blue Chips</h3>
            <p className="text-xs text-primary/50">Bourse de Casablanca · Temps réel via TradingView</p>
          </div>
        </div>
        <div className="p-2">
          <TradingViewChart symbol="CSEMA:MSI20" height={320} theme="light" interval="D" />
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h4 className="font-bold text-sm text-primary">Meilleures hausses</h4>
            <div className="ml-auto flex items-center gap-2">
              {marketStatus.open ? (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Ouvert</span>
              ) : (
                <span className="text-xs bg-surface-100 text-primary/40 px-2 py-0.5 rounded-full">Fermé</span>
              )}
              <button
                onClick={load}
                disabled={loading}
                className="text-primary/30 hover:text-secondary disabled:opacity-40 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {loading && gainers.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : gainers.map((s, i) => (
                  <MoverRow
                    key={s.ticker}
                    rank={i + 1}
                    symbol={s.ticker}
                    name={s.name}
                    changePercent={s.changePercent}
                    up={true}
                  />
                ))
            }
          </div>
          {lastUpdate && (
            <p className="text-xs text-primary/25 mt-3 text-right">
              {lastUpdate.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Losers */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-danger rotate-180" />
            <h4 className="font-bold text-sm text-primary">Plus fortes baisses</h4>
            <div className="ml-auto flex items-center gap-2">
              {movers && (
                <span className="text-xs text-primary/30">{movers.total} titres</span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {loading && losers.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : losers.map((s, i) => (
                  <MoverRow
                    key={s.ticker}
                    rank={i + 1}
                    symbol={s.ticker}
                    name={s.name}
                    changePercent={s.changePercent}
                    up={false}
                  />
                ))
            }
          </div>
          {lastUpdate && (
            <p className="text-xs text-primary/25 mt-3 text-right">
              Bourse de Casablanca
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
