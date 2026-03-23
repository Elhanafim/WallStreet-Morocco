'use client';
import { useEffect, useRef } from 'react';

const moroccanSymbols = [
  { proName: 'MASI INDEX', title: 'MASI' },
  { proName: 'BCAS:ATW', title: 'Attijariwafa' },
  { proName: 'BCAS:IAM', title: 'Maroc Telecom' },
  { proName: 'BCAS:BCP', title: 'BCP' },
  { proName: 'BCAS:LHM', title: 'LafargeHolcim' },
  { proName: 'BCAS:CIH', title: 'CIH Bank' },
  { proName: 'BCAS:CSR', title: 'Cosumar' },
  { proName: 'BCAS:ADH', title: 'Addoha' },
  { proName: 'BCAS:WAA', title: 'Wafa Assurance' },
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
