'use client';
import { useEffect, useRef, memo } from 'react';

interface AssetWidgetProps {
  symbol: string;
  name: string;
  sector?: string;
  colorTheme?: 'light' | 'dark';
}

function AssetWidget({ symbol, name, sector }: AssetWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';

    // Detect theme from DOM (data-theme attribute on <html>)
    const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 200,
      locale: 'fr',
      dateRange: '1M',
      colorTheme: isDark ? 'dark' : 'light',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      noTimeScale: false,
      chartOnly: false,
      hideDateRanges: false,
    });
    ref.current.appendChild(script);

    return () => { if (ref.current) ref.current.innerHTML = ''; };
  }, [symbol]);

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sector} · {symbol.split(':')[1]}</p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <span className="text-xs font-black" style={{ color: 'var(--text-secondary)' }}>
              {symbol.split(':')[1]?.[0]}
            </span>
          </div>
        </div>
      </div>
      <div ref={ref} className="tradingview-widget-container" style={{ height: '160px' }} />
    </div>
  );
}

export default memo(AssetWidget);
