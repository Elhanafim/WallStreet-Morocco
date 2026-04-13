import { useEffect, useRef, memo } from 'react';
import Card from '@/components/ui/Card';

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
    <Card variant="premium" className="group">
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium truncate mb-0.5 leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-1 h-3 bg-gold-gradient rounded-full" />
              <p className="text-[11px] font-medium tracking-wide uppercase text-[var(--text-muted)] truncate">
                {sector || 'Action'} · {symbol.split(':')[1]}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border)] group-hover:border-[var(--gold)] transition-colors">
            <span className="text-sm font-medium text-[var(--gold)]">
              {symbol.split(':')[1]?.[0] || 'A'}
            </span>
          </div>
        </div>
      </div>
      <div 
        ref={ref} 
        className="tradingview-widget-container transition-opacity duration-700 opacity-0 animate-fadeIn" 
        style={{ height: '160px', animationDelay: '0.3s' }} 
      />
    </Card>
  );
}

export default memo(AssetWidget);
