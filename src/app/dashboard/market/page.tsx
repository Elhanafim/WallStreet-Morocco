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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Marchés
        </h1>
        <p
          className="mt-1"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 300,
            color: 'var(--text-muted)',
          }}
        >
          Suivi en temps réel via TradingView
        </p>
      </div>

      {/* Ticker */}
      <div
        className="overflow-hidden"
        style={{ border: '1px solid var(--border)', borderRadius: '6px' }}
      >
        <TradingViewTicker />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* MASI chart — 2 cols */}
        <div
          className="xl:col-span-2 overflow-hidden"
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
                MASI Index
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                Bourse de Casablanca
              </p>
            </div>
            <span
              className="ml-auto"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--gain)',
              }}
            >
              Live
            </span>
          </div>
          <TradingViewChart symbol="CSEMA:MASI" height={380} theme="light" interval="D" />
        </div>

        {/* Watchlist — 1 col */}
        <div className="xl:col-span-1">
          <WatchlistPanel />
        </div>
      </div>

      {/* ATW and IAM charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { symbol: 'CSEMA:ATW', name: 'Attijariwafa Bank' },
          { symbol: 'CSEMA:IAM', name: 'Maroc Telecom' },
        ].map(({ symbol, name }) => (
          <div
            key={symbol}
            className="overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--gain)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {name}
              </span>
              <span
                className="ml-auto"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}
              >
                {symbol.split(':')[1]}
              </span>
            </div>
            <TradingViewChart symbol={symbol} height={280} theme="light" interval="D" showToolbar={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
