'use client';

import { useState, useEffect } from 'react';
import { Roboto_Mono, Inter } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '700', '900'] });

const BB_ORANGE = '#FF9800';
const BB_MUTED = '#8B95A1';
const BB_BG = '#040914';
const BB_BORDER = '#1E293B';
const BB_PANEL = '#0B101E';
const BB_WHITE = '#FFFFFF';
const BB_CYAN = '#00E5FF';

interface Indicators {
  title: string;
  date: string;
  url: string;
  market_cap: number | null;
  masi: number | null;
  volume: number | null;
  insights: string[];
}

export default function CapitalMarketIndicators() {
  const [data, setData] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/capital-market/latest');
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
      <div className="p-4 animate-pulse flex flex-col gap-4" style={{ background: BB_BG }}>
        <div className="h-4 w-32 bg-slate-800" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-slate-800" />
          <div className="h-20 bg-slate-800" />
          <div className="h-20 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: BB_BG, ...robotoMono.style }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0" style={{ borderColor: BB_BORDER, background: BB_PANEL }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ MARCHÉ DES CAPITAUX</span>
          <span style={{ color: BB_BORDER }}>│</span>
          <span className="text-[10px] font-bold text-gray-400">{data.date}</span>
        </div>
        <a 
          href={data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-bold py-0.5 px-2 border hover:bg-white hover:text-black transition-colors"
          style={{ borderColor: BB_BORDER, color: BB_MUTED }}
        >
          PDF SOURCE
        </a>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-px bg-[#1E293B] flex-shrink-0">
        <div className="bg-[#0B101E] p-4 flex flex-col gap-1 border-l-2" style={{ borderLeftColor: BB_ORANGE }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Indice MASI</span>
          <span className="text-xl font-black tabular-nums tracking-tight" style={{ color: BB_WHITE }}>
            {data.masi?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] opacity-60" style={{ color: BB_MUTED }}>Points</span>
        </div>

        <div className="bg-[#0B101E] p-4 flex flex-col gap-1 border-l-2" style={{ borderLeftColor: BB_CYAN }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Capitalisation</span>
          <span className="text-xl font-black tabular-nums tracking-tight" style={{ color: BB_WHITE }}>
            {data.market_cap?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] opacity-60" style={{ color: BB_MUTED }}>MMDH</span>
        </div>

        <div className="bg-[#0B101E] p-4 flex flex-col gap-1 border-l-2" style={{ borderLeftColor: '#00E676' }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Volume Global</span>
          <span className="text-xl font-black tabular-nums tracking-tight" style={{ color: BB_WHITE }}>
            {data.volume?.toLocaleString('fr-MA', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] opacity-60" style={{ color: BB_MUTED }}>MDH</span>
        </div>
      </div>

      {/* Insights Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ INSIGHTS AMMC</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>
        
        <div className="space-y-3">
          {data.insights.map((insight, i) => (
            <div key={i} className="flex gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <span style={{ color: BB_ORANGE }}>»</span>
              <p className="leading-relaxed" style={{ color: '#E2E8F0', ...inter.style }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Meta */}
      <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: BB_BORDER, background: '#050b14' }}>
        <span className="text-[9px] font-medium" style={{ color: BB_MUTED }}>DATA: COMITÉ STATISTIQUE AMMC</span>
        <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800" style={{ color: BB_CYAN }}>
          AUTO-UPDATE: {new Date(data.date).toLocaleDateString('fr-MA', { month: 'long', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
