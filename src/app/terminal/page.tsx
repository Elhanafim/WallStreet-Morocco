'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import ValuesFinancials from '@/components/terminal/ValuesFinancials';
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
type ActiveTab   = 'OVERVIEW' | 'EQUITIES' | 'OPCVM' | 'MACRO' | 'FINANCIALS';
type QuickFilter = 'ALL' | 'TOP' | 'PIRES' | 'VOLUME';
type SortField   = 'TICKER' | 'PRICE' | 'CHANGE' | 'VOLUME';
type SortDir     = 'ASC' | 'DESC';
type PanelBTab   = 1 | 2 | 3;
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
    const id = setInterval(loadData, 60_000);
    return () => clearInterval(id);
  }, [loadData, loadOpcvm]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...stocks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (quickFilter === 'TOP')    list = list.sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)).slice(0, 10);
    else if (quickFilter === 'PIRES')  list = list.sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0)).slice(0, 10);
    else if (quickFilter === 'VOLUME') list = list.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    else {
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
    if (sortField === field) setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    else { setSortField(field); setSortDir(field === 'TICKER' ? 'ASC' : 'DESC'); }
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

  // ── Data: OPCVM & Macro
  const filteredOpcvm = useMemo(() => {
    if (opcvmFilter === 'ALL') return opcvmFunds;
    return opcvmFunds.filter(f => (f.type || '').toLowerCase().includes(opcvmFilter.toLowerCase()));
  }, [opcvmFunds, opcvmFilter]);

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
    if (cmd === 'FIN')   { setActiveTab('FINANCIALS'); setCmdMsg('→ VALEURS FINANCIALS'); return; }
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

  const renderOverview = () => (
    <div className="p-6 md:p-8 space-y-6 h-full overflow-y-auto" style={robotoMono.style}>
      <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: BB_CYAN }}>Aperçu de Marché</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MARKET SNAPSHOT */}
        <div className="bg-[#0B101E] border border-[#1E293B] flex flex-col">
          <PanelHeader title={`${t('masi_label')} / MARCHÉ BVC`} />
          <div className="p-5 flex-1 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <span className="font-bold text-sm" style={{ color: BB_MUTED }}>PERFORMANCE</span>
              <span className="text-2xl font-black tabular-nums" style={{ color: pctColor(avgChange) }}>
                {stocks.length > 0 ? `~${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-[#1E293B]">
              <span className="font-bold" style={{ color: BB_MUTED }}>{t('total_volume')}</span>
              <span className="font-bold tabular-nums" style={{ color: BB_WHITE }}>{fmtVolume(totalVolume)} MAD</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-4 border border-[#1E293B] bg-[#1E293B]">
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
            <div className="pt-4 text-center">
              <button 
                onClick={() => setActiveTab('EQUITIES')}
                className="text-xs font-bold hover:underline" style={{ color: BB_CYAN }}
              >
                Explorer Valeurs BVC →
              </button>
            </div>
          </div>
        </div>

        {/* FEAR & GREED + MOVERS */}
        <div className="bg-[#0B101E] border border-[#1E293B] flex flex-col">
          <PanelHeader title={t('fg_title')} />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="mb-6">
              <FearGreedGauge score={fgScore} label={fgLabel(fgScore)} color={fgColor(fgScore)} />
            </div>
            {movers && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E293B]">
                {([
                  { key: 'gainers' as const, label: t('top_gainers'), color: BB_GREEN },
                  { key: 'losers'  as const, label: t('top_losers'),  color: BB_RED   },
                ] as const).map(({ key, label, color }) => (
                  <div key={key}>
                    <p className="text-[10px] font-bold mb-2 uppercase border-b border-[#1E293B] pb-1" style={{ color }}>{label}</p>
                    {movers[key].slice(0, 3).map(s => (
                      <div key={s.ticker} className="flex justify-between text-xs py-1">
                        <span className="font-bold" style={{ color: BB_CYAN }}>{s.ticker}</span>
                        <span className="tabular-nums font-bold" style={{ color }}>{fmtPct(s.changePercent)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FX / OPCVM SNAPSHOT */}
        <div className="bg-[#0B101E] border border-[#1E293B] flex flex-col">
          <PanelHeader title="MACRO & OPCVM RAPIDE" />
          <div className="p-5 flex-1 space-y-6">
            <div>
              <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: BB_ORANGE }}>■ DEVISES / MAD</p>
              {fxData.slice(0, 3).map(({ pair, rate, chg }) => (
                <div key={pair} className="flex justify-between text-sm py-1 border-b border-[#1E293B]">
                  <span className="font-bold" style={{ color: BB_MUTED }}>{pair}</span>
                  <span className="font-bold tabular-nums text-white">{rate}</span>
                  <span className="font-bold tabular-nums" style={{ color: pctColor(parseFloat(chg)) }}>{chg}</span>
                </div>
              ))}
              <div className="pt-2 text-right">
                <button onClick={() => setActiveTab('MACRO')} className="text-[10px] font-bold hover:underline" style={{ color: BB_CYAN }}>Plus de Macro →</button>
              </div>
            </div>
            
            <div>
              <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: BB_ORANGE }}>■ OPCVM EN VUE</p>
              {opcvmFunds.slice(0, 3).map(f => (
                <div key={f.name} className="flex justify-between text-xs py-1.5 border-b border-[#1E293B] truncate gap-2">
                  <span className="font-bold truncate text-white" title={f.name}>{f.name}</span>
                  <span className="font-bold flex-shrink-0" style={{ color: pctColor(f.perf_ytd) }}>{fmtPerf(f.perf_ytd)} YTD</span>
                </div>
              ))}
              <div className="pt-2 text-right">
                <button onClick={() => setActiveTab('OPCVM')} className="text-[10px] font-bold hover:underline" style={{ color: BB_CYAN }}>Tous les Fonds →</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderEquities = () => (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Terminal List */}
      <div className="w-full lg:w-[60%] flex flex-col border-r border-[#1E293B] bg-[#0B101E]">
        <PanelHeader title={t('panel_a_title')}>
          <span style={{ color: '#000', fontSize: '10px' }}>{stocks.length} val.</span>
        </PanelHeader>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 border-b border-[#1E293B] bg-[#040914]">
          <input
            ref={searchRef} value={search} onChange={e => { setSearch(e.target.value); setQuickFilter('ALL'); }}
            placeholder={t('search_placeholder')}
            className="flex-1 bg-transparent outline-none text-[12px] px-2"
            style={{ ...robotoMono.style, color: BB_WHITE, caretColor: BB_ORANGE }}
          />
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
        </div>

        {/* Header Grid */}
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
            <div className="flex items-center justify-center h-full text-sm font-bold" style={{ color: BB_ORANGE, ...robotoMono.style }}>{t('loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: BB_MUTED, ...robotoMono.style }}>{t('no_data')}</div>
          ) : (
            filtered.map((stock, i) => (
              <StockRow
                key={stock.ticker} stock={stock} isHighlighted={i === highlightedRow}
                isSelected={selectedTicker?.ticker === stock.ticker}
                isFlashing={flashTickers.has(stock.ticker)}
                onClick={() => { setSelectedTicker(stock); setPanelBTab(1); setHighlightedRow(i); }}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Trading Panel */}
      <div className="hidden lg:flex flex-col w-[40%] bg-[#0B101E]">
        <PanelHeader title={selectedTicker ? `${selectedTicker.ticker} — ACTIONS BVC` : t('panel_b_title')}>
          {[1, 2].map(tab => (
            <button
              key={tab} onClick={() => setPanelBTab(tab as PanelBTab)}
              className="text-[10px] px-3 py-1 font-bold rounded-sm"
              style={{
                background: panelBTab === tab ? '#000' : 'transparent', color: panelBTab === tab ? BB_ORANGE : '#000', ...inter.style,
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
                  { label: t('open'),   value: fmtPrice(selectedTicker.open) },
                  { label: t('high'),   value: fmtPrice(selectedTicker.high) },
                  { label: t('low'),    value: fmtPrice(selectedTicker.low) },
                  { label: t('volume'), value: fmtVolume(selectedTicker.volume) },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3 bg-[#0A0F1D]">
                    <p className="text-[11px] tracking-widest font-bold mb-1 uppercase" style={{ color: BB_MUTED }}>{label}</p>
                    <p className="text-base font-bold tabular-nums" style={{ color: BB_WHITE }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Smaller quick chart for quoting panel */}
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
      </div>
    </div>
  );

  const renderOpcvm = () => (
    <div className="h-full overflow-y-auto p-6 md:p-8" style={{ background: BB_BG }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: BB_CYAN }}>OPCVM / FUNDS</h2>
          <p className="text-sm mt-1" style={{ color: BB_MUTED }}>Fonds d'investissement Marocains — Données statiques de référence</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-sm border border-[#1E293B] bg-[#0B101E]">
          {(['ALL', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'] as OpcvmFilter[]).map(f => (
            <button
              key={f} onClick={() => setOpcvmFilter(f)}
              className={`text-xs px-3 py-1.5 font-bold rounded-sm uppercase tracking-wide transition-colors ${robotoMono.className}`}
              style={{ background: opcvmFilter === f ? BB_ORANGE : 'transparent', color: opcvmFilter === f ? '#000' : BB_MUTED }}
            >
              {f === 'ALL' ? t('filter_all') : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0B101E] border border-[#1E293B] rounded-md overflow-hidden max-w-[1400px] mx-auto" style={robotoMono.style}>
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
                  style={{ color: opcvmTypeColor(fund.type), borderColor: `${opcvmTypeColor(fund.type)}44`, background: `${opcvmTypeColor(fund.type)}11` }}
                >
                  {fund.type?.slice(0, 8)}
                </span>
                <div>
                  <p className="font-bold truncate text-white" title={fund.name}>{fund.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#8B95A1] mt-1">{fund.societe_gestion || '—'}</p>
                </div>
                <span className="text-right font-bold tabular-nums text-white">{fund.vl != null ? fund.vl.toFixed(2) : '—'}</span>
                <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_1m) }}>{fmtPerf(fund.perf_1m)}</span>
                <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_ytd) }}>{fmtPerf(fund.perf_ytd)}</span>
                <span className="text-right font-bold tabular-nums" style={{ color: pctColor(fund.perf_1an) }}>{fmtPerf(fund.perf_1an)}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <p className="mt-4 text-[10px] uppercase tracking-wider text-[#8B95A1] max-w-2xl mx-auto" style={robotoMono.style}>
        ⚠️ {t('opcvm_disclaimer')}
      </p>
    </div>
  );

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
            { key: 'FIN',      desc: "Aller aux données financières" },
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
            { id: 'MACRO', label: 'Macro & Devises', shortcut: 'Alt+4' },
            { id: 'FINANCIALS', label: 'Valeurs Financials', shortcut: 'Alt+5' },
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
        {activeTab === 'MACRO' && renderMacro()}
        {activeTab === 'FINANCIALS' && (
          <ValuesFinancials ticker={selectedTicker?.ticker ?? null} />
        )}
      </main>

      {/* ── DISCLAIMER BAR ────────────────────────────────────────────────────── */}
      <div className="h-8 flex-shrink-0 flex items-center justify-center px-4 text-[10px] font-bold text-center tracking-wider uppercase border-t border-[#1E293B] bg-[#0A0F1D] text-[#8B95A1]">
        ⚠️ {t('disclaimer')} ⚠️
      </div>
    </div>
  );
}
