import dynamic from 'next/dynamic';
import { BarChart2, Globe2, Eye } from 'lucide-react';

const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), { ssr: false });
const WatchlistPanel = dynamic(() => import('@/components/market/WatchlistPanel'), { ssr: false });
const MarketSummary = dynamic(() => import('@/components/market/MarketSummary'), { ssr: false });
const AssetWidget = dynamic(() => import('@/components/market/AssetWidget'), { ssr: false });

const ASSETS = [
  // ── Banques ─────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:ATW',  name: 'Attijariwafa Bank',           sector: 'Banque'           },
  { symbol: 'CSEMA:BCP',  name: 'Banque Centrale Populaire',   sector: 'Banque'           },
  { symbol: 'CSEMA:BOA',  name: 'Bank of Africa',              sector: 'Banque'           },
  { symbol: 'CSEMA:CIH',  name: 'CIH Bank',                   sector: 'Banque'           },
  { symbol: 'CSEMA:CDM',  name: 'Crédit du Maroc',             sector: 'Banque'           },
  { symbol: 'CSEMA:CFG',  name: 'CFG Bank',                    sector: 'Banque'           },
  { symbol: 'CSEMA:BCI',  name: 'BMCI',                        sector: 'Banque'           },
  // ── Assurance ────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:WAA',  name: 'Wafa Assurance',              sector: 'Assurance'        },
  { symbol: 'CSEMA:ATL',  name: 'AtlantaSanad',                sector: 'Assurance'        },
  { symbol: 'CSEMA:SAH',  name: 'Sanlam Maroc',                sector: 'Assurance'        },
  { symbol: 'CSEMA:AGM',  name: 'Agma',                        sector: 'Assurance'        },
  { symbol: 'CSEMA:AFM',  name: 'AFMA',                        sector: 'Assurance'        },
  // ── Télécoms ─────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:IAM',  name: 'Maroc Telecom',               sector: 'Télécoms'         },
  // ── Énergie ──────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:TQM',  name: 'TAQA Morocco',                sector: 'Énergie'          },
  { symbol: 'CSEMA:GAZ',  name: 'Afriquia Gaz',                sector: 'Énergie'          },
  { symbol: 'CSEMA:TMA',  name: 'TotalEnergies Marketing Maroc', sector: 'Énergie'        },
  { symbol: 'CSEMA:MOX',  name: 'Maghreb Oxygène',             sector: 'Énergie'          },
  // ── Mines & Ressources ────────────────────────────────────────────────────
  { symbol: 'CSEMA:MNG',  name: 'Managem',                     sector: 'Mines'            },
  { symbol: 'CSEMA:SMI',  name: 'SMI (Imiter)',                sector: 'Mines'            },
  { symbol: 'CSEMA:CMT',  name: 'Compagnie Minière de Touissit', sector: 'Mines'          },
  { symbol: 'CSEMA:ZDJ',  name: 'Zellidja',                    sector: 'Mines'            },
  // ── BTP & Construction ────────────────────────────────────────────────────
  { symbol: 'CSEMA:GTM',  name: 'TGCC (Travaux du Maroc)',     sector: 'BTP'              },
  { symbol: 'CSEMA:TGC',  name: 'TGCC SA',                    sector: 'BTP'              },
  { symbol: 'CSEMA:LHM',  name: 'LafargeHolcim Maroc',        sector: 'BTP'              },
  { symbol: 'CSEMA:CMA',  name: 'Ciments du Maroc',           sector: 'BTP'              },
  { symbol: 'CSEMA:JET',  name: 'Jet Contractors',            sector: 'BTP'              },
  { symbol: 'CSEMA:STR',  name: 'Stroc Industrie',            sector: 'BTP'              },
  { symbol: 'CSEMA:SRM',  name: 'Réalisations Mécaniques',    sector: 'BTP'              },
  // ── Immobilier ───────────────────────────────────────────────────────────
  { symbol: 'CSEMA:ADH',  name: 'Addoha',                     sector: 'Immobilier'       },
  { symbol: 'CSEMA:ADI',  name: 'Alliances Dév. Immobilier',  sector: 'Immobilier'       },
  { symbol: 'CSEMA:RDS',  name: 'Résidences Dar Saada',       sector: 'Immobilier'       },
  { symbol: 'CSEMA:ARD',  name: 'Aradei Capital',             sector: 'Immobilier'       },
  { symbol: 'CSEMA:IMO',  name: 'Immorente Invest',           sector: 'Immobilier'       },
  { symbol: 'CSEMA:RIS',  name: 'Risma',                      sector: 'Immobilier'       },
  { symbol: 'CSEMA:BAL',  name: 'Balima',                     sector: 'Immobilier'       },
  // ── Agroalimentaire ──────────────────────────────────────────────────────
  { symbol: 'CSEMA:CSR',  name: 'Cosumar',                    sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LES',  name: 'Lesieur Cristal',            sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:SBM',  name: 'Société des Boissons du Maroc', sector: 'Agroalimentaire' },
  { symbol: 'CSEMA:OUL',  name: "Eaux Minérales d'Oulmès",   sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:MUT',  name: 'Mutandis',                   sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:DRI',  name: 'Dari Couspate',              sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:CRS',  name: 'Cartier Saada',              sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:UMR',  name: 'Unimer',                     sector: 'Agroalimentaire'  },
  // ── Distribution & Commerce ──────────────────────────────────────────────
  { symbol: 'CSEMA:LBV',  name: "Label'Vie",                  sector: 'Distribution'     },
  { symbol: 'CSEMA:ATH',  name: 'Auto Hall',                  sector: 'Distribution'     },
  { symbol: 'CSEMA:NEJ',  name: 'Auto Nejma',                 sector: 'Distribution'     },
  { symbol: 'CSEMA:SNA',  name: 'Stokvis Nord Afrique',       sector: 'Distribution'     },
  { symbol: 'CSEMA:FBR',  name: 'Fenie Brossette',            sector: 'Distribution'     },
  { symbol: 'CSEMA:NKL',  name: 'Ennakl Automobiles',         sector: 'Distribution'     },
  // ── Santé ─────────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:AKT',  name: 'Akdital',                    sector: 'Santé'            },
  { symbol: 'CSEMA:SOT',  name: 'Sothema',                    sector: 'Santé'            },
  { symbol: 'CSEMA:PRO',  name: 'Promopharm',                 sector: 'Santé'            },
  // ── Finance & Crédit ─────────────────────────────────────────────────────
  { symbol: 'CSEMA:EQD',  name: 'EQDOM',                      sector: 'Crédit'           },
  { symbol: 'CSEMA:SLF',  name: 'Salafin',                    sector: 'Crédit'           },
  { symbol: 'CSEMA:MAB',  name: 'Maghreb Crédit-bail',        sector: 'Crédit'           },
  { symbol: 'CSEMA:MLE',  name: 'Maroc Leasing',              sector: 'Crédit'           },
  { symbol: 'CSEMA:CAP',  name: 'Cash Plus',                  sector: 'Crédit'           },
  // ── Technologie & IT ─────────────────────────────────────────────────────
  { symbol: 'CSEMA:HPS',  name: 'HPS (Hightech Payment)',     sector: 'Technologie'      },
  { symbol: 'CSEMA:DWY',  name: 'Disway',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:M2M',  name: 'M2M Group',                  sector: 'Technologie'      },
  { symbol: 'CSEMA:MIC',  name: 'Microdata',                  sector: 'Technologie'      },
  { symbol: 'CSEMA:DYT',  name: 'Disty Technologies',         sector: 'Technologie'      },
  { symbol: 'CSEMA:INV',  name: 'Involys',                    sector: 'Technologie'      },
  { symbol: 'CSEMA:IBC',  name: 'IB Maroc.com',               sector: 'Technologie'      },
  { symbol: 'CSEMA:S2M',  name: 'S2M (Monétique)',            sector: 'Technologie'      },
  // ── Industrie ─────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:DHO',  name: 'Delta Holding',              sector: 'Industrie'        },
  { symbol: 'CSEMA:CMG',  name: 'CMGP Group',                 sector: 'Industrie'        },
  { symbol: 'CSEMA:ALM',  name: 'Aluminium du Maroc',         sector: 'Industrie'        },
  { symbol: 'CSEMA:AFI',  name: 'Afric Industries',           sector: 'Industrie'        },
  { symbol: 'CSEMA:SNP',  name: 'SNEP',                       sector: 'Industrie'        },
  { symbol: 'CSEMA:MDP',  name: 'Med Paper',                  sector: 'Industrie'        },
  { symbol: 'CSEMA:SID',  name: 'SONASID',                    sector: 'Industrie'        },
  { symbol: 'CSEMA:COL',  name: 'Colorado',                   sector: 'Industrie'        },
  // ── Transport & Logistique ───────────────────────────────────────────────
  { symbol: 'CSEMA:MSA',  name: 'Marsa Maroc',                sector: 'Transport'        },
  { symbol: 'CSEMA:CTM',  name: 'CTM',                        sector: 'Transport'        },
  // ── Holding & Divers ─────────────────────────────────────────────────────
  { symbol: 'CSEMA:VCN',  name: 'Vicenne',                    sector: 'Holding'          },
  { symbol: 'CSEMA:REB',  name: 'Rebab Company',              sector: 'Holding'          },
];

export const metadata = {
  title: 'Marchés | WallStreet Morocco',
  description: 'Suivez le MASI et les actions marocaines en temps réel',
};

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Ticker tape at top */}
      <div className="bg-primary">
        <TradingViewTicker />
      </div>

      {/* Page header */}
      <div className="bg-primary text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Marchés Marocains</h1>
              <p className="text-white/60 text-sm">Données en temps réel · Bourse de Casablanca</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-success text-sm font-medium">Marché ouvert · MASI en direct</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left: Main content (3 cols) */}
          <div className="xl:col-span-3 space-y-6">
            {/* MASI Advanced Chart */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe2 className="w-5 h-5 text-secondary" />
                  <div>
                    <h2 className="font-bold text-primary">MASI — Graphique Avancé</h2>
                    <p className="text-xs text-primary/50">Indice Marocain de toutes les valeurs</p>
                  </div>
                </div>
                <span className="text-xs bg-success/10 text-success font-semibold px-2 py-1 rounded-full">Live</span>
              </div>
              <TradingViewChart symbol="CSEMA:MASI" height={450} theme="light" interval="D" showToolbar={true} />
            </div>

            {/* Market Summary */}
            <MarketSummary />

            {/* Asset grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary/60" />
                <h2 className="font-bold text-primary">Actions Marocaines</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ASSETS.map((asset) => (
                  <AssetWidget key={asset.symbol} {...asset} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Watchlist sidebar (1 col) */}
          <div className="xl:col-span-1">
            <div className="sticky top-4 space-y-4">
              <WatchlistPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
