'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchOpcvm, type OpcvmFund } from '@/lib/opcvmService';

type FilterType = 'Tous' | 'Actions' | 'Obligataire' | 'Monétaire' | 'Diversifié';
type SortKey    = 'name' | 'societe_gestion' | 'vl' | 'perf_ytd' | 'perf_1m' | 'perf_1an' | 'encours';
type SortDir    = 'asc' | 'desc';
type LoadState  = 'loading' | 'success' | 'error';

const FUND_TYPES: FilterType[] = ['Tous', 'Actions', 'Obligataire', 'Monétaire', 'Diversifié'];

const TYPE_BADGE: Record<string, string> = {
  Actions:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Obligataire: 'bg-blue-50 text-blue-700 border border-blue-200',
  Monétaire:   'bg-slate-100 text-slate-600 border border-slate-200',
  Diversifié:  'bg-amber-50 text-amber-700 border border-amber-200',
  Contractuel: 'bg-purple-50 text-purple-700 border border-purple-200',
};

// ── Formatting helpers ─────────────────────────────────────────────────────────

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—';
  return v.toLocaleString('fr-MA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtAum(v: number | null | undefined): string {
  if (v == null) return '—';
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)} Mrd MAD`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(0)} M MAD`;
  return `${fmt(v, 0)} MAD`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PerfBadge({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-primary/30 text-sm">—</span>;
  const pos = value >= 0;
  const zero = value === 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold text-sm tabular-nums ${
        zero ? 'text-primary/50' : pos ? 'text-emerald-600' : 'text-red-600'
      }`}
    >
      {zero ? '' : pos ? '▲ ' : '▼ '}
      {pos && !zero ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  const t = type ?? 'Autre';
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
        TYPE_BADGE[t] ?? 'bg-surface-100 text-primary/60 border border-surface-200'
      }`}
    >
      {t}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-surface-100">
      <td className="px-4 py-3.5"><div className="h-4 bg-surface-200 rounded w-48" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-surface-200 rounded w-28" /></td>
      <td className="px-4 py-3.5"><div className="h-5 bg-surface-200 rounded-full w-20" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-surface-200 rounded w-20 ml-auto" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-surface-200 rounded w-14 ml-auto" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-surface-200 rounded w-14 ml-auto" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-surface-200 rounded w-14 ml-auto" /></td>
      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-surface-200 rounded w-20 ml-auto" /></td>
    </tr>
  );
}

function SortTh({
  label, sortKey, current, dir, onSort, align = 'right',
}: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void; align?: 'left' | 'right';
}) {
  const active = current === sortKey;
  const Icon   = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${active ? 'text-secondary' : 'text-primary/50 hover:text-primary/70'}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {align === 'left' && label}
        <Icon className="w-3 h-3 flex-shrink-0" />
        {align === 'right' && label}
      </span>
    </th>
  );
}

function FundCard({ fund }: { fund: OpcvmFund }) {
  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-sm text-primary leading-snug">{fund.name}</p>
          <p className="text-xs text-primary/50 mt-0.5">{fund.societe_gestion ?? '—'}</p>
        </div>
        <TypeBadge type={fund.type} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'VL',     val: fund.vl != null ? `${fmt(fund.vl)} MAD` : '—', raw: null },
          { label: 'YTD',    val: null, raw: fund.perf_ytd },
          { label: '1 an',   val: null, raw: fund.perf_1an },
        ].map(({ label, val, raw }) => (
          <div key={label} className="text-center bg-surface-50 rounded-lg p-2">
            <p className="text-[10px] text-primary/40 mb-0.5 uppercase font-medium">{label}</p>
            {val != null
              ? <p className="text-xs font-bold text-primary">{val}</p>
              : <PerfBadge value={raw} />
            }
          </div>
        ))}
      </div>
      {fund.encours != null && (
        <p className="text-xs text-primary/40 mt-2 text-right">
          Actif net : {fmtAum(fund.encours)}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OpcvmFundList() {
  const [funds,       setFunds]       = useState<OpcvmFund[]>([]);
  const [loadState,   setLoadState]   = useState<LoadState>('loading');
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeType,  setActiveType]  = useState<FilterType>('Tous');
  const [search,      setSearch]      = useState('');
  const [sortKey,     setSortKey]     = useState<SortKey>('perf_ytd');
  const [sortDir,     setSortDir]     = useState<SortDir>('desc');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await fetchOpcvm();
      if (res.error || res.funds.length === 0) {
        setLoadState('error');
      } else {
        setFunds(res.funds);
        setLastUpdated(res.last_updated ?? '');
        setLoadState('success');
      }
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const displayed = useMemo(() => {
    let list = [...funds];

    if (activeType !== 'Tous') {
      const q = activeType.toLowerCase();
      list = list.filter(f => (f.type ?? '').toLowerCase().includes(q));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.societe_gestion ?? '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const va = (a[sortKey] as number | string | null) ?? (sortKey === 'name' || sortKey === 'societe_gestion' ? '' : -Infinity);
      const vb = (b[sortKey] as number | string | null) ?? (sortKey === 'name' || sortKey === 'societe_gestion' ? '' : -Infinity);
      if (typeof va === 'string' && typeof vb === 'string')
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc'
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });

    return list;
  }, [funds, activeType, search, sortKey, sortDir]);

  const shProps = { current: sortKey, dir: sortDir, onSort: handleSort };

  return (
    <div>
      {/* ── Controls bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 shadow-sm overflow-x-auto flex-shrink-0">
          {FUND_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Text search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            type="text"
            placeholder="Rechercher un fonds ou une société..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>

        {/* Count + refresh */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          {loadState === 'success' && (
            <span className="text-sm text-primary/50 font-medium whitespace-nowrap">
              {displayed.length} fonds affichés
            </span>
          )}
          <button
            onClick={load}
            disabled={loadState === 'loading'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 text-primary/60 text-xs font-semibold hover:text-secondary hover:border-secondary transition-all disabled:opacity-40 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadState === 'loading' ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Error state ── */}
      {loadState === 'error' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-warning" />
          </div>
          <div className="text-center">
            <p className="font-bold text-primary text-base">Données temporairement indisponibles</p>
            <p className="text-sm text-primary/50 mt-1 max-w-xs">
              La connexion au service OPCVM a échoué. Vérifiez votre connexion internet et réessayez.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      )}

      {/* ── Desktop table ── */}
      {loadState !== 'error' && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-surface-200 shadow-card bg-white">
            <table className="w-full min-w-[900px]">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <SortTh label="Nom du fonds"    sortKey="name"            {...shProps} align="left" />
                  <SortTh label="Soc. de gestion" sortKey="societe_gestion" {...shProps} align="left" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary/50 whitespace-nowrap">
                    Catégorie
                  </th>
                  <SortTh label="VL (MAD)"  sortKey="vl"       {...shProps} />
                  <SortTh label="Perf 1M"   sortKey="perf_1m"  {...shProps} />
                  <SortTh label="Perf YTD"  sortKey="perf_ytd" {...shProps} />
                  <SortTh label="Perf 1 an" sortKey="perf_1an" {...shProps} />
                  <SortTh label="Actif net" sortKey="encours"  {...shProps} />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {loadState === 'loading'
                  ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                  : displayed.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-primary/40 text-sm">
                        Aucun fonds ne correspond à votre recherche.
                      </td>
                    </tr>
                  )
                  : displayed.map((fund, i) => (
                    <tr key={`${fund.name}-${i}`} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <p className="font-semibold text-primary text-sm leading-snug line-clamp-2" title={fund.name}>
                          {fund.name}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-primary/60 whitespace-nowrap">
                        {fund.societe_gestion ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <TypeBadge type={fund.type} />
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm text-primary font-semibold tabular-nums">
                        {fund.vl != null ? `${fmt(fund.vl)} MAD` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <PerfBadge value={fund.perf_1m} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <PerfBadge value={fund.perf_ytd} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <PerfBadge value={fund.perf_1an} />
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm text-primary/70 font-mono tabular-nums whitespace-nowrap">
                        {fmtAum(fund.encours)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden">
            {loadState === 'loading' ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl border border-surface-200 p-4 h-28" />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <p className="text-center text-primary/40 text-sm py-12">
                Aucun fonds ne correspond à votre recherche.
              </p>
            ) : (
              <div className="space-y-3">
                {displayed.map((fund, i) => (
                  <FundCard key={`${fund.name}-${i}`} fund={fund} />
                ))}
              </div>
            )}
          </div>

          {/* Source footer */}
          {loadState === 'success' && (
            <p className="text-xs text-primary/30 mt-4 text-right">
              Source : Bourse de Casablanca / AMMC
              {lastUpdated ? ` · ${lastUpdated}` : ''}
            </p>
          )}
        </>
      )}
    </div>
  );
}
