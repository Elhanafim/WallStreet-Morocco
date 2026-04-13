'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchSnapshot, BVCPrice } from '@/lib/bvcPriceService';
import { SECTORS } from '@/lib/data/marketSectors';
import { RefreshCw } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map a change% to a background + text color (5-stop gradient) */
function heatColor(pct: number | null | undefined): { bg: string; text: string; border: string } {
  if (pct == null || isNaN(pct)) {
    return { bg: 'var(--bg-elevated)', text: 'var(--text-muted)', border: 'var(--border)' };
  }
  if (pct >  3.0) return { bg: '#0a5c35', text: '#fff',     border: '#0d7a47' };
  if (pct >  1.5) return { bg: '#137a48', text: '#fff',     border: '#1a9a5c' };
  if (pct >  0.3) return { bg: '#d4edda', text: '#0a5c35',  border: '#9fcea9' };
  if (pct > -0.3) return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', border: 'var(--border)' };
  if (pct > -1.5) return { bg: '#fde8e8', text: '#922020',  border: '#f5b5b5' };
  if (pct > -3.0) return { bg: '#c0392b', text: '#fff',     border: '#e04030' };
  return             { bg: '#8b0000', text: '#fff',     border: '#b00000' };
}

interface SectorTile {
  id: string;
  name: string;
  icon: string;
  avgChange: number | null;
  stocks: { ticker: string; name: string; pct: number | null }[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarketHeatmap() {
  const [tiles, setTiles] = useState<SectorTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const buildTiles = useCallback((priceMap: Record<string, BVCPrice>): SectorTile[] => {
    return SECTORS.map((sector) => {
      const stocks = sector.symbols.map((ticker) => {
        const p = priceMap[ticker];
        return {
          ticker,
          name: p?.name ?? ticker,
          pct: p?.available ? p.changePercent : null,
        };
      });

      const valid = stocks.filter((s) => s.pct != null);
      const avgChange =
        valid.length > 0
          ? valid.reduce((sum, s) => sum + (s.pct ?? 0), 0) / valid.length
          : null;

      return { id: sector.id, name: sector.name, icon: sector.icon, avgChange, stocks };
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await fetchSnapshot();
      const priceMap: Record<string, BVCPrice> = {};
      snapshot.forEach((p) => { priceMap[p.ticker] = p; });
      setTiles(buildTiles(priceMap));
      setLastUpdate(new Date());
    } catch {
      // silently keep previous data on error
    } finally {
      setLoading(false);
    }
  }, [buildTiles]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && tiles.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-[8px] animate-pulse"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Color intensity = sector average daily performance
        </p>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 font-body text-[12px] transition-opacity disabled:opacity-40"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-body text-[11px]" style={{ color: 'var(--text-muted)' }}>Performance:</span>
        {[
          { label: '> +3%',       bg: '#0a5c35', text: '#fff' },
          { label: '+1.5% → +3%', bg: '#137a48', text: '#fff' },
          { label: '0 → +1.5%',   bg: '#d4edda', text: '#0a5c35' },
          { label: 'Flat',        bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' },
          { label: '0 → −1.5%',   bg: '#fde8e8', text: '#922020' },
          { label: '−1.5% → −3%', bg: '#c0392b', text: '#fff' },
          { label: '< −3%',       bg: '#8b0000', text: '#fff' },
        ].map((l) => (
          <span
            key={l.label}
            className="px-2 py-0.5 rounded-[3px] font-body text-[10.5px]"
            style={{ backgroundColor: l.bg, color: l.text, border: '1px solid rgba(0,0,0,0.08)' }}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* Sector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {tiles.map((tile) => {
          const { bg, text, border } = heatColor(tile.avgChange);
          const sign = (tile.avgChange ?? 0) >= 0 ? '+' : '';
          const isExpanded = expanded === tile.id;

          return (
            <div key={tile.id} className="relative">
              <button
                onClick={() => setExpanded(isExpanded ? null : tile.id)}
                className="w-full text-left rounded-[8px] p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  color: text,
                }}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[17px] leading-none">{tile.icon}</span>
                  <span
                    className="font-mono text-[13px] font-semibold tabular-nums"
                    style={{ color: text }}
                  >
                    {tile.avgChange != null
                      ? `${sign}${tile.avgChange.toFixed(2)}%`
                      : '—'}
                  </span>
                </div>
                <p
                  className="font-body text-[11px] font-medium leading-tight"
                  style={{
                    color: text,
                    opacity: 0.9,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tile.name}
                </p>
                <p
                  className="font-body text-[10px] mt-1"
                  style={{ color: text, opacity: 0.65 }}
                >
                  {tile.stocks.length} stocks
                </p>
              </button>

              {/* Expanded stock list */}
              {isExpanded && (
                <div
                  className="absolute top-full left-0 right-0 z-30 mt-1 rounded-[8px] overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '200px',
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
                    const pctColor = s.pct != null
                      ? (s.pct > 0.3 ? 'var(--gain)' : s.pct < -0.3 ? 'var(--loss)' : 'var(--text-secondary)')
                      : 'var(--text-muted)';
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
        })}
      </div>

      {expanded && (
        <button
          onClick={() => setExpanded(null)}
          className="fixed inset-0 z-20 cursor-default"
          aria-label="Close expanded sector"
        />
      )}
    </div>
  );
}
