'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchSnapshot, BVCPrice } from '@/lib/bvcPriceService';
import { SECTORS } from '@/lib/data/marketSectors';
import { RefreshCw } from 'lucide-react';

// ── Color scale ───────────────────────────────────────────────────────────────
// Returns bg + text + border for a given change%.
// Five intensity stops — matches terminal style.
function heatColor(pct: number | null | undefined): {
  bg: string; text: string; border: string;
} {
  if (pct == null || isNaN(pct))
    return { bg: 'var(--bg-elevated)', text: 'var(--text-muted)', border: 'var(--border)' };
  if (pct >  4.0) return { bg: '#064d2b', text: '#a8f0cb', border: '#0d7a47' };
  if (pct >  2.0) return { bg: '#0a6b3c', text: '#c5f5d8', border: '#119455' };
  if (pct >  0.5) return { bg: '#d1f0e0', text: '#0a5c35', border: '#9fd4b5' };
  if (pct > -0.5) return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border)' };
  if (pct > -2.0) return { bg: '#fce8e8', text: '#921a1a', border: '#f0b5b5' };
  if (pct > -4.0) return { bg: '#b83232', text: '#fce8e8', border: '#d94444' };
  return             { bg: '#7a1a1a', text: '#fce8e8', border: '#a02222' };
}

// ── Legend ────────────────────────────────────────────────────────────────────
const LEGEND = [
  { label: '> +4%',       bg: '#064d2b', text: '#a8f0cb' },
  { label: '+2 → +4%',   bg: '#0a6b3c', text: '#c5f5d8' },
  { label: '+0.5 → +2%', bg: '#d1f0e0', text: '#0a5c35' },
  { label: 'Flat',        bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
  { label: '−0.5 → −2%', bg: '#fce8e8', text: '#921a1a' },
  { label: '−2 → −4%',   bg: '#b83232', text: '#fce8e8' },
  { label: '< −4%',       bg: '#7a1a1a', text: '#fce8e8' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type HeatView = 'stocks' | 'sectors';

interface StockTile {
  ticker: string;
  name: string;
  pct: number | null;
  sector: string;
}

interface SectorTile {
  id: string;
  name: string;
  avgChange: number | null;
  stocks: StockTile[];
  count: number;
}

// ── Tile components ───────────────────────────────────────────────────────────

function StockHeatTile({
  tile,
  expanded,
  onExpand,
}: {
  tile: StockTile;
  expanded: boolean;
  onExpand: (t: string | null) => void;
}) {
  const { bg, text, border } = heatColor(tile.pct);
  const sign = (tile.pct ?? 0) >= 0 ? '+' : '';

  return (
    <div className="relative">
      <button
        onClick={() => onExpand(expanded ? null : tile.ticker)}
        title={tile.name}
        className="w-full text-left rounded-[6px] p-2.5 transition-all duration-150 hover:brightness-[1.08]"
        style={{
          backgroundColor: bg,
          border: `1px solid ${border}`,
          minHeight: '62px',
        }}
      >
        <p
          className="font-mono text-[11.5px] font-bold leading-tight mb-1"
          style={{ color: text }}
        >
          {tile.ticker}
        </p>
        <p
          className="font-mono text-[12px] font-semibold tabular-nums"
          style={{ color: text, opacity: 0.95 }}
        >
          {tile.pct != null ? `${sign}${tile.pct.toFixed(2)}%` : '—'}
        </p>
      </button>

      {expanded && (
        <div
          className="absolute top-full left-0 z-40 mt-1 rounded-[8px] overflow-hidden whitespace-nowrap"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '180px',
          }}
        >
          <div
            className="px-3 py-2"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <p className="font-body text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {tile.ticker}
            </p>
            <p className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {tile.name}
            </p>
          </div>
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>Daily change</span>
              <span
                className="font-mono text-[13px] font-semibold"
                style={{
                  color: tile.pct != null
                    ? tile.pct > 0.5 ? 'var(--gain)' : tile.pct < -0.5 ? 'var(--loss)' : 'var(--text-secondary)'
                    : 'var(--text-muted)',
                }}
              >
                {tile.pct != null ? `${sign}${tile.pct.toFixed(2)}%` : '—'}
              </span>
            </div>
            <p className="font-body text-[10.5px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Sector: {tile.sector}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectorHeatTile({
  tile,
  expanded,
  onExpand,
}: {
  tile: SectorTile;
  expanded: boolean;
  onExpand: (id: string | null) => void;
}) {
  const { bg, text, border } = heatColor(tile.avgChange);
  const sign = (tile.avgChange ?? 0) >= 0 ? '+' : '';

  return (
    <div className="relative">
      <button
        onClick={() => onExpand(expanded ? null : tile.id)}
        className="w-full text-left rounded-[8px] p-3.5 transition-all duration-150 hover:brightness-[1.06]"
        style={{
          backgroundColor: bg,
          border: `1px solid ${border}`,
          minHeight: '78px',
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p
            className="font-body text-[12px] font-semibold leading-tight"
            style={{
              color: text,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {tile.name}
          </p>
          <span
            className="font-mono text-[13px] font-bold tabular-nums flex-shrink-0"
            style={{ color: text }}
          >
            {tile.avgChange != null ? `${sign}${tile.avgChange.toFixed(2)}%` : '—'}
          </span>
        </div>
        <p
          className="font-body text-[10.5px]"
          style={{ color: text, opacity: 0.65 }}
        >
          {tile.count} stocks
        </p>
      </button>

      {/* Expanded: stock list */}
      {expanded && (
        <div
          className="absolute top-full left-0 z-40 mt-1 rounded-[8px] overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '210px',
          }}
        >
          <div
            className="px-3 py-2 font-body text-[11px] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {tile.name}
          </div>
          {tile.stocks.map((s) => {
            const sPct = s.pct != null ? `${s.pct >= 0 ? '+' : ''}${s.pct.toFixed(2)}%` : '—';
            const pctColor =
              s.pct == null ? 'var(--text-muted)'
              : s.pct > 0.5 ? 'var(--gain)'
              : s.pct < -0.5 ? 'var(--loss)'
              : 'var(--text-secondary)';
            return (
              <div
                key={s.ticker}
                className="flex items-center justify-between px-3 py-1.5"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="font-mono text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {s.ticker}
                </span>
                <span className="font-mono text-[12px] font-semibold" style={{ color: pctColor }}>
                  {sPct}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MarketHeatmap() {
  const [view, setView]           = useState<HeatView>('stocks');
  const [stocks, setStocks]       = useState<StockTile[]>([]);
  const [sectors, setSectors]     = useState<SectorTile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);

  const buildData = useCallback((snapshot: BVCPrice[]) => {
    // Build a ticker → sector name map
    const tickerSector: Record<string, string> = {};
    SECTORS.forEach((s) => s.symbols.forEach((t) => { tickerSector[t] = s.name; }));

    // Stocks list — every stock in snapshot
    const stockTiles: StockTile[] = snapshot.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      pct: p.available ? p.changePercent : null,
      sector: tickerSector[p.ticker] ?? 'Other',
    }));

    // Sort by % change descending (gainers first, then losers)
    stockTiles.sort((a, b) => (b.pct ?? -999) - (a.pct ?? -999));

    // Sector aggregation
    const priceMap: Record<string, BVCPrice> = {};
    snapshot.forEach((p) => { priceMap[p.ticker] = p; });

    const sectorTiles: SectorTile[] = SECTORS.map((sector) => {
      const sStocks: StockTile[] = sector.symbols
        .map((ticker) => {
          const p = priceMap[ticker];
          return {
            ticker,
            name: p?.name ?? ticker,
            pct: p?.available ? p.changePercent : null,
            sector: sector.name,
          };
        })
        .sort((a, b) => (b.pct ?? -999) - (a.pct ?? -999));

      const valid = sStocks.filter((s) => s.pct != null);
      const avgChange =
        valid.length > 0
          ? valid.reduce((sum, s) => sum + (s.pct ?? 0), 0) / valid.length
          : null;

      return {
        id: sector.id,
        name: sector.name,
        avgChange,
        stocks: sStocks,
        count: sStocks.length,
      };
    });

    setStocks(stockTiles);
    setSectors(sectorTiles);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await fetchSnapshot();
      buildData(snapshot);
      setLastUpdate(new Date());
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, [buildData]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const handleExpand = useCallback((id: string | null) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  // ── Loading skeleton
  if (loading && stocks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-3">
          {[120, 100].map((w, i) => (
            <div key={i} className="h-8 rounded-[6px] animate-pulse" style={{ width: w, backgroundColor: 'var(--bg-elevated)' }} />
          ))}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
          {Array.from({ length: 78 }).map((_, i) => (
            <div key={i} className="h-16 rounded-[6px] animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar: toggle + refresh + timestamp ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-[8px]" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          {(['stocks', 'sectors'] as HeatView[]).map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); setExpanded(null); }}
              className="px-4 py-1.5 rounded-[6px] font-body text-[12.5px] font-medium transition-all duration-150"
              style={{
                backgroundColor: view === v ? 'var(--bg-surface)' : 'transparent',
                color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: view === v ? 'var(--shadow-xs)' : 'none',
                border: view === v ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {v === 'stocks' ? '78 Stocks' : '13 Sectors'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 font-body text-[12px] disabled:opacity-40"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <span className="font-body text-[10.5px] mr-1" style={{ color: 'var(--text-muted)' }}>
          Daily change:
        </span>
        {LEGEND.map((l) => (
          <span
            key={l.label}
            className="px-2 py-0.5 rounded-[3px] font-body text-[10px]"
            style={{ backgroundColor: l.bg, color: l.text, border: '1px solid rgba(0,0,0,0.1)' }}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* ── Grid ── */}
      {view === 'stocks' ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
          {stocks.map((tile) => (
            <StockHeatTile
              key={tile.ticker}
              tile={tile}
              expanded={expanded === tile.ticker}
              onExpand={handleExpand}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {sectors.map((tile) => (
            <SectorHeatTile
              key={tile.id}
              tile={tile}
              expanded={expanded === tile.id}
              onExpand={handleExpand}
            />
          ))}
        </div>
      )}

      {/* Dismiss overlay */}
      {expanded && (
        <button
          onClick={() => setExpanded(null)}
          className="fixed inset-0 z-30 cursor-default"
          aria-label="Dismiss"
        />
      )}
    </div>
  );
}
