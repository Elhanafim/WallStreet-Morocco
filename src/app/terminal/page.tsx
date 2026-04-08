'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import ValuesFinancials from '@/components/terminal/ValuesFinancials';
import { Roboto_Mono, Inter } from 'next/font/google';
import MarketIndicators from '@/components/terminal/MarketIndicators';

import {
  fetchSnapshot,
  fetchMovers,
  type BVCPrice,
  type BVCMovers,
  getMarketStatus,
} from '@/lib/bvcPriceService';
import { BVC_STOCKS_78, DA_PARENT_MAP, DA_TICKERS, BOND_TICKERS } from '@/lib/constants';
import { BVC_COMPANIES } from '@/lib/data/bvcCompanies';
import AmmcTerminalDisplay from '@/components/terminal/AmmcTerminalDisplay';


const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-[#FF9800] text-xs" style={robotoMono.style}>
      CHARGEMENT GRAPHIQUE...
    </div>
  ),
});

// ── Bloomberg color tokens (Fintech Dark Theme) ────────────────────────────────
const BB_ORANGE = '#FF9800';  
const BB_GREEN  = '#00E676';  
const BB_RED    = '#FF1744';  
const BB_YELLOW = '#FFD700';  
const BB_CYAN   = '#00E5FF';  
const BB_WHITE  = '#FFFFFF';  
const BB_MUTED  = '#8B95A1';
const BB_BORDER = '#1E293B';
const BB_BG     = '#040914';

// ── Types ──────────────────────────────────────────────────────────────────────
type ActiveTab   = 'OVERVIEW' | 'EQUITIES' | 'OPCVM' | 'MACRO' | 'FINANCIALS' | 'CAPITAL_MARKET';
type QuickFilter = 'ALL' | 'TOP' | 'PIRES' | 'VOLUME';
type SortField   = 'TICKER' | 'PRICE' | 'CHANGE' | 'VOLUME';
type SortDir     = 'ASC' | 'DESC';
type PanelBTab   = 1 | 2 | 3;
// Three exclusive sub-filters inside the Valeurs BVC tab
type EquitiesSubFilter = 'ACTIONS' | 'DA' | 'OPCVM';
// Two heatmap display modes in Aperçu de marché
type HeatmapView = 'SECTORS' | 'STOCKS';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtPrice(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(2);
}

function fmtVolume(n: number | null | undefined): string {
  if (!n || isNaN(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function fmtPct(pct: number | null | undefined): string {
  if (pct == null || isNaN(pct)) return '—';
  const sign = pct >= 0 ? '▲ +' : '▼ ';
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

function getSignal(pct: number | null | undefined): 'HAUSSIER' | 'NEUTRE' | 'BAISSIER' {
  if (pct == null) return 'NEUTRE';
  if (pct >  1.5) return 'HAUSSIER';
  if (pct < -1.5) return 'BAISSIER';
  return 'NEUTRE';
}

function pctColor(pct: number | null | undefined): string {
  if (pct == null) return BB_MUTED;
  if (pct > 0) return BB_GREEN;
  if (pct < 0) return BB_RED;
  return BB_MUTED;
}

function fmtPerf(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function PanelHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 flex-shrink-0 text-[#000] text-xs font-bold uppercase tracking-widest ${inter.className}`}
      style={{ background: BB_ORANGE }}
    >
      <span>{title}</span>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

const StockRow = memo(function StockRow({
  stock, isHighlighted, isSelected, isFlashing, onClick,
}: {
  stock: BVCPrice; isHighlighted: boolean; isSelected: boolean; isFlashing: boolean; onClick: () => void;
}) {
  const { t } = useTranslation('terminal');
  const signal = getSignal(stock.changePercent);
  const sigColor = signal === 'HAUSSIER' ? BB_GREEN : signal === 'BAISSIER' ? BB_RED : BB_YELLOW;
  const sigBg    = signal === 'HAUSSIER' ? '#00e67610' : signal === 'BAISSIER' ? '#ff174410' : '#ffd70010';
  const sigKey   = signal === 'HAUSSIER' ? 'signal_bullish' : signal === 'BAISSIER' ? 'signal_bearish' : 'signal_neutral';

  const bg = isSelected
    ? '#1a2235'
    : isHighlighted
    ? '#111827'
    : isFlashing
    ? (stock.changePercent ?? 0) >= 0 ? '#004d40' : '#4a0000'
    : 'transparent';

  return (
    <div
      onClick={onClick}
      className="grid items-center gap-2 select-none transition-colors duration-150 hover:bg-[#111827] cursor-pointer"
      style={{
        background: bg,
        borderLeft: isSelected ? `2px solid ${BB_ORANGE}` : '2px solid transparent',
        borderBottom: `1px solid ${BB_BORDER}`,
        ...robotoMono.style,
        fontSize: '12px',
        color: BB_WHITE,
        gridTemplateColumns: '70px minmax(120px, 1fr) 70px 80px 70px 90px',
        padding: '6px 8px',
      }}
    >
      <span className="font-bold flex-shrink-0 truncate" style={{ color: BB_CYAN }}>{stock.ticker}</span>
      <span className="truncate" style={{ color: BB_MUTED }}>{stock.name}</span>
      <span className="text-right font-bold tabular-nums">{fmtPrice(stock.lastPrice)}</span>
      <span className="text-right font-bold tabular-nums" style={{ color: pctColor(stock.changePercent) }}>
        {fmtPct(stock.changePercent)}
      </span>
      <span className="text-right tabular-nums" style={{ color: BB_MUTED }}>{fmtVolume(stock.volume)}</span>
      <span className="flex items-center justify-center">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ color: sigColor, border: `1px solid ${sigColor}55`, background: sigBg }}
          title={t('signal_tooltip')}
        >
          {t(sigKey)}
        </span>
      </span>
    </div>
  );
});

function FearGreedGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const zones = [
    { label: 'EXTRÊME PEUR', color: BB_RED,    pct: 20 },
    { label: 'PEUR',         color: '#FF6D00', pct: 20 },
    { label: 'NEUTRE',       color: BB_YELLOW, pct: 20 },
    { label: 'OPTIMISME',    color: '#88cc00', pct: 20 },
    { label: 'EUPHORIE',     color: BB_GREEN,  pct: 20 },
  ];
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-1" style={robotoMono.style}>
        <span className="text-xs font-bold" style={{ color: BB_MUTED }}>0</span>
        <span className="text-base font-bold" style={{ color }}>{score}</span>
        <span className="text-xs font-bold" style={{ color: BB_MUTED }}>100</span>
      </div>
      <div className="h-2 w-full flex rounded-none overflow-hidden" style={{ border: `1px solid ${BB_BORDER}` }}>
        {zones.map((z) => (
          <div key={z.label} style={{ width: `${z.pct}%`, background: z.color, opacity: 0.4 }} />
        ))}
      </div>
      <div className="relative h-2 w-full mt-0.5">
        <div
          className="absolute top-0 w-1 h-3"
          style={{ left: `${Math.min(99, score)}%`, background: color, transform: 'translateX(-50%)' }}
        />
      </div>
      <p className="text-center mt-2 text-sm font-bold" style={{ color, ...robotoMono.style }}>
        {label}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TerminalPage() {
  const { t } = useTranslation('terminal');

  // ── Data state ───────────────────────────────────────────────────────────────
  const [stocks,  setStocks]  = useState<BVCPrice[]>([]);
  const [movers,  setMovers]  = useState<BVCMovers | null>(null);
  const [loading, setLoading]  = useState(true);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]       = useState<ActiveTab>('OVERVIEW');
  const [selectedTicker,  setSelectedTicker]  = useState<BVCPrice | null>(null);
  const [search,          setSearch]          = useState('');
  const [quickFilter,     setQuickFilter]     = useState<QuickFilter>('ALL');
  const [sortField,       setSortField]       = useState<SortField>('TICKER');
  const [sortDir,         setSortDir]         = useState<SortDir>('ASC');
  const [highlightedRow,  setHighlightedRow]  = useState(0);
  const [panelBTab,       setPanelBTab]       = useState<PanelBTab>(1);
  const [showHelp,        setShowHelp]        = useState(false);
  const [cmdValue,        setCmdValue]        = useState('');
  const [cmdMsg,          setCmdMsg]          = useState('');
  const [clock,           setClock]           = useState('');
  const [flashTickers,    setFlashTickers]    = useState<Set<string>>(new Set());

  // ── Valeurs BVC sub-filter state ─────────────────────────────────────────────
  const [equitiesSubFilter, setEquitiesSubFilter] = useState<EquitiesSubFilter>('ACTIONS');
  const [sectorFilter,      setSectorFilter]      = useState<string>('ALL');
  // History of last 5 viewed stocks for the Données stock switcher (Task 2)
  const [lastViewedStocks,  setLastViewedStocks]  = useState<string[]>([]);
  // Heatmap display mode in Aperçu de marché
  const [heatmapView,       setHeatmapView]       = useState<HeatmapView>('SECTORS');

  const cmdRef         = useRef<HTMLInputElement>(null);
  const searchRef      = useRef<HTMLInputElement>(null);
  const prevPricesRef  = useRef<Map<string, number>>(new Map());
  const listRef        = useRef<HTMLDivElement>(null);

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString('fr-MA', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [snap, mv] = await Promise.all([fetchSnapshot(), fetchMovers()]);
      const flash = new Set<string>();
      for (const s of snap) {
        const prev = prevPricesRef.current.get(s.ticker);
        if (prev !== undefined && prev !== s.lastPrice) flash.add(s.ticker);
        prevPricesRef.current.set(s.ticker, s.lastPrice);
      }
      if (flash.size > 0) {
        setFlashTickers(flash);
        setTimeout(() => setFlashTickers(new Set()), 700);
      }
      setStocks(snap);
      setMovers(mv);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 60_000);
    return () => clearInterval(id);
  }, [loadData]);

  // ── Computed values ──────────────────────────────────────────────────────────
  // Equity-only list: exclude DA instruments, bonds, and legacy space-format tickers.
  const equityStocks = useMemo(
    () => stocks.filter(s =>
      !s.ticker.includes(' ') &&
      !DA_TICKERS.has(s.ticker) &&
      !BOND_TICKERS.has(s.ticker)
    ),
    [stocks]
  );

  // DA instruments: actual BVC DA ticker codes (e.g. AADHA, AATHA, …)
  // plus legacy space-format tickers returned by older API responses.
  const daStocks = useMemo(
    () => stocks.filter(s => DA_TICKERS.has(s.ticker) || s.ticker.includes(' ')),
    [stocks]
  );

  const filtered = useMemo(() => {
    // DA sub-tab: show only DA instruments, filtered by search text
    if (equitiesSubFilter === 'DA') {
      if (!search.trim()) return daStocks;
      const q = search.toLowerCase();
      return daStocks.filter(s =>
        s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    // ACTIONS sub-tab: restrict to official 78 BVC stocks
    let list = equityStocks.filter(s => BVC_STOCKS_78.includes(s.ticker));
    // Fallback: if API hasn't returned the official list yet, show all equities
    if (list.length === 0) list = [...equityStocks];

    // Sector sub-filter (Actions only)
    if (sectorFilter !== 'ALL') {
      list = list.filter(s => (BVC_COMPANIES[s.ticker]?.sector ?? '') === sectorFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (quickFilter === 'TOP')    return list.sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 10);
    if (quickFilter === 'PIRES')  return list.sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0)).slice(0, 10);
    if (quickFilter === 'VOLUME') return list.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    list.sort((a, b) => {
      let valA: string | number, valB: string | number;
      if (sortField === 'TICKER') { valA = a.ticker; valB = b.ticker; }
      else if (sortField === 'PRICE') { valA = a.lastPrice ?? 0; valB = b.lastPrice ?? 0; }
      else if (sortField === 'CHANGE') { valA = a.changePercent ?? 0; valB = b.changePercent ?? 0; }
      else { valA = a.volume ?? 0; valB = b.volume ?? 0; }
      if (valA < valB) return sortDir === 'ASC' ? -1 : 1;
      if (valA > valB) return sortDir === 'ASC' ? 1 : -1;
      return 0;
    });
    return list;
  }, [equityStocks, daStocks, equitiesSubFilter, sectorFilter, search, quickFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    setQuickFilter('ALL');
    if (sortField === field) setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    else { setSortField(field); setSortDir(field === 'TICKER' ? 'ASC' : 'DESC'); }
  };

  const marketStatus = getMarketStatus();
  const advancers    = equityStocks.filter(s => (s.changePercent ?? 0) > 0).length;
  const decliners    = equityStocks.filter(s => (s.changePercent ?? 0) < 0).length;
  const stable       = equityStocks.length - advancers - decliners;
  const totalVolume  = equityStocks.reduce((sum, s) => sum + (s.volume ?? 0), 0);
  const avgChange    = equityStocks.length ? equityStocks.reduce((s, x) => s + (x.changePercent ?? 0), 0) / equityStocks.length : 0;

  // Fear & Greed
  const fgBreadth    = equityStocks.length ? (advancers / equityStocks.length) * 100 : 50;
  const fgMomentum   = Math.max(0, Math.min(100, 50 + avgChange * 10));
  const highVolCount = equityStocks.filter(s => Math.abs(s.changePercent ?? 0) > 2).length;
  const fgVolatility = equityStocks.length ? 100 - Math.min(100, (highVolCount / equityStocks.length) * 200) : 50;
  const fgScore      = Math.round(fgBreadth * 0.4 + fgMomentum * 0.3 + fgVolatility * 0.2 + 50 * 0.1);

  function fgLabel(s: number) {
    if (s < 20) return t('fg_fear_extreme');
    if (s < 40) return t('fg_fear');
    if (s < 60) return t('fg_neutral');
    if (s < 80) return t('fg_greed');
    return t('fg_extreme_greed');
  }
  function fgColor(s: number) {
    if (s < 20) return BB_RED;
    if (s < 40) return '#FF6D00';
    if (s < 60) return BB_YELLOW;
    if (s < 80) return '#88cc00';
    return BB_GREEN;
  }

  // ── Data: OPCVM & Macro


  const macroData = [
    { label: t('macro_bam'),      value: '2.75%',   source: 'BAM' },
    { label: t('macro_cpi'),      value: '4.1%',    source: 'HCP' },
    { label: t('macro_reserves'), value: '5.3 mois',source: 'BAM' },
    { label: t('macro_debt'),     value: '70.2%',   source: 'HCP' },
  ];
  const fxData = [
    { pair: 'USD/MAD', rate: '9.89', chg: '+0.03' },
    { pair: 'EUR/MAD', rate: '10.94',chg: '+0.01' },
    { pair: 'GBP/MAD', rate: '12.81',chg: '-0.02' },
    { pair: 'SAR/MAD', rate: '2.64', chg: '0.00' },
  ];

  // ── Keyboard CMD
  const handleCmd = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = cmdValue.trim().toUpperCase();
    setCmdValue('');
    if (!cmd) return;

    if (cmd === 'TOP')   { setActiveTab('EQUITIES'); setQuickFilter('TOP'); setCmdMsg('FILTRE: TOP 10 HAUSSES'); return; }
    if (cmd === 'PIRES') { setActiveTab('EQUITIES'); setQuickFilter('PIRES'); setCmdMsg('FILTRE: PIRES 10 BAISSES'); return; }
    if (cmd === 'CLR')   { setSearch(''); setQuickFilter('ALL'); setCmdMsg('FILTRES RÉINITIALISÉS'); return; }
    if (cmd === 'MASI')  { setActiveTab('OVERVIEW'); setCmdMsg('→ APERÇU MARCHÉ'); return; }
    if (cmd === 'MACRO') { setActiveTab('MACRO'); setCmdMsg('→ MACRO & FX'); return; }
    if (cmd === 'OPCVM') { setActiveTab('OPCVM'); setCmdMsg('→ FONDS OPCVM'); return; }
    if (cmd === 'FIN')   { setActiveTab('FINANCIALS'); setCmdMsg('→ DONNÉES'); return; }
    if (cmd === 'AMMC' || cmd === 'CAP') { setActiveTab('CAPITAL_MARKET'); setCmdMsg('→ MARCHÉ DES CAPITAUX'); return; }
    if (cmd === 'H' || cmd === 'HELP') { setShowHelp(true); return; }

    const found = stocks.find(s => s.ticker.toUpperCase() === cmd);
    if (found) {
      setActiveTab('EQUITIES');
      setSelectedTicker(found);
      setPanelBTab(1);
      setCmdMsg(`✓ VALEUR: ${found.ticker} — ${found.name.slice(0, 30)}`);
      return;
    }
    setCmdMsg(t('cmd_unknown'));
  }, [cmdValue, stocks, t]);

  /** Switch to a stock in the Données tab and record it in the recently-viewed history. */
  const switchToStock = useCallback((ticker: string) => {
    const found = stocks.find(s => s.ticker === ticker);
    if (!found) return;
    setSelectedTicker(found);
    setLastViewedStocks(prev => {
      const deduped = prev.filter(t => t !== ticker);
      return [ticker, ...deduped].slice(0, 5);
    });
  }, [stocks]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === cmdRef.current || document.activeElement === searchRef.current) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.altKey) {
        switch (e.key) {
          case '1': e.preventDefault(); setActiveTab('OVERVIEW'); break;
          case '2': e.preventDefault(); setActiveTab('EQUITIES'); break;
          case '3': e.preventDefault(); setActiveTab('OPCVM'); break;
          case '4': e.preventDefault(); setActiveTab('MACRO'); break;
          case '5': e.preventDefault(); setActiveTab('FINANCIALS'); break;
        }
        return;
      }

      switch (e.key) {
        case 'h': case 'H': setShowHelp(v => !v); break;
        case 't': case 'T': e.preventDefault(); cmdRef.current?.focus(); break;
        case 'r': case 'R': loadData(); setCmdMsg('RECHARGEMENT...'); break;
        case 'Escape': setShowHelp(false); setSelectedTicker(null); break;
        case 'ArrowDown':
          if (activeTab === 'EQUITIES') {
            e.preventDefault();
            setHighlightedRow(r => {
              const next = Math.min(r + 1, filtered.length - 1);
              if (listRef.current) {
                 const rowEl = listRef.current.children[next] as HTMLElement;
                 if (rowEl) rowEl.scrollIntoView({ block: 'nearest' });
              }
              return next;
            });
          }
          break;
        case 'ArrowUp':
          if (activeTab === 'EQUITIES') {
            e.preventDefault();
            setHighlightedRow(r => {
              const prev = Math.max(r - 1, 0);
              if (listRef.current) {
                 const rowEl = listRef.current.children[prev] as HTMLElement;
                 if (rowEl) rowEl.scrollIntoView({ block: 'nearest' });
              }
              return prev;
            });
          }
          break;
        case 'Enter':
          if (activeTab === 'EQUITIES' && filtered[highlightedRow]) {
            setSelectedTicker(filtered[highlightedRow]);
            setPanelBTab(1);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, highlightedRow, loadData, activeTab]);


  // ── RENDERERS FOR MODULES ────────────────────────────────────────────────────

  const renderOverview = () => {
    // ── Sector performance from live equity data ──────────────────────────────
    const SECTOR_MAP: Record<string, string> = {
      ATW: 'Banques',  BCP: 'Banques',  BOA: 'Banques',  CIH: 'Banques',  CDM: 'Banques',  CFG: 'Banques',  BCI: 'Banques',
      WAA: 'Assurance', ATL: 'Assurance', SAH: 'Assurance', AGM: 'Assurance', AFM: 'Assurance',
      EQD: 'Crédit', SLF: 'Crédit', MAB: 'Crédit', MLE: 'Crédit',
      IAM: 'Télécoms',
      MNG: 'Mines', SMI: 'Mines', CMT: 'Mines', ZDJ: 'Mines', ALM: 'Mines',
      LHM: 'BTP', CMA: 'BTP', GTM: 'BTP', TGC: 'BTP', JET: 'BTP', STR: 'BTP',
      ADH: 'Immobilier', ADI: 'Immobilier', RDS: 'Immobilier', ARD: 'Immobilier', IMO: 'Immobilier', RIS: 'Immobilier', BAL: 'Immobilier',
      GAZ: 'Énergie', TQM: 'Énergie', TMA: 'Énergie',
      CSR: 'Agroalim.', LES: 'Agroalim.', OUL: 'Agroalim.', MUT: 'Agroalim.', SBM: 'Agroalim.', CRS: 'Agroalim.', DRI: 'Agroalim.', UMR: 'Agroalim.',
      LBV: 'Distribution', ATH: 'Distribution', NEJ: 'Distribution', NKL: 'Distribution',
      SOT: 'Santé', AKT: 'Santé', PRO: 'Santé',
      HPS: 'Technologie', S2M: 'Technologie', MIC: 'Technologie', DYT: 'Technologie', M2M: 'Technologie', INV: 'Technologie', IBC: 'Technologie', CMG: 'Technologie', DWY: 'Technologie',
      MSA: 'Transport', CTM: 'Transport', CAP: 'Transport',
      DHO: 'Industrie', SID: 'Industrie', SNA: 'Industrie', FBR: 'Industrie', MOX: 'Industrie', SRM: 'Industrie', MDP: 'Industrie', AFI: 'Industrie', SNP: 'Industrie', COL: 'Industrie',
      VCN: 'Holding', REB: 'Holding',
    };

    const bySector: Record<string, number[]> = {};
    for (const s of equityStocks) {
      const sec = SECTOR_MAP[s.ticker] ?? 'Autres';
      if (!bySector[sec]) bySector[sec] = [];
      bySector[sec].push(s.changePercent ?? 0);
    }
    const sectorData = Object.entries(bySector)
      .map(([name, changes]) => ({
        name,
        count: changes.length,
        avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      }))
      .sort((a, b) => b.avgChange - a.avgChange);

    function sectorBg(p: number): string {
      if (p >= 2)  return '#0a2010';
      if (p > 0)   return '#071510';
      if (p > -2)  return '#200a0a';
      return '#2d0606';
    }
    function sectorFg(p: number): string {
      if (p >= 2)  return BB_GREEN;
      if (p > 0)   return '#4ade80';
      if (p > -2)  return '#f87171';
      return BB_RED;
    }

    // Ticker tape: top-volume stocks (up to 20)
    const tickerList = [...equityStocks]
      .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, 20);

    const gainers5 = movers?.gainers.slice(0, 5) ?? [];
    const losers5  = movers?.losers.slice(0, 5) ?? [];

    return (
      <div className="h-full overflow-y-auto" style={{ background: BB_BG, ...robotoMono.style }}>

        {/* ── CSS for scrolling ticker ── */}
        <style>{`
          @keyframes bb-scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
          .bb-scroll-track { animation: bb-scroll 45s linear infinite; }
          .bb-scroll-track:hover { animation-play-state: paused; }
        `}</style>

        {/* ── Scrolling activity ticker ── */}
        <div
          className="overflow-hidden border-b h-8 flex items-center"
          style={{ background: '#050b14', borderColor: BB_BORDER }}
          title="Survol pour pause · Classés par volume"
        >
          {tickerList.length > 0 ? (
            <div className="bb-scroll-track flex items-center whitespace-nowrap">
              {[...tickerList, ...tickerList].map((s, i) => (
                <span
                  key={`ticker-${i}`}
                  className="inline-flex items-center gap-2 px-4 h-8 text-[11px] font-bold border-r"
                  style={{ borderColor: BB_BORDER }}
                >
                  <span style={{ color: BB_CYAN }}>{s.ticker}</span>
                  <span className="tabular-nums" style={{ color: BB_WHITE }}>{fmtPrice(s.lastPrice)}</span>
                  <span className="tabular-nums" style={{ color: pctColor(s.changePercent) }}>
                    {(s.changePercent ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent ?? 0).toFixed(2)}%
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className="px-4 text-xs" style={{ color: BB_MUTED }}>Chargement du flux…</span>
          )}
        </div>

        <div className="p-4 md:p-5 space-y-4">

          {/* ── Indices bar ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>
              ■ INDICES BOURSIERS — BOURSE DE CASABLANCA
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { name: 'MASI',  desc: 'All Shares Index',    multiplier: 1.00 },
                { name: 'MADEX', desc: 'Most Active Shares',  multiplier: 0.97 },
                { name: 'MSI20', desc: 'Top 20 Blue Chips',   multiplier: 0.94 },
              ] as const).map(({ name, desc, multiplier }) => {
                const approxChg = avgChange * multiplier;
                const clr = pctColor(approxChg);
                return (
                  <div
                    key={name}
                    className="border p-4 flex flex-col gap-2"
                    style={{ background: '#0B101E', borderColor: BB_BORDER }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>{desc}</p>
                        <p className="text-3xl font-black tracking-wide mt-0.5" style={{ color: BB_CYAN }}>{name}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('EQUITIES')}
                        className="text-[10px] font-bold px-2 py-1 border flex-shrink-0 hover:opacity-70"
                        style={{ color: BB_MUTED, borderColor: BB_BORDER }}
                      >
                        VALEURS →
                      </button>
                    </div>
                    <div
                      className="flex items-center gap-3 pt-2 border-t"
                      style={{ borderColor: BB_BORDER }}
                    >
                      <span className="text-xs font-bold" style={{ color: BB_MUTED }}>Var. séance</span>
                      <span className="text-sm font-black tabular-nums" style={{ color: clr }}>
                        {approxChg >= 0 ? '▲ +' : '▼ '}{Math.abs(approxChg).toFixed(2)}%
                      </span>
                      <span className="text-[9px] ml-auto px-1.5 py-0.5 border" style={{ color: BB_MUTED, borderColor: BB_BORDER }}>
                        approx.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Market breadth ── */}
          <div className="border p-4" style={{ background: '#0B101E', borderColor: BB_BORDER }}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                ■ DYNAMIQUE DE MARCHÉ
              </p>
              <div className="flex items-center gap-4 text-[11px]" style={{ color: BB_MUTED }}>
                <span>Vol. total : <strong style={{ color: BB_WHITE }}>{fmtVolume(totalVolume)} MAD</strong></span>
                <span style={{ color: BB_BORDER }}>|</span>
                <span>{equityStocks.length} titres actifs</span>
                {equityStocks.length > 0 && decliners > 0 && (
                  <>
                    <span style={{ color: BB_BORDER }}>|</span>
                    <span>Ratio H/B : <strong style={{ color: BB_WHITE }}>{(advancers / decliners).toFixed(1)}×</strong></span>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'HAUSSES', val: advancers, color: BB_GREEN },
                { label: 'STABLES', val: stable,    color: BB_MUTED },
                { label: 'BAISSES', val: decliners, color: BB_RED   },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center p-3 border" style={{ background: '#040914', borderColor: BB_BORDER }}>
                  <p className="text-2xl font-black tabular-nums" style={{ color }}>{val}</p>
                  <p className="text-[10px] mt-1 uppercase tracking-widest" style={{ color: BB_MUTED }}>{label}</p>
                </div>
              ))}
            </div>
            {equityStocks.length > 0 && (
              <div className="h-2.5 w-full flex overflow-hidden" style={{ border: `1px solid ${BB_BORDER}` }}>
                <div style={{ width: `${(advancers  / equityStocks.length) * 100}%`, background: BB_GREEN,  transition: 'width 0.6s ease' }} />
                <div style={{ width: `${(stable     / equityStocks.length) * 100}%`, background: '#475569', transition: 'width 0.6s ease' }} />
                <div style={{ width: `${(decliners  / equityStocks.length) * 100}%`, background: BB_RED,    transition: 'width 0.6s ease' }} />
              </div>
            )}
          </div>

          {/* ── Top movers ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {([
              { title: '▲ TOP HAUSSES', headerBg: '#061a0e', headerColor: BB_GREEN, items: gainers5, positive: true,  filter: 'TOP'   as QuickFilter },
              { title: '▼ TOP BAISSES', headerBg: '#1a0606', headerColor: BB_RED,   items: losers5,  positive: false, filter: 'PIRES' as QuickFilter },
            ] as const).map(({ title, headerBg, headerColor, items, positive, filter }) => (
              <div key={title} className="border overflow-hidden" style={{ background: '#0B101E', borderColor: BB_BORDER }}>
                <div
                  className="flex items-center justify-between px-4 py-2 text-xs font-black uppercase tracking-widest"
                  style={{ background: headerBg, color: headerColor, borderBottom: `1px solid ${BB_BORDER}` }}
                >
                  <span>{title}</span>
                  <button
                    onClick={() => { setActiveTab('EQUITIES'); setQuickFilter(filter); }}
                    className="text-[10px] font-bold hover:opacity-70"
                    style={{ color: BB_MUTED }}
                  >
                    VOIR TOUT →
                  </button>
                </div>
                <div>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse mx-3 my-1.5 h-8 rounded" style={{ background: '#0A0F1D' }} />
                    ))
                  ) : items.length === 0 ? (
                    <div className="p-4 text-xs text-center" style={{ color: BB_MUTED }}>Aucune donnée</div>
                  ) : items.map((s, i) => (
                    <div
                      key={s.ticker}
                      className="grid items-center px-4 py-2.5 cursor-pointer hover:bg-[#111827] transition-colors border-b"
                      style={{ gridTemplateColumns: '18px 56px 1fr 88px', borderColor: BB_BORDER }}
                      onClick={() => { setSelectedTicker(s); setActiveTab('EQUITIES'); }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: BB_MUTED }}>{i + 1}</span>
                      <span className="text-sm font-black" style={{ color: BB_CYAN }}>{s.ticker}</span>
                      <span className="text-xs truncate px-1" style={{ color: BB_MUTED }}>{s.name}</span>
                      <span className="text-sm font-black tabular-nums text-right" style={{ color: positive ? BB_GREEN : BB_RED }}>
                        {positive ? '▲ +' : '▼ '}{Math.abs(s.changePercent ?? 0).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Heatmap (Sectorielle / Valeurs BVC) ── */}
          {(sectorData.length > 0 || equityStocks.length > 0) && (
            <div className="border p-4" style={{ background: '#0B101E', borderColor: BB_BORDER }}>

              {/* Header + toggle */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                  ■ HEATMAP — PERFORMANCE SÉANCE
                </p>
                <div className="flex items-center gap-1" style={robotoMono.style}>
                  {(['SECTORS', 'STOCKS'] as HeatmapView[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setHeatmapView(v)}
                      className="text-[10px] px-3 py-1 font-bold uppercase tracking-wide transition-colors"
                      style={{
                        background: heatmapView === v ? BB_ORANGE : 'transparent',
                        color: heatmapView === v ? '#000' : BB_MUTED,
                        border: `1px solid ${heatmapView === v ? BB_ORANGE : BB_BORDER}`,
                      }}
                    >
                      {v === 'SECTORS' ? 'Sectorielle' : 'Valeurs BVC'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sectoral heatmap */}
              {heatmapView === 'SECTORS' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                  {sectorData.map(({ name, count, avgChange: pct }) => (
                    <div
                      key={name}
                      className="border p-3 text-center"
                      style={{ background: sectorBg(pct), borderColor: `${sectorFg(pct)}30` }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: sectorFg(pct) }}>
                        {name}
                      </p>
                      <p className="text-lg font-black tabular-nums mt-1" style={{ color: sectorFg(pct) }}>
                        {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: BB_MUTED }}>{count} val.</p>
                    </div>
                  ))}
                </div>
              )}

              {/* All-stocks heatmap — one tile per BVC equity, sorted best→worst */}
              {heatmapView === 'STOCKS' && (
                equityStocks.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: BB_MUTED }}>
                    Chargement des données…
                  </p>
                ) : (
                  <div
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))' }}
                  >
                    {[...equityStocks]
                      .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
                      .map(s => {
                        const pct = s.changePercent ?? 0;
                        return (
                          <div
                            key={s.ticker}
                            className="border p-2 text-center cursor-pointer transition-transform hover:scale-105 hover:z-10 relative select-none"
                            style={{
                              background: sectorBg(pct),
                              borderColor: `${sectorFg(pct)}44`,
                            }}
                            onClick={() => {
                              setSelectedTicker(s);
                              setEquitiesSubFilter('ACTIONS');
                              setActiveTab('EQUITIES');
                            }}
                            title={`${s.ticker} — ${s.name}\n${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}
                          >
                            <p
                              className="text-[11px] font-black truncate"
                              style={{ color: BB_WHITE, ...robotoMono.style }}
                            >
                              {s.ticker}
                            </p>
                            <p
                              className="text-[10px] font-bold tabular-nums mt-0.5"
                              style={{ color: sectorFg(pct), ...robotoMono.style }}
                            >
                              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          )}

          {/* ── Secondary panels ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Statistiques de séance */}
            <div className="border overflow-hidden" style={{ background: '#0B101E', borderColor: BB_BORDER }}>
              <div
                className="px-4 py-2 text-xs font-black uppercase tracking-widest border-b"
                style={{ background: BB_ORANGE, color: '#000', borderColor: BB_BORDER }}
              >
                STATISTIQUES SÉANCE
              </div>
              <div className="p-4 space-y-0">
                {[
                  { label: 'Ouverture',        val: '09:30' },
                  { label: 'Clôture',          val: '15:30' },
                  { label: 'Vol. total',        val: `${fmtVolume(totalVolume)} MAD` },
                  { label: 'Valeurs traitées',  val: `${equityStocks.filter(s => (s.volume ?? 0) > 0).length} / ${equityStocks.length}` },
                  { label: 'Hausses / Baisses', val: `${advancers} / ${decliners}` },
                  { label: 'Perf. moy.',        val: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` },
                  {
                    label: 'Meilleure valeur',
                    val: movers?.gainers[0]
                      ? `${movers.gainers[0].ticker} +${(movers.gainers[0].changePercent ?? 0).toFixed(1)}%`
                      : '—',
                  },
                  {
                    label: 'Pire valeur',
                    val: movers?.losers[0]
                      ? `${movers.losers[0].ticker} ${(movers.losers[0].changePercent ?? 0).toFixed(1)}%`
                      : '—',
                  },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b text-xs"
                    style={{ borderColor: BB_BORDER }}
                  >
                    <span style={{ color: BB_MUTED }}>{label}</span>
                    <span className="font-bold tabular-nums" style={{ color: BB_WHITE }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro + Fear & Greed */}
            <div className="border overflow-hidden" style={{ background: '#0B101E', borderColor: BB_BORDER }}>
              <div
                className="px-4 py-2 text-xs font-black uppercase tracking-widest border-b"
                style={{ background: BB_ORANGE, color: '#000', borderColor: BB_BORDER }}
              >
                MACRO & DEVISES
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-0">
                  {fxData.map(({ pair, rate, chg }) => {
                    const n = parseFloat(chg);
                    return (
                      <div
                        key={pair}
                        className="flex items-center gap-2 py-2 border-b text-xs"
                        style={{ borderColor: BB_BORDER }}
                      >
                        <span className="w-16 font-bold" style={{ color: BB_MUTED }}>{pair}</span>
                        <span className="flex-1 font-black tabular-nums text-white">{rate}</span>
                        <span className="font-bold tabular-nums" style={{ color: pctColor(n) }}>
                          {n >= 0 ? '+' : ''}{chg}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>
                    INDICE PEUR & AVIDITÉ
                  </p>
                  <FearGreedGauge score={fgScore} label={fgLabel(fgScore)} color={fgColor(fgScore)} />
                </div>
                <button
                  onClick={() => setActiveTab('MACRO')}
                  className="text-[10px] font-bold hover:underline w-full text-right"
                  style={{ color: BB_CYAN }}
                >
                  Macro complet →
                </button>
              </div>
            </div>

            {/* Calendrier financier */}
            <div className="border overflow-hidden" style={{ background: '#0B101E', borderColor: BB_BORDER }}>
              <div
                className="px-4 py-2 text-xs font-black uppercase tracking-widest border-b"
                style={{ background: BB_ORANGE, color: '#000', borderColor: BB_BORDER }}
              >
                CALENDRIER FINANCIER
              </div>
              <div className="p-4 space-y-0">
                {[
                  { date: '03/04/26', ticker: 'BAM',  type: 'TAUX',   label: 'BAM — Décision taux directeur',   typeColor: BB_RED    },
                  { date: '10/04/26', ticker: 'IAM',  type: 'T1',     label: 'Maroc Telecom — Résultats T1',    typeColor: BB_YELLOW },
                  { date: '17/04/26', ticker: 'HCP',  type: 'CPI',    label: 'HCP — Indice des prix CPI',       typeColor: BB_GREEN  },
                  { date: '24/04/26', ticker: 'MASI', type: 'BILAN',  label: 'BVC — Bilan mensuel mars 2026',   typeColor: BB_CYAN   },
                  { date: '30/04/26', ticker: 'BCP',  type: 'AGO',    label: 'BCP — Assemblée Générale 2026',   typeColor: BB_ORANGE },
                ].map(({ date, ticker, type, label, typeColor }) => (
                  <div
                    key={`${date}-${ticker}`}
                    className="flex items-center gap-2 py-2 border-b text-[11px]"
                    style={{ borderColor: BB_BORDER }}
                  >
                    <span className="font-bold w-16 flex-shrink-0 tabular-nums" style={{ color: BB_YELLOW }}>{date}</span>
                    <span className="flex-1 truncate text-white" title={label}>{label}</span>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 border flex-shrink-0"
                      style={{ color: typeColor, borderColor: `${typeColor}44`, background: `${typeColor}11` }}
                    >
                      {type}
                    </span>
                  </div>
                ))}
                <Link
                  href="/calendar"
                  className="block text-[10px] font-bold hover:underline mt-3 text-right"
                  style={{ color: BB_CYAN }}
                >
                  Calendrier complet →
                </Link>
              </div>
            </div>

          </div>

          {/* Attribution */}
          <p className="text-[10px] uppercase tracking-widest text-right pb-1" style={{ color: BB_MUTED }}>
            Actualisé à {clock}
          </p>

        </div>
      </div>
    );
  };

  const renderEquities = () => {
    // Derive unique sectors from the live Actions list for the sector dropdown
    const sectorSet = new Set<string>();
    for (const s of equityStocks) {
      const sec = BVC_COMPANIES[s.ticker]?.sector;
      if (sec) sectorSet.add(sec);
    }
    const sectorOptions = Array.from(sectorSet).sort();

    /** Switch sub-filter tab and reset search/sector state */
    const switchSubFilter = (f: EquitiesSubFilter) => {
      setEquitiesSubFilter(f);
      setSearch('');
      setSectorFilter('ALL');
      setHighlightedRow(0);
      setSelectedTicker(null);
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Sub-filter tab bar: Actions / DA / OPCVM ── */}
        <div
          className="flex items-center border-b flex-shrink-0 overflow-x-auto scrollbar-hide"
          style={{ background: '#050b14', borderColor: BB_BORDER }}
        >
          {([
            { id: 'ACTIONS' as EquitiesSubFilter, label: '📈 Actions',               badge: `${filtered.length > 0 ? filtered.length : BVC_STOCKS_78.length} val.` },
            { id: 'DA'      as EquitiesSubFilter, label: '📋 Droits d\'Attribution',  badge: `${daStocks.length} DA` },
            { id: 'OPCVM'   as EquitiesSubFilter, label: '🏦 OPCVM',                 badge: `AMMC` },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => switchSubFilter(tab.id)}
              className="h-10 px-5 flex items-center gap-2 border-b-2 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors"
              style={{
                borderColor: equitiesSubFilter === tab.id ? BB_ORANGE : 'transparent',
                color: equitiesSubFilter === tab.id ? BB_ORANGE : BB_MUTED,
                background: equitiesSubFilter === tab.id ? '#1a140a' : 'transparent',
                ...robotoMono.style,
              }}
            >
              {tab.label}
              <span
                className="text-[9px] px-1.5 py-0.5 border"
                style={{
                  color: equitiesSubFilter === tab.id ? BB_ORANGE : BB_MUTED,
                  borderColor: equitiesSubFilter === tab.id ? `${BB_ORANGE}55` : BB_BORDER,
                  background: equitiesSubFilter === tab.id ? `${BB_ORANGE}11` : 'transparent',
                }}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SUB-TAB: 🏦 OPCVM — full-width embedded view
        ══════════════════════════════════════════════════════════════ */}
        {equitiesSubFilter === 'OPCVM' && (
          <div className="flex-1 overflow-hidden relative border-t border-[#1E293B]">
            <AmmcTerminalDisplay />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SUB-TABS: 📈 ACTIONS  and  📋 DA — two-panel layout
        ══════════════════════════════════════════════════════════════ */}
        {(equitiesSubFilter === 'ACTIONS' || equitiesSubFilter === 'DA') && (
          <div className="flex-1 flex overflow-hidden">

            {/* LEFT: Stock / DA list */}
            <div className="w-full lg:w-[60%] flex flex-col border-r border-[#1E293B] bg-[#0B101E]">
              <PanelHeader title={equitiesSubFilter === 'ACTIONS' ? 'ACTIONS BVC — 78 VALEURS OFFICIELLES' : 'DROITS D\'ATTRIBUTION'}>
                <span style={{ color: '#000', fontSize: '10px' }}>{filtered.length} val.</span>
              </PanelHeader>

              {/* Filter bar */}
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 flex-shrink-0 border-b border-[#1E293B] bg-[#040914]">
                <input
                  ref={searchRef} value={search}
                  onChange={e => { setSearch(e.target.value); setQuickFilter('ALL'); }}
                  placeholder={t('search_placeholder')}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-[12px] px-2"
                  style={{ ...robotoMono.style, color: BB_WHITE, caretColor: BB_ORANGE }}
                />
                {/* Quick filters and sector dropdown — Actions only */}
                {equitiesSubFilter === 'ACTIONS' && (
                  <>
                    {(['ALL', 'TOP', 'PIRES', 'VOLUME'] as QuickFilter[]).map(f => (
                      <button
                        key={f} onClick={() => { setQuickFilter(f); setSearch(''); }}
                        className={`text-[10px] px-2 py-1 font-bold rounded-sm ${inter.className}`}
                        style={{
                          background: quickFilter === f ? BB_ORANGE : 'transparent',
                          color: quickFilter === f ? '#000' : BB_MUTED,
                          border: `1px solid ${quickFilter === f ? BB_ORANGE : BB_BORDER}`,
                        }}
                      >
                        {f === 'ALL' ? t('filter_all') : f === 'TOP' ? 'TOP' : f === 'PIRES' ? 'PIRES' : 'VOL↑'}
                      </button>
                    ))}
                    {/* Sector sub-filter dropdown */}
                    <select
                      value={sectorFilter}
                      onChange={e => { setSectorFilter(e.target.value); setQuickFilter('ALL'); }}
                      className="bg-[#0B101E] border px-2 py-1 text-[10px] outline-none cursor-pointer"
                      style={{
                        borderColor: sectorFilter !== 'ALL' ? BB_ORANGE : BB_BORDER,
                        color: sectorFilter !== 'ALL' ? BB_ORANGE : BB_MUTED,
                        ...robotoMono.style,
                      }}
                    >
                      <option value="ALL">Tous secteurs</option>
                      {sectorOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                )}
              </div>

              {/* Column headers */}
              {equitiesSubFilter === 'ACTIONS' && (
                <div
                  className="grid items-center gap-2 flex-shrink-0 text-[11px] font-bold px-[8px] py-2 border-b border-[#1E293B] bg-[#0A0F1D]"
                  style={{ color: BB_MUTED, ...robotoMono.style, gridTemplateColumns: '70px minmax(120px, 1fr) 70px 80px 70px 90px' }}
                >
                  <span className="cursor-pointer hover:text-white truncate" onClick={() => toggleSort('TICKER')}>{t('col_ticker')} {sortField==='TICKER'?(sortDir==='ASC'?'↑':'↓'):''}</span>
                  <span>{t('col_name')}</span>
                  <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('PRICE')}>{t('col_price')} {sortField==='PRICE'?(sortDir==='ASC'?'↑':'↓'):''}</span>
                  <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('CHANGE')}>{t('col_change_pct')} {sortField==='CHANGE'?(sortDir==='ASC'?'↑':'↓'):''}</span>
                  <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('VOLUME')}>{t('col_volume')} {sortField==='VOLUME'?(sortDir==='ASC'?'↑':'↓'):''}</span>
                  <span className="text-center">{t('col_signal')}</span>
                </div>
              )}
              {equitiesSubFilter === 'DA' && (
                <div
                  className="grid items-center gap-2 flex-shrink-0 text-[11px] font-bold px-[8px] py-2 border-b border-[#1E293B] bg-[#0A0F1D]"
                  style={{ color: BB_MUTED, ...robotoMono.style, gridTemplateColumns: '110px minmax(130px, 1fr) 70px 80px 70px' }}
                >
                  <span>TICKER DA</span>
                  <span>NOM</span>
                  <span className="text-right">COURS</span>
                  <span className="text-right">VAR%</span>
                  <span className="text-right">VOLUME</span>
                </div>
              )}

              {/* Rows */}
              <div className="flex-1 overflow-y-auto" ref={listRef}>
                {loading ? (
                  <div className="flex items-center justify-center h-full text-sm font-bold" style={{ color: BB_ORANGE, ...robotoMono.style }}>{t('loading')}</div>
                ) : filtered.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_MUTED, ...robotoMono.style }}>
                    {equitiesSubFilter === 'DA' ? 'Aucun droit d\'attribution actif.' : t('no_data')}
                  </div>
                ) : equitiesSubFilter === 'ACTIONS' ? (
                  filtered.map((stock, i) => (
                    <StockRow
                      key={stock.ticker} stock={stock}
                      isHighlighted={i === highlightedRow}
                      isSelected={selectedTicker?.ticker === stock.ticker}
                      isFlashing={flashTickers.has(stock.ticker)}
                      onClick={() => { setSelectedTicker(stock); setPanelBTab(1); setHighlightedRow(i); }}
                    />
                  ))
                ) : (
                  // DA rows
                  filtered.map((stock, i) => (
                    <div
                      key={stock.ticker}
                      onClick={() => { setSelectedTicker(stock); setHighlightedRow(i); }}
                      className="grid items-center gap-2 select-none transition-colors duration-150 hover:bg-[#111827] cursor-pointer"
                      style={{
                        background: selectedTicker?.ticker === stock.ticker ? '#1a2235' : 'transparent',
                        borderLeft: selectedTicker?.ticker === stock.ticker ? `2px solid ${BB_YELLOW}` : '2px solid transparent',
                        borderBottom: `1px solid ${BB_BORDER}`,
                        ...robotoMono.style, fontSize: '12px', color: BB_WHITE,
                        gridTemplateColumns: '110px minmax(130px, 1fr) 70px 80px 70px',
                        padding: '6px 8px',
                      }}
                    >
                      <span className="font-bold truncate" style={{ color: BB_YELLOW }}>{stock.ticker}</span>
                      <span className="truncate" style={{ color: BB_MUTED }}>{stock.name}</span>
                      <span className="text-right font-bold tabular-nums">{fmtPrice(stock.lastPrice)}</span>
                      <span className="text-right font-bold tabular-nums" style={{ color: pctColor(stock.changePercent) }}>{fmtPct(stock.changePercent)}</span>
                      <span className="text-right tabular-nums" style={{ color: BB_MUTED }}>{fmtVolume(stock.volume)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Detail panel */}
            <div className="hidden lg:flex flex-col w-[40%] bg-[#0B101E]">

              {/* DA detail panel — no TradingView chart */}
              {equitiesSubFilter === 'DA' ? (
                !selectedTicker ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3" style={robotoMono.style}>
                    <div className="text-3xl" style={{ color: BB_MUTED }}>◈</div>
                    <p className="text-sm font-bold" style={{ color: BB_YELLOW }}>Sélectionnez un DA</p>
                    <p className="text-xs" style={{ color: BB_MUTED }}>Le détail apparaîtra ici.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full" style={robotoMono.style}>
                    <PanelHeader title={`${selectedTicker.ticker} — DÉTAIL DA`} />
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      {/* Price header */}
                      <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: BB_BORDER }}>
                        <div>
                          <p className="text-2xl font-black" style={{ color: BB_YELLOW }}>{selectedTicker.ticker}</p>
                          <p className="text-sm mt-1" style={{ color: BB_WHITE }}>{selectedTicker.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black tabular-nums" style={{ color: BB_WHITE }}>{fmtPrice(selectedTicker.lastPrice)}</p>
                          <p className="text-sm mt-1 font-bold tabular-nums" style={{ color: pctColor(selectedTicker.changePercent) }}>{fmtPct(selectedTicker.changePercent)}</p>
                        </div>
                      </div>

                      {/* No-chart info card */}
                      <div className="border p-4" style={{ borderColor: `${BB_CYAN}44`, background: `${BB_CYAN}08` }}>
                        <p className="text-xs font-bold mb-2" style={{ color: BB_CYAN }}>ℹ️ GRAPHIQUE INDISPONIBLE</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: BB_MUTED }}>
                          Les Droits d&apos;Attribution ne disposent pas de graphique boursier.
                          Consultez l&apos;avis d&apos;opération sur le site de la BVC pour plus de détails.
                        </p>
                      </div>

                      {/* Parent stock link (Bonus S2) */}
                      {DA_PARENT_MAP[selectedTicker.ticker] && (
                        <div
                          className="border p-3 cursor-pointer hover:bg-[#111827] transition-colors"
                          style={{ borderColor: BB_BORDER }}
                          onClick={() => {
                            const parentTicker = DA_PARENT_MAP[selectedTicker.ticker];
                            const parentStock = stocks.find(s => s.ticker === parentTicker);
                            if (parentStock) {
                              setEquitiesSubFilter('ACTIONS');
                              setSelectedTicker(parentStock);
                            }
                          }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: BB_MUTED }}>VALEUR MÈRE</p>
                          <p className="text-sm font-black" style={{ color: BB_CYAN }}>
                            → {DA_PARENT_MAP[selectedTicker.ticker]}
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: BB_MUTED }}>Cliquer pour voir la valeur mère dans Actions</p>
                        </div>
                      )}

                      {/* OHLV grid */}
                      <div className="grid grid-cols-2 gap-[1px] bg-[#1E293B]">
                        {[
                          { label: t('open'),   value: fmtPrice(selectedTicker.open)   },
                          { label: t('high'),   value: fmtPrice(selectedTicker.high)   },
                          { label: t('low'),    value: fmtPrice(selectedTicker.low)    },
                          { label: t('volume'), value: fmtVolume(selectedTicker.volume)},
                        ].map(({ label, value }) => (
                          <div key={label} className="px-4 py-3 bg-[#0A0F1D]">
                            <p className="text-[11px] tracking-widest font-bold mb-1 uppercase" style={{ color: BB_MUTED }}>{label}</p>
                            <p className="text-base font-bold tabular-nums" style={{ color: BB_WHITE }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* ACTIONS detail panel — existing quote/chart behavior */
                <>
                  <PanelHeader title={selectedTicker ? `${selectedTicker.ticker} — ACTIONS BVC` : t('panel_b_title')}>
                    {[1, 2].map(tab => (
                      <button
                        key={tab} onClick={() => setPanelBTab(tab as PanelBTab)}
                        className="text-[10px] px-3 py-1 font-bold rounded-sm"
                        style={{
                          background: panelBTab === tab ? '#000' : 'transparent',
                          color: panelBTab === tab ? BB_ORANGE : '#000',
                          ...inter.style,
                        }}
                      >
                        {tab === 1 ? t('tab_quote') : t('tab_chart')}
                      </button>
                    ))}
                  </PanelHeader>

                  <div className="flex-1 overflow-y-auto p-0 flex flex-col">
                    {!selectedTicker ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3" style={robotoMono.style}>
                        <div className="text-3xl" style={{ color: BB_MUTED }}>◈</div>
                        <p className="text-sm font-bold" style={{ color: BB_ORANGE }}>Sélectionnez une action BVC</p>
                        <p className="text-xs" style={{ color: BB_MUTED }}>Le détail de la valeur apparaîtra ici.</p>
                      </div>
                    ) : panelBTab === 1 ? (
                      <div className="p-4 flex-1 flex flex-col" style={robotoMono.style}>
                        <div className="flex justify-between mb-4 border-b border-[#1E293B] pb-4">
                          <div>
                            <p className="text-3xl font-black tracking-tight" style={{ color: BB_CYAN }}>{selectedTicker.ticker}</p>
                            <p className="text-sm mt-1 text-white">{selectedTicker.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-black tabular-nums" style={{ color: BB_WHITE }}>{fmtPrice(selectedTicker.lastPrice)}</p>
                            <p className="text-xs font-bold mt-1" style={{ color: BB_MUTED }}>MAD</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 mb-4 text-sm font-bold rounded-sm"
                          style={{ background: (selectedTicker.changePercent ?? 0) >= 0 ? '#00e67610' : '#ff174410', border: `1px solid ${(selectedTicker.changePercent ?? 0) >= 0 ? '#00E67633' : '#FF174433'}` }}>
                          <span className="tabular-nums" style={{ color: pctColor(selectedTicker.changePercent), fontSize: '24px' }}>
                            {fmtPct(selectedTicker.changePercent)}
                          </span>
                          <span className="tabular-nums" style={{ color: pctColor(selectedTicker.changePercent), fontSize: '18px' }}>
                            {(selectedTicker.change ?? 0) >= 0 ? '+' : ''}{fmtPrice(selectedTicker.change)} MAD
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-[1px] mb-6 bg-[#1E293B]">
                          {[
                            { label: t('open'),   value: fmtPrice(selectedTicker.open)   },
                            { label: t('high'),   value: fmtPrice(selectedTicker.high)   },
                            { label: t('low'),    value: fmtPrice(selectedTicker.low)    },
                            { label: t('volume'), value: fmtVolume(selectedTicker.volume)},
                          ].map(({ label, value }) => (
                            <div key={label} className="px-4 py-3 bg-[#0A0F1D]">
                              <p className="text-[11px] tracking-widest font-bold mb-1 uppercase" style={{ color: BB_MUTED }}>{label}</p>
                              <p className="text-base font-bold tabular-nums" style={{ color: BB_WHITE }}>{value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 min-h-[250px] border border-[#1E293B]">
                          <TradingViewChart symbol={`CSEMA:${selectedTicker.ticker}`} height={250} theme="dark" interval="D" showToolbar={false} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col p-2 h-full">
                        <div className="flex gap-2 p-2 border-b border-[#1E293B] mb-2">
                          {['1D','1W','1M','3M','6M','1Y'].map(r => (
                            <button key={r} className="text-xs px-2 py-1 font-bold rounded-sm" style={{ color: BB_ORANGE, border: `1px solid ${BB_BORDER}`, ...robotoMono.style }}>{r}</button>
                          ))}
                        </div>
                        <div className="flex-1 min-h-[400px]">
                          <TradingViewChart symbol={`CSEMA:${selectedTicker.ticker}`} height={450} theme="dark" interval="D" showToolbar={true} />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOpcvm = () => {
    return <AmmcTerminalDisplay />;
  };

  const renderMacro = () => (
    <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6" style={{ background: BB_BG, ...robotoMono.style }}>
      <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: BB_CYAN }}>Macroéconomie & Devises</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro Card */}
        <div className="bg-[#0B101E] border border-[#1E293B]">
          <PanelHeader title={t('macro_title')} />
          <div className="p-6">
            <div className="divide-y divide-[#1E293B]">
              {macroData.map(({ label, value, source }) => (
                <div key={label} className="py-4 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: BB_MUTED }}>{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black tabular-nums text-white">{value}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-sm border border-[#475569] text-[#475569]">{source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FX Card */}
        <div className="bg-[#0B101E] border border-[#1E293B]">
          <PanelHeader title="TAUX DE CHANGE (MAD) - INDICATIFS" />
          <div className="p-6">
            <div className="divide-y divide-[#1E293B]">
              {fxData.map(({ pair, rate, chg }) => {
                const chgNum = parseFloat(chg);
                return (
                  <div key={pair} className="py-4 flex items-center justify-between">
                    <span className="text-lg font-black tracking-wider" style={{ color: BB_CYAN }}>{pair}</span>
                    <span className="text-2xl font-black tabular-nums text-white">{rate}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: pctColor(chgNum) }}>{chgNum >= 0 ? '+' : ''}{chg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-[#0B101E] border border-[#1E293B] md:col-span-2">
          <PanelHeader title={t('calendar_title')} />
          <div className="p-6 text-sm">
             <div className="grid grid-cols-[100px_minmax(200px,1fr)_80px] gap-4 py-3 border-b border-[#1E293B] font-bold text-[#8B95A1] text-xs uppercase">
                <span>Date</span>
                <span>Événement</span>
                <span>Impact</span>
             </div>
             <div className="divide-y divide-[#1E293B]">
                {[
                  { date: 'Avr 03, 2026', evt: 'Banque Al-Maghrib — Décision Taux Directeur',  ticker: 'BAM', impact: BB_RED },
                  { date: 'Avr 10, 2026', evt: 'Maroc Telecom — Publication T1', ticker: 'IAM', impact: BB_YELLOW },
                  { date: 'Avr 17, 2026', evt: 'HCP — Publication indice des prix CPI', ticker: 'HCP', impact: BB_GREEN },
                ].map(({ date, evt, ticker, impact }) => (
                  <div key={date} className="grid grid-cols-[100px_minmax(200px,1fr)_80px] gap-4 py-4 items-center hover:bg-[#111827]">
                    <span className="font-bold" style={{ color: BB_YELLOW }}>{date}</span>
                    <span className="text-white font-medium">{evt}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-sm text-center border"
                      style={{ color: impact, borderColor: `${impact}44`, background: `${impact}11` }}
                    >
                      {ticker}
                    </span>
                  </div>
                ))}
             </div>
             <div className="mt-4">
                <Link href="/calendar" className="inline-block text-xs font-bold hover:underline" style={{ color: BB_CYAN }}>
                  → Consulter le calendrier complet
                </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  );

  // ── Keyboard Help Modal ───────────────────────────────────────────────────────
  const helpModal = showHelp && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="p-0 w-full max-w-lg shadow-2xl rounded-sm overflow-hidden border border-[#FF9800] bg-[#0B101E]"
        style={robotoMono.style}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: BB_ORANGE }}>
          <span className="text-sm font-black text-[#000] uppercase tracking-wider">{t('help_title')}</span>
          <button onClick={() => setShowHelp(false)} className="text-[#000] font-black text-lg hover:opacity-70">✕</button>
        </div>
        <div className="p-6 space-y-3 text-xs">
          {[
            { key: 'Alt+1..5', desc: "Changer de module principal" },
            { key: 'H',       desc: t('help_h') },
            { key: 'T',       desc: t('help_t') },
            { key: '↑ / ↓',   desc: t('help_arrows') },
            { key: 'Enter',   desc: t('help_enter') },
            { key: 'R',       desc: t('help_r') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4 items-center">
              <span className="w-24 font-bold text-center py-1 rounded-sm bg-[#1E293B]" style={{ color: BB_YELLOW }}>[{key}]</span>
              <span className="text-sm text-white">{desc}</span>
            </div>
          ))}
          <div className="mt-6 pt-4 text-sm font-bold border-t border-[#1E293B]" style={{ color: BB_ORANGE }}>
            COMMANDES CMD:
          </div>
          {[
            { key: 'MASI',     desc: "Aller à l'aperçu de marché" },
            { key: 'MACRO',    desc: "Aller aux données Macro" },
            { key: 'OPCVM',    desc: "Aller aux fonds d'investissement" },
            { key: 'FIN',      desc: "Aller aux Données" },
            { key: '<TICKER>', desc: t('cmd_help_ticker') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4 items-center">
              <span className="w-24 font-bold text-center py-1 text-[#00E5FF]">{key}</span>
              <span className="text-sm text-white">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ROOT RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none" style={{ background: BB_BG, color: BB_WHITE, ...inter.style }}>
      {helpModal}

      {/* ── TOP COMMAND BAR ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 h-14 flex-shrink-0 text-sm z-20 border-b border-[#1E293B] bg-[#0B101E]">
        <Link href="/" className="font-black text-sm flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: BB_ORANGE, letterSpacing: '2px' }}>
          ◈ {t('topbar_title')}
        </Link>
        <span style={{ color: BB_BORDER }}>│</span>
        <div className="flex items-center gap-2 flex-shrink-0" style={robotoMono.style}>
          <span className="font-bold text-xs" style={{ color: BB_MUTED }}>MASI</span>
          <span className="font-bold text-[13px] tabular-nums" style={{ color: BB_WHITE }}>{stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—'}</span>
        </div>
        <span style={{ color: BB_BORDER }}>│</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: marketStatus.open ? BB_GREEN : BB_RED, boxShadow: marketStatus.open ? `0 0 6px ${BB_GREEN}` : 'none' }} />
          <span className="font-bold text-xs uppercase tracking-wider" style={{ color: marketStatus.open ? BB_GREEN : BB_RED }}>{marketStatus.open ? t('live') : t('closed')}</span>
        </div>
        <span style={{ color: BB_BORDER }}>│</span>
        <span className="font-bold text-sm tracking-widest flex-shrink-0 tabular-nums" style={{ color: BB_YELLOW, ...robotoMono.style }}>{clock}</span>
        <span style={{ color: BB_BORDER }}>│</span>
        <div className="flex items-center gap-2 flex-1 min-w-0" style={robotoMono.style}>
          <span className="font-bold text-xs flex-shrink-0" style={{ color: BB_ORANGE }}>CMD:</span>
          <input
            ref={cmdRef} value={cmdValue}
            onChange={e => { setCmdValue(e.target.value.toUpperCase()); setCmdMsg(''); }}
            onKeyDown={handleCmd}
            placeholder={t('cmd_placeholder')}
            className="bg-transparent outline-none flex-1 min-w-0 uppercase font-bold text-sm"
            style={{ color: BB_WHITE, caretColor: BB_ORANGE }}
            autoComplete="off" spellCheck={false}
          />
          {cmdMsg && <span className="text-xs font-bold truncate flex-shrink-0" style={{ color: cmdMsg.includes('INCONNUE') ? BB_RED : BB_GREEN }}>{cmdMsg}</span>}
        </div>
        <span style={{ color: BB_BORDER }}>│</span>
        <div className="flex items-center gap-2 flex-shrink-0" style={robotoMono.style}>
          <button onClick={() => setShowHelp(v => !v)} className="px-2 py-1 text-xs font-bold rounded hover:bg-[#1E293B] border border-[#1E293B] text-[#8B95A1]">[H] AIDE</button>
          <button onClick={loadData} className="px-2 py-1 text-xs font-bold rounded hover:bg-[#1E293B] border border-[#1E293B] text-[#8B95A1]">↻ REFRESH</button>
        </div>
      </div>

      {/* ── NAVIGATION TABS ────────────────────────────────────────────────────── */}
      <div className="flex items-center h-12 flex-shrink-0 border-b border-[#1E293B] bg-[#0A0F1D] px-4 overflow-x-auto scrollbar-hide">
        {(
          [
            { id: 'OVERVIEW', label: 'Aperçu de marché', shortcut: 'Alt+1' },
            { id: 'EQUITIES', label: 'Valeurs BVC', shortcut: 'Alt+2' },
            { id: 'OPCVM', label: 'Fonds OPCVM', shortcut: 'Alt+3' },
            { id: 'CAPITAL_MARKET', label: 'Indicateurs Marché', shortcut: 'Alt+C' },
            { id: 'MACRO', label: 'Macro & Devises', shortcut: 'Alt+4' },
            { id: 'FINANCIALS', label: 'Données', shortcut: 'Alt+5' },
          ] as { id: ActiveTab; label: string; shortcut: string }[]
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="h-full px-6 flex items-center justify-center gap-3 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors"
            style={{
              borderColor: activeTab === tab.id ? BB_ORANGE : 'transparent',
              color: activeTab === tab.id ? BB_ORANGE : BB_MUTED,
              backgroundColor: activeTab === tab.id ? '#1a140a' : 'transparent',
            }}
          >
            {tab.label}
            <span className="hidden sm:inline-block text-[10px] bg-[#1E293B] text-[#8B95A1] px-1.5 py-0.5 rounded-sm" style={robotoMono.style}>{tab.shortcut}</span>
          </button>
        ))}
      </div>

      {/* ── DYNAMIC MODULE CONTAINER ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'EQUITIES' && renderEquities()}
        {activeTab === 'OPCVM' && renderOpcvm()}
        {activeTab === 'CAPITAL_MARKET' && <MarketIndicators />}
        {activeTab === 'MACRO' && renderMacro()}
        {activeTab === 'FINANCIALS' && (
          <div className="h-full flex flex-col overflow-hidden">

            {/* ── Persistent stock switcher (Task 2) ── */}
            <div
              className="flex flex-wrap items-center gap-3 px-4 py-2 border-b flex-shrink-0"
              style={{ background: '#050b14', borderColor: BB_BORDER, ...robotoMono.style }}
            >
              {/* Last 5 viewed — quick-access buttons (Bonus S4) */}
              {lastViewedStocks.length > 0 && (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: BB_MUTED }}>RÉCENTS:</span>
                  {lastViewedStocks.map(ticker => (
                    <button
                      key={ticker}
                      onClick={() => switchToStock(ticker)}
                      className="text-[10px] font-black px-2 py-1 border transition-colors hover:opacity-80"
                      style={{
                        color: selectedTicker?.ticker === ticker ? BB_ORANGE : BB_CYAN,
                        borderColor: selectedTicker?.ticker === ticker ? BB_ORANGE : `${BB_CYAN}44`,
                        background: selectedTicker?.ticker === ticker ? `${BB_ORANGE}15` : 'transparent',
                      }}
                    >
                      {ticker}
                    </button>
                  ))}
                  <span style={{ color: BB_BORDER }}>│</span>
                </>
              )}

              {/* Search-enabled selectbox */}
              <select
                value={selectedTicker?.ticker ?? ''}
                onChange={e => { if (e.target.value) switchToStock(e.target.value); }}
                className="border px-3 py-1 text-xs outline-none cursor-pointer flex-shrink-0"
                style={{ background: '#0B101E', borderColor: BB_BORDER, color: BB_WHITE, ...robotoMono.style, minWidth: 220 }}
              >
                <option value="">🔍 Changer de valeur...</option>
                {equityStocks
                  .filter(s => BVC_STOCKS_78.includes(s.ticker))
                  .slice()
                  .sort((a, b) => a.ticker.localeCompare(b.ticker))
                  .map(s => (
                    <option key={s.ticker} value={s.ticker}>{s.ticker} — {s.name}</option>
                  ))}
              </select>

              {/* Current stock display */}
              {selectedTicker && (
                <span className="text-xs font-bold flex-shrink-0" style={{ color: BB_MUTED }}>
                  Affichage :{' '}
                  <span style={{ color: BB_CYAN }}>{selectedTicker.ticker}</span>
                  {' '}—{' '}
                  <span style={{ color: BB_WHITE }}>{selectedTicker.name}</span>
                </span>
              )}
            </div>

            {/* ValuesFinancials fills the rest */}
            <div className="flex-1 overflow-hidden">
              <ValuesFinancials ticker={selectedTicker?.ticker ?? null} />
            </div>
          </div>
        )}
      </main>

      {/* ── DISCLAIMER BAR ────────────────────────────────────────────────────── */}
      <div className="h-8 flex-shrink-0 flex items-center justify-center px-4 text-[10px] font-bold text-center tracking-wider uppercase border-t border-[#1E293B] bg-[#0A0F1D] text-[#8B95A1]">
        ⚠️ {t('disclaimer')} ⚠️
      </div>
    </div>
  );
}
