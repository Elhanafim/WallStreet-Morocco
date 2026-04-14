'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Info, DollarSign, Clock, BarChart2 } from 'lucide-react';
import PortfolioChart from '@/components/simulator/PortfolioChart';
import AllocationChart from '@/components/simulator/AllocationChart';
import { SimulatorResult, Allocation } from '@/types';
import { calculateCompoundInterest, formatCurrency } from '@/lib/utils';

type RiskLevel = 'conservateur' | 'equilibre' | 'croissance';

interface RiskProfile {
  label: string;
  description: string;
  rate: number;
  rateColor: string;
  allocations: Allocation[];
}

const riskProfiles: Record<RiskLevel, RiskProfile> = {
  conservateur: {
    label: 'Conservative',
    description: 'Preserve capital with steady, low-risk growth.',
    rate: 4.5,
    rateColor: 'var(--info, #1A4A80)',
    allocations: [
      { name: 'Money Market', percentage: 30, color: '#CBD5E1' },
      { name: 'Bonds',        percentage: 50, color: '#3A86FF' },
      { name: 'Equities',     percentage: 15, color: '#0D7A4E' },
      { name: 'Real Estate',  percentage: 5,  color: '#B07D2A' },
    ],
  },
  equilibre: {
    label: 'Balanced',
    description: 'Balance between growth potential and capital security.',
    rate: 7.0,
    rateColor: 'var(--gold)',
    allocations: [
      { name: 'Money Market', percentage: 10, color: '#CBD5E1' },
      { name: 'Bonds',        percentage: 30, color: '#3A86FF' },
      { name: 'Equities',     percentage: 50, color: '#0D7A4E' },
      { name: 'Real Estate',  percentage: 10, color: '#B07D2A' },
    ],
  },
  croissance: {
    label: 'Growth',
    description: 'Maximise long-term returns with higher risk tolerance.',
    rate: 10.0,
    rateColor: 'var(--gain)',
    allocations: [
      { name: 'Money Market', percentage: 5,  color: '#CBD5E1' },
      { name: 'Bonds',        percentage: 10, color: '#3A86FF' },
      { name: 'Equities',     percentage: 75, color: '#0D7A4E' },
      { name: 'Real Estate',  percentage: 10, color: '#B07D2A' },
    ],
  },
};

const timeHorizons = [5, 10, 15, 20, 25, 30];

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-[10px] p-5 flex flex-col items-center text-center"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center rounded-[8px] mb-3"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        <Icon size={18} />
      </div>
      <p
        className="font-display font-medium text-[22px] leading-tight mb-1"
        style={{ color: accent }}
      >
        {value}
      </p>
      <p className="font-body text-[12px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export default function SimulatorPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(2000);
  const [initialAmount, setInitialAmount] = useState(10000);
  const [riskLevel, setRiskLevel]         = useState<RiskLevel>('equilibre');
  const [timeHorizon, setTimeHorizon]     = useState(10);

  const profile = riskProfiles[riskLevel];

  const results = useMemo<SimulatorResult[]>(() => {
    const data: SimulatorResult[] = [];
    for (let year = 1; year <= timeHorizon; year++) {
      const totalMonths   = year * 12;
      const contributions = initialAmount + monthlyAmount * totalMonths;
      const value         = calculateCompoundInterest(initialAmount, monthlyAmount, profile.rate, year);
      data.push({
        year,
        value:         Math.round(value),
        contributions: Math.round(contributions),
        returns:       Math.round(value - contributions),
      });
    }
    return data;
  }, [monthlyAmount, initialAmount, riskLevel, timeHorizon, profile.rate]);

  const finalResult  = results[results.length - 1];
  const totalInvested = finalResult?.contributions ?? 0;
  const finalValue    = finalResult?.value ?? 0;
  const totalGains    = finalValue - totalInvested;
  const gainPercent   = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

  // ── Quick-select presets ─────────────────────────────────────────────────────
  const initialPresets = [0, 5000, 10000, 50000];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div
        className="page-hero-bg"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/jeffrey-blum-7-gaPkhIgqs-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="container-max py-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: 'rgba(184,151,74,0.12)',
              border: '1px solid rgba(184,151,74,0.4)',
            }}
          >
            <Calculator size={13} style={{ color: 'var(--gold)' }} />
            <span
              className="font-body text-[11.5px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: 'var(--gold)' }}
            >
              Portfolio Simulator
            </span>
          </div>

          <h1
            className="font-display font-medium mb-3"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1, color: 'var(--navy)' }}
          >
            Project Your{' '}
            <span className="italic" style={{ color: 'var(--gold)' }}>
              Future Wealth
            </span>
          </h1>
          <p
            className="font-body font-light max-w-xl mx-auto"
            style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            Simulate portfolio growth using compound interest projections —
            calibrated to Moroccan market return profiles.
          </p>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="container-max py-8">
        <div className="grid lg:grid-cols-5 gap-7">

          {/* ── FORM PANEL (2 cols) ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Parameters card */}
            <div
              className="rounded-[10px] p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={16} style={{ color: 'var(--gold)' }} />
                <h2
                  className="font-body font-semibold text-[15px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Parameters
                </h2>
              </div>

              {/* Initial amount */}
              <div className="mb-6">
                <label
                  className="block font-body text-[12.5px] font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Initial Capital (MAD)
                </label>
                <div className="relative">
                  <DollarSign
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[7px] font-body text-[14px] font-medium outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {initialPresets.map((val) => (
                    <button
                      key={val}
                      onClick={() => setInitialAmount(val)}
                      className="font-body text-[11.5px] px-2.5 py-1 rounded-[5px] transition-all"
                      style={{
                        backgroundColor: initialAmount === val ? 'var(--navy)' : 'var(--bg-elevated)',
                        color: initialAmount === val ? '#fff' : 'var(--text-secondary)',
                        border: initialAmount === val ? '1px solid var(--navy)' : '1px solid var(--border)',
                      }}
                    >
                      {val === 0 ? 'None' : val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly amount */}
              <div className="mb-6">
                <label
                  className="block font-body text-[12.5px] font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Monthly Contribution (MAD)
                </label>
                <div className="relative">
                  <DollarSign
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-[7px] font-body text-[14px] font-medium outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gold)'; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
                    min="0"
                    step="100"
                  />
                </div>
                <input
                  type="range"
                  min="100"
                  max="20000"
                  step="100"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="w-full mt-3"
                  style={{ accentColor: 'var(--gold)' }}
                />
                <div
                  className="flex justify-between font-body text-[11px] mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>100 MAD</span>
                  <span>20,000 MAD</span>
                </div>
              </div>

              {/* Risk profile */}
              <div className="mb-6">
                <label
                  className="block font-body text-[12.5px] font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Risk Profile
                </label>
                <div className="space-y-2">
                  {(Object.keys(riskProfiles) as RiskLevel[]).map((risk) => {
                    const p = riskProfiles[risk];
                    const active = riskLevel === risk;
                    return (
                      <button
                        key={risk}
                        onClick={() => setRiskLevel(risk)}
                        className="w-full text-left p-3.5 rounded-[8px] transition-all duration-150"
                        style={{
                          border: active ? `1.5px solid var(--gold)` : `1px solid var(--border)`,
                          backgroundColor: active ? 'var(--gold-subtle)' : 'var(--bg-elevated)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="font-body font-semibold text-[13px]"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {p.label}
                          </span>
                          <span
                            className="font-mono text-[12px] font-bold"
                            style={{ color: p.rateColor }}
                          >
                            ~{p.rate}%/yr
                          </span>
                        </div>
                        <p
                          className="font-body text-[11.5px]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time horizon */}
              <div>
                <label
                  className="block font-body text-[12.5px] font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Investment Horizon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeHorizons.map((years) => {
                    const active = timeHorizon === years;
                    return (
                      <button
                        key={years}
                        onClick={() => setTimeHorizon(years)}
                        className="py-2 rounded-[7px] font-body text-[13px] font-medium transition-all"
                        style={{
                          backgroundColor: active ? 'var(--navy)' : 'var(--bg-elevated)',
                          color: active ? '#fff' : 'var(--text-secondary)',
                          border: active ? '1px solid var(--navy)' : '1px solid var(--border)',
                        }}
                      >
                        {years} yrs
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Disclaimer card */}
            <div
              className="rounded-[10px] p-4"
              style={{
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid rgba(176,125,42,0.2)',
              }}
            >
              <div className="flex gap-3">
                <Info size={14} style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p
                    className="font-body text-[12px] font-semibold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    About this simulator
                  </p>
                  <p
                    className="font-body text-[11.5px] leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Uses monthly compound interest formula. Historical returns do
                    not guarantee future performance. Rate is assumed constant
                    over the full period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RESULTS PANEL (3 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={DollarSign}  label="Capital Invested"   value={formatCurrency(totalInvested)} accent="var(--navy)" />
              <StatCard icon={TrendingUp}  label="Final Value"        value={formatCurrency(finalValue)}    accent="var(--gain)" />
              <StatCard icon={BarChart2}   label="Total Gains"        value={formatCurrency(totalGains)}    accent="var(--gold)" />
              <StatCard icon={Clock}       label="Total Return"       value={`+${gainPercent.toFixed(1)}%`} accent="#5B9BD5" />
            </div>

            {/* Growth chart */}
            <div
              className="rounded-[10px] p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="font-body font-semibold text-[14px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Portfolio Growth
                </h3>
                <div className="flex items-center gap-4">
                  <span
                    className="flex items-center gap-1.5 font-body text-[11.5px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span
                      className="inline-block w-3 h-0.5 rounded"
                      style={{ backgroundColor: 'var(--navy)' }}
                    />
                    Total value
                  </span>
                  <span
                    className="flex items-center gap-1.5 font-body text-[11.5px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span
                      className="inline-block w-3 border-t-2 border-dashed"
                      style={{ borderColor: 'var(--gold)' }}
                    />
                    Invested
                  </span>
                </div>
              </div>
              <PortfolioChart data={results} monthlyAmount={monthlyAmount} />
            </div>

            {/* Allocation + year-by-year */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* Allocation donut */}
              <div
                className="rounded-[10px] p-6"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <AllocationChart
                  allocations={profile.allocations}
                  title="Recommended Allocation"
                />
              </div>

              {/* Year-by-year table */}
              <div
                className="rounded-[10px] p-6"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h4
                  className="font-body font-semibold text-[13.5px] mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Annual Projection
                </h4>
                <div className="space-y-0 max-h-[280px] overflow-y-auto pr-1">
                  {results.map((result) => (
                    <div
                      key={result.year}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <span
                        className="font-body text-[12px] font-medium px-2.5 py-0.5 rounded-[5px]"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        Yr {result.year}
                      </span>
                      <div className="text-right">
                        <p
                          className="font-mono text-[13px] font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatCurrency(result.value)}
                        </p>
                        <p
                          className="font-mono text-[11px]"
                          style={{ color: 'var(--gain)' }}
                        >
                          +{((result.value / result.contributions - 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legal disclaimer */}
            <div
              className="rounded-[10px] p-4"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="font-body text-[11.5px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                <strong style={{ color: 'var(--text-secondary)' }}>Disclaimer:</strong>{' '}
                This simulator is for illustrative purposes only. Past performance does not
                guarantee future results. The assumed annual rate ({profile.rate}%) is based
                on historical data and may vary significantly. Consult a qualified financial
                adviser before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
