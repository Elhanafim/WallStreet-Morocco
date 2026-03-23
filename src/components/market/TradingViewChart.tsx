'use client';
import { useEffect, useRef, memo } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  theme?: 'light' | 'dark';
  interval?: string;
  showToolbar?: boolean;
}

function TradingViewChart({
  symbol = 'CSEMA:MASI',
  height = 400,
  theme = 'light',
  interval = 'D',
  showToolbar = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear previous widget
    containerRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(container);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Africa/Casablanca',
      theme,
      style: '1',
      locale: 'fr',
      toolbar_bg: theme === 'dark' ? '#0A2540' : '#ffffff',
      enable_publishing: false,
      hide_top_toolbar: !showToolbar,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, height, theme, interval, showToolbar]);

  return (
    <div
      className="tradingview-widget-container w-full rounded-2xl overflow-hidden"
      ref={containerRef}
      style={{ height: `${height}px` }}
    />
  );
}

export default memo(TradingViewChart);
