'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { Roboto_Mono, Inter } from 'next/font/google';

import {
  fetchSnapshot,
  fetchMovers,
  type BVCPrice,
  type BVCMovers,
  getMarketStatus,
} from '@/lib/bvcPriceService';
import { fetchOpcvm, type OpcvmFund } from '@/lib/opcvmService';

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
const BB_PANEL  = '#0B101E';  
const BB_BG     = '#040914';  

// ── Types ──────────────────────────────────────────────────────────────────────
type QuickFilter = 'ALL' | 'TOP' | 'PIRES' | 'VOLUME';
type SortField   = 'TICKER' | 'PRICE' | 'CHANGE' | 'VOLUME';
type SortDir     = 'ASC' | 'DESC';
type PanelBTab   = 1 | 2 | 3;
type MobileTab   = 'A' | 'B' | 'C' | 'D';
type OpcvmFilter = 'ALL' | 'Actions' | 'Obligataire' | 'Monétaire' | 'Diversifié';

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

function opcvmTypeColor(type: string | null | undefined): string {
  const t = (type || '').toLowerCase();
  if (t.includes('action'))                       return BB_GREEN;
  if (t.includes('oblig'))                        return '#aa44ff';
  if (t.includes('mon') || t.includes('moné'))    return BB_YELLOW;
  if (t.includes('divers'))                       return BB_CYAN;
  return BB_MUTED;
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
  stock,
  isHighlighted,
  isSelected,
  isFlashing,
  onClick,
}: {
  stock: BVCPrice;
  isHighlighted: boolean;
  isSelected: boolean;
  isFlashing: boolean;
  onClick: () => void;
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
      {/* TICKER */}
      <span className="font-bold flex-shrink-0 truncate" style={{ color: BB_CYAN }}>{stock.ticker}</span>
      {/* NOM */}
      <span className="truncate" style={{ color: BB_MUTED }}>{stock.name}</span>
      {/* COURS */}
      <span className="text-right font-bold tabular-nums">{fmtPrice(stock.lastPrice)}</span>
      {/* VAR% */}
      <span className="text-right font-bold tabular-nums" style={{ color: pctColor(stock.changePercent) }}>
        {fmtPct(stock.changePercent)}
      </span>
      {/* VOLUME */}
      <span className="text-right tabular-nums" style={{ color: BB_MUTED }}>{fmtVolume(stock.volume)}</span>
      {/* SIGNAL */}
      <span className="flex items-center justify-center">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{
            color: sigColor,
            border: `1px solid ${sigColor}55`,
            background: sigBg,
          }}
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
    <div>
      <div className="flex items-end justify-between mb-1" style={robotoMono.style}>
        <span className="text-xs font-bold" style={{ color: BB_MUTED }}>0</span>
        <span className="text-base font-bold" style={{ color }}>{score}</span>
        <span className="text-xs font-bold" style={{ color: BB_MUTED }}>100</span>
      </div>
      {/* Track */}
      <div className="h-2 w-full flex rounded-none overflow-hidden" style={{ border: `1px solid ${BB_BORDER}` }}>
        {zones.map((z) => (
          <div key={z.label} style={{ width: `${z.pct}%`, background: z.color, opacity: 0.4 }} />
        ))}
      </div>
      {/* Needle */}
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
  const [loading, setLoading] = useState(true);

  // ── UI state ─────────────────────────────────────────────────────────────────
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
  const [mobileTab,       setMobileTab]       = useState<MobileTab>('A');

  // ── OPCVM state ──────────────────────────────────────────────────────────────
  const [opcvmFunds,    setOpcvmFunds]    = useState<OpcvmFund[]>([]);
  const [opcvmLoading,  setOpcvmLoading]  = useState(true);
  const [opcvmFilter,   setOpcvmFilter]   = useState<OpcvmFilter>('ALL');

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

      // Flash changed prices
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

  const loadOpcvm = useCallback(async () => {
    setOpcvmLoading(true);
    try {
      const data = await fetchOpcvm();
      setOpcvmFunds(data.funds);
    } finally {
      setOpcvmLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadOpcvm();
    const id = setInterval(loadData, 60_000); // 60s Terminal Refresh
    return () => clearInterval(id);
  }, [loadData, loadOpcvm]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...stocks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }
    
    // Quick filters
    if (quickFilter === 'TOP')    list = list.sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 10);
    else if (quickFilter === 'PIRES')  list = list.sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0)).slice(0, 10);
    else if (quickFilter === 'VOLUME') list = list.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    else {
      // Column Sort
      list.sort((a, b) => {
        let valA, valB;
        if (sortField === 'TICKER') { valA = a.ticker; valB = b.ticker; }
        else if (sortField === 'PRICE') { valA = a.lastPrice ?? 0; valB = b.lastPrice ?? 0; }
        else if (sortField === 'CHANGE') { valA = a.changePercent ?? 0; valB = b.changePercent ?? 0; }
        else { valA = a.volume ?? 0; valB = b.volume ?? 0; }
        
        if (valA < valB) return sortDir === 'ASC' ? -1 : 1;
        if (valA > valB) return sortDir === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [stocks, search, quickFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    setQuickFilter('ALL');
    if (sortField === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDir(field === 'TICKER' ? 'ASC' : 'DESC');
    }
  };

  const marketStatus = getMarketStatus();
  const advancers    = stocks.filter(s => (s.changePercent ?? 0) > 0).length;
  const decliners    = stocks.filter(s => (s.changePercent ?? 0) < 0).length;
  const stable       = stocks.length - advancers - decliners;
  const totalVolume  = stocks.reduce((sum, s) => sum + (s.volume ?? 0), 0);
  const avgChange    = stocks.length ? stocks.reduce((s, x) => s + (x.changePercent ?? 0), 0) / stocks.length : 0;

  // Fear & Greed
  const fgBreadth    = stocks.length ? (advancers / stocks.length) * 100 : 50;
  const fgMomentum   = Math.max(0, Math.min(100, 50 + avgChange * 10));
  const highVolCount = stocks.filter(s => Math.abs(s.changePercent ?? 0) > 2).length;
  const fgVolatility = stocks.length ? 100 - Math.min(100, (highVolCount / stocks.length) * 200) : 50;
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

  // ── OPCVM filtered list ──────────────────────────────────────────────────────
  const filteredOpcvm = useMemo(() => {
    if (opcvmFilter === 'ALL') return opcvmFunds;
    return opcvmFunds.filter(f => (f.type || '').toLowerCase().includes(opcvmFilter.toLowerCase()));
  }, [opcvmFunds, opcvmFilter]);

  // ── CMD handler ──────────────────────────────────────────────────────────────
  const handleCmd = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = cmdValue.trim().toUpperCase();
    setCmdValue('');
    if (!cmd) return;

    if (cmd === 'TOP')   { setQuickFilter('TOP');   setCmdMsg('FILTRE: TOP 10 HAUSSES'); return; }
    if (cmd === 'PIRES') { setQuickFilter('PIRES'); setCmdMsg('FILTRE: PIRES 10 BAISSES'); return; }
    if (cmd === 'CLR')   { setSearch(''); setQuickFilter('ALL'); setCmdMsg('FILTRES RÉINITIALISÉS'); return; }
    if (cmd === 'MASI')  { setCmdMsg('→ PANEL C: APERÇU MARCHÉ'); setMobileTab('C'); return; }
    if (cmd === 'MACRO') { setCmdMsg('→ PANEL D: MACRO & FX'); setMobileTab('D'); return; }
    if (cmd === 'H' || cmd === 'HELP') { setShowHelp(true); return; }

    const found = stocks.find(s => s.ticker.toUpperCase() === cmd);
    if (found) {
      setSelectedTicker(found);
      setPanelBTab(1);
      setMobileTab('B');
      setCmdMsg(`✓ VALEUR: ${found.ticker} — ${found.name.slice(0, 30)}`);
      return;
    }
    setCmdMsg(t('cmd_unknown'));
  }, [cmdValue, stocks, t]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === cmdRef.current || document.activeElement === searchRef.current) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'h': case 'H': setShowHelp(v => !v); break;
        case 't': case 'T': e.preventDefault(); cmdRef.current?.focus(); break;
        case 'r': case 'R': loadData(); setCmdMsg('RECHARGEMENT...'); break;
        case 'Escape': setShowHelp(false); setSelectedTicker(null); break;
        case '1': setPanelBTab(1); break;
        case '2': setPanelBTab(2); break;
        case '3': setPanelBTab(3); break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedRow(r => {
            const next = Math.min(r + 1, filtered.length - 1);
            if (listRef.current) {
               const rowEl = listRef.current.children[next] as HTMLElement;
               if (rowEl) rowEl.scrollIntoView({ block: 'nearest' });
            }
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedRow(r => {
            const prev = Math.max(r - 1, 0);
            if (listRef.current) {
               const rowEl = listRef.current.children[prev] as HTMLElement;
               if (rowEl) rowEl.scrollIntoView({ block: 'nearest' });
            }
            return prev;
          });
          break;
        case 'Enter':
          if (filtered[highlightedRow]) {
            setSelectedTicker(filtered[highlightedRow]);
            setPanelBTab(1);
            setMobileTab('B');
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, highlightedRow, loadData]);

  // ── Macro data (static / indicative) ─────────────────────────────────────────
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

  // ── PANEL RENDERERS ──────────────────────────────────────────────────────────

  const panelA = (
    <div className="flex flex-col h-full overflow-hidden" style={{ borderRight: `1px solid ${BB_BORDER}`, borderBottom: `1px solid ${BB_BORDER}`, background: BB_PANEL }}>
      <PanelHeader title={t('panel_a_title')}>
        <span style={{ color: '#000', fontSize: '10px' }}>{stocks.length} val.</span>
      </PanelHeader>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 border-b border-[#1E293B] bg-[#040914]">
        <input
          ref={searchRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setQuickFilter('ALL'); }}
          placeholder={t('search_placeholder')}
          className="flex-1 bg-transparent outline-none text-[12px] px-2"
          style={{ ...robotoMono.style, color: BB_WHITE, caretColor: BB_ORANGE }}
        />
        {(['ALL', 'TOP', 'PIRES', 'VOLUME'] as QuickFilter[]).map(f => (
          <button
            key={f}
            onClick={() => { setQuickFilter(f); setSearch(''); }}
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
      </div>

      {/* Column headers (Grid) */}
      <div
        className="grid items-center gap-2 flex-shrink-0 text-[11px] font-bold px-[8px] py-2 border-b border-[#1E293B] bg-[#0A0F1D]"
        style={{ color: BB_MUTED, ...robotoMono.style, gridTemplateColumns: '70px minmax(120px, 1fr) 70px 80px 70px 90px' }}
      >
        <span className="cursor-pointer hover:text-white truncate" onClick={() => toggleSort('TICKER')}>{t('col_ticker')} {sortField==='TICKER'? (sortDir==='ASC'?'↑':'↓'):''}</span>
        <span>{t('col_name')}</span>
        <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('PRICE')}>{t('col_price')} {sortField==='PRICE'? (sortDir==='ASC'?'↑':'↓'):''}</span>
        <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('CHANGE')}>{t('col_change_pct')} {sortField==='CHANGE'? (sortDir==='ASC'?'↑':'↓'):''}</span>
        <span className="text-right cursor-pointer hover:text-white" onClick={() => toggleSort('VOLUME')}>{t('col_volume')} {sortField==='VOLUME'? (sortDir==='ASC'?'↑':'↓'):''}</span>
        <span className="text-center">{t('col_signal')}</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" ref={listRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm font-bold" style={{ color: BB_ORANGE, ...robotoMono.style }}>
            {t('loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_MUTED, ...robotoMono.style }}>
            {t('no_data')}
          </div>
        ) : (
          filtered.map((stock, i) => (
            <StockRow
              key={stock.ticker}
              stock={stock}
              isHighlighted={i === highlightedRow}
              isSelected={selectedTicker?.ticker === stock.ticker}
              isFlashing={flashTickers.has(stock.ticker)}
              onClick={() => { setSelectedTicker(stock); setPanelBTab(1); setMobileTab('B'); setHighlightedRow(i); }}
            />
          ))
        )}
      </div>
    </div>
  );

  const panelB = (
    <div className="flex flex-col h-full overflow-hidden" style={{ borderBottom: `1px solid ${BB_BORDER}`, background: BB_PANEL }}>
      <PanelHeader title={selectedTicker ? `${selectedTicker.ticker} — ACTIONS BVC` : t('panel_b_title')}>
        {[1, 2, 3].map(tab => (
          <button
            key={tab}
            onClick={() => setPanelBTab(tab as PanelBTab)}
            className="text-[10px] px-3 py-1 font-bold rounded-sm"
            style={{
              background: panelBTab === tab ? '#000' : 'transparent',
              color: panelBTab === tab ? BB_ORANGE : '#000',
              ...inter.style,
            }}
          >
            {tab === 1 ? t('tab_quote') : tab === 2 ? t('tab_chart') : t('tab_financials')}
          </button>
        ))}
      </PanelHeader>

      <div className="flex-1 overflow-y-auto p-0">
        {!selectedTicker ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={robotoMono.style}>
            <div className="text-3xl" style={{ color: BB_MUTED }}>◈</div>
            <p className="text-sm font-bold" style={{ color: BB_ORANGE }}>Veuillez sélectionner une action BVC</p>
            <p className="text-xs" style={{ color: BB_MUTED }}>{t('no_ticker_sub')}</p>
          </div>
        ) : panelBTab === 1 ? (
          /* ── TAB 1: QUOTE ── */
          <div className="p-4" style={robotoMono.style}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-2xl font-black tracking-tight" style={{ color: BB_CYAN }}>{selectedTicker.ticker}</p>
                <p className="text-sm mt-1" style={{ color: BB_MUTED }}>{selectedTicker.name}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black tabular-nums" style={{ color: BB_WHITE }}>{fmtPrice(selectedTicker.lastPrice)}</p>
                <p className="text-xs font-bold mt-1" style={{ color: BB_MUTED }}>MAD</p>
              </div>
            </div>

            {/* Change */}
            <div
              className="flex items-center gap-4 p-3 mb-4 text-sm font-bold rounded-sm"
              style={{ background: (selectedTicker.changePercent ?? 0) >= 0 ? '#00e67610' : '#ff174410', border: `1px solid ${(selectedTicker.changePercent ?? 0) >= 0 ? '#00E67633' : '#FF174433'}` }}
            >
              <span className="tabular-nums" style={{ color: pctColor(selectedTicker.changePercent), fontSize: '20px' }}>
                {fmtPct(selectedTicker.changePercent)}
              </span>
              <span className="tabular-nums" style={{ color: pctColor(selectedTicker.changePercent) }}>
                {(selectedTicker.change ?? 0) >= 0 ? '+' : ''}{fmtPrice(selectedTicker.change)} MAD
              </span>
            </div>

            {/* OHLV Grid */}
            <div className="grid grid-cols-2 gap-[1px] mb-4 bg-[#1E293B]">
              {[
                { label: t('open'),   value: fmtPrice(selectedTicker.open) + ' MAD' },
                { label: t('high'),   value: fmtPrice(selectedTicker.high) + ' MAD' },
                { label: t('low'),    value: fmtPrice(selectedTicker.low)  + ' MAD' },
                { label: t('volume'), value: fmtVolume(selectedTicker.volume) },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3" style={{ background: BB_PANEL }}>
                  <p className="text-xs font-bold mb-1" style={{ color: BB_MUTED }}>{label}</p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: BB_WHITE }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Signal */}
            {(() => {
              const sig = getSignal(selectedTicker.changePercent);
              const sigColor = sig === 'HAUSSIER' ? BB_GREEN : sig === 'BAISSIER' ? BB_RED : BB_YELLOW;
              return (
                <div className="flex items-center justify-between p-3 text-sm font-bold rounded-sm border border-[#1E293B]">
                  <span style={{ color: BB_MUTED }}>SIGNAL TECHNIQUE</span>
                  <span style={{ color: sigColor }}>{sig}</span>
                </div>
              );
            })()}

            <p className="mt-3 text-xs" style={{ color: BB_MUTED }}>
              * {t('signal_tooltip')}
            </p>
          </div>
        ) : panelBTab === 2 ? (
          /* ── TAB 2: CHART ── */
          <div className="h-full flex flex-col">
            <div className="flex gap-2 p-2 flex-shrink-0 border-b border-[#1E293B]">
              {['1D','1W','1M','3M','6M','1Y'].map(r => (
                <button key={r} className="text-xs px-2 py-1 font-bold rounded-sm" style={{ color: BB_ORANGE, border: `1px solid ${BB_BORDER}`, ...robotoMono.style }}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-[300px]">
              <TradingViewChart
                symbol={`CSEMA:${selectedTicker.ticker}`}
                height={300}
                theme="dark"
                interval="D"
                showToolbar={false}
              />
            </div>
          </div>
        ) : (
          /* ── TAB 3: FINANCIALS ── */
          <div className="p-4" style={robotoMono.style}>
            <div className="h-[300px]">
              <TradingViewChart
                symbol={`CSEMA:${selectedTicker.ticker}`}
                height={300}
                theme="dark"
                interval="D"
                showToolbar={false}
              />
            </div>
            <p className="mt-3 text-xs text-center" style={{ color: BB_MUTED }}>
              Données via TradingView · Graphique différé
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const panelC = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ borderRight: `1px solid ${BB_BORDER}`, background: BB_PANEL }}>
      <PanelHeader title={t('panel_c_title')} />

      <div className="p-4 space-y-6" style={robotoMono.style}>
        {/* MASI Dashboard */}
        <div>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: BB_ORANGE }}>■ {t('masi_label')} / MARCHÉ</p>
          <div className="space-y-1">
            {[
              { label: t('masi_label'),       value: stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—', chgPct: avgChange,  isIndex: true },
              { label: t('valeurs_totales'),   value: `${stocks.length}`,                                                                  chgPct: null,       isIndex: false },
              { label: t('total_volume'),      value: fmtVolume(totalVolume) + ' MAD',                                                     chgPct: null,       isIndex: false },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                <span className="font-bold" style={{ color: row.isIndex ? BB_CYAN : BB_MUTED }}>{row.label}</span>
                <span className="font-bold tabular-nums" style={{ color: row.isIndex ? pctColor(row.chgPct) : BB_WHITE }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-[1px] mt-4 bg-[#1E293B] border border-[#1E293B]">
            {[
              { label: t('advancers'), value: advancers, color: BB_GREEN },
              { label: t('decliners'), value: decliners, color: BB_RED   },
              { label: t('stable'),    value: stable,    color: BB_MUTED  },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-2 bg-[#0B101E]">
                <p className="text-xl font-black tabular-nums" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-1 uppercase" style={{ color: BB_MUTED }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fear & Greed */}
        <div>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: BB_ORANGE }}>■ {t('fg_title')}</p>
          <FearGreedGauge score={fgScore} label={fgLabel(fgScore)} color={fgColor(fgScore)} />
          <div className="mt-4 space-y-2">
            {[
              { label: t('fg_breadth'),    value: fgBreadth,    weight: '40%' },
              { label: t('fg_momentum'),   value: fgMomentum,   weight: '30%' },
              { label: t('fg_volatility'), value: fgVolatility, weight: '20%' },
              { label: t('fg_volume_label'), value: 50,         weight: '10%' },
            ].map(({ label, value, weight }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span style={{ color: BB_MUTED }}>{label} <span style={{ color: '#475569' }}>({weight})</span></span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-none overflow-hidden" style={{ background: BB_BORDER }}>
                    <div style={{ width: `${value}%`, height: '100%', background: fgColor(value) }} />
                  </div>
                  <span className="tabular-nums font-bold min-w-[2ch] text-right" style={{ color: BB_WHITE }}>{Math.round(value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        {movers && (
          <div>
            <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: BB_ORANGE }}>■ MOVERS</p>
            <div className="grid grid-cols-2 gap-4">
              {([
                { key: 'gainers' as const, label: t('top_gainers'), color: BB_GREEN },
                { key: 'losers'  as const, label: t('top_losers'),  color: BB_RED   },
              ] as const).map(({ key, label, color }) => (
                <div key={key}>
                  <p className="text-[11px] font-bold mb-2 uppercase border-b border-[#1E293B] pb-1" style={{ color }}>{label}</p>
                  {movers[key].slice(0, 5).map(s => (
                    <div
                      key={s.ticker}
                      className="flex justify-between text-xs cursor-pointer hover:bg-[#1E293B] px-1 py-1.5 rounded-sm"
                      onClick={() => { setSelectedTicker(s); setPanelBTab(1); setMobileTab('B'); }}
                    >
                      <span className="font-bold" style={{ color: BB_CYAN }}>{s.ticker}</span>
                      <span className="tabular-nums font-bold" style={{ color }}>{fmtPct(s.changePercent)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const panelD = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BB_PANEL }}>
      <PanelHeader title={t('panel_d_title')} />

      <div className="p-4 space-y-6" style={robotoMono.style}>
        {/* FX Rates */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-[#1E293B] pb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: BB_ORANGE }}>■ {t('fx_title')}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: '#1a1a00', color: BB_YELLOW, border: `1px solid ${BB_YELLOW}33` }}>
              {t('indicative')}
            </span>
          </div>
          {fxData.map(({ pair, rate, chg }) => {
            const chgNum = parseFloat(chg);
            return (
              <div key={pair} className="flex items-center justify-between text-sm py-1.5">
                <span className="font-bold tracking-wider" style={{ color: BB_CYAN }}>{pair}</span>
                <span className="font-bold tabular-nums" style={{ color: BB_WHITE }}>{rate}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: pctColor(chgNum) }}>{chgNum >= 0 ? '+' : ''}{chg}</span>
              </div>
            );
          })}
        </div>

        {/* Macro indicators */}
        <div>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider border-b border-[#1E293B] pb-2" style={{ color: BB_ORANGE }}>■ {t('macro_title')}</p>
          {macroData.map(({ label, value, source }) => (
            <div key={label} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-xs" style={{ color: BB_MUTED }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums" style={{ color: BB_WHITE }}>{value}</span>
                <span className="text-[10px]" style={{ color: '#475569' }}>[{source}]</span>
              </div>
            </div>
          ))}
          <p className="mt-2 text-[10px]" style={{ color: '#475569' }}>Mis à jour: 2026 · {t('indicative')}</p>
        </div>

        {/* Mini Calendar */}
        <div>
          <p className="text-xs font-bold mb-3 uppercase tracking-wider border-b border-[#1E293B] pb-2" style={{ color: BB_ORANGE }}>■ {t('calendar_title')}</p>
          <div className="space-y-2 text-xs" style={{ color: BB_MUTED }}>
            {[
              { date: 'Avr 03', evt: 'BAM — Décision de taux directeur',  ticker: 'BAM' },
              { date: 'Avr 10', evt: 'Maroc Telecom — Publication T1', ticker: 'IAM' },
              { date: 'Avr 17', evt: 'HCP — Publication indice des prix', ticker: 'HCP' },
            ].map(({ date, evt, ticker }) => {
              const badgeColor = ticker === 'BAM' ? BB_CYAN : ticker === 'IAM' ? BB_YELLOW : ticker === 'ATW' ? BB_GREEN : BB_MUTED;
              return (
                <div key={date} className="flex gap-2 py-1 items-start">
                  <span className="w-12 flex-shrink-0 font-bold mt-0.5" style={{ color: BB_YELLOW }}>{date}</span>
                  <span className="flex-1 leading-relaxed" style={{ color: BB_WHITE }}>{evt}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5"
                    style={{ color: badgeColor, border: `1px solid ${badgeColor}44`, background: `${badgeColor}11` }}
                  >
                    {ticker}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href="/calendar" className="inline-block mt-4 text-xs font-bold hover:underline" style={{ color: BB_CYAN }}>
            → {t('see_full_calendar')}
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Keyboard Help Modal ───────────────────────────────────────────────────────
  const helpModal = showHelp && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4, 9, 20, 0.9)' }}
      onClick={() => setShowHelp(false)}
    >
      <div
        className="p-0 w-full max-w-lg shadow-2xl rounded-sm overflow-hidden"
        style={{ border: `1px solid ${BB_ORANGE}`, background: BB_PANEL, ...robotoMono.style }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: BB_ORANGE }}>
          <span className="text-sm font-black text-[#000] uppercase tracking-wider">{t('help_title')}</span>
          <button onClick={() => setShowHelp(false)} className="text-[#000] font-black text-lg hover:opacity-70">✕</button>
        </div>
        <div className="p-6 space-y-3 text-xs">
          {[
            { key: 'H',       desc: t('help_h') },
            { key: 'T',       desc: t('help_t') },
            { key: '↑ / ↓',   desc: t('help_arrows') },
            { key: 'Enter',   desc: t('help_enter') },
            { key: '1 / 2 / 3', desc: t('help_123') },
            { key: 'R',       desc: t('help_r') },
            { key: 'Esc',     desc: t('help_esc') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4 items-center">
              <span className="w-24 font-bold text-center py-1 rounded-sm bg-[#1E293B]" style={{ color: BB_YELLOW }}>[{key}]</span>
              <span className="text-sm" style={{ color: BB_WHITE }}>{desc}</span>
            </div>
          ))}
          <div className="mt-6 pt-4 text-sm" style={{ borderTop: `1px solid ${BB_BORDER}`, color: BB_ORANGE, fontWeight: 'bold' }}>
            COMMANDES CMD:
          </div>
          {[
            { key: 'TOP',      desc: t('cmd_help_top') },
            { key: 'PIRES',    desc: t('cmd_help_pires') },
            { key: 'CLR',      desc: t('cmd_help_clr') },
            { key: '<TICKER>', desc: t('cmd_help_ticker') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4 items-center">
              <span className="w-24 font-bold text-center py-1" style={{ color: BB_CYAN }}>{key}</span>
              <span className="text-sm" style={{ color: BB_WHITE }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ROOT RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{ background: BB_BG, color: BB_WHITE, ...inter.style }}
    >
      {helpModal}

      {/* ── TOP COMMAND BAR ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-4 h-14 flex-shrink-0 text-sm z-10 relative"
        style={{ background: BB_PANEL, borderBottom: `1px solid ${BB_BORDER}` }}
      >
        {/* Logo */}
        <Link href="/" className="font-black text-sm flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: BB_ORANGE, letterSpacing: '2px' }}>
          ◈ {t('topbar_title')}
        </Link>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* MASI indicator */}
        <div className="flex items-center gap-2 flex-shrink-0" style={robotoMono.style}>
          <span className="font-bold text-xs" style={{ color: BB_MUTED }}>MASI</span>
          <span className="font-bold text-[13px] tabular-nums" style={{ color: BB_WHITE }}>
            {stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—'}
          </span>
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Market status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: marketStatus.open ? BB_GREEN : BB_RED, boxShadow: marketStatus.open ? `0 0 6px ${BB_GREEN}` : 'none' }}
          />
          <span className="font-bold text-xs uppercase tracking-wider" style={{ color: marketStatus.open ? BB_GREEN : BB_RED }}>
            {marketStatus.open ? t('live') : t('closed')}
          </span>
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Clock */}
        <span className="font-bold text-sm tracking-widest flex-shrink-0 tabular-nums" style={{ color: BB_YELLOW, ...robotoMono.style }}>{clock}</span>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* CMD input */}
        <div className="flex items-center gap-2 flex-1 min-w-0" style={robotoMono.style}>
          <span className="font-bold text-xs flex-shrink-0" style={{ color: BB_ORANGE }}>CMD:</span>
          <input
            ref={cmdRef}
            value={cmdValue}
            onChange={e => { setCmdValue(e.target.value.toUpperCase()); setCmdMsg(''); }}
            onKeyDown={handleCmd}
            placeholder={t('cmd_placeholder')}
            className="bg-transparent outline-none flex-1 min-w-0 uppercase font-bold text-sm"
            style={{ color: BB_WHITE, caretColor: BB_ORANGE }}
            autoComplete="off"
            spellCheck={false}
          />
          {cmdMsg && (
            <span className="text-xs font-bold truncate flex-shrink-0 max-w-[250px]" style={{ color: cmdMsg.includes('INCONNUE') ? BB_RED : BB_GREEN }}>
              {cmdMsg}
            </span>
          )}
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Help + nav */}
        <div className="flex items-center gap-2 flex-shrink-0" style={robotoMono.style}>
          <button
            onClick={() => setShowHelp(v => !v)}
            className="px-2 py-1 text-xs font-bold rounded hover:bg-[#1E293B] transition-colors"
            style={{ border: `1px solid ${BB_BORDER}`, color: BB_MUTED }}
          >
            [H] AIDE
          </button>
          <button
            onClick={loadData}
            className="px-2 py-1 text-xs font-bold rounded hover:bg-[#1E293B] transition-colors"
            style={{ border: `1px solid ${BB_BORDER}`, color: BB_MUTED }}
            title="Reload (R)"
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      {/* ── MOBILE TABS ──────────────────────────────────────────────────────────── */}
      <div className="flex sm:hidden flex-shrink-0" style={{ background: BB_PANEL, borderBottom: `1px solid ${BB_BORDER}` }}>
        {(['A','B','C','D'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className="flex-1 py-3 text-xs font-bold text-center uppercase tracking-widest"
            style={{
              background: mobileTab === tab ? BB_ORANGE : 'transparent',
              color: mobileTab === tab ? '#000' : BB_MUTED,
              borderRight: `1px solid ${BB_BORDER}`,
            }}
          >
            {tab === 'A' ? t('mobile_tab_a') : tab === 'B' ? t('mobile_tab_b') : tab === 'C' ? t('mobile_tab_c') : t('mobile_tab_d')}
          </button>
        ))}
      </div>

      {/* ── EQUITY TERMINAL (H-SCREEN BLOCK) ─────────────────────────────────────── */}
      <div className="h-[calc(100vh-56px)] flex-shrink-0">
        <div className="hidden sm:grid h-full" style={{ gridTemplateColumns: '55fr 45fr', gridTemplateRows: '1fr 1fr' }}>
          {panelA}
          {panelB}
          {panelC}
          {panelD}
        </div>
        <div className="sm:hidden h-full">
          {mobileTab === 'A' && panelA}
          {mobileTab === 'B' && panelB}
          {mobileTab === 'C' && panelC}
          {mobileTab === 'D' && panelD}
        </div>
      </div>

      {/* ── SEPARATE MODULE: OPCVM / FUNDS (STATIC LIST) ─────────────────────────── */}
      <div className="mt-8 border-t-[4px]" style={{ borderColor: BB_BORDER, background: BB_BG }}>
        <div className="max-w-[1400px] mx-auto p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: BB_CYAN }}>OPCVM / FUNDS</h2>
              <p className="text-sm mt-1" style={{ color: BB_MUTED }}>Fonds d'investissement Marocains — Données statiques de référence</p>
            </div>
            {/* Filter buttons for OPCVM */}
            <div className="flex flex-wrap items-center gap-2 p-1 rounded-sm" style={{ background: BB_PANEL, border: `1px solid ${BB_BORDER}` }}>
              {(['ALL', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'] as OpcvmFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setOpcvmFilter(f)}
                  className={`text-xs px-3 py-1.5 font-bold rounded-sm uppercase tracking-wide transition-colors ${robotoMono.className}`}
                  style={{
                    background: opcvmFilter === f ? BB_ORANGE : 'transparent',
                    color: opcvmFilter === f ? '#000' : BB_MUTED,
                  }}
                >
                  {f === 'ALL' ? t('filter_all') : f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0B101E] border border-[#1E293B] rounded-md overflow-hidden" style={robotoMono.style}>
            {/* Table Header */}
            <div className="grid grid-cols-[100px_minmax(180px,1fr)_120px_100px_100px_100px] gap-4 px-6 py-3 border-b border-[#1E293B] bg-[#0A0F1D] text-xs font-bold text-[#8B95A1] uppercase tracking-wider">
              <span>Catégorie</span>
              <span>Nom du Fonds</span>
              <span className="text-right">VL (MAD)</span>
              <span className="text-right">Perf 1M</span>
              <span className="text-right">Perf YTD</span>
              <span className="text-right">Perf 1AN</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#1E293B]">
              {opcvmLoading ? (
                <div className="p-8 text-center text-sm font-bold" style={{ color: BB_ORANGE }}>{t('loading')}</div>
              ) : filteredOpcvm.length === 0 ? (
                <div className="p-8 text-center text-sm" style={{ color: BB_MUTED }}>Aucun fonds trouvé pour cette catégorie.</div>
              ) : (
                filteredOpcvm.map((fund, i) => (
                  <div key={`${fund.name}-${i}`} className="grid grid-cols-[100px_minmax(180px,1fr)_120px_100px_100px_100px] gap-4 px-6 py-4 hover:bg-[#111827] transition-colors items-center text-sm">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-sm uppercase inline-block text-center border"
                      style={{
                        color: opcvmTypeColor(fund.type),
                        borderColor: `${opcvmTypeColor(fund.type)}44`,
                        background: `${opcvmTypeColor(fund.type)}11`,
                      }}
                    >
                      {fund.type?.slice(0, 8)}
                    </span>
                    <div>
                      <p className="font-bold truncate text-white" title={fund.name}>{fund.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#8B95A1] mt-1">{fund.societe_gestion || '—'}</p>
                    </div>
                    <span className="text-right font-bold tabular-nums text-white">
                      {fund.vl != null ? fund.vl.toFixed(2) : '—'}
                    </span>
                    <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_1m) }}>
                      {fmtPerf(fund.perf_1m)}
                    </span>
                    <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_ytd) }}>
                      {fmtPerf(fund.perf_ytd)}
                    </span>
                    <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_1an) }}>
                      {fmtPerf(fund.perf_1an)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <p className="mt-4 text-[10px] uppercase tracking-wider text-[#8B95A1] max-w-2xl" style={robotoMono.style}>
            ⚠️ {t('opcvm_disclaimer')}
          </p>
        </div>
      </div>

      {/* ── DISCLAIMER BAR ────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-center px-4 py-2 text-[10px] font-bold text-center tracking-wider uppercase"
        style={{ background: '#0A0F1D', color: BB_MUTED, borderTop: `1px solid ${BB_BORDER}` }}
      >
        ⚠️ {t('disclaimer')} ⚠️
      </div>
    </div>
  );
}
