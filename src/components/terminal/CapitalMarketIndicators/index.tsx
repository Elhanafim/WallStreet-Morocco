'use client';

import { useState, useEffect } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Info, Download, ExternalLink, Activity, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700', '900'] });

// Professional Financial Color Palette (Bloomberg-inspired HSL)
const BB_ORANGE = '#FF9800';
const BB_MUTED = '#8B95A1';
const BB_BG = '#040914';
const BB_BORDER = '#1E293B';
const BB_PANEL = '#0B101E';
const BB_WHITE = '#FFFFFF';
const BB_CYAN = '#00E5FF';
const BB_GREEN = '#00E676';
const BB_RED = '#FF5252';

const CHART_COLORS = ['#00E5FF', '#00E676', '#FF9800', '#FF5252', '#E040FB', '#7C4DFF'];

interface OPCVMCategory {
  category: string;
  funds: number;
  assets: number;
  change_ytd: string;
}

interface Indicators {
  title: string;
  date: string;
  url: string;
  scraped_at: string;
  market_cap: number | null;
  masi: number | null;
  volume: number | null;
  opcvm: {
    total_assets: number | null;
    total_funds: number | null;
    categories: OPCVMCategory[];
  };
  capital_raises: {
    total: number | null;
    equity: number | null;
    bonds: number | null;
    tcn: number | null;
  };
  securities_lending: {
    volume: number | null;
    outstanding: number | null;
  };
  insights: string[];
}

export default function CapitalMarketIndicators() {
  const [data, setData] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/capital-market/latest');
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch indicators', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center bg-[#040914]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-BB_ORANGE border-BB_BORDER rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse" style={{ color: BB_ORANGE }}>
            LOADING MARKET DATA...
          </span>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="p-8 h-full flex items-center justify-center bg-[#040914]">
      <div className="text-red-500 font-mono text-xs">ERR: DATA_FETCH_FAILED</div>
    </div>
  );

  const chartData = data.opcvm.categories.map(cat => ({
    name: cat.category,
    value: cat.assets
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#040914] text-white" style={robotoMono.style}>
      {/* Header — Official AMMC Label */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1E293B] bg-[#0B101E]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-BB_ORANGE rounded-full animate-pulse" />
            <h1 className="text-[11px] font-black uppercase tracking-[0.15em] text-white">
              Indicateurs du Marché des Capitaux
            </h1>
          </div>
          <div className="h-4 w-px bg-[#1E293B]" />
          <span className="text-[10px] font-bold text-gray-400">PÉRIODE: {data.date.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest hidden md:inline">
            Status: Official Publication
          </span>
          <a 
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 border border-[#1E293B] hover:bg-white hover:text-black transition-all duration-200"
          >
            <Download size={10} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">RAPPORT PDF</span>
          </a>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden overflow-y-auto lg:overflow-hidden divide-x divide-[#1E293B]">
        
        {/* Column 1: Market Bourse & Insights (3 Grid Cols) */}
        <div className="lg:col-span-3 flex flex-col h-full overflow-y-auto divide-y divide-[#1E293B]">
          
          {/* Top Level Market KPI */}
          <div className="p-6 space-y-6">
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Indice MASI</span>
                <TrendingUp size={12} className="text-BB_GREEN opacity-50" />
              </div>
              <div className="text-3xl font-black tabular-nums tracking-tighter leading-none group-hover:text-BB_ORANGE transition-colors">
                {data.masi?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[9px] font-bold mt-2 text-BB_GREEN">PTS / LIVE SNAPSHOT</div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Capitalisation</span>
                <span className="text-[8px] text-slate-600 font-bold">MMDH</span>
              </div>
              <div className="text-3xl font-black tabular-nums tracking-tighter leading-none text-BB_CYAN">
                {data.market_cap?.toLocaleString('fr-MA', { minimumFractionDigits: 1 })}
              </div>
              <div className="text-[9px] font-bold mt-2 text-slate-500 tracking-tight">AMMC BOURSE RECAP</div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Volume de Transaction</span>
                <span className="text-[8px] text-slate-600 font-bold">MDH</span>
              </div>
              <div className="text-3xl font-black tabular-nums tracking-tighter leading-none text-BB_GREEN">
                {data.volume?.toLocaleString('fr-MA')}
              </div>
              <div className="text-[9px] font-bold mt-2 text-slate-500 tracking-tight uppercase">Volume Mensuel Global</div>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="p-6 bg-[#0B101E]/30 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={14} className="text-BB_ORANGE" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Analyste Insights</span>
            </div>
            <div className="space-y-6">
              {data.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <span className="text-BB_ORANGE font-bold text-xs mt-0.5 group-hover:translate-x-1 transition-transform">»</span>
                  <p className="text-[11px] leading-[1.6] tracking-tight font-medium text-gray-300" style={inter.style}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: OPCVM Distribution (5 Grid Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full border-r border-[#1E293B] overflow-y-auto">
          <div className="p-6 border-b border-[#1E293B] bg-[#0B101E]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon size={14} className="text-BB_ORANGE" />
              <span className="text-[11px] font-black uppercase tracking-widest">Répartition Actifs OPCVM</span>
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: BB_ORANGE }}>
              {data.opcvm.total_assets?.toLocaleString('fr-MA', { minimumFractionDigits: 1 })} MMDH
            </span>
          </div>

          <div className="flex-1 flex flex-col p-6 space-y-6">
            {/* Chart Container */}
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: BB_PANEL, border: `1px solid ${BB_BORDER}`, color: BB_WHITE, fontSize: '10px' }}
                    itemStyle={{ color: BB_ORANGE }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Actifs</span>
                <span className="text-xl font-black tabular-nums">{data.opcvm.total_assets?.toFixed(0)}</span>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B]">
                    <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-left tracking-widest">Catégorie</th>
                    <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right tracking-widest">Fonds</th>
                    <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right tracking-widest">Assets (MMDH)</th>
                    <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right tracking-widest">Var. YTD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {data.opcvm.categories.map((cat, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-2.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-[11px] font-bold text-gray-200">{cat.category}</span>
                      </td>
                      <td className="py-2.5 text-[11px] text-right text-gray-400 tabular-nums">{cat.funds}</td>
                      <td className="py-2.5 text-[11px] text-right font-black text-white tabular-nums">{cat.assets.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 text-[11px] text-right font-bold tabular-nums" style={{ color: cat.change_ytd.includes('-') ? BB_RED : BB_GREEN }}>
                        {cat.change_ytd}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 3: Funding & Lending (4 Grid Cols) */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto">
          
          {/* Capital Raises */}
          <div className="p-6 h-1/2 border-b border-[#1E293B]">
            <div className="flex items-center gap-2 mb-8">
              <BarChart2 size={14} className="text-BB_ORANGE" />
              <span className="text-[11px] font-black uppercase tracking-widest">Levées de Capitaux</span>
            </div>
            
            <div className="space-y-6">
              <div className="relative pl-4 border-l-2 border-BB_CYAN">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Titres de Capital</span>
                <div className="text-2xl font-black tabular-nums tracking-tighter">
                  {data.capital_raises.equity?.toLocaleString('fr-MA')} <span className="text-xs font-normal text-gray-600 ml-1">MDH</span>
                </div>
              </div>

              <div className="relative pl-4 border-l-2 border-BB_GREEN">
                <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Titres de Créances (TCN)</span>
                <div className="text-2xl font-black tabular-nums tracking-tighter">
                  {data.capital_raises.tcn?.toLocaleString('fr-MA')} <span className="text-xs font-normal text-gray-600 ml-1">MDH</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1E293B]/50 flex items-end justify-between">
                <div>
                  <span className="text-[9px] font-bold text-BB_ORANGE block mb-1">TOTAL LEVÉES</span>
                  <div className="text-3xl font-black tabular-nums tracking-tighter text-BB_ORANGE leading-none">
                    {( (data.capital_raises.equity || 0) + (data.capital_raises.tcn || 0) ).toLocaleString('fr-MA')}
                  </div>
                </div>
                <div className="text-[9px] font-bold text-gray-600 uppercase mb-1">CUMUL MENSUEL</div>
              </div>
            </div>
          </div>

          {/* Securities Lending */}
          <div className="p-6 h-1/2 flex flex-col bg-[#0B101E]/50">
            <div className="flex items-center gap-2 mb-8">
              <Activity size={14} className="text-BB_ORANGE" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Prêt-Emprunt de Titres</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6 flex-1 justify-center">
              <div className="flex justify-between items-center p-4 bg-[#040914] border border-[#1E293B] group hover:border-BB_CYAN transition-colors">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Encours Global</span>
                  <span className="text-2xl font-black tabular-nums text-white group-hover:text-BB_CYAN transition-colors">
                    {data.securities_lending.outstanding?.toLocaleString('fr-MA')}
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-600">MMDH</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#040914] border border-[#1E293B] group hover:border-BB_GREEN transition-colors">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Volume Mensuel</span>
                  <span className="text-2xl font-black tabular-nums text-white group-hover:text-BB_GREEN transition-colors">
                    {data.securities_lending.volume?.toLocaleString('fr-MA')}
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-600">MMDH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="px-6 py-2 border-t border-[#1E293B] flex items-center justify-between bg-[#040914] relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-BB_GREEN rounded-full animate-shine" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: BB_GREEN }}>DATA FEED CLOUD: SECURE</span>
          </div>
          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em]">
            SOURCE: AMMC PUBLICATIONS • SYNC: {new Date(data.scraped_at).toLocaleTimeString('fr-MA')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-white/50 tracking-tighter uppercase italic">Institutional Dashboard v1.02</span>
          <div className="flex items-center gap-1">
             <div className="w-1 h-3 bg-BB_ORANGE/30" />
             <div className="w-1 h-3 bg-BB_ORANGE/60" />
             <div className="w-1 h-3 bg-BB_ORANGE" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .animate-shine {
          animation: shine 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
