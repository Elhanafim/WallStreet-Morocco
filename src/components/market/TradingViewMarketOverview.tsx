'use client';

import { useEffect, useRef } from 'react';

// TradingView Market Overview widget — shows price + % change for a list of symbols
export default function TradingViewMarketOverview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '12M',
      showChart: true,
      locale: 'fr',
      width: '100%',
      height: '660',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0)',
      scaleFontColor: 'rgba(106, 109, 120, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: 'Maroc',
          symbols: [
            { s: 'MASI INDEX',  d: 'MASI Index'          },
            { s: 'BCAS:ATW',   d: 'Attijariwafa Bank'   },
            { s: 'BCAS:IAM',   d: 'Maroc Telecom'       },
            { s: 'BCAS:BCP',   d: 'Banque Pop.'         },
            { s: 'BCAS:LHM',   d: 'LafargeHolcim Maroc' },
            { s: 'BCAS:CIH',   d: 'CIH Bank'            },
            { s: 'BCAS:CSR',   d: 'Cosumar'             },
          ],
          originalTitle: 'Maroc',
        },
        {
          title: 'Mondial',
          symbols: [
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500'    },
            { s: 'FOREXCOM:NSXUSD', d: 'NASDAQ 100' },
            { s: 'FOREXCOM:DJI',    d: 'Dow Jones'  },
            { s: 'INDEX:DEU40',     d: 'DAX 40'     },
            { s: 'FOREXCOM:EURUSD', d: 'EUR/USD'    },
            { s: 'TVC:GOLD',        d: 'Or (XAU)'   },
            { s: 'TVC:USOIL',       d: 'Pétrole WTI'},
          ],
          originalTitle: 'Mondial',
        },
      ],
    });

    ref.current.appendChild(script);
    return () => { if (ref.current) ref.current.innerHTML = ''; };
  }, []);

  return (
    <div
      ref={ref}
      className="tradingview-widget-container w-full rounded-2xl overflow-hidden"
      style={{ minHeight: '660px' }}
    />
  );
}
