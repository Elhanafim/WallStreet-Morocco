import { TrendingUp, TrendingDown, Database } from 'lucide-react';
import type { OpcvmMarketStats } from '@/lib/data/opcvm-stats';

// Colour per category
const CATEGORY_COLOR: Record<string, string> = {
  'Actions':         'text-success  bg-success/10  border-success/20',
  'Diversifiés':     'text-accent-600 bg-accent/10 border-accent/20',
  'Monétaire':       'text-primary/60 bg-surface-200 border-surface-300',
  'Obligations CT':  'text-secondary bg-secondary/10 border-secondary/20',
  'Obligations MLT': 'text-secondary bg-secondary/10 border-secondary/20',
};

function Variation({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${positive ? 'text-success' : 'text-danger'}`}>
      <Icon className="w-3 h-3" />
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export default function OpcvmMarketBanner({ stats }: { stats: OpcvmMarketStats }) {
  return (
    <div className="mt-8 space-y-4">
      {/* Aggregate row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
          <p className="text-accent font-black text-2xl">
            {stats.totalActifNetBn.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-white/60 text-xs mt-0.5">Mrd MAD — Actif net total</p>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
          <p className="text-accent font-black text-2xl">{stats.totalNbFonds}</p>
          <p className="text-white/60 text-xs mt-0.5">OPCVM enregistrés</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white/10 border border-white/20 rounded-xl p-4 text-center">
          <p className="text-white font-bold text-sm">{stats.reportDate}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Database className="w-3 h-3 text-white/40" />
            <p className="text-white/40 text-xs">Source AMMC — Open Data Maroc</p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {stats.categories.map((cat) => {
          const colorClass = CATEGORY_COLOR[cat.category] ?? 'text-primary bg-white border-surface-200';
          return (
            <div
              key={cat.category}
              className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-white/5 border-white/10`}
            >
              <div>
                <p className="text-white text-xs font-semibold">{cat.label}</p>
                <p className="text-white/50 text-2xs">{cat.nbFonds} fonds</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">
                  {cat.actifNetBn.toLocaleString('fr-MA', { maximumFractionDigits: 0 })} Mrd
                </p>
                <Variation value={cat.varAnnuel} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
