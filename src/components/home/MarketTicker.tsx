'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { tickerStocks } from '@/lib/data/stocks';

function TickerItem({ symbol, value, change }: { symbol: string; value: number; change: number }) {
  const isPositive = change >= 0;
  const formattedValue = value >= 1000
    ? value.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value.toFixed(2);

  return (
    <span className="inline-flex items-center gap-2 px-5 border-r" style={{ borderColor: 'var(--border)' }}>
      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{symbol}</span>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formattedValue}</span>
      <span
        className="flex items-center gap-0.5 text-xs font-semibold"
        style={{ color: isPositive ? 'var(--gain)' : 'var(--loss)' }}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    </span>
  );
}

export default function MarketTicker() {
  const doubledStocks = [...tickerStocks, ...tickerStocks];

  return (
    <div className="border-y transition-colors duration-150" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
      <div className="relative flex items-center py-2.5">
        {/* Label */}
        <div
          className="flex-shrink-0 px-4 py-0.5 text-xs font-black uppercase tracking-wider mr-4 rounded-sm"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--bg-surface)' }}
        >
          LIVE
        </div>

        {/* Scrolling content */}
        <div className="ticker-wrap flex-1">
          <div className="ticker-move whitespace-nowrap">
            {doubledStocks.map((stock, index) => (
              <TickerItem
                key={`${stock.symbol}-${index}`}
                symbol={stock.symbol}
                value={stock.value}
                change={stock.change}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
