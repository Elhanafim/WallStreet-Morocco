'use client';
import { useEffect, useRef, memo } from 'react';

interface AssetWidgetProps {
  symbol: string;
  name: string;
  sector?: string;
  colorTheme?: 'light' | 'dark';
}

function AssetWidget({ symbol, name, sector, colorTheme = 'light' }: AssetWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 200,
      locale: 'fr',
      dateRange: '1M',
      colorTheme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      noTimeScale: false,
      chartOnly: false,
      hideDateRanges: false,
    });
    ref.current.appendChild(script);

    return () => { if (ref.current) ref.current.innerHTML = ''; };
  }, [symbol, colorTheme]);

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-sm text-primary">{name}</p>
            <p className="text-xs text-primary/40">{sector} · {symbol.split(':')[1]}</p>
          </div>
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-xs font-black text-secondary">{symbol.split(':')[1]?.[0]}</span>
          </div>
        </div>
      </div>
      <div ref={ref} className="tradingview-widget-container" style={{ height: '160px' }} />
    </div>
  );
}

export default memo(AssetWidget);
