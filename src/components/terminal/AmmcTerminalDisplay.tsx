import React, { useState } from 'react';
import { useAmmcData } from '@/hooks/useAmmcData';
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });

const BB_ORANGE = '#FF9800';  
const BB_GREEN  = '#00E676';  
const BB_RED    = '#FF1744';  
const BB_YELLOW = '#FFD700';  
const BB_CYAN   = '#00E5FF';  
const BB_WHITE  = '#FFFFFF';  
const BB_MUTED  = '#8B95A1';
const BB_BORDER = '#1E293B';
const BB_BG     = '#040914';
const BB_CARD   = '#0B101E';

const CAT_ORDER = [
  'monetaire', 'obligataire_mlt', 'obligataire_ct',
  'actions', 'diversifie', 'contractuel',
];

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

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-none" style={{ background: BB_BORDER }}>
        <div
          className="h-full rounded-none transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-10 text-right" style={{ color }}>{score.toFixed(0)}</span>
    </div>
  );
}

export default function AmmcTerminalDisplay() {
  const { latest, loading, error } = useAmmcData();
  const [activeTab, setActiveTab] = useState<'overview'>('overview');

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#040914] text-xs font-bold" style={{ color: BB_ORANGE, ...robotoMono.style }}>
        ◈ CHARGEMENT DONNÉES AMMC...
      </div>
    );
  }

  if (error || !latest) {
    return (
      <div className="h-full flex items-center justify-center bg-[#040914] text-xs font-bold" style={{ color: BB_RED, ...robotoMono.style }}>
        ⚠️ ERREUR: IMPOSSIBLE DE CHARGER LES DONNÉES AMMC
      </div>
    );
  }

  const catList = CAT_ORDER.map(k => ({ key: k, ...latest.categories[k] })).filter(c => c.aum != null);
  const totalFonds = catList.reduce((acc, c) => acc + (c.nb_fonds ?? 0), 0);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: BB_BG, ...robotoMono.style }}>
      {/* ── Stat summary bar ── */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-b text-[11px] font-bold flex-shrink-0"
        style={{ background: '#050b14', borderColor: BB_BORDER, color: BB_ORANGE }}
      >
        <span>◈ ENCOURS GLOBAL: {mrd(latest.aum_total)} MAD</span>
        <span style={{ color: BB_MUTED }}>|</span>
        <span>FONDS AMMC: {totalFonds}</span>
        <span style={{ color: BB_MUTED }}>|</span>
        <span>FLUX NET: <span style={{ color: latest.flows.net_flow >= 0 ? BB_GREEN : BB_RED }}>{(latest.flows.net_flow >= 0 ? '+' : '') + mrd(latest.flows.net_flow)} MAD</span></span>
        <span style={{ color: BB_MUTED }}>|</span>
        <span style={{ color: BB_CYAN }}>SEMAINE {latest.week_number} ({latest.date})</span>
      </div>

      {/* ── Main display ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category breakdown table */}
        <div className="border overflow-x-auto" style={{ borderColor: BB_BORDER, background: BB_CARD }}>
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: BB_BORDER }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BB_ORANGE }}>
              RÉPARTITION PAR CATÉGORIE
            </span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-[10px]" style={{ borderColor: BB_BORDER, color: BB_MUTED }}>
                {['Catégorie', 'Fonds', 'Encours', 'Poids', 'Δ Hebdo', 'Sousc.', 'Rachats', 'Flux Net', 'Score'].map(h => (
                  <th key={h} className="px-3 py-2 font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catList.map(c => (
                <tr
                  key={c.key}
                  className="border-b transition-colors hover:bg-white/5 whitespace-nowrap"
                  style={{ borderColor: BB_BORDER }}
                >
                  <td className="px-3 py-2 font-bold" style={{ color: BB_WHITE }}>{c.label}</td>
                  <td className="px-3 py-2" style={{ color: BB_MUTED }}>{c.nb_fonds ?? '—'}</td>
                  <td className="px-3 py-2 font-bold tabular-nums" style={{ color: BB_CYAN }}>
                    {mrd(c.aum)} MAD
                  </td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: BB_MUTED }}>
                    {c.weight?.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 font-bold tabular-nums" style={{ color: pctColor(c.weekly_growth) }}>
                    {pct(c.weekly_growth)}
                  </td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: BB_GREEN }}>
                    +{mrd(c.subscriptions)}
                  </td>
                  <td className="px-3 py-2 tabular-nums" style={{ color: BB_RED }}>
                    -{mrd(c.redemptions)}
                  </td>
                  <td
                    className="px-3 py-2 font-bold tabular-nums"
                    style={{ color: (c.net_flow ?? 0) >= 0 ? BB_GREEN : BB_RED }}
                  >
                    {(c.net_flow ?? 0) >= 0 ? '+' : ''}{mrd(c.net_flow)}
                  </td>
                  <td className="px-3 py-2 w-24">
                    <ScoreBar score={c.score ?? 50} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ASCII/Terminal-style visual block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border p-4" style={{ borderColor: BB_BORDER, background: '#0B101E' }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: BB_ORANGE }}>
              RÉSUMÉ FLUX
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: BB_MUTED }}>SOUSCRIPTIONS</span>
                <span className="font-bold" style={{ color: BB_GREEN }}>+{mrd(latest.flows.subscriptions)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: BB_MUTED }}>RACHATS</span>
                <span className="font-bold" style={{ color: BB_RED }}>-{mrd(latest.flows.redemptions)} MAD</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: BB_BORDER }}>
                <span style={{ color: BB_WHITE }}>FLUX NET TOTAL</span>
                <span className="font-black" style={{ color: latest.flows.net_flow >= 0 ? BB_GREEN : BB_RED }}>
                  {(latest.flows.net_flow >= 0 ? '+' : '')}{mrd(latest.flows.net_flow)} MAD
                </span>
              </div>
            </div>
          </div>
          
          <div className="border p-4" style={{ borderColor: BB_BORDER, background: '#0B101E' }}>
             <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: BB_CYAN }}>
              AUM PRECEDENT (SEMAINE {(latest.week_number || 0) - 1 || '...'})
            </p>
            <div className="flex flex-col justify-center h-full pb-4">
              <div className="text-2xl font-black tabular-nums" style={{ color: BB_WHITE }}>
                {mrd(latest.aum_prev)} MAD
              </div>
              <div className="text-xs font-bold mt-1" style={{ color: pctColor(latest.weekly_growth) }}>
                 Variation: {pct(latest.weekly_growth)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
