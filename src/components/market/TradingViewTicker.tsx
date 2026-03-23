'use client';
import { useEffect, useRef } from 'react';

const moroccanSymbols = [
  { proName: 'CSEMA:MASI',  title: 'MASI' },
  { proName: 'CSEMA:ATW',   title: 'Attijariwafa' },
  { proName: 'CSEMA:IAM',   title: 'Maroc Telecom' },
  { proName: 'CSEMA:BCP',   title: 'BCP' },
  { proName: 'CSEMA:LHM',   title: 'LafargeHolcim' },
  { proName: 'CSEMA:CIH',   title: 'CIH Bank' },
  { proName: 'CSEMA:CSR',   title: 'Cosumar' },
  { proName: 'CSEMA:ADH',   title: 'Addoha' },
  { proName: 'CSEMA:WAA',   title: 'Wafa Assurance' },
  { proName: 'CSEMA:BOA',   title: 'Bank of Africa' },
  { proName: 'CSEMA:LBV',   title: "Label'Vie" },
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
