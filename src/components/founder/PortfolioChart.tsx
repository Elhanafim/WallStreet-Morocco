'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { DCADataPoint } from '@/data/founderPortfolio';

// ─── useInView ────────────────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const port = payload.find((p: any) => p.dataKey === 'portfolioValue');
  const cap = payload.find((p: any) => p.dataKey === 'capitalInvested');
  if (!port || !cap) return null;

  const perf = (((port.value - cap.value) / cap.value) * 100).toFixed(1);
  const fmt = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  return (
    <div className="bg-primary border border-white/15 rounded-xl shadow-2xl px-4 py-3 text-xs min-w-[200px]">
      <p className="text-white font-bold mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-400">Portefeuille</span>
          <span className="text-white font-semibold">{fmt(port.value)} MAD</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">Capital investi</span>
          <span className="text-white font-semibold">{fmt(cap.value)} MAD</span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
          <span className="text-emerald-400/70">Performance</span>
          <span className={`font-bold ${parseFloat(perf) >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
            {parseFloat(perf) >= 0 ? '+' : ''}{perf.replace('.', ',')}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

interface PortfolioChartProps {
  data: DCADataPoint[];
}

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const [ref, inView] = useInView(0.15);

  return (
    <div className="mb-10">
      <div
        ref={ref}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8"
        style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-black text-lg">
              Évolution du portefeuille
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              Nov 2024 — Mar 2026 · DCA 100 MAD/mois
            </p>
          </div>
          <div className="flex flex-row sm:flex-col gap-3 sm:gap-1.5 text-xs sm:text-right flex-wrap">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="w-4 h-0.5 bg-emerald-400 inline-block rounded-full" aria-hidden="true" />
              Valeur du portefeuille
            </span>
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-4 h-0.5 bg-white/30 inline-block rounded-full" style={{ borderStyle: 'dashed' }} aria-hidden="true" />
              Capital investi
            </span>
          </div>
        </div>

        {/* Chart */}
        <div
          aria-label="Évolution du portefeuille BVC novembre 2024 à mars 2026"
          role="img"
          className="h-[240px] md:h-[320px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
              <defs>
                {/* Green fill for portfolio P&L layer */}
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                {/* Near-opaque dark fill to mask portfolio fill below the invested line */}
                <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A2540" stopOpacity={0.97} />
                  <stop offset="100%" stopColor="#0A2540" stopOpacity={0.97} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v.toLocaleString('fr-FR')}`}
                width={52}
                domain={[0, 3000]}
                ticks={[0, 500, 1000, 1500, 2000, 2500, 3000]}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* ATH annotation */}
              <ReferenceLine
                x="Aoû 25"
                stroke="rgba(212,175,55,0.5)"
                strokeDasharray="3 3"
                label={{
                  value: '📍 ATH MASI',
                  position: 'insideTopLeft',
                  fill: 'rgba(212,175,55,0.75)',
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              />
              {/* Correction annotation */}
              <ReferenceLine
                x="Mar 26"
                stroke="rgba(239,68,68,0.4)"
                strokeDasharray="3 3"
                label={{
                  value: '📉 -13%',
                  position: 'insideTopRight',
                  fill: 'rgba(239,68,68,0.7)',
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              />

              {/* Portfolio value — fills green from curve down */}
              <Area
                type="monotone"
                dataKey="portfolioValue"
                name="Valeur du portefeuille"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#portGrad)"
                isAnimationActive={inView}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
              {/* Capital invested — dashed, dark fill masks portfolio fill below line */}
              <Area
                type="monotone"
                dataKey="capitalInvested"
                name="Capital investi"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="url(#capGrad)"
                isAnimationActive={inView}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-white/25 text-[10px] leading-relaxed text-center">
          Simulation DCA sur prix de clôture estimés · Modèle linéaire · Hors frais de courtage (~0,3%/transaction) · Les performances passées ne préjugent pas des performances futures.
        </p>
      </div>
    </div>
  );
}
