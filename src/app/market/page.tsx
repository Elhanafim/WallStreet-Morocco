import dynamic from 'next/dynamic';
import { BarChart2, Globe2 } from 'lucide-react';
import MarchesSupport from '@/components/donate/MarchesSupport';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import EduBannerInline from '@/components/legal/EduBannerInline';

const TradingViewTicker  = dynamic(() => import('@/components/market/TradingViewTicker'),  { ssr: false });
const TradingViewChart   = dynamic(() => import('@/components/market/TradingViewChart'),   { ssr: false });
const WatchlistPanel     = dynamic(() => import('@/components/market/WatchlistPanel'),     { ssr: false });
const MarketSummary      = dynamic(() => import('@/components/market/MarketSummary'),      { ssr: false });
const MarketStockGrid    = dynamic(() => import('@/components/market/MarketStockGrid'),    { ssr: false });
const ChatHint           = dynamic(() => import('@/components/chat/ChatHint'),             { ssr: false });

// ── All 77 CSEMA stocks ────────────────────────────────────────────────────────
// Organised by primary sector — MarketStockGrid re-groups them by SECTORS config.
const ASSETS = [
  // ── Banques ──────────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:ATW',  name: 'Attijariwafa Bank',              sector: 'Banque'           },
  { symbol: 'CSEMA:BCP',  name: 'Banque Centrale Populaire',      sector: 'Banque'           },
  { symbol: 'CSEMA:BOA',  name: 'Bank of Africa',                 sector: 'Banque'           },
  { symbol: 'CSEMA:CIH',  name: 'CIH Bank',                      sector: 'Banque'           },
  { symbol: 'CSEMA:CDM',  name: 'Crédit du Maroc',                sector: 'Banque'           },
  { symbol: 'CSEMA:CFG',  name: 'CFG Bank',                       sector: 'Banque'           },
  { symbol: 'CSEMA:BCI',  name: 'BMCI',                           sector: 'Banque'           },
  // ── Assurance ────────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:WAA',  name: 'Wafa Assurance',                 sector: 'Assurance'        },
  { symbol: 'CSEMA:ATL',  name: 'AtlantaSanad',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:SAH',  name: 'Sanlam Maroc',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:AGM',  name: 'Agma',                           sector: 'Assurance'        },
  { symbol: 'CSEMA:AFM',  name: 'AFMA',                           sector: 'Assurance'        },
  // ── Crédit ───────────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:EQD',  name: 'EQDOM',                          sector: 'Crédit'           },
  { symbol: 'CSEMA:SLF',  name: 'Salafin',                        sector: 'Crédit'           },
  { symbol: 'CSEMA:MAB',  name: 'Maghreb Crédit-bail',            sector: 'Crédit'           },
  { symbol: 'CSEMA:MLE',  name: 'Maroc Leasing',                  sector: 'Crédit'           },
  // ── Télécoms ─────────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:IAM',  name: 'Maroc Telecom',                  sector: 'Télécoms'         },
  // ── Mines & Matériaux ─────────────────────────────────────────────────────────
  { symbol: 'CSEMA:MNG',  name: 'Managem',                        sector: 'Mines'            },
  { symbol: 'CSEMA:SMI',  name: 'SMI (Imiter)',                   sector: 'Mines'            },
  { symbol: 'CSEMA:CMT',  name: 'Compagnie Minière de Touissit',  sector: 'Mines'            },
  { symbol: 'CSEMA:ZDJ',  name: 'Zellidja',                       sector: 'Mines'            },
  { symbol: 'CSEMA:ALM',  name: 'Aluminium du Maroc',             sector: 'Mines'            },
  // ── BTP & Construction ───────────────────────────────────────────────────────
  { symbol: 'CSEMA:LHM',  name: 'LafargeHolcim Maroc',           sector: 'BTP'              },
  { symbol: 'CSEMA:CMA',  name: 'Ciments du Maroc',              sector: 'BTP'              },
  { symbol: 'CSEMA:GTM',  name: 'TGCC (Travaux du Maroc)',        sector: 'BTP'              },
  { symbol: 'CSEMA:TGC',  name: 'TGCC SA',                        sector: 'BTP'              },
  { symbol: 'CSEMA:JET',  name: 'Jet Contractors',               sector: 'BTP'              },
  { symbol: 'CSEMA:STR',  name: 'Stroc Industrie',               sector: 'BTP'              },
  // ── Immobilier ───────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:ADH',  name: 'Addoha',                        sector: 'Immobilier'       },
  { symbol: 'CSEMA:ADI',  name: 'Alliances Dév. Immobilier',     sector: 'Immobilier'       },
  { symbol: 'CSEMA:RDS',  name: 'Résidences Dar Saada',          sector: 'Immobilier'       },
  { symbol: 'CSEMA:ARD',  name: 'Aradei Capital',                sector: 'Immobilier'       },
  { symbol: 'CSEMA:IMO',  name: 'Immorente Invest',              sector: 'Immobilier'       },
  { symbol: 'CSEMA:RIS',  name: 'Risma',                         sector: 'Immobilier'       },
  { symbol: 'CSEMA:BAL',  name: 'Balima',                        sector: 'Immobilier'       },
  // ── Pétrole, Gaz & Énergie ───────────────────────────────────────────────────
  { symbol: 'CSEMA:GAZ',  name: 'Afriquia Gaz',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TQM',  name: 'TAQA Morocco',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TMA',  name: 'TotalEnergies Marketing Maroc', sector: 'Énergie'          },
  // ── Agroalimentaire ──────────────────────────────────────────────────────────
  { symbol: 'CSEMA:CSR',  name: 'Cosumar',                       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LES',  name: 'Lesieur Cristal',               sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:OUL',  name: "Eaux Minérales d'Oulmès",       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:MUT',  name: 'Mutandis',                      sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:SBM',  name: 'Société des Boissons du Maroc', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:CRS',  name: 'Cartier Saada',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:DRI',  name: 'Dari Couspate',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:UMR',  name: 'Unimer',                        sector: 'Agroalimentaire'  },
  // ── Distribution ─────────────────────────────────────────────────────────────
  { symbol: 'CSEMA:LBV',  name: "Label'Vie",                     sector: 'Distribution'     },
  { symbol: 'CSEMA:ATH',  name: 'Auto Hall',                     sector: 'Distribution'     },
  { symbol: 'CSEMA:NEJ',  name: 'Auto Nejma',                    sector: 'Distribution'     },
  { symbol: 'CSEMA:NKL',  name: 'Ennakl Automobiles',            sector: 'Distribution'     },
  // ── Santé & Pharmacie ────────────────────────────────────────────────────────
  { symbol: 'CSEMA:SOT',  name: 'Sothema',                       sector: 'Santé'            },
  { symbol: 'CSEMA:AKT',  name: 'Akdital',                       sector: 'Santé'            },
  { symbol: 'CSEMA:PRO',  name: 'Promopharm',                    sector: 'Santé'            },
  // ── Technologie & IT ─────────────────────────────────────────────────────────
  { symbol: 'CSEMA:HPS',  name: 'HPS (Hightech Payment)',        sector: 'Technologie'      },
  { symbol: 'CSEMA:S2M',  name: 'S2M (Monétique)',               sector: 'Technologie'      },
  { symbol: 'CSEMA:MIC',  name: 'Microdata',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:DYT',  name: 'Disty Technologies',            sector: 'Technologie'      },
  { symbol: 'CSEMA:M2M',  name: 'M2M Group',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:INV',  name: 'Involys',                       sector: 'Technologie'      },
  { symbol: 'CSEMA:IBC',  name: 'IB Maroc.com',                  sector: 'Technologie'      },
  { symbol: 'CSEMA:CMG',  name: 'CMGP Group',                    sector: 'Technologie'      },
  { symbol: 'CSEMA:DWY',  name: 'Disway',                        sector: 'Technologie'      },
  // ── Transport & Logistique ───────────────────────────────────────────────────
  { symbol: 'CSEMA:MSA',  name: 'Marsa Maroc',                   sector: 'Transport'        },
  { symbol: 'CSEMA:CTM',  name: 'CTM',                           sector: 'Transport'        },
  { symbol: 'CSEMA:CAP',  name: 'Cash Plus',                     sector: 'Transport'        },
  // ── Industrie & Conglomérats ─────────────────────────────────────────────────
  { symbol: 'CSEMA:DHO',  name: 'Delta Holding',                 sector: 'Industrie'        },
  { symbol: 'CSEMA:SID',  name: 'SONASID',                       sector: 'Industrie'        },
  { symbol: 'CSEMA:SNA',  name: 'Stokvis Nord Afrique',          sector: 'Industrie'        },
  { symbol: 'CSEMA:FBR',  name: 'Fenie Brossette',               sector: 'Industrie'        },
  { symbol: 'CSEMA:MOX',  name: 'Maghreb Oxygène',               sector: 'Industrie'        },
  { symbol: 'CSEMA:SRM',  name: 'Réalisations Mécaniques',       sector: 'Industrie'        },
  { symbol: 'CSEMA:MDP',  name: 'Med Paper',                     sector: 'Industrie'        },
  { symbol: 'CSEMA:AFI',  name: 'Afric Industries',              sector: 'Industrie'        },
  { symbol: 'CSEMA:SNP',  name: 'SNEP',                          sector: 'Industrie'        },
  { symbol: 'CSEMA:COL',  name: 'Colorado',                      sector: 'Industrie'        },
  // ── Autres & Divers ──────────────────────────────────────────────────────────
  { symbol: 'CSEMA:VCN',  name: 'Vicenne',                       sector: 'Holding'          },
  { symbol: 'CSEMA:REB',  name: 'Rebab Company',                 sector: 'Holding'          },
];

export const metadata = {
  title: 'Marchés | WallStreet Morocco',
  description: 'Suivez le MASI et les 77 actions marocaines par secteur en temps réel',
};

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Ticker tape */}
      <div className="bg-[#061020] border-b border-[#C9A84C]/10">
        <TradingViewTicker />
      </div>

      {/* Page header */}
      <div className="bg-[#0A1628] border-b border-[#C9A84C]/10 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="gold-bar mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A84C]/12 border border-[#C9A84C]/25 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display">Marchés Marocains</h1>
              <p className="text-[#A8B4C8] text-sm font-sans">Données en temps réel · Bourse de Casablanca · 77 valeurs</p>
            </div>
          </div>
        </div>
      </div>

      <EduBannerInline />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0 space-y-3">
        <FinancialDisclaimer variant="short" />
        <ChatHint
          storageKey="wsma_hint_market"
          icon="💬"
          message="Des questions sur une valeur ? Demandez à l'assistant IA."
          ctaLabel="Ouvrir l'assistant"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left: Main content (3 cols) */}
          <div className="xl:col-span-3 space-y-6">
            {/* MASI Advanced Chart */}
            <div className="bg-[#112240] rounded-2xl border border-[#C9A84C]/12 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1A3050] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe2 className="w-5 h-5 text-[#C9A84C]" />
                  <div>
                    <h2 className="font-bold text-white font-display">MASI — Graphique Avancé</h2>
                    <p className="text-xs text-[#A8B4C8] font-sans">Indice Marocain de toutes les valeurs</p>
                  </div>
                </div>
                <span className="text-xs bg-[#2ECC71]/10 text-[#2ECC71] font-semibold px-2.5 py-1 rounded-full border border-[#2ECC71]/20 font-sans">Live</span>
              </div>
              <TradingViewChart symbol="CSEMA:MASI" height={450} theme="dark" interval="D" showToolbar={true} />
            </div>

            {/* Market Summary — unchanged */}
            <MarketSummary />

            {/* Placement 8: permanent support strip */}
            <MarchesSupport />
            <EduBannerInline />

            {/* Stocks by sector */}
            <MarketStockGrid assets={ASSETS} />
          </div>

          {/* Right: Watchlist sidebar — unchanged */}
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
