'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { AmmcSnapshot, AmmcCategory } from '@/app/api/opcvm/ammc/route';

// ── Colours ───────────────────────────────────────────────────────────────────

const BB_BG     = '#040914';
const BB_CARD   = '#0B101E';
const BB_BORDER = '#1E293B';
const BB_ORANGE = '#FF8C00';
const BB_GREEN  = '#00FF7F';
const BB_RED    = '#FF4444';
const BB_CYAN   = '#00BFFF';
const BB_MUTED  = '#64748B';
const BB_WHITE  = '#E2E8F0';
const BB_YELLOW = '#FFD700';

const CAT_COLORS: Record<string, string> = {
  monetaire:       BB_CYAN,
  obligataire_mlt: '#6366F1',
  obligataire_ct:  '#A855F7',
  actions:         BB_GREEN,
  diversifie:      BB_YELLOW,
  contractuel:     BB_MUTED,
};

const CAT_ORDER = [
  'monetaire', 'obligataire_mlt', 'obligataire_ct',
  'actions', 'diversifie', 'contractuel',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function mrd(v: number | null | undefined): string {
  if (v == null) return '—';
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)} Mrd`;
  return `${v.toFixed(0)} M`;
}

function pct(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(decimals)}%`;
}

function pctColor(v: number | null | undefined): string {
  if (v == null) return BB_MUTED;
  return v > 0 ? BB_GREEN : v < 0 ? BB_RED : BB_MUTED;
}

function scoreColor(s: number): string {
  if (s >= 70) return BB_GREEN;
  if (s >= 50) return BB_YELLOW;
  return BB_RED;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = BB_ORANGE }: {
  label: string; value: string; sub: string; color?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 border"
      style={{ background: BB_CARD, borderColor: `${color}44` }}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BB_MUTED }}>{label}</span>
      <span className="text-2xl font-black tabular-nums" style={{ color }}>{value}</span>
      <span className="text-[11px]" style={{ color: BB_MUTED }}>{sub}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: BB_BORDER }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-10 text-right" style={{ color }}>{score.toFixed(0)}</span>
    </div>
  );
}

function InsightBadge({ text, idx }: { text: string; idx: number }) {
  const icons = ['◆', '◈', '▶', '●', '◉', '◇'];
  return (
    <div className="flex items-start gap-3 py-3 border-b" style={{ borderColor: BB_BORDER }}>
      <span className="text-base flex-shrink-0 mt-0.5" style={{ color: BB_ORANGE }}>
        {icons[idx % icons.length]}
      </span>
      <p className="text-sm leading-relaxed" style={{ color: BB_WHITE }}>{text}</p>
    </div>
  );
}

// ── Custom tooltip for Recharts ───────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="border px-3 py-2 text-xs"
      style={{ background: '#0d1626', borderColor: BB_BORDER }}
    >
      <p className="font-bold mb-1" style={{ color: BB_ORANGE }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? mrd(p.value) + ' MAD' : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OpcvmAmmcPage() {
  const [latest,   setLatest]   = useState<AmmcSnapshot | null>(null);
  const [history,  setHistory]  = useState<AmmcSnapshot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'insights' | 'simulator'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [latestRes, histRes] = await Promise.all([
        fetch('/api/opcvm/ammc'),
        fetch('/api/opcvm/ammc?_path=history'),
      ]);
      if (!latestRes.ok) throw new Error('latest failed');
      const latestData = await latestRes.json() as AmmcSnapshot;
      setLatest(latestData);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData.history ?? []);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived chart data ──────────────────────────────────────────────────────

  const aumChartData = history.map(snap => {
    const row: Record<string, string | number> = { date: snap.date.slice(5) };
    for (const key of CAT_ORDER) {
      const c = snap.categories[key];
      if (c?.aum) row[key] = c.aum;
    }
    return row;
  });

  const flowsChartData = history.map(snap => ({
    date:          snap.date.slice(5),
    subscriptions: snap.flows.subscriptions,
    redemptions:   -snap.flows.redemptions,
    net_flow:      snap.flows.net_flow,
  }));

  const pieData = latest
    ? CAT_ORDER
        .map(k => ({ name: latest.categories[k]?.label ?? k, value: latest.categories[k]?.aum ?? 0, key: k }))
        .filter(d => d.value > 0)
    : [];

  const scoresChartData = history.map(snap => {
    const row: Record<string, string | number> = { date: snap.date.slice(5) };
    for (const key of CAT_ORDER) {
      if (snap.scores[key] != null) row[key] = snap.scores[key];
    }
    return row;
  });

  // ── Simulator state ─────────────────────────────────────────────────────────

  const [simAmount,  setSimAmount]  = useState(100000);
  const [simCat,     setSimCat]     = useState('actions');
  const [simWeeks,   setSimWeeks]   = useState(8);

  const simResult = (() => {
    if (!history.length || !simCat) return null;
    const recent = history.slice(-simWeeks);
    let value = simAmount;
    const series: { date: string; value: number }[] = [{ date: 'Début', value }];
    for (const snap of recent) {
      const c = snap.categories[simCat];
      const g = c?.weekly_growth ?? 0;
      value *= (1 + g);
      series.push({ date: snap.date.slice(5), value: Math.round(value) });
    }
    const gain = value - simAmount;
    const gainPct = gain / simAmount;
    return { finalValue: Math.round(value), gain: Math.round(gain), gainPct, series };
  })();

  // ── Loading / error ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BB_BG }}>
        <div className="text-center space-y-3">
          <div className="text-3xl animate-pulse" style={{ color: BB_ORANGE }}>◈</div>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>
            Chargement des données AMMC…
          </p>
        </div>
      </div>
    );
  }

  if (error || !latest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BB_BG }}>
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-lg font-bold" style={{ color: BB_RED }}>Données indisponibles</p>
          <p className="text-sm" style={{ color: BB_MUTED }}>
            Impossible de charger les données AMMC. Vérifiez votre connexion ou relancez le pipeline.
          </p>
          <button
            onClick={load}
            className="px-4 py-2 text-sm font-bold border"
            style={{ color: BB_ORANGE, borderColor: BB_ORANGE }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const cats = latest.categories;
  const catList = CAT_ORDER.map(k => ({ key: k, ...cats[k] })).filter(c => c.aum != null);
  const sortedByScore = [...catList].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const prevGrowth = latest.weekly_growth;

  return (
    <div className="min-h-screen" style={{ background: BB_BG, color: BB_WHITE, fontFamily: 'monospace' }}>

      {/* ── Navbar breadcrumb ── */}
      <div
        className="flex items-center gap-2 px-6 py-3 border-b text-xs"
        style={{ background: '#050b14', borderColor: BB_BORDER, color: BB_MUTED }}
      >
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/opcvm" className="hover:text-white transition-colors">OPCVM</Link>
        <span>/</span>
        <span style={{ color: BB_ORANGE }}>Statistiques AMMC</span>
        <span className="ml-auto">{latest.date} · {latest.source}</span>
      </div>

      {/* ── Page header ── */}
      <div
        className="px-6 py-6 border-b"
        style={{ background: '#060c18', borderColor: BB_BORDER }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: BB_ORANGE }}>
            ◈ Statistiques Hebdomadaires OPCVM
          </h1>
          <p className="text-sm mt-1" style={{ color: BB_MUTED }}>
            Source : AMMC · data.gov.ma · Mise à jour automatique chaque lundi
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Encours Total"
            value={`${mrd(latest.aum_total)} MAD`}
            sub={`vs ${mrd(latest.aum_prev)} MAD semaine préc.`}
            color={BB_ORANGE}
          />
          <KpiCard
            label="Croissance Hebdo"
            value={pct(prevGrowth)}
            sub="Variation de l'encours total"
            color={pctColor(prevGrowth)}
          />
          <KpiCard
            label="Flux Nets"
            value={`${(latest.flows.net_flow >= 0 ? '+' : '') + mrd(latest.flows.net_flow)} MAD`}
            sub={`Sub: ${mrd(latest.flows.subscriptions)}  Rach: ${mrd(latest.flows.redemptions)}`}
            color={latest.flows.net_flow >= 0 ? BB_GREEN : BB_RED}
          />
          <KpiCard
            label="Fonds Actifs"
            value={String(catList.reduce((s, c) => s + (c.nb_fonds ?? 0), 0))}
            sub={`Répartis sur ${catList.length} catégories`}
            color={BB_CYAN}
          />
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 border-b" style={{ borderColor: BB_BORDER }}>
          {(['overview', 'charts', 'insights', 'simulator'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
              style={{
                color: activeTab === tab ? BB_ORANGE : BB_MUTED,
                borderBottom: activeTab === tab ? `2px solid ${BB_ORANGE}` : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {tab === 'overview'   ? 'Vue d\'ensemble' :
               tab === 'charts'    ? 'Graphiques' :
               tab === 'insights'  ? 'Insights' :
               'Simulateur'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ══ TAB: OVERVIEW ══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Category breakdown table */}
            <div className="border overflow-x-auto" style={{ borderColor: BB_BORDER, background: BB_CARD }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BB_BORDER }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                  Répartition par Catégorie
                </span>
                <span className="text-xs" style={{ color: BB_MUTED }}>
                  Encours en M MAD · Semaine {latest.week_number ?? '—'} · {latest.date}
                </span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: BB_BORDER, color: BB_MUTED }}>
                    {['Catégorie', 'Fonds', 'Encours', 'Poids', 'Δ Hebdo', 'Idx Perf.', 'Souscriptions', 'Rachats', 'Flux Nets', 'Score'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catList.map(c => {
                    const color = CAT_COLORS[c.key] ?? BB_MUTED;
                    return (
                      <tr
                        key={c.key}
                        className="border-b transition-colors hover:bg-white/5"
                        style={{ borderColor: BB_BORDER }}
                      >
                        <td className="px-4 py-3 font-bold" style={{ color }}>{c.label}</td>
                        <td className="px-4 py-3" style={{ color: BB_MUTED }}>{c.nb_fonds ?? '—'}</td>
                        <td className="px-4 py-3 font-bold tabular-nums" style={{ color: BB_CYAN }}>
                          {mrd(c.aum)} MAD
                        </td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: BB_MUTED }}>
                          {c.weight?.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-bold tabular-nums" style={{ color: pctColor(c.weekly_growth) }}>
                          {pct(c.weekly_growth)}
                        </td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: BB_YELLOW }}>
                          {c.perf_index?.toFixed(2) ?? '—'}
                        </td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: BB_GREEN }}>
                          +{mrd(c.subscriptions)}
                        </td>
                        <td className="px-4 py-3 tabular-nums" style={{ color: BB_RED }}>
                          -{mrd(c.redemptions)}
                        </td>
                        <td
                          className="px-4 py-3 font-bold tabular-nums"
                          style={{ color: (c.net_flow ?? 0) >= 0 ? BB_GREEN : BB_RED }}
                        >
                          {(c.net_flow ?? 0) >= 0 ? '+' : ''}{mrd(c.net_flow)}
                        </td>
                        <td className="px-4 py-3 w-36">
                          <ScoreBar score={c.score ?? 50} />
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals row */}
                  <tr style={{ background: '#0d1626' }}>
                    <td className="px-4 py-3 font-black uppercase text-[10px] tracking-widest" style={{ color: BB_ORANGE }}>Total</td>
                    <td className="px-4 py-3 font-bold" style={{ color: BB_WHITE }}>
                      {catList.reduce((s, c) => s + (c.nb_fonds ?? 0), 0)}
                    </td>
                    <td className="px-4 py-3 font-black tabular-nums" style={{ color: BB_CYAN }}>
                      {mrd(latest.aum_total)} MAD
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: BB_WHITE }}>100%</td>
                    <td className="px-4 py-3 font-bold tabular-nums" style={{ color: pctColor(latest.weekly_growth) }}>
                      {pct(latest.weekly_growth)}
                    </td>
                    <td colSpan={2} />
                    <td />
                    <td className="px-4 py-3 font-black tabular-nums" style={{ color: latest.flows.net_flow >= 0 ? BB_GREEN : BB_RED }}>
                      {latest.flows.net_flow >= 0 ? '+' : ''}{mrd(latest.flows.net_flow)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Score ranking */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedByScore.map((c, i) => {
                const color = CAT_COLORS[c.key] ?? BB_MUTED;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={c.key}
                    className="border p-4 space-y-3"
                    style={{ background: BB_CARD, borderColor: `${color}44`, borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black" style={{ color }}>
                        {medals[i] ? medals[i] + ' ' : ''}{c.label}
                      </span>
                      <span className="text-xs" style={{ color: BB_MUTED }}>{c.nb_fonds} fonds</span>
                    </div>
                    <ScoreBar score={c.score ?? 50} />
                    <div className="grid grid-cols-2 gap-x-4 text-xs">
                      <div>
                        <span style={{ color: BB_MUTED }}>Encours</span>
                        <div className="font-bold" style={{ color: BB_CYAN }}>{mrd(c.aum)} MAD</div>
                      </div>
                      <div>
                        <span style={{ color: BB_MUTED }}>Flux nets</span>
                        <div className="font-bold" style={{ color: (c.net_flow ?? 0) >= 0 ? BB_GREEN : BB_RED }}>
                          {(c.net_flow ?? 0) >= 0 ? '+' : ''}{mrd(c.net_flow)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span style={{ color: BB_MUTED }}>Perf. index</span>
                        <div className="font-bold" style={{ color: BB_YELLOW }}>
                          {c.perf_index?.toFixed(2) ?? '—'}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span style={{ color: BB_MUTED }}>Δ Hebdo</span>
                        <div className="font-bold" style={{ color: pctColor(c.weekly_growth) }}>
                          {pct(c.weekly_growth)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══ TAB: CHARTS ════════════════════════════════════════════════════════ */}
        {activeTab === 'charts' && (
          <div className="space-y-8">

            {/* AUM Line Chart */}
            <div className="border p-5" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: BB_ORANGE }}>
                Évolution de l'Encours par Catégorie (M MAD)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={aumChartData}>
                  <CartesianGrid stroke={BB_BORDER} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: BB_MUTED, fontSize: 11 }} />
                  <YAxis tick={{ fill: BB_MUTED, fontSize: 11 }} tickFormatter={v => mrd(v)} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ color: BB_MUTED, fontSize: 11 }} />
                  {CAT_ORDER.map(key => {
                    const label = latest.categories[key]?.label ?? key;
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={label}
                        stroke={CAT_COLORS[key]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie + Flows side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Pie Chart — category allocation */}
              <div className="border p-5" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: BB_ORANGE }}>
                  Répartition de l'Encours (Semaine {latest.week_number})
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map(entry => (
                        <Cell key={entry.key} fill={CAT_COLORS[entry.key] ?? BB_MUTED} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [mrd(v) + ' MAD', '']}
                      contentStyle={{ background: '#0d1626', border: `1px solid ${BB_BORDER}`, fontSize: 11 }}
                      labelStyle={{ color: BB_ORANGE }}
                    />
                    <Legend
                      formatter={(value, entry: any) => {
                        const c = latest.categories[entry.payload.key];
                        return `${value} ${c?.weight?.toFixed(1)}%`;
                      }}
                      wrapperStyle={{ color: BB_MUTED, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart — weekly flows */}
              <div className="border p-5" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: BB_ORANGE }}>
                  Flux Hebdomadaires (M MAD)
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={flowsChartData} barGap={2}>
                    <CartesianGrid stroke={BB_BORDER} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: BB_MUTED, fontSize: 10 }} />
                    <YAxis tick={{ fill: BB_MUTED, fontSize: 10 }} tickFormatter={v => mrd(Math.abs(v))} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ color: BB_MUTED, fontSize: 11 }} />
                    <Bar dataKey="subscriptions" name="Souscriptions" fill={BB_GREEN} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="redemptions"   name="Rachats"        fill={BB_RED}   radius={[2, 2, 0, 0]} />
                    <Bar dataKey="net_flow"      name="Flux nets"      fill={BB_ORANGE} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score evolution line chart */}
            <div className="border p-5" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: BB_ORANGE }}>
                Évolution des Scores OPCVM (0–100)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={scoresChartData}>
                  <CartesianGrid stroke={BB_BORDER} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: BB_MUTED, fontSize: 11 }} />
                  <YAxis domain={[40, 90]} tick={{ fill: BB_MUTED, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1626', border: `1px solid ${BB_BORDER}`, fontSize: 11 }} />
                  <Legend wrapperStyle={{ color: BB_MUTED, fontSize: 11 }} />
                  {CAT_ORDER.map(key => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={latest.categories[key]?.label ?? key}
                      stroke={CAT_COLORS[key]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CAT_COLORS[key] }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ TAB: INSIGHTS ══════════════════════════════════════════════════════ */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Auto-generated insights */}
            <div className="border" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: BB_BORDER }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                  ◈ Insights Automatisés — {latest.date}
                </span>
              </div>
              <div className="px-4 py-2">
                {latest.insights.map((text, i) => (
                  <InsightBadge key={i} text={text} idx={i} />
                ))}
              </div>
            </div>

            {/* Historical insights */}
            <div className="border" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: BB_BORDER }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                  ◈ Historique des Signaux
                </span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {[...history].reverse().slice(0, 3).map(snap => (
                  <div key={snap.date} className="border-b px-4 py-3" style={{ borderColor: BB_BORDER }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: BB_CYAN }}>
                      Semaine {snap.week_number} · {snap.date}
                    </p>
                    {snap.insights.slice(0, 2).map((txt, i) => (
                      <p key={i} className="text-xs mb-1.5" style={{ color: BB_MUTED }}>
                        <span style={{ color: BB_ORANGE }}>◆ </span>{txt}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Market metrics */}
            <div className="border md:col-span-2" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: BB_BORDER }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                  ◈ Métriques de Marché — Momentum & Tendances
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-800">
                {catList.map(c => {
                  const color = CAT_COLORS[c.key] ?? BB_MUTED;
                  const weeks3 = history.slice(-3).map(s => s.categories[c.key]?.weekly_growth ?? null);
                  const momentum = weeks3.filter(g => g !== null && g > 0).length;
                  return (
                    <div key={c.key} className="px-4 py-4 text-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color }}>{c.label}</p>
                      <p className="text-lg font-black" style={{ color: scoreColor(c.score ?? 50) }}>
                        {c.score?.toFixed(0) ?? '—'}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: BB_MUTED }}>score</p>
                      <div className="flex justify-center gap-1 mt-2">
                        {weeks3.map((g, i) => (
                          <span key={i} style={{ color: g === null ? BB_MUTED : g > 0 ? BB_GREEN : BB_RED, fontSize: 14 }}>
                            {g === null ? '○' : g > 0 ? '▲' : '▼'}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: BB_MUTED }}>
                        {momentum}/3 sem. haussières
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: SIMULATOR ═════════════════════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Controls */}
            <div className="border p-5 space-y-5" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
                ◈ Paramètres du Simulateur
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: BB_MUTED }}>
                  Montant initial (MAD)
                </label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={e => setSimAmount(Number(e.target.value))}
                  className="w-full bg-transparent border px-3 py-2 text-sm font-bold outline-none"
                  style={{ borderColor: BB_BORDER, color: BB_WHITE }}
                  min={1000}
                  step={10000}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: BB_MUTED }}>
                  Catégorie OPCVM
                </label>
                <select
                  value={simCat}
                  onChange={e => setSimCat(e.target.value)}
                  className="w-full bg-transparent border px-3 py-2 text-sm font-bold outline-none"
                  style={{ background: BB_CARD, borderColor: BB_BORDER, color: BB_WHITE }}
                >
                  {catList.map(c => (
                    <option key={c.key} value={c.key} style={{ background: BB_CARD }}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: BB_MUTED }}>
                  Durée : {simWeeks} semaine{simWeeks > 1 ? 's' : ''}
                </label>
                <input
                  type="range"
                  value={simWeeks}
                  onChange={e => setSimWeeks(Number(e.target.value))}
                  min={1}
                  max={Math.min(history.length, 9)}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-[10px]" style={{ color: BB_MUTED }}>
                  <span>1 sem.</span>
                  <span>{Math.min(history.length, 9)} sem.</span>
                </div>
              </div>

              {simResult && (
                <div className="pt-4 border-t space-y-3" style={{ borderColor: BB_BORDER }}>
                  <div>
                    <p className="text-[10px] uppercase font-bold" style={{ color: BB_MUTED }}>Valeur finale</p>
                    <p className="text-xl font-black tabular-nums" style={{ color: BB_CYAN }}>
                      {simResult.finalValue.toLocaleString('fr-MA')} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold" style={{ color: BB_MUTED }}>Gain / Perte</p>
                    <p className="text-lg font-black tabular-nums" style={{ color: simResult.gain >= 0 ? BB_GREEN : BB_RED }}>
                      {simResult.gain >= 0 ? '+' : ''}{simResult.gain.toLocaleString('fr-MA')} MAD
                    </p>
                    <p className="text-sm" style={{ color: pctColor(simResult.gainPct) }}>
                      {pct(simResult.gainPct, 3)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation chart */}
            <div className="border p-5 md:col-span-2" style={{ background: BB_CARD, borderColor: BB_BORDER }}>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: BB_ORANGE }}>
                Simulation : {catList.find(c => c.key === simCat)?.label} · {simWeeks} semaine{simWeeks > 1 ? 's' : ''}
              </h3>
              {simResult && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={simResult.series}>
                    <CartesianGrid stroke={BB_BORDER} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: BB_MUTED, fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: BB_MUTED, fontSize: 11 }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => [v.toLocaleString('fr-MA') + ' MAD', 'Valeur']}
                      contentStyle={{ background: '#0d1626', border: `1px solid ${BB_BORDER}`, fontSize: 11 }}
                      labelStyle={{ color: BB_ORANGE }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={CAT_COLORS[simCat] ?? BB_ORANGE}
                      strokeWidth={3}
                      dot={{ r: 4, fill: CAT_COLORS[simCat] ?? BB_ORANGE }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <p className="text-[10px] mt-3" style={{ color: BB_MUTED }}>
                ⚠️ Simulation basée sur les performances passées des fonds AMMC.
                La performance passée ne préjuge pas des performances futures.
                Usage éducatif uniquement.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div
        className="border-t px-6 py-4 text-[10px] flex items-center justify-between"
        style={{ borderColor: BB_BORDER, background: '#050b14', color: BB_MUTED }}
      >
        <span>WallStreet Morocco · Données AMMC · data.gov.ma</span>
        <span>Mise à jour auto chaque lundi · {latest.source}</span>
      </div>
    </div>
  );
}
