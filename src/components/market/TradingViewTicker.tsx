'use client';
import { useEffect, useRef } from 'react';

const moroccanSymbols = [
  { proName: 'CASABLANCA:MASI', title: 'MASI' },
  { proName: 'CASABLANCA:ATW', title: 'Attijariwafa' },
  { proName: 'CASABLANCA:IAM', title: 'Maroc Telecom' },
  { proName: 'CASABLANCA:BCP', title: 'BCP' },
  { proName: 'CASABLANCA:LHM', title: 'LafargeHolcim' },
  { proName: 'CASABLANCA:CIH', title: 'CIH Bank' },
  { proName: 'CASABLANCA:CSR', title: 'Cosumar' },
  { proName: 'CASABLANCA:ADH', title: 'Addoha' },
  { proName: 'CASABLANCA:WAA', title: 'Wafa Assurance' },
];

export default function TradingViewTicker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: moroccanSymbols,
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'fr',
    });
    ref.current.appendChild(script);

    return () => { if (ref.current) ref.current.innerHTML = ''; };
  }, []);

  return <div ref={ref} className="tradingview-widget-container w-full" style={{ height: '46px' }} />;
}
