import dynamic from 'next/dynamic';
import { Activity, BarChart2, Clock, Globe2, Layers, TrendingUp, LayoutGrid } from 'lucide-react';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';

const TradingViewTicker   = dynamic(() => import('@/components/market/TradingViewTicker'),   { ssr: false });
const TradingViewChart    = dynamic(() => import('@/components/market/TradingViewChart'),    { ssr: false });
const WatchlistPanel      = dynamic(() => import('@/components/market/WatchlistPanel'),      { ssr: false });
const MarketSummary       = dynamic(() => import('@/components/market/MarketSummary'),       { ssr: false });
const MarketStockGrid     = dynamic(() => import('@/components/market/MarketStockGrid'),     { ssr: false });
const MarketHeatmap       = dynamic(() => import('@/components/market/MarketHeatmap'),       { ssr: false });
const ChatHint            = dynamic(() => import('@/components/chat/ChatHint'),              { ssr: false });

// ── All 77 CSEMA stocks ────────────────────────────────────────────────────────
const ASSETS = [
  { symbol: 'CSEMA:ATW',  name: 'Attijariwafa Bank',              sector: 'Banque'           },
  { symbol: 'CSEMA:BCP',  name: 'Banque Centrale Populaire',      sector: 'Banque'           },
  { symbol: 'CSEMA:BOA',  name: 'Bank of Africa',                 sector: 'Banque'           },
  { symbol: 'CSEMA:CIH',  name: 'CIH Bank',                      sector: 'Banque'           },
  { symbol: 'CSEMA:CDM',  name: 'Crédit du Maroc',                sector: 'Banque'           },
  { symbol: 'CSEMA:CFG',  name: 'CFG Bank',                       sector: 'Banque'           },
  { symbol: 'CSEMA:BCI',  name: 'BMCI',                           sector: 'Banque'           },
  { symbol: 'CSEMA:WAA',  name: 'Wafa Assurance',                 sector: 'Assurance'        },
  { symbol: 'CSEMA:ATL',  name: 'AtlantaSanad',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:SAH',  name: 'Sanlam Maroc',                   sector: 'Assurance'        },
  { symbol: 'CSEMA:AGM',  name: 'Agma',                           sector: 'Assurance'        },
  { symbol: 'CSEMA:AFM',  name: 'AFMA',                           sector: 'Assurance'        },
  { symbol: 'CSEMA:EQD',  name: 'EQDOM',                          sector: 'Crédit'           },
  { symbol: 'CSEMA:SLF',  name: 'Salafin',                        sector: 'Crédit'           },
  { symbol: 'CSEMA:MAB',  name: 'Maghreb Crédit-bail',            sector: 'Crédit'           },
  { symbol: 'CSEMA:MLE',  name: 'Maroc Leasing',                  sector: 'Crédit'           },
  { symbol: 'CSEMA:IAM',  name: 'Maroc Telecom',                  sector: 'Télécoms'         },
  { symbol: 'CSEMA:MNG',  name: 'Managem',                        sector: 'Mines'            },
  { symbol: 'CSEMA:SMI',  name: 'SMI (Imiter)',                   sector: 'Mines'            },
  { symbol: 'CSEMA:CMT',  name: 'Compagnie Minière de Touissit',  sector: 'Mines'            },
  { symbol: 'CSEMA:ZDJ',  name: 'Zellidja',                       sector: 'Mines'            },
  { symbol: 'CSEMA:ALM',  name: 'Aluminium du Maroc',             sector: 'Mines'            },
  { symbol: 'CSEMA:LHM',  name: 'LafargeHolcim Maroc',           sector: 'BTP'              },
  { symbol: 'CSEMA:CMA',  name: 'Ciments du Maroc',              sector: 'BTP'              },
  { symbol: 'CSEMA:GTM',  name: 'TGCC (Travaux du Maroc)',        sector: 'BTP'              },
  { symbol: 'CSEMA:TGC',  name: 'TGCC SA',                        sector: 'BTP'              },
  { symbol: 'CSEMA:JET',  name: 'Jet Contractors',               sector: 'BTP'              },
  { symbol: 'CSEMA:STR',  name: 'Stroc Industrie',               sector: 'BTP'              },
  { symbol: 'CSEMA:ADH',  name: 'Addoha',                        sector: 'Immobilier'       },
  { symbol: 'CSEMA:ADI',  name: 'Alliances Dév. Immobilier',     sector: 'Immobilier'       },
  { symbol: 'CSEMA:RDS',  name: 'Résidences Dar Saada',          sector: 'Immobilier'       },
  { symbol: 'CSEMA:ARD',  name: 'Aradei Capital',                sector: 'Immobilier'       },
  { symbol: 'CSEMA:IMO',  name: 'Immorente Invest',              sector: 'Immobilier'       },
  { symbol: 'CSEMA:RIS',  name: 'Risma',                         sector: 'Immobilier'       },
  { symbol: 'CSEMA:BAL',  name: 'Balima',                        sector: 'Immobilier'       },
  { symbol: 'CSEMA:GAZ',  name: 'Afriquia Gaz',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TQM',  name: 'TAQA Morocco',                  sector: 'Énergie'          },
  { symbol: 'CSEMA:TMA',  name: 'TotalEnergies Marketing Maroc', sector: 'Énergie'          },
  { symbol: 'CSEMA:CSR',  name: 'Cosumar',                       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LES',  name: 'Lesieur Cristal',               sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:OUL',  name: "Eaux Minérales d'Oulmès",       sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:MUT',  name: 'Mutandis',                      sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:SBM',  name: 'Société des Boissons du Maroc', sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:CRS',  name: 'Cartier Saada',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:DRI',  name: 'Dari Couspate',                 sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:UMR',  name: 'Unimer',                        sector: 'Agroalimentaire'  },
  { symbol: 'CSEMA:LBV',  name: "Label'Vie",                     sector: 'Distribution'     },
  { symbol: 'CSEMA:ATH',  name: 'Auto Hall',                     sector: 'Distribution'     },
  { symbol: 'CSEMA:NEJ',  name: 'Auto Nejma',                    sector: 'Distribution'     },
  { symbol: 'CSEMA:NKL',  name: 'Ennakl Automobiles',            sector: 'Distribution'     },
  { symbol: 'CSEMA:SOT',  name: 'Sothema',                       sector: 'Santé'            },
  { symbol: 'CSEMA:AKT',  name: 'Akdital',                       sector: 'Santé'            },
  { symbol: 'CSEMA:PRO',  name: 'Promopharm',                    sector: 'Santé'            },
  { symbol: 'CSEMA:HPS',  name: 'HPS (Hightech Payment)',        sector: 'Technologie'      },
  { symbol: 'CSEMA:S2M',  name: 'S2M (Monétique)',               sector: 'Technologie'      },
  { symbol: 'CSEMA:MIC',  name: 'Microdata',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:DYT',  name: 'Disty Technologies',            sector: 'Technologie'      },
  { symbol: 'CSEMA:M2M',  name: 'M2M Group',                     sector: 'Technologie'      },
  { symbol: 'CSEMA:INV',  name: 'Involys',                       sector: 'Technologie'      },
  { symbol: 'CSEMA:IBC',  name: 'IB Maroc.com',                  sector: 'Technologie'      },
  { symbol: 'CSEMA:CMG',  name: 'CMGP Group',                    sector: 'Technologie'      },
  { symbol: 'CSEMA:DWY',  name: 'Disway',                        sector: 'Technologie'      },
  { symbol: 'CSEMA:MSA',  name: 'Marsa Maroc',                   sector: 'Transport'        },
  { symbol: 'CSEMA:CTM',  name: 'CTM',                           sector: 'Transport'        },
  { symbol: 'CSEMA:CAP',  name: 'Cash Plus',                     sector: 'Transport'        },
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
  { symbol: 'CSEMA:VCN',  name: 'Vicenne',                       sector: 'Holding'          },
  { symbol: 'CSEMA:REB',  name: 'Rebab Company',                 sector: 'Holding'          },
];

export const metadata = {
  title: 'Markets | WallStreet Morocco',
  description: 'Real-time market data, indices, sector heatmap, and top movers for the Bourse de Casablanca.',
};

// ── Reusable card shell (server component safe) ───────────────────────────────
function Card({
  title,
  subtitle,
  icon,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--gold)' }}>{icon}</span>
          <div>
            <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
              {title}
            </p>
            {subtitle && (
              <p className="font-body text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>

      {/* ── Ticker tape ─────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <TradingViewTicker />
      </div>

      {/* ── Page header with background image ──────────────────────────────── */}
      <div
        className="page-hero-bg"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/nick-chong-N__BnvQ_w18-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="container-max py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p
                className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] mb-1"
                style={{ color: 'var(--gold)' }}
              >
                Bourse de Casablanca
              </p>
              <h1
                className="font-display font-medium"
                style={{ fontSize: '32px', lineHeight: 1.1, color: 'var(--navy)' }}
              >
                Market Overview
              </h1>
              <p
                className="font-body text-[14px] mt-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Real-time prices, indices, sector heatmap, and top movers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Layers size={12} />,    label: '77 Securities' },
                { icon: <Globe2 size={12} />,    label: 'CSE · Casablanca' },
                { icon: <Clock size={12} />,     label: 'Mon–Fri 09:30–15:30' },
                { icon: <Activity size={12} />,  label: 'TradingView Feed' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[11.5px]"
                  style={{
                    backgroundColor: 'rgba(15,45,82,0.06)',
                    border: '1px solid rgba(15,45,82,0.12)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--gold)' }}>{m.icon}</span>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer + AI hint ─────────────────────────────────────────────── */}
      <div className="container-max pt-5 space-y-3">
        <FinancialDisclaimer variant="short" />
        <ChatHint
          storageKey="wsma_hint_market"
          icon=""
          message="Questions about a stock? Ask the AI assistant."
          ctaLabel="Open Assistant"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LAYOUT — 3-col main + 1-col sidebar
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="container-max py-7">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ── LEFT: main content (3 cols) ─────────────────────────────────── */}
          <div className="xl:col-span-3 space-y-6">

            {/* ── ROW 1: KEY MARKET INDICATORS (top movers / gainers / losers) ─ */}
            <MarketSummary />

            {/* ── ROW 2: MASI + MASI20 CHARTS (big, side by side) ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* MASI */}
              <div
                className="overflow-hidden rounded-[10px]"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={15} style={{ color: 'var(--gold)' }} />
                    <div>
                      <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                        MASI — All Shares Index
                      </p>
                      <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        77 companies · daily
                      </p>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 font-mono text-[10.5px] px-2.5 py-1 rounded-full"
                    style={{ color: 'var(--gain)', backgroundColor: 'var(--gain-bg)', border: '1px solid rgba(13,122,78,0.2)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow bg-current" />
                    LIVE
                  </span>
                </div>
                <TradingViewChart symbol="CSEMA:MASI" height={320} theme="light" interval="D" showToolbar={false} />
              </div>

              {/* MASI20 */}
              <div
                className="overflow-hidden rounded-[10px]"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={15} style={{ color: 'var(--gold)' }} />
                    <div>
                      <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                        MASI20 — Blue Chips Index
                      </p>
                      <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Top 20 most liquid stocks · daily
                      </p>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 font-mono text-[10.5px] px-2.5 py-1 rounded-full"
                    style={{ color: 'var(--gain)', backgroundColor: 'var(--gain-bg)', border: '1px solid rgba(13,122,78,0.2)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow bg-current" />
                    LIVE
                  </span>
                </div>
                <TradingViewChart symbol="CSEMA:MASI20" height={320} theme="light" interval="D" showToolbar={false} />
              </div>
            </div>

            {/* ── ROW 2b: MASI ADVANCED FULL-WIDTH CHART ────────────────────────── */}
            <div
              className="overflow-hidden rounded-[10px]"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 size={15} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      MASI — Advanced Chart
                    </p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Full interactive chart with drawing tools and indicators
                    </p>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1.5 font-mono text-[10.5px] px-2.5 py-1 rounded-full"
                  style={{ color: 'var(--gain)', backgroundColor: 'var(--gain-bg)', border: '1px solid rgba(13,122,78,0.2)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow bg-current" />
                  LIVE
                </span>
              </div>
              <TradingViewChart symbol="CSEMA:MASI" height={480} theme="light" interval="D" showToolbar={true} />
            </div>

            {/* ── ROW 3: HEATMAP — STOCKS + SECTORS (toggle) ───────────────────── */}
            <div
              className="overflow-hidden rounded-[10px]"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid size={15} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      Market Heatmap
                    </p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      78 stocks & 13 sectors — daily performance · click any tile to expand
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <MarketHeatmap />
              </div>
            </div>

            {/* ── ROW 4: ALL STOCKS BY SECTOR ──────────────────────────────────── */}
            <div
              className="overflow-hidden rounded-[10px]"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={15} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p className="font-body font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      All Securities — Bourse de Casablanca
                    </p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      77 companies · 13 sectors · real-time prices
                    </p>
                  </div>
                </div>
                <span
                  className="font-mono text-[11px] px-2 py-0.5 rounded-[4px]"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  CSE · CSEMA
                </span>
              </div>
              <div className="p-5">
                <MarketStockGrid assets={ASSETS} />
              </div>
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
