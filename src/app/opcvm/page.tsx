'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  fetchOpcvm,
  fetchOpcvmSummary,
  fetchOpcvmTop,
  refreshOpcvmCache,
  formatVL,
  formatEncours,
  formatPerf,
  TYPE_COLORS_LIGHT,
  FUND_TYPES,
  type OpcvmFund,
  type OpcvmSummaryEntry,
  type OpcvmSummaryResponse,
} from '@/lib/opcvmService';

export default function OpcvmPage() {
  const [funds,        setFunds]        = useState<OpcvmFund[]>([]);
  const [summary,      setSummary]      = useState<OpcvmSummaryResponse | null>(null);
  const [top5,         setTop5]         = useState<OpcvmFund[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [source,       setSource]       = useState('');
  const [dataDate,     setDataDate]     = useState<string | null>(null);
  const [scrapedAt,    setScrapedAt]    = useState('');

  // Filters
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [sgFilter,     setSgFilter]     = useState('');
  const [sortKey,      setSortKey]      = useState<keyof OpcvmFund>('perf_ytd');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [data, summ, topData] = await Promise.all([
        fetchOpcvm(),
        fetchOpcvmSummary(),
        fetchOpcvmTop(5, 'perf_ytd'),
      ]);
      if (data.error || data.funds.length === 0) {
        setError(true);
      } else {
        setFunds(data.funds);
        setSource(data.source);
        setDataDate(data.data_date);
        setScrapedAt(data.last_updated);
      }
      if (summ) setSummary(summ);
      if (topData?.top) setTop5(topData.top);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOpcvmCache();
    await load();
    setRefreshing(false);
  };

  const sgOptions = useMemo(
    () => [...new Set(funds.map(f => f.societe_gestion).filter(Boolean))].sort() as string[],
    [funds],
  );

  const filtered = useMemo(() => {
    let list = [...funds];
    if (typeFilter) list = list.filter(f => (f.type ?? '').toLowerCase().includes(typeFilter.toLowerCase()));
    if (sgFilter)   list = list.filter(f => f.societe_gestion === sgFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.societe_gestion ?? '').toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const av = (a[sortKey] as number | null) ?? null;
      const bv = (b[sortKey] as number | null) ?? null;
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return list;
  }, [funds, typeFilter, sgFilter, debouncedSearch, sortKey, sortDir]);

  const toggleSort = (key: keyof OpcvmFund) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const totalFunds    = funds.length;
  const totalEncours  = summary?.total_encours ?? funds.reduce((s, f) => s + (f.encours ?? 0), 0);
  const bestYtd       = top5[0];

  const typeColorClass = (type: string | null) =>
    TYPE_COLORS_LIGHT[type ?? ''] ?? 'bg-slate-50 text-slate-600 border-slate-200';

  const perfClass = (v: number | null) =>
    v === null ? 'text-slate-400' : v > 0 ? 'text-emerald-600 dark:text-emerald-400' : v < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500';

  const sortCols: { key: keyof OpcvmFund; label: string; mobile?: false }[] = [
    { key: 'vl',       label: 'VL (DH)'  },
    { key: 'var_jour', label: 'Jour'     },
    { key: 'perf_1m',  label: '1 Mois',  mobile: false },
    { key: 'perf_ytd', label: 'YTD'      },
    { key: 'perf_1an', label: '1 An'     },
    { key: 'encours',  label: 'Encours', mobile: false },
  ];

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              OPCVM Maroc
            </h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
              Données éducatives uniquement
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Fonds d&apos;investissement collectif · Source :{' '}
            <span className="text-blue-400">{source || 'medias24.com / ASFIM'}</span>
            {dataDate && <> · Données du <span className="text-slate-300">{dataDate}</span></>}
          </p>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Fonds suivis',       value: totalFunds > 0 ? String(totalFunds) : '—',                         sub: 'toutes catégories' },
              { label: 'Meilleure YTD',       value: bestYtd?.perf_ytd != null ? formatPerf(bestYtd.perf_ytd) : '—',   sub: bestYtd?.name?.slice(0, 22) ?? '—' },
              { label: 'Encours total',        value: totalEncours > 0 ? formatEncours(totalEncours) : '—',              sub: 'MAD (estimatif)'  },
              { label: 'Sociétés de gestion', value: String(sgOptions.length) || '—',                                   sub: 'gestionnaires'   },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <p className="text-blue-300 font-black text-lg sm:text-xl mb-0.5">{kpi.value}</p>
                <p className="text-white/80 text-xs font-semibold">{kpi.label}</p>
                <p className="text-white/40 text-[10px] mt-0.5 truncate">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Summary cards ─────────────────────────────────────────────── */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FUND_TYPES.map(type => {
              const s: OpcvmSummaryEntry | undefined = summary.summary[type];
              if (!s) return null;
              const color = TYPE_COLORS_LIGHT[type] ?? 'bg-slate-50 text-slate-700 border-slate-200';
              return (
                <div key={type} className={`rounded-xl border p-4 ${color} bg-opacity-60`}>
                  <p className="font-black text-sm mb-2">{type}</p>
                  <p className="text-2xl font-black">{s.count}</p>
                  <p className="text-xs opacity-70 mb-1">fonds</p>
                  {s.avg_ytd !== null && (
                    <p className="text-xs font-semibold">
                      Moy. YTD : <span className={s.avg_ytd >= 0 ? 'text-emerald-700' : 'text-red-700'}>{formatPerf(s.avg_ytd)}</span>
                    </p>
                  )}
                  {s.best_ytd !== null && (
                    <p className="text-xs opacity-60 truncate" title={s.best_fund ?? ''}>
                      Meilleur : {formatPerf(s.best_ytd)}
                    </p>
                  )}
                  {s.total_encours > 0 && (
                    <p className="text-xs opacity-60 mt-1">{formatEncours(s.total_encours)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Top 5 YTD podium ──────────────────────────────────────────── */}
        {top5.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <h2 className="font-black text-slate-800 dark:text-white text-base">
                🏆 Top 5 Performances YTD — Tous types confondus
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {top5.map((fund, i) => {
                const accentColor = i === 0 ? 'border-yellow-400' : i === 1 ? 'border-slate-400' : i === 2 ? 'border-amber-600' : 'border-slate-200 dark:border-slate-700';
                const rankColor   = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-slate-400';
                return (
                  <div key={fund.name + i} className={`flex items-center gap-4 px-5 py-3 border-l-4 ${accentColor} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                    <span className={`text-2xl font-black w-8 text-center shrink-0 ${rankColor}`}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white truncate" title={fund.name}>{fund.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{fund.societe_gestion ?? '—'}</p>
                    </div>
                    <span className={`text-xl font-mono font-black shrink-0 ${perfClass(fund.perf_ytd)}`}>
                      {formatPerf(fund.perf_ytd)}
                    </span>
                    <span className={`text-xs border rounded-full px-2.5 py-0.5 font-semibold shrink-0 ${typeColorClass(fund.type)}`}>
                      {fund.type ?? '—'}
                    </span>
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block">
                      {formatVL(fund.vl)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Filters bar ───────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un fonds ou une société de gestion..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="">Tous les types</option>
            {FUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* SG filter */}
          <select
            value={sgFilter}
            onChange={e => setSgFilter(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer max-w-[180px]"
          >
            <option value="">Toutes les SG</option>
            {sgOptions.map(sg => <option key={sg} value={sg}>{sg}</option>)}
          </select>

          {/* Reset */}
          {(search || typeFilter || sgFilter) && (
            <button
              onClick={() => { setSearch(''); setTypeFilter(''); setSgFilter(''); }}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-2 transition-colors"
            >
              ✕ Réinitialiser
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400">{filtered.length} fonds</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
            >
              {refreshing ? '⏳' : '↻'} Rafraîchir
            </button>
          </div>
        </div>

        {/* ── Main table ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="text-3xl mb-3 animate-pulse">📊</div>
            <p className="font-semibold">Chargement des fonds OPCVM…</p>
            <p className="text-sm text-slate-400 mt-1">Connexion à {source || 'medias24.com / ASFIM'}</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-slate-500">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="font-semibold text-red-600 dark:text-red-400">Données indisponibles</p>
            <p className="text-sm text-slate-400 mt-1">Vérifiez la connexion au backend ou réessayez.</p>
            <button onClick={load} className="mt-4 text-sm text-blue-600 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
              ↻ Réessayer
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                {/* Sticky header */}
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left py-3 pl-4 pr-2 text-xs text-slate-400 font-semibold w-8">#</th>
                    <th className="text-left py-3 px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold w-28">Type</th>
                    <th className="text-left py-3 px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">Nom du fonds</th>
                    <th className="text-left py-3 px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold hidden md:table-cell">Société de Gestion</th>
                    {sortCols.map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={`text-right py-3 px-3 text-xs font-semibold cursor-pointer select-none transition-colors hover:text-blue-600 ${col.mobile === false ? 'hidden md:table-cell' : ''} ${sortKey === col.key ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        {col.label} {sortKey === col.key ? (sortDir === 'desc' ? '▼' : '▲') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-sm text-slate-400">
                        Aucun fonds ne correspond à votre recherche.
                      </td>
                    </tr>
                  ) : filtered.map((fund, i) => (
                    <tr
                      key={fund.name + i}
                      className="border-b border-slate-100 dark:border-slate-700/50 even:bg-slate-50/50 dark:even:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors cursor-default h-14"
                    >
                      {/* # */}
                      <td className="pl-4 pr-2 text-xs text-slate-400">{i + 1}</td>

                      {/* Type */}
                      <td className="px-2">
                        <span className={`text-xs border rounded-full px-2.5 py-0.5 font-semibold whitespace-nowrap ${typeColorClass(fund.type)}`}>
                          {fund.type ?? '—'}
                        </span>
                      </td>

                      {/* Nom */}
                      <td className="px-2">
                        <p
                          className="text-sm font-medium text-slate-800 dark:text-white truncate max-w-[240px]"
                          title={fund.name}
                        >
                          {fund.name}
                        </p>
                      </td>

                      {/* SG */}
                      <td className="px-2 hidden md:table-cell">
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          {fund.societe_gestion ?? '—'}
                        </p>
                      </td>

                      {/* VL */}
                      <td className="px-3 text-right">
                        <span className="text-base font-mono font-semibold text-slate-700 dark:text-slate-200">
                          {fund.vl != null ? fund.vl.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                        </span>
                      </td>

                      {/* Var Jour */}
                      <td className={`px-3 text-right ${fund.var_jour != null ? (fund.var_jour >= 0 ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : 'bg-red-50/60 dark:bg-red-900/10') : ''}`}>
                        <span className={`text-base font-mono font-bold ${perfClass(fund.var_jour)}`}>
                          {formatPerf(fund.var_jour)}
                        </span>
                      </td>

                      {/* 1M */}
                      <td className="px-3 text-right hidden md:table-cell">
                        <span className={`text-base font-mono font-bold ${perfClass(fund.perf_1m)}`}>
                          {formatPerf(fund.perf_1m)}
                        </span>
                      </td>

                      {/* YTD */}
                      <td className="px-3 text-right">
                        <span className={`text-base font-mono font-bold ${perfClass(fund.perf_ytd)}`}>
                          {formatPerf(fund.perf_ytd)}
                        </span>
                      </td>

                      {/* 1 An */}
                      <td className="px-3 text-right">
                        <span className={`text-base font-mono font-bold ${perfClass(fund.perf_1an)}`}>
                          {formatPerf(fund.perf_1an)}
                        </span>
                      </td>

                      {/* Encours */}
                      <td className="px-3 text-right hidden md:table-cell">
                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                          {formatEncours(fund.encours)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Source & Disclaimer footer ─────────────────────────────────── */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 px-5 py-4 text-sm space-y-1">
          {source && (
            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Source : <span className="font-semibold">{source}</span>
              {scrapedAt && <> · Mis à jour le <span className="font-semibold">{new Date(scrapedAt).toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></>}
            </p>
          )}
          <p className="text-amber-800 dark:text-amber-300 font-medium">
            ⚠️ Les performances passées ne préjugent pas des performances futures.
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-xs">
            Ces informations sont fournies à des fins éducatives uniquement et ne constituent pas un conseil en investissement.
            {' '}<Link href="/learn" className="underline hover:text-amber-900 dark:hover:text-amber-200">En savoir plus →</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
