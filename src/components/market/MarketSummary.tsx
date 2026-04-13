'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { TrendingUp, RefreshCw, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { fetchMovers, BVCMovers, getMarketStatus } from '@/lib/bvcPriceService';

const TradingViewChart = dynamic(() => import('./TradingViewChart'), { ssr: false });

const REFRESH_INTERVAL = 5 * 60 * 1000;

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
    <div
      className="flex items-center gap-3 h-[46px] transition-colors"
      style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-elevated)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
    >
      <span
        className="w-5 text-right"
        style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}
      >
        {rank}
      </span>
      <div
        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 500,
          color: up ? 'var(--gain)' : 'var(--loss)',
        }}
      >
        {symbol[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {symbol}
        </p>
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 300,
            color: 'var(--text-secondary)',
          }}
        >
          {name}
        </p>
      </div>
      <span
        className="flex-shrink-0"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 500,
          color: up ? 'var(--gain)' : 'var(--loss)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 h-[46px] animate-pulse">
      <div className="w-5 h-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }} />
      <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 rounded w-16" style={{ backgroundColor: 'var(--bg-elevated)' }} />
        <div className="h-2.5 rounded w-24" style={{ backgroundColor: 'var(--bg-elevated)' }} />
      </div>
      <div className="h-4 w-14 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }} />
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
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          >
            <Activity className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              MSI20 — Indice Blue Chips
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}
            >
              Bourse de Casablanca · Temps réel via TradingView
            </p>
          </div>
        </div>
        <div className="p-2">
          <TradingViewChart symbol="CSEMA:MSI20" height={320} theme="light" interval="D" />
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--gain)' }} />
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                color: 'var(--text-secondary)',
                borderLeft: '3px solid var(--gold)',
                paddingLeft: '8px',
              }}
            >
              Plus fortes hausses
            </h4>
            <div className="ml-auto flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: marketStatus.open ? 'var(--gain)' : 'var(--text-muted)',
                }}
              >
                {marketStatus.open ? 'Ouvert' : 'Fermé'}
              </span>
              <button
                onClick={load}
                disabled={loading}
                className="transition-colors disabled:opacity-40"
                title="Actualiser"
                style={{ color: 'var(--text-muted)' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div>
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
            <p
              className="mt-3 text-right"
              style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}
            >
              {lastUpdate.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Losers */}
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 rotate-180" style={{ color: 'var(--loss)' }} />
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                color: 'var(--text-secondary)',
                borderLeft: '3px solid var(--gold)',
                paddingLeft: '8px',
              }}
            >
              Plus fortes baisses
            </h4>
            <div className="ml-auto">
              {movers && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {movers.total} titres
                </span>
              )}
            </div>
          </div>
          <div>
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
            <p
              className="mt-3 text-right"
              style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}
            >
              Bourse de Casablanca
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
