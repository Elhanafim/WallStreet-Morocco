'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Info, DollarSign, Clock, BarChart2 } from 'lucide-react';
import PortfolioChart from '@/components/simulator/PortfolioChart';
import AllocationChart from '@/components/simulator/AllocationChart';
import { SimulatorResult, Allocation } from '@/types';
import { calculateCompoundInterest, formatCurrency, formatPercent } from '@/lib/utils';

type RiskLevel = 'conservateur' | 'equilibre' | 'croissance';

interface RiskProfile {
  label: string;
  description: string;
  rate: number;
  color: string;
  allocations: Allocation[];
}

const riskProfiles: Record<RiskLevel, RiskProfile> = {
  conservateur: {
    label: 'Conservateur',
    description: 'Préserve le capital avec une croissance stable',
    rate: 4.5,
    color: 'text-secondary',
    allocations: [
      { name: 'Monétaire', percentage: 30, color: '#CBD5E1' },
      { name: 'Obligations', percentage: 50, color: '#3A86FF' },
      { name: 'Actions', percentage: 15, color: '#10B981' },
      { name: 'Immobilier', percentage: 5, color: '#D4AF37' },
    ],
  },
  equilibre: {
    label: 'Équilibré',
    description: 'Équilibre entre rendement et sécurité',
    rate: 7.0,
    color: 'text-accent',
    allocations: [
      { name: 'Monétaire', percentage: 10, color: '#CBD5E1' },
      { name: 'Obligations', percentage: 30, color: '#3A86FF' },
      { name: 'Actions', percentage: 50, color: '#10B981' },
      { name: 'Immobilier', percentage: 10, color: '#D4AF37' },
    ],
  },
  croissance: {
    label: 'Croissance',
    description: 'Maximise le rendement sur le long terme',
    rate: 10.0,
    color: 'text-success',
    allocations: [
      { name: 'Monétaire', percentage: 5, color: '#CBD5E1' },
      { name: 'Obligations', percentage: 10, color: '#3A86FF' },
      { name: 'Actions', percentage: 75, color: '#10B981' },
      { name: 'Immobilier', percentage: 10, color: '#D4AF37' },
    ],
  },
};

const timeHorizons = [5, 10, 15, 20, 25, 30];

export default function SimulatorPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(2000);
  const [initialAmount, setInitialAmount] = useState(10000);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('equilibre');
  const [timeHorizon, setTimeHorizon] = useState(10);

  const profile = riskProfiles[riskLevel];

  const results = useMemo<SimulatorResult[]>(() => {
    const data: SimulatorResult[] = [];
    for (let year = 1; year <= timeHorizon; year++) {
      const totalMonths = year * 12;
      const contributions = initialAmount + monthlyAmount * totalMonths;
      const value = calculateCompoundInterest(
        initialAmount,
        monthlyAmount,
        profile.rate,
        year
      );
      data.push({
        year,
        value: Math.round(value),
        contributions: Math.round(contributions),
        returns: Math.round(value - contributions),
      });
    }
    return data;
  }, [monthlyAmount, initialAmount, riskLevel, timeHorizon, profile.rate]);

  const finalResult = results[results.length - 1];
  const totalInvested = finalResult?.contributions || 0;
  const finalValue = finalResult?.value || 0;
  const totalGains = finalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGains / totalInvested) * 100) : 0;

  return (
    <div className="pt-16 min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
            <Calculator className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold">Simulateur de portefeuille</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Projetez votre{' '}
            <span className="gradient-text-gold">richesse future</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Simulez la croissance de votre portefeuille sur le long terme grâce à
            la formule des intérêts composés. Adapté au marché marocain.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parameters Card */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-surface-200">
              <h2 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-secondary" />
                Paramètres
              </h2>

              {/* Initial Amount */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Capital initial (MAD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[0, 5000, 10000, 50000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setInitialAmount(val)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                        initialAmount === val
                          ? 'bg-secondary text-white'
                          : 'bg-surface-100 text-primary/60 hover:bg-surface-200'
                      }`}
                    >
                      {val === 0 ? 'Aucun' : `${val.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Amount */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Investissement mensuel (MAD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
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
                  className="w-full mt-2 accent-secondary"
                />
                <div className="flex justify-between text-xs text-primary/40 mt-1">
                  <span>100 MAD</span>
                  <span>20 000 MAD</span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Profil de risque
                </label>
                <div className="space-y-2.5">
                  {(Object.keys(riskProfiles) as RiskLevel[]).map((risk) => {
                    const p = riskProfiles[risk];
                    return (
                      <button
                        key={risk}
                        onClick={() => setRiskLevel(risk)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                          riskLevel === risk
                            ? 'border-secondary bg-secondary/5'
                            : 'border-surface-200 bg-white hover:border-surface-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-sm text-primary">{p.label}</span>
                          <span className={`text-xs font-bold ${p.color}`}>
                            ~{p.rate}%/an
                          </span>
                        </div>
                        <p className="text-xs text-primary/50">{p.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Horizon */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Horizon d&apos;investissement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeHorizons.map((years) => (
                    <button
                      key={years}
                      onClick={() => setTimeHorizon(years)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        timeHorizon === years
                          ? 'bg-primary text-white'
                          : 'bg-surface-100 text-primary/70 hover:bg-surface-200'
                      }`}
                    >
                      {years} ans
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
              <div className="flex gap-3">
                <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">À propos du simulateur</p>
                  <p className="text-xs text-primary/60 leading-relaxed">
                    Ce simulateur utilise la formule des intérêts composés mensuels.
                    Les rendements historiques ne garantissent pas les performances futures.
                    Taux supposé constant sur toute la période.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: DollarSign,
                  label: 'Capital investi',
                  value: formatCurrency(totalInvested),
                  color: 'text-primary',
                  bg: 'bg-primary/5',
                },
                {
                  icon: TrendingUp,
                  label: 'Valeur finale',
                  value: formatCurrency(finalValue),
                  color: 'text-success',
                  bg: 'bg-success/10',
                },
                {
                  icon: BarChart2,
                  label: 'Gains générés',
                  value: formatCurrency(totalGains),
                  color: 'text-secondary',
                  bg: 'bg-secondary/10',
                },
                {
                  icon: Clock,
                  label: 'Rendement total',
                  value: `+${gainPercent.toFixed(1)}%`,
                  color: 'text-accent',
                  bg: 'bg-accent/10',
                },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                  <p className={`text-xl font-black ${stat.color} mb-0.5 leading-tight`}>
                    {stat.value}
                  </p>
                  <p className="text-primary/50 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Growth Chart */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-surface-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-primary">
                  Croissance du portefeuille
                </h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-primary/50">
                    <span className="w-3 h-0.5 bg-secondary inline-block" />
                    Valeur totale
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-primary/50">
                    <span className="w-3 h-0.5 bg-accent inline-block border-dashed border-t-2 border-accent" />
                    Capital investi
                  </span>
                </div>
              </div>
              <PortfolioChart data={results} monthlyAmount={monthlyAmount} />
            </div>

            {/* Bottom Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Allocation Chart */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-surface-200">
                <AllocationChart
                  allocations={profile.allocations}
                  title="Allocation recommandée"
                />
              </div>

              {/* Year by Year Table */}
              <div className="bg-white rounded-2xl shadow-card p-6 border border-surface-200">
                <h4 className="text-sm font-bold text-primary mb-4">Projection annuelle</h4>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {results.map((result) => (
                    <div
                      key={result.year}
                      className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/5 text-primary font-bold w-12 h-6 rounded-lg flex items-center justify-center">
                          An {result.year}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(result.value)}
                        </p>
                        <p className="text-xs text-success">
                          +{((result.value / result.contributions - 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
              <p className="text-xs text-primary/50 leading-relaxed">
                <strong className="text-primary/70">Avertissement :</strong> Ce simulateur est fourni à titre illustratif uniquement.
                Les performances passées ne préjugent pas des performances futures. Le rendement annuel supposé ({profile.rate}%)
                est basé sur des données historiques et peut varier significativement.
                Consultez un conseiller financier avant toute décision d&apos;investissement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
