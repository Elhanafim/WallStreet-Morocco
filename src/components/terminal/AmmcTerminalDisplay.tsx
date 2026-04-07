'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Roboto_Mono } from 'next/font/google';
import { useAmmcData } from '@/hooks/useAmmcData';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

// ── Bloomberg Terminal Aesthetics ───────────────────────────────────────────

const BB_BG      = '#040914';
const BB_CARD    = '#0B101E';
const BB_BORDER  = '#1E293B';
const BB_ORANGE  = '#FF8C00';
const BB_GREEN   = '#00FF7F';
const BB_RED     = '#FF4444';
const BB_CYAN    = '#00BFFF';
const BB_MUTED   = '#64748B';
const BB_WHITE   = '#E2E8F0';
const BB_YELLOW  = '#FFD700';

const CAT_COLORS: Record<string, string> = {
  monetaire:       BB_CYAN,
  obligataire_mlt: '#6366F1',
  obligataire_ct:  '#A855F7',
  actions:         BB_GREEN,
  diversifie:      BB_YELLOW,
  contractuel:     BB_RED,
};

const CAT_ORDER = [
  'monetaire', 'obligataire_mlt', 'obligataire_ct',
  'actions', 'diversifie', 'contractuel',
];

// ── Formatters ──────────────────────────────────────────────────────────────

const mrd = (v: number | null | undefined) => {
  if (v == null) return '—';
  const val = Math.abs(v);
  if (val >= 1000) return `${(v / 1000).toFixed(2)} Mrd`;
  return `${v.toFixed(1)} M`;
};

const pct = (v: number | null | undefined) => {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${(v * 100).toFixed(2)}%`;
};

// ── Components ──────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col mb-4 border-l-2 border-orange-500 pl-3">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: BB_ORANGE }}>
        {title}
      </h3>
      {subtitle && <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: BB_MUTED }}>{subtitle}</span>}
    </div>
  );
}

function KpiBox({ label, value, sub, trend = 0 }: { label: string; value: string; sub: string; trend?: number }) {
  return (
    <div className="p-4 border border-slate-800/50 bg-[#060c18] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-bold opacity-20" style={{ color: BB_ORANGE }}>OPCVM::CORE</div>
      <p className="text-[9px] uppercase font-bold tracking-widest mb-1" style={{ color: BB_MUTED }}>{label}</p>
      <p className="text-xl font-black tabular-nums" style={{ color: BB_WHITE }}>{value}</p>
      <p className="text-[10px] mt-1 flex items-center gap-1.5">
        <span style={{ color: trend > 0 ? BB_GREEN : trend < 0 ? BB_RED : BB_MUTED }}>
          {trend !== 0 && (trend > 0 ? '▲' : '▼')}
        </span>
        <span style={{ color: BB_MUTED }}>{sub}</span>
      </p>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────

export default function AmmcTerminalDisplay() {
  const { latest, history, loading, error } = useAmmcData();
  const [ticker, setTicker] = useState('ALL');

  // Derived Data
  const chartData = useMemo(() => {
    return [...history].slice(-12).map(snap => ({
      date: snap.date.split('-').slice(1).reverse().join('/'),
      aum: snap.aum_total / 1000,
      flow: snap.flows.net_flow,
      subs: snap.flows.subscriptions,
      reds: -snap.flows.redemptions,
    }));
  }, [history]);

  // Simulator State
  const [simAmount, setSimAmount] = useState(100000);
  const [simWeeks, setSimWeeks] = useState(4);
  const [simCat, setSimCat] = useState('actions');

  const simResult = useMemo(() => {
    if (!latest?.categories[simCat]) return null;
    const cat = latest.categories[simCat];
    const growth = cat.weekly_growth || 0;
    const final = simAmount * Math.pow(1 + growth, simWeeks);
    return {
      final,
      gain: final - simAmount,
      pct: (final / simAmount - 1) * 100
    };
  }, [latest, simAmount, simWeeks, simCat]);

  if (loading) return <div className="p-8 text-orange-500 animate-pulse font-mono">INITIALIZING OPCVM_CORE v2.0...</div>;
  if (error || !latest) return <div className="p-8 text-red-500 font-mono">FATAL: DATA_REFETCH_FAILED</div>;

  const cats = CAT_ORDER.map(id => ({ id, ...latest.categories[id] })).filter(c => c.label);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: BB_BG, color: BB_WHITE, ...robotoMono.style }}>
      
      {/* ── TOP BANNER ───────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#050b14]">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600/10 border border-orange-500/30 px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-orange-500 tracking-tighter uppercase whitespace-nowrap">AMMC LIVE</span>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight">Active Portfolio Analytics</h1>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: BB_MUTED }}>
              Reporting Week: {latest.week_number} | Source: {latest.source}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="hidden md:block">
            <p className="text-[9px] font-bold" style={{ color: BB_MUTED }}>LAST SYNC</p>
            <p className="text-xs font-black tabular-nums">{latest.date}</p>
          </div>
          <div className="bg-[#1E293B] px-3 py-1 border border-slate-700">
             <span className="text-[10px] font-black" style={{ color: BB_ORANGE }}>TERM::OPCVM</span>
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD GRID ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[800px]">
          
          {/* COLUMN 1: VITAL STATS & SENTIMENT (3/12) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <SectionHeader title="Global Liquidity" subtitle="Institutional AUM Metrics" />
            
            <div className="grid grid-cols-1 gap-3">
              <KpiBox 
                label="Total Assets (AUM)" 
                value={`${mrd(latest.aum_total)} MAD`} 
                sub={`vs ${mrd(latest.aum_prev)} (W-1)`}
                trend={latest.weekly_growth || 0}
              />
              <KpiBox 
                label="Weekly Net Flow" 
                value={`${latest.flows.net_flow >= 0 ? '+' : ''}${mrd(latest.flows.net_flow)}`} 
                sub="Cumulative Sub/Rach"
                trend={latest.flows.net_flow}
              />
            </div>

            <div className="flex-1 border border-slate-800 bg-[#060c18] p-4">
              <SectionHeader title="Category Momentum" />
              <div className="space-y-4">
                {cats.sort((a,b) => (b.score || 0) - (a.score || 0)).slice(0, 4).map((c, i) => (
                  <div key={c.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase truncate max-w-[120px]" style={{ color: CAT_COLORS[c.id] }}>
                        {i+1}. {c.label}
                      </span>
                      <span className="text-[10px] font-black tabular-nums" style={{ color: BB_CYAN }}>
                        {c.score?.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${c.score}%`, background: CAT_COLORS[c.id] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                 <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: BB_MUTED }}>Sentiment Logic</p>
                 <div className="space-y-2">
                    {latest.insights.slice(0, 2).map((ins, i) => (
                      <p key={i} className="text-[10px] leading-relaxed italic" style={{ color: BB_YELLOW }}>
                        // {ins}
                      </p>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: INTELLIGENCE ENGINE (5/12) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <SectionHeader title="Category Intelligence" subtitle="Deep Dive Performance Matrix" />
            
            <div className="flex-1 bg-[#060c18] border border-slate-800 relative overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest" style={{ color: BB_MUTED }}>Category</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right" style={{ color: BB_MUTED }}>AUM</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right" style={{ color: BB_MUTED }}>Weight</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right" style={{ color: BB_MUTED }}>Δ Weekly</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right" style={{ color: BB_MUTED }}>Net Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cats.map(c => (
                      <tr key={c.id} className="border-b border-slate-800/30 hover:bg-white/[0.02] group transition-colors cursor-pointer" onClick={() => setTicker(c.id)}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-3" style={{ background: CAT_COLORS[c.id] }} />
                            <span className="text-[11px] font-bold uppercase" style={{ color: BB_WHITE }}>{c.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-[11px] font-black" style={{ color: BB_CYAN }}>{mrd(c.aum)}</td>
                        <td className="px-4 py-4 text-right tabular-nums text-[10px]" style={{ color: BB_MUTED }}>{c.weight?.toFixed(1)}%</td>
                        <td className="px-4 py-4 text-right tabular-nums text-[11px] font-bold" style={{ color: (c.weekly_growth || 0) >= 0 ? BB_GREEN : BB_RED }}>
                          {pct(c.weekly_growth)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-[11px] font-bold" style={{ color: (c.net_flow || 0) >= 0 ? BB_GREEN : BB_RED }}>
                          {mrd(c.net_flow)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-[#0a1120] border-t border-slate-800">
                <SectionHeader title="Historical Context" />
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BB_CYAN} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={BB_CYAN} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip 
                        contentStyle={{ background: '#0d1626', border: '1px solid #1e293b', padding: '6px' }}
                        labelStyle={{ fontSize: '9px', color: BB_MUTED }}
                        itemStyle={{ fontSize: '10px', color: BB_CYAN }}
                      />
                      <Area type="monotone" dataKey="aum" name="Total AUM (Mrd)" stroke={BB_CYAN} fillOpacity={1} fill="url(#colorAum)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: FLOW ANALYTICS & SIMULATOR (4/12) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <SectionHeader title="Asset Flow Dynamics" subtitle="Weekly Subscription Velocity" />
            
            <div className="h-[200px] bg-[#060c18] border border-slate-800 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ background: '#0d1626', border: '1px solid #1e293b', padding: '6px' }}
                    labelStyle={{ fontSize: '9px', color: BB_MUTED }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Bar dataKey="subs" name="Inflow" fill={BB_GREEN} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="reds" name="Outflow" fill={BB_RED} radius={[0, 0, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between mt-3 px-2">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2" style={{ background: BB_GREEN }} />
                    <span className="text-[9px] uppercase font-bold" style={{ color: BB_MUTED }}>Subscriptions</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2" style={{ background: BB_RED }} />
                    <span className="text-[9px] uppercase font-bold" style={{ color: BB_MUTED }}>Redemptions</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 bg-[#060c18] border border-slate-800 p-5 space-y-6">
              <SectionHeader title="Investment Simulator" subtitle="Quick Yield Projection" />
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-widest" style={{ color: BB_MUTED }}>Principal (MAD)</label>
                  <input 
                    type="number" 
                    value={simAmount} 
                    onChange={e => setSimAmount(Number(e.target.value))}
                    className="w-full bg-[#0d1626] border border-slate-800 px-3 py-2 text-xs font-bold focus:border-orange-500 outline-none tabular-nums"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-widest" style={{ color: BB_MUTED }}>Category Strategy</label>
                  <select 
                    value={simCat} 
                    onChange={e => setSimCat(e.target.value)}
                    className="w-full bg-[#0d1626] border border-slate-800 px-3 py-2 text-xs font-bold focus:border-orange-500 outline-none"
                  >
                    {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[9px] uppercase font-black tracking-widest" style={{ color: BB_MUTED }}>Horizon (Weeks)</label>
                    <span className="text-[10px] font-black" style={{ color: BB_ORANGE }}>{simWeeks}W</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="52" 
                    value={simWeeks} 
                    onChange={e => setSimWeeks(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>

              {simResult && (
                <div className="pt-6 border-t border-slate-800 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold" style={{ color: BB_MUTED }}>Target Value</span>
                    <span className="text-lg font-black tabular-nums" style={{ color: BB_CYAN }}>
                      {simResult.final.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase font-bold" style={{ color: BB_MUTED }}>Net Profit</span>
                    <div className="text-right">
                      <p className="text-sm font-black tabular-nums" style={{ color: simResult.gain >= 0 ? BB_GREEN : BB_RED }}>
                        {simResult.gain >= 0 ? '+' : ''}{simResult.gain.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: simResult.pct >= 0 ? BB_GREEN : BB_RED }}>
                        {simResult.pct >= 0 ? '+' : ''}{simResult.pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ───────────────────────────────────────────────────────── */}
      <footer className="px-6 py-2 border-t border-slate-800 bg-[#050b14] flex justify-between items-center">
        <div className="flex gap-4">
          <span className="text-[9px] font-bold" style={{ color: BB_MUTED }}>BVC::LIVE_QUERY_STABLE</span>
          <span className="text-[9px] font-bold" style={{ color: BB_ORANGE }}>SYSTEM_ENCRYPTED</span>
        </div>
        <div className="text-[10px] font-black italic" style={{ color: BB_MUTED }}>
           WALLSTREET MOROCCO v3.2.0 • TERMINAL_CORE
        </div>
      </footer>
    </div>
  );
}
