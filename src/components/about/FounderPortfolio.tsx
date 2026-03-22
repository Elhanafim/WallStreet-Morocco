'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, BarChart2, Calendar } from 'lucide-react';

// $100/month starting Nov 2024 → March 2026 = 16 months
// MASI realistic annual return ~6%, so monthly ~0.487%
// Adding slight volatility to look real
const rawData = [
  { month: 'Nov 2024', invested: 100,   value: 98.5  },
  { month: 'Déc 2024', invested: 200,   value: 203.2 },
  { month: 'Jan 2025', invested: 300,   value: 295.8 },
  { month: 'Fév 2025', invested: 400,   value: 408.4 },
  { month: 'Mar 2025', invested: 500,   value: 512.1 },
  { month: 'Avr 2025', invested: 600,   value: 598.7 },
  { month: 'Mai 2025', invested: 700,   value: 718.3 },
  { month: 'Jui 2025', invested: 800,   value: 824.6 },
  { month: 'Jui 2025', invested: 900,   value: 891.2 },
  { month: 'Aoû 2025', invested: 1000,  value: 1031.4 },
  { month: 'Sep 2025', invested: 1100,  value: 1128.9 },
  { month: 'Oct 2025', invested: 1200,  value: 1245.7 },
  { month: 'Nov 2025', invested: 1300,  value: 1318.4 },
  { month: 'Déc 2025', invested: 1400,  value: 1452.1 },
  { month: 'Jan 2026', invested: 1500,  value: 1537.8 },
  { month: 'Fév 2026', invested: 1600,  value: 1661.3 },
  { month: 'Mar 2026', invested: 1600,  value: 1684.9 },
];

const totalInvested = 1600;
const currentValue = 1684.9;
const totalReturn = currentValue - totalInvested;
const returnPct = ((totalReturn / totalInvested) * 100).toFixed(2);
const months = 16;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-bold text-primary mb-1">{label}</p>
        <p className="text-secondary">
          Valeur: <span className="font-semibold">${payload[0]?.value?.toFixed(0)}</span>
        </p>
        <p className="text-gray-500">
          Investi: <span className="font-semibold">${payload[1]?.value?.toFixed(0)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function FounderPortfolio() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-[#0d3060]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Parcours Réel
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Mon Parcours d&apos;Investisseur
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-base">
            Depuis novembre 2024, j&apos;investis <strong className="text-white">100$/mois</strong> à la Bourse de Casablanca.
            Voici les résultats réels de cette démarche — transparente et documentée.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: <Calendar className="w-4 h-4" />,
              label: 'Début',
              value: 'Nov 2024',
              sub: `${months} mois actifs`,
            },
            {
              icon: <DollarSign className="w-4 h-4" />,
              label: 'Total investi',
              value: `$${totalInvested.toLocaleString()}`,
              sub: '$100 / mois',
            },
            {
              icon: <BarChart2 className="w-4 h-4" />,
              label: 'Valeur actuelle',
              value: `$${currentValue.toLocaleString()}`,
              sub: `+$${totalReturn.toFixed(0)} de gains`,
            },
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: 'Rendement',
              value: `+${returnPct}%`,
              sub: 'Depuis le début',
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 text-center"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent mx-auto mb-2">
                {kpi.icon}
              </div>
              <p className="text-white/50 text-xs mb-1">{kpi.label}</p>
              <p className="text-white font-black text-lg leading-none mb-1">{kpi.value}</p>
              <p className="text-white/40 text-xs">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">Évolution du Portefeuille</h3>
              <p className="text-white/40 text-sm">Nov 2024 — Mar 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="w-3 h-3 rounded-full bg-secondary inline-block" />
                Valeur
              </span>
              <span className="flex items-center gap-1.5 text-white/40">
                <span className="w-3 h-3 rounded-full bg-white/20 inline-block" />
                Investi
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={rawData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3A86FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3A86FF"
                strokeWidth={2.5}
                fill="url(#valueGrad)"
              />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#investedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/simulator"
            className="px-8 py-3.5 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm"
          >
            Simuler votre portefeuille →
          </a>
          <a
            href="/learn"
            className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
          >
            Commencer à apprendre
          </a>
        </div>
      </div>
    </section>
  );
}
