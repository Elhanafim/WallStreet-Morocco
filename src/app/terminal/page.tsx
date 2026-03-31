'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import {
  fetchSnapshot,
  fetchMovers,
  type BVCPrice,
  type BVCMovers,
  getMarketStatus,
} from '@/lib/bvcPriceService';
import { fetchOpcvm, type OpcvmFund } from '@/lib/opcvmService';

const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-[#ff6600] font-mono text-xs">
      CHARGEMENT GRAPHIQUE...
    </div>
  ),
});

// ── Bloomberg color tokens ─────────────────────────────────────────────────────
const BB_ORANGE = '#ff6600';
const BB_GREEN  = '#00ff41';
const BB_RED    = '#ff2244';
const BB_YELLOW = '#ffd700';
const BB_CYAN   = '#00bfff';
const BB_WHITE  = '#e8e8e8';
const BB_MUTED  = '#555566';
const BB_BORDER = '#1a1a2e';
const BB_PANEL  = '#0a0a0a';

// ── Types ──────────────────────────────────────────────────────────────────────
type QuickFilter = 'ALL' | 'TOP' | 'PIRES' | 'VOLUME';
type PanelBTab   = 1 | 2 | 3;
type MobileTab   = 'A' | 'B' | 'C' | 'D';
type ViewMode    = 'bvc' | 'opcvm';
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
      className="flex items-center justify-between px-3 py-1 flex-shrink-0 text-black text-xs font-bold uppercase tracking-widest"
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
  const sigBg    = signal === 'HAUSSIER' ? '#00ff4110' : signal === 'BAISSIER' ? '#ff224410' : '#ffd70010';
  const sigKey   = signal === 'HAUSSIER' ? 'signal_bullish' : signal === 'BAISSIER' ? 'signal_bearish' : 'signal_neutral';

  const bg = isSelected
    ? '#1a1a00'
    : isHighlighted
    ? '#111122'
    : isFlashing
    ? (stock.changePercent ?? 0) >= 0 ? '#002200' : '#220000'
    : 'transparent';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-0 cursor-pointer select-none transition-colors duration-150"
      style={{
        background: bg,
        borderLeft: isSelected ? `2px solid ${BB_ORANGE}` : '2px solid transparent',
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        color: BB_WHITE,
      }}
    >
      {/* TICKER */}
      <span className="w-14 px-1.5 py-0.5 font-bold" style={{ color: BB_CYAN }}>{stock.ticker}</span>
      {/* NOM */}
      <span className="flex-1 px-1 py-0.5 truncate" style={{ color: BB_MUTED }}>{stock.name.slice(0, 22)}</span>
      {/* COURS */}
      <span className="w-16 px-1 py-0.5 text-right font-bold">{fmtPrice(stock.lastPrice)}</span>
      {/* VAR% */}
      <span className="w-20 px-1 py-0.5 text-right font-bold" style={{ color: pctColor(stock.changePercent) }}>
        {fmtPct(stock.changePercent)}
      </span>
      {/* VOLUME */}
      <span className="w-14 px-1 py-0.5 text-right" style={{ color: BB_MUTED }}>{fmtVolume(stock.volume)}</span>
      {/* SIGNAL */}
      <span className="w-16 px-1 py-0.5 flex items-center justify-center">
        <span
          className="text-[11px] font-bold px-1.5 py-0.5"
          style={{
            color: sigColor,
            border: `1px solid ${sigColor}55`,
            background: sigBg,
            fontFamily: "'Courier New', monospace",
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
    { label: 'PEUR',         color: '#ff6622', pct: 20 },
    { label: 'NEUTRE',       color: BB_YELLOW, pct: 20 },
    { label: 'OPTIMISME',    color: '#88cc00', pct: 20 },
    { label: 'EUPHORIE',     color: BB_GREEN,  pct: 20 },
  ];
  return (
    <div>
      <div className="flex items-end justify-between mb-1">
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
      <div className="relative h-1 w-full mt-0.5">
        <div
          className="absolute top-0 w-0.5 h-2"
          style={{ left: `${Math.min(99, score)}%`, background: color, transform: 'translateX(-50%)' }}
        />
      </div>
      <p className="text-center mt-1 text-sm font-bold" style={{ color, fontFamily: "'Courier New', monospace" }}>
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
  const [highlightedRow,  setHighlightedRow]  = useState(0);
  const [panelBTab,       setPanelBTab]       = useState<PanelBTab>(1);
  const [showHelp,        setShowHelp]        = useState(false);
  const [cmdValue,        setCmdValue]        = useState('');
  const [cmdMsg,          setCmdMsg]          = useState('');
  const [clock,           setClock]           = useState('');
  const [flashTickers,    setFlashTickers]    = useState<Set<string>>(new Set());
  const [mobileTab,       setMobileTab]       = useState<MobileTab>('A');

  // ── OPCVM state ──────────────────────────────────────────────────────────────
  const [viewMode,      setViewMode]      = useState<ViewMode>('bvc');
  const [opcvmFunds,    setOpcvmFunds]    = useState<OpcvmFund[]>([]);
  const [opcvmLoading,  setOpcvmLoading]  = useState(false);
  const [selectedOpcvm, setSelectedOpcvm] = useState<OpcvmFund | null>(null);
  const [opcvmFilter,   setOpcvmFilter]   = useState<OpcvmFilter>('ALL');
  const [opcvmSource,   setOpcvmSource]   = useState('');

  const cmdRef         = useRef<HTMLInputElement>(null);
  const searchRef      = useRef<HTMLInputElement>(null);
  const prevPricesRef  = useRef<Map<string, number>>(new Map());

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

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5 * 60_000);
    return () => clearInterval(id);
  }, [loadData]);

  // ── OPCVM data loading ───────────────────────────────────────────────────────
  const loadOpcvm = useCallback(async () => {
    setOpcvmLoading(true);
    try {
      const data = await fetchOpcvm();
      setOpcvmFunds(data.funds);
      setOpcvmSource(data.source);
    } finally {
      setOpcvmLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'opcvm' && opcvmFunds.length === 0) {
      loadOpcvm();
    }
  }, [viewMode, opcvmFunds.length, loadOpcvm]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...stocks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }
    if (quickFilter === 'TOP')    return [...stocks].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 10);
    if (quickFilter === 'PIRES')  return [...stocks].sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0)).slice(0, 10);
    if (quickFilter === 'VOLUME') return [...stocks].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    return list;
  }, [stocks, search, quickFilter]);

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
    if (s < 40) return '#ff6622';
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
    if (cmd === 'OPCVM') { setViewMode('opcvm'); setCmdMsg('→ OPCVM: FONDS MAROC'); return; }
    if (cmd === 'BVC')   { setViewMode('bvc');   setCmdMsg('→ BVC: VALEURS'); return; }

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
          setHighlightedRow(r => Math.min(r + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedRow(r => Math.max(r - 1, 0));
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
    <div className="flex flex-col h-full overflow-hidden" style={{ borderRight: `1px solid ${BB_BORDER}`, borderBottom: `1px solid ${BB_BORDER}` }}>
      <PanelHeader title={t('panel_a_title')}>
        <span style={{ color: BB_MUTED, fontSize: '9px' }}>{stocks.length} val.</span>
      </PanelHeader>

      {/* Filter bar */}
      <div className="flex items-center gap-1 px-1 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${BB_BORDER}`, background: '#050505' }}>
        <input
          ref={searchRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setQuickFilter('ALL'); }}
          placeholder={t('search_placeholder')}
          className="flex-1 bg-transparent outline-none text-[10px] px-1"
          style={{ fontFamily: "'Courier New', monospace", color: BB_WHITE, caretColor: BB_ORANGE }}
        />
        {(['ALL', 'TOP', 'PIRES', 'VOLUME'] as QuickFilter[]).map(f => (
          <button
            key={f}
            onClick={() => { setQuickFilter(f); setSearch(''); }}
            className="text-[9px] px-1.5 py-0.5 font-bold"
            style={{
              background: quickFilter === f ? BB_ORANGE : 'transparent',
              color: quickFilter === f ? '#000' : BB_MUTED,
              border: `1px solid ${quickFilter === f ? BB_ORANGE : BB_BORDER}`,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {f === 'ALL' ? t('filter_all') : f === 'TOP' ? 'TOP' : f === 'PIRES' ? 'PIRES' : 'VOL↑'}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="flex items-center gap-0 flex-shrink-0 text-xs font-bold px-0"
        style={{ background: '#111', color: BB_MUTED, fontFamily: "'Courier New', monospace", borderBottom: `1px solid ${BB_BORDER}` }}
      >
        <span className="w-14 px-1.5 py-0.5">{t('col_ticker')}</span>
        <span className="flex-1 px-1">{t('col_name')}</span>
        <span className="w-16 px-1 text-right">{t('col_price')}</span>
        <span className="w-20 px-1 text-right">{t('col_change_pct')}</span>
        <span className="w-14 px-1 text-right">{t('col_volume')}</span>
        <span className="w-16 px-1 text-center">{t('col_signal')}</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_ORANGE, fontFamily: "'Courier New', monospace" }}>
            {t('loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_MUTED, fontFamily: "'Courier New', monospace" }}>
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
    <div className="flex flex-col h-full overflow-hidden" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
      <PanelHeader title={selectedTicker ? `${selectedTicker.ticker} — ${t('panel_b_title')}` : t('panel_b_title')}>
        {[1, 2, 3].map(tab => (
          <button
            key={tab}
            onClick={() => setPanelBTab(tab as PanelBTab)}
            className="text-[9px] px-2 py-0.5 font-bold"
            style={{
              background: panelBTab === tab ? '#000' : 'transparent',
              color: panelBTab === tab ? BB_ORANGE : '#000',
            }}
          >
            {tab === 1 ? t('tab_quote') : tab === 2 ? t('tab_chart') : t('tab_financials')}
          </button>
        ))}
      </PanelHeader>

      <div className="flex-1 overflow-y-auto p-0">
        {!selectedTicker ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
            <div className="text-2xl" style={{ color: BB_ORANGE }}>◈</div>
            <p className="text-xs font-bold" style={{ color: BB_ORANGE }}>{t('no_ticker')}</p>
            <p className="text-xs" style={{ color: BB_MUTED }}>{t('no_ticker_sub')}</p>
          </div>
        ) : panelBTab === 1 ? (
          /* ── TAB 1: QUOTE ── */
          <div className="p-3" style={{ fontFamily: "'Courier New', monospace" }}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xl font-black" style={{ color: BB_CYAN }}>{selectedTicker.ticker}</p>
                <p className="text-sm" style={{ color: BB_MUTED }}>{selectedTicker.name}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black" style={{ color: BB_WHITE }}>{fmtPrice(selectedTicker.lastPrice)}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: BB_MUTED }}>MAD</p>
              </div>
            </div>

            {/* Change */}
            <div
              className="flex items-center gap-3 p-2 mb-3 text-sm font-bold"
              style={{ background: (selectedTicker.changePercent ?? 0) >= 0 ? '#002200' : '#220000', border: `1px solid ${(selectedTicker.changePercent ?? 0) >= 0 ? BB_GREEN : BB_RED}` }}
            >
              <span style={{ color: pctColor(selectedTicker.changePercent), fontSize: '20px' }}>
                {fmtPct(selectedTicker.changePercent)}
              </span>
              <span style={{ color: pctColor(selectedTicker.changePercent) }}>
                {(selectedTicker.change ?? 0) >= 0 ? '+' : ''}{fmtPrice(selectedTicker.change)} MAD
              </span>
            </div>

            {/* OHLV Grid */}
            <div className="grid grid-cols-2 gap-px mb-3" style={{ background: BB_BORDER }}>
              {[
                { label: t('open'),   value: fmtPrice(selectedTicker.open) + ' MAD' },
                { label: t('high'),   value: fmtPrice(selectedTicker.high) + ' MAD' },
                { label: t('low'),    value: fmtPrice(selectedTicker.low)  + ' MAD' },
                { label: t('volume'), value: fmtVolume(selectedTicker.volume) },
              ].map(({ label, value }) => (
                <div key={label} className="px-2 py-1.5" style={{ background: BB_PANEL }}>
                  <p className="text-xs font-bold mb-0.5" style={{ color: BB_MUTED }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: BB_WHITE }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Signal */}
            {(() => {
              const sig = getSignal(selectedTicker.changePercent);
              const sigColor = sig === 'HAUSSIER' ? BB_GREEN : sig === 'BAISSIER' ? BB_RED : BB_YELLOW;
              return (
                <div className="flex items-center justify-between p-2 text-sm font-bold" style={{ border: `1px solid ${BB_BORDER}` }}>
                  <span style={{ color: BB_MUTED }}>SIGNAL TECHNIQUE</span>
                  <span style={{ color: sigColor }}>{sig}</span>
                </div>
              );
            })()}

            <p className="mt-2 text-xs" style={{ color: BB_MUTED }}>
              * {t('signal_tooltip')}
            </p>
          </div>
        ) : panelBTab === 2 ? (
          /* ── TAB 2: CHART ── */
          <div className="h-full flex flex-col">
            <div className="flex gap-1 p-1 flex-shrink-0" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
              {['1D','1W','1M','3M','6M','1Y'].map(r => (
                <button key={r} className="text-xs px-2 py-0.5 font-bold" style={{ color: BB_ORANGE, border: `1px solid ${BB_BORDER}`, fontFamily: "'Courier New', monospace" }}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <TradingViewChart
                symbol={`CSEMA:${selectedTicker.ticker}`}
                height={280}
                theme="dark"
                interval="D"
                showToolbar={false}
              />
            </div>
          </div>
        ) : (
          /* ── TAB 3: FINANCIALS ── */
          <div className="p-3" style={{ fontFamily: "'Courier New', monospace" }}>
            <TradingViewChart
              symbol={`CSEMA:${selectedTicker.ticker}`}
              height={280}
              theme="dark"
              interval="D"
              showToolbar={false}
            />
            <p className="mt-2 text-xs text-center" style={{ color: BB_MUTED }}>
              Données via TradingView · Graphique différé
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const panelC = (
    <div className="flex flex-col h-full overflow-y-auto" style={{ borderRight: `1px solid ${BB_BORDER}` }}>
      <PanelHeader title={t('panel_c_title')} />

      <div className="p-3 space-y-4" style={{ fontFamily: "'Courier New', monospace" }}>
        {/* MASI Dashboard */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: BB_ORANGE }}>■ {t('masi_label')} / MARCHÉ</p>
          <div className="space-y-1">
            {[
              { label: t('masi_label'),       value: stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—', chgPct: avgChange,  isIndex: true },
              { label: t('valeurs_totales'),   value: `${stocks.length}`,                                                                  chgPct: null,       isIndex: false },
              { label: t('total_volume'),      value: fmtVolume(totalVolume) + ' MAD',                                                     chgPct: null,       isIndex: false },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                <span className="font-bold" style={{ color: row.isIndex ? BB_CYAN : BB_MUTED }}>{row.label}</span>
                <span className="font-bold" style={{ color: row.isIndex ? pctColor(row.chgPct) : BB_WHITE }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1 mt-2">
            {[
              { label: t('advancers'), value: advancers, color: BB_GREEN },
              { label: t('decliners'), value: decliners, color: BB_RED   },
              { label: t('stable'),    value: stable,    color: BB_MUTED  },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-1" style={{ border: `1px solid ${BB_BORDER}` }}>
                <p className="text-base font-black" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: BB_MUTED }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-1 text-xs" style={{ color: BB_MUTED }}>
            {t('total_volume')}: <span style={{ color: BB_WHITE }}>{fmtVolume(totalVolume)}</span>
          </div>
        </div>

        {/* Fear & Greed */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: BB_ORANGE }}>■ {t('fg_title')}</p>
          <FearGreedGauge score={fgScore} label={fgLabel(fgScore)} color={fgColor(fgScore)} />
          <div className="mt-2 space-y-0.5">
            {[
              { label: t('fg_breadth'),    value: fgBreadth,    weight: '40%' },
              { label: t('fg_momentum'),   value: fgMomentum,   weight: '30%' },
              { label: t('fg_volatility'), value: fgVolatility, weight: '20%' },
              { label: t('fg_volume_label'), value: 50,         weight: '10%' },
            ].map(({ label, value, weight }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span style={{ color: BB_MUTED }}>{label} <span style={{ color: BB_BORDER }}>({weight})</span></span>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1 rounded-none overflow-hidden" style={{ background: BB_BORDER }}>
                    <div style={{ width: `${value}%`, height: '100%', background: fgColor(value) }} />
                  </div>
                  <span style={{ color: BB_WHITE }}>{Math.round(value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        {movers && (
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: BB_ORANGE }}>■ MOVERS</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'gainers' as const, label: t('top_gainers'), color: BB_GREEN },
                { key: 'losers'  as const, label: t('top_losers'),  color: BB_RED   },
              ] as const).map(({ key, label, color }) => (
                <div key={key}>
                  <p className="text-xs font-bold mb-1" style={{ color }}>{label}</p>
                  {movers[key].slice(0, 5).map(s => (
                    <div
                      key={s.ticker}
                      className="flex justify-between text-xs cursor-pointer hover:bg-white/5 px-0.5 py-0.5"
                      onClick={() => { setSelectedTicker(s); setPanelBTab(1); setMobileTab('B'); }}
                    >
                      <span style={{ color: BB_CYAN }}>{s.ticker}</span>
                      <span style={{ color }}>{fmtPct(s.changePercent)}</span>
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
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelHeader title={t('panel_d_title')} />

      <div className="p-3 space-y-4" style={{ fontFamily: "'Courier New', monospace" }}>
        {/* FX Rates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold" style={{ color: BB_ORANGE }}>■ {t('fx_title')}</p>
            <span className="text-[10px] px-1 py-0.5" style={{ background: '#1a1a00', color: BB_YELLOW, border: `1px solid ${BB_YELLOW}33` }}>
              {t('indicative')}
            </span>
          </div>
          {fxData.map(({ pair, rate, chg }) => {
            const chgNum = parseFloat(chg);
            return (
              <div key={pair} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                <span className="font-bold" style={{ color: BB_CYAN }}>{pair}</span>
                <span className="font-bold" style={{ color: BB_WHITE }}>{rate}</span>
                <span className="text-xs" style={{ color: pctColor(chgNum) }}>{chgNum >= 0 ? '+' : ''}{chg}</span>
              </div>
            );
          })}
        </div>

        {/* Macro indicators */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: BB_ORANGE }}>■ {t('macro_title')}</p>
          {macroData.map(({ label, value, source }) => (
            <div key={label} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
              <span className="text-xs" style={{ color: BB_MUTED }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: BB_WHITE }}>{value}</span>
                <span className="text-[10px]" style={{ color: BB_BORDER }}>[{source}]</span>
              </div>
            </div>
          ))}
          <p className="mt-1 text-[10px]" style={{ color: BB_MUTED }}>Mis à jour: 2026 · {t('indicative')}</p>
        </div>

        {/* Mini Calendar */}
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: BB_ORANGE }}>■ {t('calendar_title')}</p>
          <div className="space-y-1 text-xs" style={{ color: BB_MUTED }}>
            {[
              { date: 'Avr 03', evt: 'BAM — Décision de taux directeur',  ticker: 'BAM' },
              { date: 'Avr 10', evt: 'Maroc Telecom — Publication résultats T1', ticker: 'IAM' },
              { date: 'Avr 17', evt: 'HCP — Publication indice des prix', ticker: 'HCP' },
            ].map(({ date, evt, ticker }) => {
              const badgeColor = ticker === 'BAM' ? BB_CYAN : ticker === 'IAM' ? BB_YELLOW : ticker === 'ATW' ? BB_GREEN : BB_MUTED;
              return (
                <div key={date} className="flex gap-2 py-1 items-center" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                  <span className="w-10 flex-shrink-0 font-bold" style={{ color: BB_YELLOW }}>{date}</span>
                  <span className="flex-1" style={{ color: BB_WHITE }}>{evt}</span>
                  <span
                    className="text-[8px] font-bold px-1 py-0.5 flex-shrink-0"
                    style={{ color: badgeColor, border: `1px solid ${badgeColor}44`, background: `${badgeColor}11` }}
                  >
                    {ticker}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href="/calendar" className="block mt-2 text-xs hover:underline" style={{ color: BB_CYAN }}>
            {t('see_full_calendar')}
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Keyboard Help Modal ───────────────────────────────────────────────────────
  const helpModal = showHelp && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={() => setShowHelp(false)}
    >
      <div
        className="p-0 w-[520px] max-w-[95vw]"
        style={{ border: `2px solid ${BB_ORANGE}`, background: BB_PANEL, fontFamily: "'Courier New', monospace" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-3 py-1 flex items-center justify-between" style={{ background: BB_ORANGE }}>
          <span className="text-xs font-black text-black">{t('help_title')}</span>
          <button onClick={() => setShowHelp(false)} className="text-black font-black text-sm">✕</button>
        </div>
        <div className="p-4 space-y-1 text-xs">
          {[
            { key: 'H',       desc: t('help_h') },
            { key: 'T',       desc: t('help_t') },
            { key: '↑ / ↓',  desc: t('help_arrows') },
            { key: 'Enter',   desc: t('help_enter') },
            { key: '1 / 2 / 3', desc: t('help_123') },
            { key: 'R',       desc: t('help_r') },
            { key: 'Esc',     desc: t('help_esc') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4">
              <span className="w-20 font-bold" style={{ color: BB_YELLOW }}>[{key}]</span>
              <span style={{ color: BB_WHITE }}>{desc}</span>
            </div>
          ))}
          <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${BB_BORDER}`, color: BB_ORANGE, fontWeight: 'bold' }}>
            COMMANDES CMD:
          </div>
          {[
            { key: 'TOP',      desc: t('cmd_help_top') },
            { key: 'PIRES',    desc: t('cmd_help_pires') },
            { key: 'CLR',      desc: t('cmd_help_clr') },
            { key: '<TICKER>', desc: t('cmd_help_ticker') },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4">
              <span className="w-20 font-bold" style={{ color: BB_CYAN }}>{key}</span>
              <span style={{ color: BB_WHITE }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── OPCVM PANEL ───────────────────────────────────────────────────────────────
  const panelOpcvm = (
    <div className="flex-1 overflow-hidden flex h-full" style={{ borderTop: `1px solid ${BB_BORDER}` }}>

      {/* LEFT — fund list */}
      <div className="flex flex-col h-full overflow-hidden" style={{ width: '55%', borderRight: `1px solid ${BB_BORDER}` }}>
        <PanelHeader title={t('opcvm_panel_left')}>
          <span style={{ color: BB_MUTED, fontSize: '11px' }}>{filteredOpcvm.length} fonds</span>
        </PanelHeader>

        {/* Filter bar */}
        <div className="flex items-center gap-1 px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${BB_BORDER}`, background: '#050505' }}>
          {(['ALL', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'] as OpcvmFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setOpcvmFilter(f)}
              className="text-[10px] px-1.5 py-0.5 font-bold flex-shrink-0"
              style={{
                background: opcvmFilter === f ? BB_ORANGE : 'transparent',
                color: opcvmFilter === f ? '#000' : BB_MUTED,
                border: `1px solid ${opcvmFilter === f ? BB_ORANGE : BB_BORDER}`,
                fontFamily: "'Courier New', monospace",
              }}
            >
              {f === 'ALL' ? t('filter_all') : f === 'Actions' ? 'ACT' : f === 'Obligataire' ? 'OBL' : f === 'Monétaire' ? 'MON' : 'DIV'}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div
          className="flex items-center flex-shrink-0 text-xs font-bold"
          style={{ background: '#111', color: BB_MUTED, fontFamily: "'Courier New', monospace", borderBottom: `1px solid ${BB_BORDER}` }}
        >
          <span className="w-24 px-2 py-1">{t('opcvm_col_type')}</span>
          <span className="flex-1 px-1 py-1">{t('opcvm_col_name')}</span>
          <span className="w-20 px-1 py-1 text-right">{t('opcvm_col_vl')}</span>
          <span className="w-16 px-1 py-1 text-right">{t('opcvm_col_1m')}</span>
          <span className="w-16 px-1 py-1 text-right">{t('opcvm_col_ytd')}</span>
          <span className="w-16 px-1 py-1 text-right">{t('opcvm_col_1an')}</span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {opcvmLoading ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_ORANGE, fontFamily: "'Courier New', monospace" }}>
              {t('loading')}
            </div>
          ) : filteredOpcvm.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ fontFamily: "'Courier New', monospace" }}>
              <div className="text-2xl" style={{ color: BB_MUTED }}>◈</div>
              <p className="text-sm" style={{ color: BB_MUTED }}>
                {opcvmSource === 'unavailable' ? t('error_fetch') : t('no_data')}
              </p>
              {opcvmSource === 'unavailable' && (
                <button
                  onClick={loadOpcvm}
                  className="text-xs px-3 py-1 font-bold"
                  style={{ border: `1px solid ${BB_ORANGE}`, color: BB_ORANGE }}
                >
                  {t('retry')}
                </button>
              )}
            </div>
          ) : (
            filteredOpcvm.map((fund, i) => {
              const typeColor = opcvmTypeColor(fund.type);
              const isSelected = selectedOpcvm?.name === fund.name;
              return (
                <div
                  key={`${fund.name}-${i}`}
                  onClick={() => setSelectedOpcvm(fund)}
                  className="flex items-center cursor-pointer select-none transition-colors duration-100"
                  style={{
                    background: isSelected ? '#1a0a00' : 'transparent',
                    borderLeft: isSelected ? `2px solid ${BB_ORANGE}` : '2px solid transparent',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '13px',
                    color: BB_WHITE,
                  }}
                >
                  <span className="w-24 px-2 py-1.5 text-[10px] font-bold truncate" style={{ color: typeColor }}>
                    {(fund.type || '—').slice(0, 8).toUpperCase()}
                  </span>
                  <span className="flex-1 px-1 py-1.5 truncate text-xs" title={fund.name} style={{ color: BB_WHITE }}>
                    {fund.name.slice(0, 28)}
                  </span>
                  <span className="w-20 px-1 py-1.5 text-right font-bold text-xs" style={{ color: BB_WHITE }}>
                    {fund.vl != null ? fund.vl.toFixed(2) : '—'}
                  </span>
                  <span className="w-16 px-1 py-1.5 text-right text-xs font-bold" style={{ color: pctColor(fund.perf_1m) }}>
                    {fmtPerf(fund.perf_1m)}
                  </span>
                  <span className="w-16 px-1 py-1.5 text-right text-xs font-bold" style={{ color: pctColor(fund.perf_ytd) }}>
                    {fmtPerf(fund.perf_ytd)}
                  </span>
                  <span className="w-16 px-1 py-1.5 text-right text-xs font-bold" style={{ color: pctColor(fund.perf_1an) }}>
                    {fmtPerf(fund.perf_1an)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT — fund detail */}
      <div className="flex flex-col h-full overflow-hidden" style={{ flex: 1 }}>
        <PanelHeader title={t('opcvm_panel_right')} />

        <div className="flex-1 overflow-y-auto">
          {!selectedOpcvm ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ fontFamily: "'Courier New', monospace" }}>
              <div className="text-3xl" style={{ color: BB_ORANGE }}>◈</div>
              <p className="text-sm font-bold" style={{ color: BB_ORANGE }}>{t('opcvm_no_selection')}</p>
              <p className="text-xs" style={{ color: BB_MUTED }}>{t('opcvm_no_selection_sub')}</p>
            </div>
          ) : (
            <div className="p-4" style={{ fontFamily: "'Courier New', monospace" }}>
              {/* Fund name + type */}
              <div className="mb-4">
                <p
                  className="text-xs font-bold mb-1 px-2 py-0.5 inline-block"
                  style={{ color: opcvmTypeColor(selectedOpcvm.type), border: `1px solid ${opcvmTypeColor(selectedOpcvm.type)}44`, background: `${opcvmTypeColor(selectedOpcvm.type)}11` }}
                >
                  {selectedOpcvm.type?.toUpperCase() || '—'}
                </p>
                <p className="text-base font-bold mt-1" style={{ color: BB_CYAN }}>{selectedOpcvm.name}</p>
                <p className="text-sm mt-0.5" style={{ color: BB_MUTED }}>{selectedOpcvm.societe_gestion || '—'}</p>
              </div>

              {/* Separator */}
              <div style={{ borderTop: `1px solid ${BB_BORDER}`, marginBottom: '12px' }} />

              {/* VL */}
              <div className="mb-4">
                <p className="text-xs mb-1" style={{ color: BB_MUTED }}>{t('opcvm_col_vl')}</p>
                <p className="text-4xl font-black" style={{ color: BB_WHITE }}>
                  {selectedOpcvm.vl != null ? selectedOpcvm.vl.toFixed(2) : '—'}
                  <span className="text-base font-normal ml-2" style={{ color: BB_MUTED }}>DH</span>
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${BB_BORDER}`, marginBottom: '12px' }} />

              {/* Performance rows */}
              {[
                { label: t('opcvm_col_1m'),  val: selectedOpcvm.perf_1m  },
                { label: t('opcvm_col_ytd'), val: selectedOpcvm.perf_ytd },
                { label: t('opcvm_col_1an'), val: selectedOpcvm.perf_1an },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                  <span className="text-sm" style={{ color: BB_MUTED }}>{label}</span>
                  <span className="text-base font-bold" style={{ color: pctColor(val) }}>
                    {val != null ? `${val >= 0 ? '▲ +' : '▼ '}${Math.abs(val).toFixed(2)}%` : '—'}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${BB_BORDER}`, margin: '12px 0' }} />

              {/* Encours */}
              {selectedOpcvm.encours != null && (
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${BB_BORDER}` }}>
                  <span className="text-sm" style={{ color: BB_MUTED }}>{t('opcvm_col_encours')}</span>
                  <span className="text-base font-bold" style={{ color: BB_WHITE }}>
                    {selectedOpcvm.encours.toLocaleString('fr-MA')} MDH
                  </span>
                </div>
              )}

              <div style={{ borderTop: `1px solid ${BB_BORDER}`, marginTop: '16px', paddingTop: '12px' }}>
                <p className="text-xs" style={{ color: BB_MUTED }}>
                  ⚠️ {t('opcvm_disclaimer')}
                </p>
                {opcvmSource && (
                  <p className="text-[10px] mt-1" style={{ color: BB_BORDER }}>
                    Source: {opcvmSource}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── ROOT RENDER ───────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col overflow-hidden select-none"
      style={{ background: '#000', color: BB_WHITE, fontFamily: "'Courier New', monospace" }}
    >
      {helpModal}

      {/* ── TOP COMMAND BAR ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 h-12 flex-shrink-0 text-sm"
        style={{ background: '#050505', borderBottom: `1px solid ${BB_BORDER}` }}
      >
        {/* Logo */}
        <Link href="/" className="font-black text-sm flex-shrink-0 hover:opacity-80 transition-opacity" style={{ color: BB_ORANGE, letterSpacing: '2px' }}>
          ◈ {t('topbar_title')}
        </Link>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* MASI indicator */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="font-bold" style={{ color: BB_MUTED }}>MASI</span>
          <span className="font-black" style={{ color: BB_WHITE }}>
            {stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—'}
          </span>
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Market status */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: marketStatus.open ? BB_GREEN : BB_RED, boxShadow: marketStatus.open ? `0 0 4px ${BB_GREEN}` : 'none' }}
          />
          <span className="font-bold" style={{ color: marketStatus.open ? BB_GREEN : BB_RED }}>
            {marketStatus.open ? t('live') : t('closed')}
          </span>
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Clock */}
        <span className="font-bold flex-shrink-0" style={{ color: BB_YELLOW }}>{clock}</span>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* CMD input */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="font-bold flex-shrink-0" style={{ color: BB_ORANGE }}>CMD:</span>
          <input
            ref={cmdRef}
            value={cmdValue}
            onChange={e => { setCmdValue(e.target.value.toUpperCase()); setCmdMsg(''); }}
            onKeyDown={handleCmd}
            placeholder={t('cmd_placeholder')}
            className="bg-transparent outline-none flex-1 min-w-0 uppercase"
            style={{ color: BB_WHITE, caretColor: BB_ORANGE, fontFamily: "'Courier New', monospace", fontSize: '14px' }}
            autoComplete="off"
            spellCheck={false}
          />
          {cmdMsg && (
            <span className="text-xs truncate flex-shrink-0 max-w-[200px]" style={{ color: cmdMsg.includes('INCONNUE') ? BB_RED : BB_GREEN }}>
              {cmdMsg}
            </span>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setViewMode('bvc')}
            className="px-2 py-0.5 text-xs font-bold"
            style={{
              border: `1px solid ${viewMode === 'bvc' ? BB_ORANGE : BB_BORDER}`,
              color: viewMode === 'bvc' ? BB_ORANGE : BB_MUTED,
              background: viewMode === 'bvc' ? '#1a0a00' : 'transparent',
            }}
          >
            BVC
          </button>
          <button
            onClick={() => setViewMode('opcvm')}
            className="px-2 py-0.5 text-xs font-bold"
            style={{
              border: `1px solid ${viewMode === 'opcvm' ? BB_ORANGE : BB_BORDER}`,
              color: viewMode === 'opcvm' ? BB_ORANGE : BB_MUTED,
              background: viewMode === 'opcvm' ? '#1a0a00' : 'transparent',
            }}
          >
            {t('opcvm_tab')}
          </button>
        </div>

        <span style={{ color: BB_BORDER }}>│</span>

        {/* Help + nav */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowHelp(v => !v)}
            className="px-2 py-0.5 text-xs font-bold"
            style={{ border: `1px solid ${BB_BORDER}`, color: BB_MUTED }}
          >
            [H]
          </button>
          <button
            onClick={loadData}
            className="px-2 py-0.5 text-xs font-bold"
            style={{ border: `1px solid ${BB_BORDER}`, color: BB_MUTED }}
            title="Reload (R)"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── MOBILE TABS ──────────────────────────────────────────────────────────── */}
      <div className="flex sm:hidden flex-shrink-0" style={{ background: '#080808', borderBottom: `1px solid ${BB_BORDER}` }}>
        {(['A','B','C','D'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className="flex-1 py-1.5 text-xs font-bold text-center"
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'opcvm' ? (
          /* OPCVM 2-panel view */
          panelOpcvm
        ) : (
          <>
            {/* Desktop: 4-panel BVC grid */}
            <div
              className="hidden sm:grid h-full"
              style={{ gridTemplateColumns: '55fr 45fr', gridTemplateRows: '1fr 1fr' }}
            >
              {panelA}
              {panelB}
              {panelC}
              {panelD}
            </div>

            {/* Mobile: one panel at a time */}
            <div className="sm:hidden h-full">
              {mobileTab === 'A' && panelA}
              {mobileTab === 'B' && panelB}
              {mobileTab === 'C' && panelC}
              {mobileTab === 'D' && panelD}
            </div>
          </>
        )}
      </div>

      {/* ── DISCLAIMER BAR ────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-center px-4 text-[10px] font-bold text-center tracking-wide"
        style={{ background: '#1a0500', color: BB_ORANGE, height: '26px', borderTop: `2px solid ${BB_ORANGE}44` }}
      >
        ⚠️ {t('disclaimer')} ⚠️
      </div>
    </div>
  );
}
