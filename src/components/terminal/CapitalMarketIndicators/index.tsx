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
const BB_GREEN = '#00E676';

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
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ INDICATEURS DU MARCHÉ DES CAPITAUX</span>
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
          RAPPORT OFFICIEL (PDF)
        </a>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Market Bourse & Insights */}
        <div className="w-[40%] flex flex-col border-r overflow-y-auto" style={{ borderColor: BB_BORDER }}>
          {/* Market Stats */}
          <div className="grid grid-cols-1 divide-y divide-slate-800">
            <div className="p-4 bg-[#0B101E]/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Indice MASI</span>
                <span className="text-[9px] font-bold text-slate-500">POINTS</span>
              </div>
              <div className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: BB_WHITE }}>
                {data.masi?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-4 bg-[#0B101E]/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Capitalisation</span>
                <span className="text-[9px] font-bold text-slate-500">MMDH</span>
              </div>
              <div className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: BB_CYAN }}>
                {data.market_cap?.toLocaleString('fr-MA', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-4 bg-[#0B101E]/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BB_MUTED }}>Volume Global</span>
                <span className="text-[9px] font-bold text-slate-500">MDH</span>
              </div>
              <div className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: BB_GREEN }}>
                {data.volume?.toLocaleString('fr-MA')}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ COMMENTAIRE MARCHÉ</span>
              <div className="flex-1 h-px bg-[#1E293B]" />
            </div>
            <div className="space-y-4">
              {data.insights.map((insight, i) => (
                <div key={i} className="flex gap-2 text-[11px] leading-relaxed" style={{ color: '#E2E8F0', ...inter.style }}>
                  <span style={{ color: BB_ORANGE }}>»</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OPCVM & Other Metrics */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* OPCVM Table */}
          <div className="p-4 border-b" style={{ borderColor: BB_BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ RÉPARTITION ACTIFS OPCVM</span>
              <div className="flex-1 h-px bg-[#1E293B]" />
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: BB_BORDER }}>
                  <th className="py-2 text-[9px] font-black uppercase text-gray-500">Catégorie</th>
                  <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right">Fonds</th>
                  <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right">Actif Net (MMDH)</th>
                  <th className="py-2 text-[9px] font-black uppercase text-gray-500 text-right">∆ YTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.opcvm.categories.map((cat, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 text-[11px] font-bold" style={{ color: '#CBD5E1' }}>{cat.category}</td>
                    <td className="py-2 text-[11px] tabular-nums text-right" style={{ color: BB_MUTED }}>{cat.funds}</td>
                    <td className="py-2 text-[11px] tabular-nums font-bold text-right text-white">{cat.assets.toFixed(2)}</td>
                    <td className="py-2 text-[11px] tabular-nums font-bold text-right" style={{ color: cat.change_ytd.includes('-') ? '#FF5252' : BB_GREEN }}>
                      {cat.change_ytd}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900/50">
                  <td className="py-2 text-[11px] font-black text-white px-1">TOTAL</td>
                  <td className="py-2 text-[11px] tabular-nums font-black text-right pr-1" style={{ color: BB_ORANGE }}>{data.opcvm.total_funds}</td>
                  <td className="py-2 text-[11px] tabular-nums font-black text-right pr-1 text-white">{data.opcvm.total_assets?.toFixed(2)}</td>
                  <td className="py-2 text-[11px] text-right pr-1">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capital Raises & Securities Lending */}
          <div className="grid grid-cols-2 divide-x divide-slate-800 h-full">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ LEVÉES DE CAPITAUX</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px]">
                  <span style={{ color: BB_MUTED }}>Titres de Capital</span>
                  <span className="font-bold text-white tabular-nums">{data.capital_raises.equity ? `${data.capital_raises.equity.toLocaleString()} MDH` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span style={{ color: BB_MUTED }}>Obligations</span>
                  <span className="font-bold text-white tabular-nums">{data.capital_raises.bonds ? `${data.capital_raises.bonds.toLocaleString()} MDH` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span style={{ color: BB_MUTED }}>TCN</span>
                  <span className="font-bold text-white tabular-nums">{data.capital_raises.tcn ? `${data.capital_raises.tcn.toLocaleString()} MDH` : '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>■ PRÊT EMPRUNT</span>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Encours Global</span>
                  <div className="text-lg font-black tabular-nums tracking-tight text-white">
                    {data.securities_lending.outstanding?.toLocaleString()} <span className="text-xs font-normal" style={{ color: BB_MUTED }}>MMDH</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Volume Mensuel</span>
                  <div className="text-lg font-black tabular-nums tracking-tight text-white">
                    {data.securities_lending.volume?.toLocaleString()} <span className="text-xs font-normal" style={{ color: BB_MUTED }}>MMDH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t flex items-center justify-between flex-shrink-0" style={{ borderColor: BB_BORDER, background: '#050b14' }}>
        <span className="text-[8px] font-medium tracking-tight" style={{ color: BB_MUTED }}>DATA SOURCE: AMMC PUBLICATIONS STATISTIQUES • DERNIÈRE MISE À JOUR: {new Date(data.scraped_at).toLocaleString('fr-MA')}</span>
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-black" style={{ color: BB_CYAN }}>● LIVE DATA FEED</span>
          <span className="text-[8px] font-medium" style={{ color: BB_MUTED }}>TERMINAL M-01</span>
        </div>
      </div>
    </div>
  );
}
