'use client';

/**
 * RawDataPanel
 *
 * Bloomberg-style financial data panel powered by the raw AMMC annual-report
 * JSON.  Rendered inside the "★ DONNÉES AMMC" tab of ValuesFinancials.
 *
 * Sections:
 *  1. Income statement — multi-period time-series bar chart + detailed rows
 *  2. Balance sheet snapshot — equity vs liabilities donut
 *  3. Shareholding structure — donut chart + ranked table
 *  4. Board of Directors — sortable member table
 *  5. Dividends history — table
 *  6. Extraction quality badge
 */

import { useState, useMemo } from 'react';
import { Roboto_Mono } from 'next/font/google';
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import type { ParsedAmmcReport, NormalizedISPeriod, NormalizedBSSnapshot } from '@/lib/data/parseAmmcReport';

const mono = Roboto_Mono({ subsets: ['latin'], weight: ['400', '500', '700'] });

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#040914',
  panel:   '#0B101E',
  panel2:  '#060D1A',
  border:  '#1E293B',
  orange:  '#FF9800',
  gold:    '#C9A84C',
  cyan:    '#00E5FF',
  green:   '#00E676',
  red:     '#FF1744',
  muted:   '#8B95A1',
  white:   '#FFFFFF',
  teal:    '#0E9F8E',
  blue1:   '#1E3A5F',
  blue2:   '#2563EB',
  purple:  '#7C3AED',
};

const DONUT_COLORS = [C.teal, C.gold, C.blue2, C.purple, C.orange, C.green, '#94A3B8', '#CBD5E1'];

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtN(v: number | null | undefined, dec = 1): string {
  if (v == null) return '—';
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(dec)} Md`;
  if (abs >= 1_000_000)     return `${(v / 1_000_000).toFixed(dec)} M`;
  if (abs >= 1_000)         return `${(v / 1_000).toFixed(dec)} K`;
  return v.toFixed(dec);
}

function fmtMAD(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${fmtN(v)} MAD`;
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

function vColor(v: number | null, neg = false): string {
  if (v == null) return C.muted;
  return neg ? (v < 0 ? C.green : C.red) : (v >= 0 ? C.green : C.red);
}

// ── Shared layout atoms ───────────────────────────────────────────────────────
function SectionTitle({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: C.border, background: C.panel2 }}>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.orange }}>■ {label}</span>
      {sub && <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>{sub}</span>}
      <div className="flex-1 h-px" style={{ background: C.border }} />
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-8 border-b" style={{ borderColor: C.border }}>
      <span className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>
        {label} — données non disponibles
      </span>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border px-3 py-2 shadow-xl" style={{ background: C.panel, borderColor: C.border, ...mono.style }}>
      <p className="text-[10px] font-black uppercase mb-1.5" style={{ color: C.orange }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-[11px] flex gap-3 justify-between" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className="font-bold tabular-nums">{fmtMAD(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ── 1. Income Statement ───────────────────────────────────────────────────────
function IncomeStatementSection({ periods }: { periods: NormalizedISPeriod[] }) {
  if (!periods.length) return (
    <>
      <SectionTitle label="Compte de Résultat" sub="Rapport annuel 2024 AMMC" />
      <EmptySection label="Compte de résultat" />
    </>
  );

  // Keep only periods that look like calendar years or standard labels
  const chartPeriods = periods
    .filter(p => /^\d{4}$/.test(p.period) || p.period === '2024' || p.period === '2023')
    .slice(0, 4)
    .reverse();   // chronological order

  const chartData = chartPeriods.map(p => ({
    name: p.period,
    'Produits exploitation': p.revenue,
    'Résultat exploitation': p.operatingResult,
    'Résultat net': p.netResult,
  }));

  // YoY growth
  const latest  = periods.find(p => p.period === '2024') ?? periods[0];
  const prev    = periods.find(p => p.period === '2023') ?? periods[1];
  const revGrowth = latest?.revenue && prev?.revenue ? ((latest.revenue - prev.revenue) / Math.abs(prev.revenue)) * 100 : null;
  const rnGrowth  = latest?.netResult && prev?.netResult ? ((latest.netResult - prev.netResult) / Math.abs(prev.netResult)) * 100 : null;

  return (
    <>
      <SectionTitle label="Compte de Résultat" sub="AMMC · Rapport Annuel 2024" />

      {/* Growth chips */}
      {(revGrowth != null || rnGrowth != null) && (
        <div className="flex gap-px border-b" style={{ borderColor: C.border, background: C.border }}>
          {revGrowth != null && (
            <div className="flex-1 flex flex-col gap-0.5 p-3" style={{ background: C.panel }}>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>CA N vs N-1</span>
              <span className="text-base font-black tabular-nums" style={{ color: vColor(revGrowth), ...mono.style }}>
                {fmtPct(revGrowth)}
              </span>
            </div>
          )}
          {rnGrowth != null && (
            <div className="flex-1 flex flex-col gap-0.5 p-3" style={{ background: C.panel }}>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>Résultat Net N vs N-1</span>
              <span className="text-base font-black tabular-nums" style={{ color: vColor(rnGrowth), ...mono.style }}>
                {fmtPct(rnGrowth)}
              </span>
            </div>
          )}
          {latest?.revenue != null && (
            <div className="flex-1 flex flex-col gap-0.5 p-3" style={{ background: C.panel }}>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>CA 2024</span>
              <span className="text-base font-black tabular-nums" style={{ color: C.cyan, ...mono.style }}>{fmtMAD(latest.revenue)}</span>
            </div>
          )}
          {latest?.netResult != null && (
            <div className="flex-1 flex flex-col gap-0.5 p-3" style={{ background: C.panel }}>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>Résultat Net 2024</span>
              <span className="text-base font-black tabular-nums" style={{ color: vColor(latest.netResult), ...mono.style }}>{fmtMAD(latest.netResult)}</span>
            </div>
          )}
        </div>
      )}

      {/* Bar + line chart */}
      {chartData.length >= 2 && (
        <div className="p-4 border-b" style={{ borderColor: C.border, background: C.panel }}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} barCategoryGap="25%" barGap={2}>
              <CartesianGrid vertical={false} stroke={C.border} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9, fontFamily: 'Roboto Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => fmtN(v, 0)}
                width={56}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'Roboto Mono', color: C.muted, paddingTop: 8 }} />
              <Bar dataKey="Produits exploitation" fill={C.blue1} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Résultat exploitation" fill={C.gold}  radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="Résultat net"
                stroke={C.green}
                strokeWidth={2.5}
                dot={{ fill: C.green, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed rows table */}
      <div style={{ background: C.panel }}>
        <div
          className="grid px-4 py-2 text-[9px] font-black uppercase tracking-widest border-b"
          style={{ borderColor: C.border, color: C.orange, background: C.panel2, gridTemplateColumns: `1fr repeat(${Math.min(periods.length, 3)}, 120px)`, ...mono.style }}
        >
          <span>Libellé</span>
          {periods.slice(0, 3).map(p => <span key={p.period} className="text-right">{p.period}</span>)}
        </div>

        {[
          { key: 'revenue',          label: "Produits d'exploitation",  highlight: false },
          { key: 'charges',          label: "Charges d'exploitation",   highlight: false },
          { key: 'operatingResult',  label: 'Résultat d\'exploitation', highlight: true },
          { key: 'financialResult',  label: 'Résultat financier',       highlight: false },
          { key: 'corporateTax',     label: 'Impôt sur les sociétés',   highlight: false },
          { key: 'netResult',        label: 'Résultat net',             highlight: true },
        ].map(({ key, label, highlight }) => {
          const vals = periods.slice(0, 3).map(p => (p as unknown as Record<string, unknown>)[key] as number | null);
          const hasAny = vals.some(v => v != null);
          if (!hasAny) return null;
          return (
            <div
              key={key}
              className="grid items-center px-4 py-2.5 hover:bg-[#0F172A] border-b transition-colors"
              style={{ borderColor: C.border, background: highlight ? '#0B101E' : 'transparent', gridTemplateColumns: `1fr repeat(${Math.min(periods.length, 3)}, 120px)`, ...mono.style }}
            >
              <span className={`text-[10px] ${highlight ? 'font-black uppercase tracking-wide' : ''}`} style={{ color: highlight ? C.white : C.muted }}>
                {label}
              </span>
              {vals.map((v, i) => (
                <span key={i} className="text-right text-[11px] font-bold tabular-nums"
                  style={{ color: highlight ? (v != null ? (v >= 0 ? C.green : C.red) : C.muted) : C.white }}>
                  {fmtMAD(v)}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── 2. Balance Sheet ──────────────────────────────────────────────────────────
function BalanceSheetSection({ snapshots }: { snapshots: NormalizedBSSnapshot[] }) {
  if (!snapshots.length) return (
    <>
      <SectionTitle label="Bilan" />
      <EmptySection label="Bilan" />
    </>
  );

  const latest = snapshots[0];
  const donutData = [
    { name: 'Capitaux propres',  value: latest.equity      ?? 0, color: C.teal },
    { name: 'Passif circulant',  value: latest.currentLiab ?? 0, color: C.red },
  ].filter(d => d.value > 0);

  const remaining = (latest.totalAssets ?? 0) - (latest.equity ?? 0) - (latest.currentLiab ?? 0);
  if (remaining > 0) donutData.push({ name: 'Autres passifs', value: remaining, color: '#334155' });

  return (
    <>
      <SectionTitle label="Bilan" sub="Snapshot actif / passif" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border-b" style={{ borderColor: C.border, background: C.border }}>
        {/* Donut */}
        {donutData.length > 0 && (
          <div className="p-4 flex items-center gap-6" style={{ background: C.panel }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
                  formatter={(v: number) => fmtMAD(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {donutData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[9px] uppercase tracking-wide" style={{ color: C.muted, ...mono.style }}>{item.name}</span>
                  <span className="text-[9px] font-bold tabular-nums ml-auto" style={{ color: C.white, ...mono.style }}>{fmtMAD(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key numbers */}
        <div className="p-4 space-y-2" style={{ background: C.panel }}>
          {[
            { label: 'Total Actif',          value: latest.totalAssets,      color: C.white },
            { label: 'Actif non courant',     value: latest.nonCurrentAssets, color: C.cyan  },
            { label: 'Capitaux propres',      value: latest.equity,           color: C.teal  },
            { label: 'Passif circulant',      value: latest.currentLiab,      color: C.red   },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: C.border, ...mono.style }}>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: C.muted }}>{row.label}</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: row.color }}>{fmtMAD(row.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 3. Shareholding ───────────────────────────────────────────────────────────
function ShareholdingSection({ shareholders, shareCapital }: {
  shareholders: ParsedAmmcReport['shareholding'];
  shareCapital: number | null;
}) {
  if (!shareholders.length) return (
    <>
      <SectionTitle label="Actionnariat" />
      <EmptySection label="Structure actionnariat" />
    </>
  );

  // Prefer pct-based shareholders; fall back to shares-based
  const hasPct = shareholders.some(s => s.pct != null);
  const maxShares = hasPct ? null : Math.max(...shareholders.map(s => s.shares ?? 0));

  const donutData = hasPct
    ? shareholders.filter(s => s.pct != null).map((s, i) => ({
        name: s.name, value: s.pct!, color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
    : [];

  return (
    <>
      <SectionTitle label="Structure de l'Actionnariat" sub="Source: rapport annuel AMMC" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border-b" style={{ borderColor: C.border, background: C.border }}>

        {/* Donut (only when we have percentages) */}
        {donutData.length > 0 ? (
          <div className="p-4 flex items-center gap-6" style={{ background: C.panel }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={64} dataKey="value" strokeWidth={0}>
                  {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: 'Roboto Mono', fontSize: 10 }}
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {donutData.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 flex-shrink-0 rounded-sm" style={{ background: item.color }} />
                  <span className="text-[9px] truncate" style={{ color: C.muted, ...mono.style }}>{item.name}</span>
                  <span className="text-[9px] font-bold ml-auto flex-shrink-0" style={{ color: C.white, ...mono.style }}>{item.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: C.panel }} />
        )}

        {/* Table */}
        <div style={{ background: C.panel }}>
          <div className="overflow-hidden">
            <div className="grid text-[9px] font-black uppercase tracking-widest px-4 py-2 border-b"
              style={{ borderColor: C.border, color: C.orange, background: C.panel2, gridTemplateColumns: '1fr 80px 80px', ...mono.style }}>
              <span>Actionnaire</span>
              <span className="text-right">{hasPct ? 'Part %' : 'Actions'}</span>
              {shareCapital != null && <span className="text-right">Capital</span>}
            </div>
            {shareholders.slice(0, 8).map((s, i) => (
              <div key={i} className="grid items-center px-4 py-2 border-b hover:bg-[#0F172A] transition-colors"
                style={{ borderColor: C.border, gridTemplateColumns: '1fr 80px 80px', ...mono.style }}>
                <span className="text-[10px] truncate pr-2" style={{ color: i === 0 ? C.cyan : C.white }}>{s.name}</span>
                <span className="text-[10px] font-bold text-right tabular-nums" style={{ color: DONUT_COLORS[i % DONUT_COLORS.length] }}>
                  {hasPct
                    ? (s.pct != null ? `${s.pct.toFixed(1)}%` : '—')
                    : (s.shares != null ? fmtN(s.shares, 0) : '—')
                  }
                </span>
                {shareCapital != null && (
                  <span className="text-[9px] text-right tabular-nums" style={{ color: C.muted }}>
                    {(s.pct != null && shareCapital > 0)
                      ? fmtMAD((s.pct / 100) * shareCapital)
                      : '—'
                    }
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 4. Board of Directors ─────────────────────────────────────────────────────
type BoardSort = 'name' | 'role';

function BoardSection({ members }: { members: ParsedAmmcReport['boardOfDirectors'] }) {
  const [sort, setSort] = useState<BoardSort>('name');

  const sorted = useMemo(() => [...members].sort((a, b) => a[sort].localeCompare(b[sort])), [members, sort]);

  if (!members.length) return (
    <>
      <SectionTitle label="Conseil d'Administration" />
      <EmptySection label="Conseil d'administration" />
    </>
  );

  return (
    <>
      <SectionTitle label={`Conseil d'Administration`} sub={`${members.length} membres`} />
      <div style={{ background: C.panel }}>
        <div className="grid text-[9px] font-black uppercase tracking-widest px-4 py-2 border-b"
          style={{ borderColor: C.border, color: C.orange, background: C.panel2, gridTemplateColumns: '1fr 1fr 120px', ...mono.style }}>
          <button className="text-left flex items-center gap-1 hover:opacity-80" onClick={() => setSort('name')}>
            Nom {sort === 'name' && <span style={{ color: C.gold }}>▲</span>}
          </button>
          <button className="text-left flex items-center gap-1 hover:opacity-80" onClick={() => setSort('role')}>
            Fonction {sort === 'role' && <span style={{ color: C.gold }}>▲</span>}
          </button>
          <span>Type / Mandat</span>
        </div>
        {sorted.map((m, i) => (
          <div key={i}
            className="grid items-center px-4 py-2.5 border-b hover:bg-[#0F172A] transition-colors"
            style={{ borderColor: C.border, gridTemplateColumns: '1fr 1fr 120px', ...mono.style }}>
            <span className="text-[11px] font-bold pr-2 truncate" style={{ color: C.white }}>{m.name}</span>
            <span className="text-[10px] pr-2 truncate" style={{ color: C.muted }}>{m.role}</span>
            {m.meta && (
              <span className="text-[9px] px-2 py-0.5 rounded-sm w-fit" style={{ background: '#1E293B', color: C.gold, ...mono.style }}>
                {m.meta.slice(0, 24)}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ── 5. Dividends ──────────────────────────────────────────────────────────────
function DividendsSection({ dividends }: { dividends: ParsedAmmcReport['dividends'] }) {
  if (!dividends.length) return null;

  return (
    <>
      <SectionTitle label="Dividendes" />
      <div style={{ background: C.panel }}>
        <div className="grid text-[9px] font-black uppercase tracking-widest px-4 py-2 border-b"
          style={{ borderColor: C.border, color: C.orange, background: C.panel2, gridTemplateColumns: '80px 100px 1fr', ...mono.style }}>
          <span>Période</span>
          <span>Montant</span>
          <span>Type</span>
        </div>
        {dividends.map((d, i) => (
          <div key={i} className="grid items-center px-4 py-2.5 border-b hover:bg-[#0F172A] transition-colors"
            style={{ borderColor: C.border, gridTemplateColumns: '80px 100px 1fr', ...mono.style }}>
            <span className="text-[10px]" style={{ color: C.muted }}>{d.period}</span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: C.gold }}>{fmtMAD(d.amount)}</span>
            <span className="text-[9px] capitalize" style={{ color: C.muted }}>{d.type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 6. Extraction quality badge ───────────────────────────────────────────────
function ExtractionBadge({ meta }: { meta: ParsedAmmcReport['meta'] }) {
  const color = meta.confidence === 'high' ? C.green : meta.confidence === 'medium' ? C.gold : C.muted;
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-t flex-wrap" style={{ borderColor: C.border, background: C.panel2 }}>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.muted, ...mono.style }}>Source AMMC</span>
      <span className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest border" style={{ color, borderColor: color, ...mono.style }}>
        Confiance: {meta.confidence}
      </span>
      {meta.auditor && (
        <span className="text-[9px]" style={{ color: C.muted, ...mono.style }}>Auditeur: {meta.auditor}</span>
      )}
      {meta.missingFields.length > 0 && (
        <span className="text-[9px]" style={{ color: C.muted, ...mono.style }}>
          Sections manquantes: {meta.missingFields.join(', ')}
        </span>
      )}
      <span className="ml-auto text-[9px]" style={{ color: C.muted, ...mono.style }}>
        Rapport annuel {meta.fiscalYear} · AMMC
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
interface Props {
  report: ParsedAmmcReport;
}

export default function RawDataPanel({ report }: Props) {
  return (
    <div className="divide-y" style={{ background: C.bg, borderColor: C.border, ...mono.style }}>

      {/* Income statement */}
      <IncomeStatementSection periods={report.incomeStatement} />

      {/* Balance sheet */}
      {report.balanceSheet.length > 0 && (
        <BalanceSheetSection snapshots={report.balanceSheet} />
      )}

      {/* Shareholding */}
      <ShareholdingSection
        shareholders={report.shareholding}
        shareCapital={report.shareCapital}
      />

      {/* Board */}
      {report.boardOfDirectors.length > 0 && (
        <BoardSection members={report.boardOfDirectors} />
      )}

      {/* Dividends */}
      {report.dividends.length > 0 && (
        <DividendsSection dividends={report.dividends} />
      )}

      {/* Footer */}
      <ExtractionBadge meta={report.meta} />
    </div>
  );
}
