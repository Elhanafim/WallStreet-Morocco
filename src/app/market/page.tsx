import dynamic from 'next/dynamic';
import { Activity, BarChart2, TrendingUp, Clock, Globe2, Layers } from 'lucide-react';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';

const TradingViewTicker   = dynamic(() => import('@/components/market/TradingViewTicker'),   { ssr: false });
const TradingViewChart    = dynamic(() => import('@/components/market/TradingViewChart'),    { ssr: false });
const WatchlistPanel      = dynamic(() => import('@/components/market/WatchlistPanel'),      { ssr: false });
const MarketSummary       = dynamic(() => import('@/components/market/MarketSummary'),       { ssr: false });
const MarketStockGrid     = dynamic(() => import('@/components/market/MarketStockGrid'),     { ssr: false });
const ChatHint            = dynamic(() => import('@/components/chat/ChatHint'),              { ssr: false });

// ── All 77 CSEMA stocks ────────────────────────────────────────────────────────
const ASSETS = [
  // Banks
  { symbol: 'CSEMA:ATW',  name: 'Attijariwafa Bank',              sector: 'Banque'           },
  { symbol: 'CSEMA:BCP',  name: 'Banque Centrale Populaire',      sector: 'Banque'           },
  { symbol: 'CSEMA:BOA',  name: 'Bank of Africa',                 sector: 'Banque'           },
  { symbol: 'CSEMA:CIH',  name: 'CIH Bank',                      sector: 'Banque'           },
  { symbol: 'CSEMA:CDM',  name: 'Crédit du Maroc',                sector: 'Banque'           },
  { symbol: 'CSEMA:CFG',  name: 'CFG Bank',                       sector: 'Banque'           },
  { symbol: 'CSEMA:BCI',  name: 'BMCI',                           sector: 'Banque'           },
  // Insurance
  { symbol: 'CSEMA:WAA',  name: 'Wafa Assurance',                 sector: 'Assurance'        },
  { symbol: 'CSEMA:ATL',  name: 'AtlantaSanad',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:SAH',  name: 'Sanlam Maroc',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:AGM',  name: 'Agma',                           sector: 'Assurance'        },
  { symbol: 'CSEMA:AFM',  name: 'AFMA',                           sector: 'Assurance'        },
  // Credit
  { symbol: 'CSEMA:EQD',  name: 'EQDOM',                          sector: 'Crédit'           },
  { symbol: 'CSEMA:SLF',  name: 'Salafin',                        sector: 'Crédit'           },
  { symbol: 'CSEMA:MAB',  name: 'Maghreb Crédit-bail',            sector: 'Crédit'           },
  { symbol: 'CSEMA:MLE',  name: 'Maroc Leasing',                  sector: 'Crédit'           },
  // Telecoms
  { symbol: 'CSEMA:IAM',  name: 'Maroc Telecom',                  sector: 'Télécoms'         },
  // Mining & Materials
  { symbol: 'CSEMA:MNG',  name: 'Managem',                        sector: 'Mines'            },
  { symbol: 'CSEMA:SMI',  name: 'SMI (Imiter)',                   sector: 'Mines'            },
  { symbol: 'CSEMA:CMT',  name: 'Compagnie Minière de Touissit',  sector: 'Mines'            },
  { symbol: 'CSEMA:ZDJ',  name: 'Zellidja',                       sector: 'Mines'            },
  { symbol: 'CSEMA:ALM',  name: 'Aluminium du Maroc',             sector: 'Mines'            },
  // Construction
  { symbol: 'CSEMA:LHM',  name: 'LafargeHolcim Maroc',           sector: 'BTP'              },
  { symbol: 'CSEMA:CMA',  name: 'Ciments du Maroc',              sector: 'BTP'              },
  { symbol: 'CSEMA:GTM',  name: 'TGCC (Travaux du Maroc)',        sector: 'BTP'              },
  { symbol: 'CSEMA:TGC',  name: 'TGCC SA',                        sector: 'BTP'              },
  { symbol: 'CSEMA:JET',  name: 'Jet Contractors',               sector: 'BTP'              },
  { symbol: 'CSEMA:STR',  name: 'Stroc Industrie',               sector: 'BTP'              },
  // Real Estate
  { symbol: 'CSEMA:ADH',  name: 'Addoha',                        sector: 'Immobilier'       },
  { symbol: 'CSEMA:ADI',  name: 'Alliances Dév. Immobilier',     sector: 'Immobilier'       },
  { symbol: 'CSEMA:RDS',  name: 'Résidences Dar Saada',          sector: 'Immobilier'       },
  { symbol: 'CSEMA:ARD',  name: 'Aradei Capital',                sector: 'Immobilier'       },
  { symbol: 'CSEMA:IMO',  name: 'Immorente Invest',              sector: 'Immobilier'       },
  { symbol: 'CSEMA:RIS',  name: 'Risma',                         sector: 'Immobilier'       },
  { symbol: 'CSEMA:BAL',  name: 'Balima',                        sector: 'Immobilier'       },
  // Energy
  { symbol: 'CSEMA:GAZ',  name: 'Afriquia Gaz',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TQM',  name: 'TAQA Morocco',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TMA',  name: 'TotalEnergies Marketing Maroc', sector: 'Énergie'          },
  // Agri-food
  { symbol: 'CSEMA:CSR',  name: 'Cosumar',                       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LES',  name: 'Lesieur Cristal',               sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:OUL',  name: "Eaux Minérales d'Oulmès",       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:MUT',  name: 'Mutandis',                      sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:SBM',  name: 'Société des Boissons du Maroc', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:CRS',  name: 'Cartier Saada',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:DRI',  name: 'Dari Couspate',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:UMR',  name: 'Unimer',                        sector: 'Agroalimentaire'  },
  // Distribution
  { symbol: 'CSEMA:LBV',  name: "Label'Vie",                     sector: 'Distribution'     },
  { symbol: 'CSEMA:ATH',  name: 'Auto Hall',                     sector: 'Distribution'     },
  { symbol: 'CSEMA:NEJ',  name: 'Auto Nejma',                    sector: 'Distribution'     },
  { symbol: 'CSEMA:NKL',  name: 'Ennakl Automobiles',            sector: 'Distribution'     },
  // Healthcare & Pharma
  { symbol: 'CSEMA:SOT',  name: 'Sothema',                       sector: 'Santé'            },
  { symbol: 'CSEMA:AKT',  name: 'Akdital',                       sector: 'Santé'            },
  { symbol: 'CSEMA:PRO',  name: 'Promopharm',                    sector: 'Santé'            },
  // Technology & IT
  { symbol: 'CSEMA:HPS',  name: 'HPS (Hightech Payment)',        sector: 'Technologie'      },
  { symbol: 'CSEMA:S2M',  name: 'S2M (Monétique)',               sector: 'Technologie'      },
  { symbol: 'CSEMA:MIC',  name: 'Microdata',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:DYT',  name: 'Disty Technologies',            sector: 'Technologie'      },
  { symbol: 'CSEMA:M2M',  name: 'M2M Group',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:INV',  name: 'Involys',                       sector: 'Technologie'      },
  { symbol: 'CSEMA:IBC',  name: 'IB Maroc.com',                  sector: 'Technologie'      },
  { symbol: 'CSEMA:CMG',  name: 'CMGP Group',                    sector: 'Technologie'      },
  { symbol: 'CSEMA:DWY',  name: 'Disway',                        sector: 'Technologie'      },
  // Transport & Logistics
  { symbol: 'CSEMA:MSA',  name: 'Marsa Maroc',                   sector: 'Transport'        },
  { symbol: 'CSEMA:CTM',  name: 'CTM',                           sector: 'Transport'        },
  { symbol: 'CSEMA:CAP',  name: 'Cash Plus',                     sector: 'Transport'        },
  // Industry & Conglomerates
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
  // Holdings & Other
  { symbol: 'CSEMA:VCN',  name: 'Vicenne',                       sector: 'Holding'          },
  { symbol: 'CSEMA:REB',  name: 'Rebab Company',                 sector: 'Holding'          },
];

// ── Market breadcrumb sections ─────────────────────────────────────────────────
const MARKET_META = [
  { icon: <Layers size={13} />, label: '77 Securities' },
  { icon: <Globe2 size={13} />, label: 'Bourse de Casablanca' },
  { icon: <Clock size={13} />,  label: 'Mon – Fri · 09:30 – 15:30' },
  { icon: <Activity size={13} />, label: 'TradingView Data Feed' },
];

export const metadata = {
  title: 'Markets | WallStreet Morocco',
  description: 'Real-time market data for all 77 companies listed on the Bourse de Casablanca — MASI, indices, sectors.',
};

export default function MarketPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>

      {/* ── Ticker tape ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <TradingViewTicker />
      </div>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Gold top accent */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--gold) 0%, transparent 60%)' }} />

        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Title block */}
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-[8px] flex-shrink-0"
                style={{
                  backgroundColor: 'var(--gold-subtle)',
                  border: '1px solid rgba(201,168,76,0.25)',
                }}
              >
                <BarChart2 size={18} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <h1
                  className="font-display font-medium"
                  style={{ fontSize: '28px', color: 'var(--text-primary)', lineHeight: 1.15 }}
                >
                  Moroccan Markets
                </h1>
                <p
                  className="font-body text-[13px] mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Live prices, charts, and sector analysis — Bourse de Casablanca
                </p>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2">
              {MARKET_META.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[11.5px]"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{m.icon}</span>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer + AI hint ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-5 pb-0 space-y-3">
        <FinancialDisclaimer variant="short" />
        <ChatHint
          storageKey="wsma_hint_market"
          icon=""
          message="Questions about a stock? Ask the AI assistant."
          ctaLabel="Open Assistant"
        />
      </div>

      {/* ── Main layout: 3-col left + 1-col right ───────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ── LEFT: Main content (3 cols) ─────────────────────────────────── */}
          <div className="xl:col-span-3 space-y-6">

            {/* MASI Chart */}
            <div
              className="overflow-hidden rounded-[10px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-[6px]"
                    style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <TrendingUp size={15} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <h2
                      className="font-display font-medium"
                      style={{ fontSize: '17px', color: 'var(--text-primary)' }}
                    >
                      MASI — All Shares Index
                    </h2>
                    <p
                      className="font-body text-[12px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Moroccan All Shares Index · Daily chart
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full"
                    style={{
                      color: 'var(--gain)',
                      backgroundColor: 'var(--gain-bg)',
                      border: '1px solid rgba(61,184,122,0.2)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                      style={{ backgroundColor: 'var(--gain)' }}
                    />
                    LIVE
                  </span>
                </div>
              </div>
              <TradingViewChart symbol="CSEMA:MASI" height={460} theme="dark" interval="D" showToolbar={true} />
            </div>

            {/* Market Summary: Movers + MSI20 */}
            <MarketSummary />

            {/* All stocks by sector */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="section-label">All Securities</span>
                <span
                  className="font-mono text-[11px] px-2 py-0.5 rounded-[4px]"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  77 companies · 14 sectors
                </span>
              </div>
              <MarketStockGrid assets={ASSETS} />
            </div>
          </div>

          {/* ── RIGHT: Watchlist sidebar ─────────────────────────────────────── */}
          <div className="xl:col-span-1">
            <div className="sticky top-[72px] space-y-4">
              <WatchlistPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
