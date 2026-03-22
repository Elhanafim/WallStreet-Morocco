'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { tickerStocks } from '@/lib/data/stocks';

function TickerItem({ symbol, value, change }: { symbol: string; value: number; change: number }) {
  const isPositive = change >= 0;
  const formattedValue = value >= 1000
    ? value.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value.toFixed(2);

  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-white/10 last:border-r-0">
      <span className="font-bold text-white text-sm">{symbol}</span>
      <span className="text-white/80 text-sm">{formattedValue}</span>
      <span
        className={`flex items-center gap-0.5 text-xs font-semibold ${
          isPositive ? 'text-success' : 'text-danger'
        }`}
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
    <div className="bg-primary border-y border-white/10 py-2.5 overflow-hidden">
      <div className="relative flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 px-4 py-0.5 bg-accent text-primary text-xs font-black uppercase tracking-wider mr-4 rounded-sm">
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
