'use client';
import { useState, useEffect } from 'react';
import { Star, Plus, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const TradingViewSymbolInfo = dynamic(
  () => import('./TradingViewSymbolInfo'),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-surface-100 rounded-xl" /> }
);

const DEFAULT_ASSETS = [
  { symbol: 'CSEMA:MASI',  name: 'MASI Index',               sector: 'Indice'          },
  { symbol: 'CSEMA:ATW',   name: 'Attijariwafa Bank',         sector: 'Banque'          },
  { symbol: 'CSEMA:IAM',   name: 'Maroc Telecom',             sector: 'Télécoms'        },
  { symbol: 'CSEMA:BCP',   name: 'Banque Pop.',               sector: 'Banque'          },
  { symbol: 'CSEMA:LHM',   name: 'LafargeHolcim',             sector: 'Matériaux'       },
  { symbol: 'CSEMA:CIH',   name: 'CIH Bank',                  sector: 'Banque'          },
  { symbol: 'CSEMA:CSR',   name: 'Cosumar',                   sector: 'Agroalimentaire' },
  { symbol: 'CSEMA:ADH',   name: 'Addoha',                    sector: 'Immobilier'      },
  { symbol: 'CSEMA:WAA',   name: 'Wafa Assurance',            sector: 'Assurance'       },
  { symbol: 'CSEMA:BOA',   name: 'Bank of Africa',            sector: 'Banque'          },
  { symbol: 'CSEMA:LES',   name: 'Lesieur Cristal',           sector: 'Agroalimentaire' },
  { symbol: 'CSEMA:CDM',   name: 'Crédit du Maroc',           sector: 'Banque'          },
  { symbol: 'CSEMA:NEJ',   name: 'Auto Nejma',                sector: 'Distribution'    },
  { symbol: 'CSEMA:ADI',   name: 'Alliances Immobilier',      sector: 'Immobilier'      },
  { symbol: 'CSEMA:LBV',   name: "Label'Vie",                 sector: 'Distribution'    },
  { symbol: 'CSEMA:LYDEC', name: 'Lydec',                     sector: 'Utilities'       },
];

export default function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState<string[]>(['CSEMA:MASI', 'CSEMA:ATW', 'CSEMA:IAM']);
  const [activeSymbol, setActiveSymbol] = useState('MASI INDEX');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wsm_watchlist');
    if (saved) {
      // Migrate old prefixes to CSEMA: and fix legacy symbol names
      const migrated = (JSON.parse(saved) as string[]).map(s =>
        s === 'MASI INDEX'
          ? 'CSEMA:MASI'
          : s.replace(/^(CASABLANCA:|BCAS:)/, 'CSEMA:')
      );
      localStorage.setItem('wsm_watchlist', JSON.stringify(migrated));
      setWatchlist(migrated);
    }
  }, []);

  const toggleWatch = (symbol: string) => {
    setWatchlist(prev => {
      const next = prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol];
      localStorage.setItem('wsm_watchlist', JSON.stringify(next));
      return next;
    });
  };

  const watchedAssets = DEFAULT_ASSETS.filter(a => watchlist.includes(a.symbol));
  const unwatchedAssets = DEFAULT_ASSETS.filter(a => !watchlist.includes(a.symbol));

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-primary text-base">Ma Watchlist</h3>
          <p className="text-xs text-primary/50">{watchlist.length} actifs suivis</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {/* Add assets panel */}
      {showAdd && (
        <div className="px-5 py-3 bg-surface-50 border-b border-surface-100">
          <p className="text-xs font-medium text-primary/60 mb-2">Sélectionner des actifs</p>
          <div className="flex flex-wrap gap-2">
            {unwatchedAssets.map(asset => (
              <button
                key={asset.symbol}
                onClick={() => toggleWatch(asset.symbol)}
                className="text-xs px-3 py-1.5 rounded-full border border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all font-medium"
              >
                + {asset.name}
              </button>
            ))}
            {unwatchedAssets.length === 0 && (
              <p className="text-xs text-primary/40">Tous les actifs sont déjà dans votre watchlist</p>
            )}
          </div>
        </div>
      )}

      {/* Watchlist items */}
      <div className="divide-y divide-surface-100">
        {watchedAssets.map(asset => (
          <div
            key={asset.symbol}
            className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors group ${
              activeSymbol === asset.symbol ? 'bg-secondary/5' : ''
            }`}
            onClick={() => setActiveSymbol(asset.symbol)}
          >
            {/* Active indicator */}
            <div className={`w-1 h-8 rounded-full transition-all ${activeSymbol === asset.symbol ? 'bg-secondary' : 'bg-transparent'}`} />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary truncate">{asset.name}</p>
              <p className="text-xs text-primary/40">{asset.sector} · {asset.symbol.split(':')[1]}</p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); toggleWatch(asset.symbol); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/30 hover:text-danger"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <Star className={`w-4 h-4 flex-shrink-0 ${activeSymbol === asset.symbol ? 'text-accent fill-accent' : 'text-primary/20'}`} />
          </div>
        ))}

        {watchedAssets.length === 0 && (
          <div className="px-5 py-8 text-center">
            <Star className="w-8 h-8 text-primary/10 mx-auto mb-2" />
            <p className="text-sm text-primary/40">Votre watchlist est vide</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 text-xs text-secondary font-medium hover:underline"
            >
              Ajouter des actifs
            </button>
          </div>
        )}
      </div>

      {/* Active chart */}
      {activeSymbol && watchedAssets.length > 0 && (
        <div className="p-4 border-t border-surface-100 bg-surface-50">
          <p className="text-xs font-medium text-primary/50 mb-2 uppercase tracking-wide">
            {watchedAssets.find(a => a.symbol === activeSymbol)?.name}
          </p>
          <TradingViewSymbolInfo symbol={activeSymbol} colorTheme="light" />
        </div>
      )}
    </div>
  );
}
