'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewForexWidgetProps {
  /** TradingView symbol, e.g. "FX_IDC:USDMAD" */
  symbol: string;
  /** Human-readable pair label, e.g. "USD / MAD" */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  height?: number;
}

/**
 * Renders a TradingView mini symbol-overview widget for a forex pair.
 * Uses the `embed-widget-mini-symbol-overview` script (no API key required).
 */
function TradingViewForexWidget({
  symbol,
  label,
  description,
  height = 220,
}: TradingViewForexWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height,
      locale: 'en',
      dateRange: '1M',
      colorTheme: 'light',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
      noTimeScale: false,
      chartOnly: false,
      hideDateRanges: false,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, height]);

  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Card header */}
      <div
        className="px-5 pt-4 pb-3 flex items-start justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <p
            className="font-display font-medium"
            style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            {label}
          </p>
          {description && (
            <p
              className="font-body text-[12px] mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>
        <span
          className="font-body text-[10.5px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            marginTop: '2px',
          }}
        >
          Forex
        </span>
      </div>

      {/* Widget */}
      <div ref={containerRef} style={{ height: `${height}px` }} />
    </div>
  );
}

export default memo(TradingViewForexWidget);
