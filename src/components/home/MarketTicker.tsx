'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { tickerStocks } from '@/lib/data/stocks';
import { cn } from '@/lib/utils';

function TickerItem({ symbol, value, change }: { symbol: string; value: number; change: number }) {
  const isPositive = change >= 0;
  const formattedValue = value >= 1000
    ? value.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value.toFixed(2);

  return (
    <span className="inline-flex items-center gap-3 px-6 border-r border-[var(--border)] h-10">
      <span className="font-body text-[13px] font-medium text-[var(--text-primary)] uppercase tracking-wider">{symbol}</span>
      <span className="font-body text-[13px] text-[var(--text-secondary)] tabular-nums">{formattedValue}</span>
      <span
        className={cn(
          "flex items-center gap-1 font-body text-[12px] font-semibold",
          isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
        )}
      >
        {isPositive ? "+" : ""}{change.toFixed(2)}%
      </span>
    </span>
  );
}

export default function MarketTicker() {
  const doubledStocks = [...tickerStocks, ...tickerStocks];

  return (
    <div className="bg-[var(--bg-base)] border-y border-[var(--border)] relative overflow-hidden h-10 flex items-center">
      {/* Editorial Live Indicator */}
      <div className="absolute left-0 top-0 bottom-0 z-10 px-6 bg-[var(--bg-base)] border-r border-[var(--border)] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--loss)] animate-pulse" />
        <span className="font-body text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-primary)]">Live</span>
      </div>

      {/* Scrolling content */}
      <div className="ticker-wrap flex-1 pl-[120px]">
        <div className="ticker-move whitespace-nowrap flex items-center">
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
  );
}
