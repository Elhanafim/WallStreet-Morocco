import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import type { OpcvmMarketStats, CategoryStat } from '@/lib/data/opcvm-stats';

const CATEGORY_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
  'Actions':         { bar: 'bg-success',    badge: 'bg-success/15 text-success',       text: 'text-success'      },
  'Diversifiés':     { bar: 'bg-accent',     badge: 'bg-accent/15 text-accent-600',     text: 'text-accent-600'   },
  'Monétaire':       { bar: 'bg-sky-400',    badge: 'bg-sky-50 text-sky-600',           text: 'text-sky-600'      },
  'Obligations CT':  { bar: 'bg-secondary',  badge: 'bg-secondary/10 text-secondary',   text: 'text-secondary'    },
  'Obligations MLT': { bar: 'bg-violet-500', badge: 'bg-violet-50 text-violet-600',     text: 'text-violet-600'   },
};

function Var({ value, size = 'sm' }: { value: number; size?: 'sm' | 'xs' }) {
  const pos  = value >= 0;
  const Icon = pos ? TrendingUp : TrendingDown;
  const sz   = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const txt  = size === 'xs' ? 'text-[11px]' : 'text-xs';
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold ${txt} ${pos ? 'text-success' : 'text-danger'}`}>
      <Icon className={sz} />
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function CategoryCard({ cat, totalBn }: { cat: CategoryStat; totalBn: number }) {
  const colors = CATEGORY_COLORS[cat.category] ?? { bar: 'bg-primary', badge: 'bg-primary/10 text-primary', text: 'text-primary' };
  const pct    = totalBn > 0 ? (cat.actifNetBn / totalBn) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
            {cat.label}
          </span>
          <p className="text-primary/50 text-xs mt-1.5">{cat.nbFonds} fonds</p>
        </div>
        <div className="text-right">
          <Var value={cat.varAnnuel} />
          <p className="text-primary/40 text-2xs mt-0.5">variation 1 an</p>
        </div>
      </div>

      {/* Actif net */}
      <div>
        <p className="text-2xl font-black text-primary">
          {cat.actifNetBn.toLocaleString('fr-MA', { maximumFractionDigits: 0 })}
          <span className="text-sm font-semibold text-primary/40 ml-1">Mrd MAD</span>
        </p>
      </div>

      {/* Market share bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs text-primary/40">Part de marché</span>
          <span className={`text-xs font-bold ${colors.text}`}>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Weekly var */}
      <div className="flex items-center justify-between pt-1 border-t border-surface-100">
        <span className="text-2xs text-primary/40">Variation hebdo.</span>
        <Var value={cat.varHebdo} size="xs" />
      </div>
    </div>
  );
}

export default function OpcvmMarketBanner({ stats }: { stats: OpcvmMarketStats }) {
  return (
    <section className="bg-surface-50 border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              <span className="text-success text-xs font-semibold uppercase tracking-wide">Données officielles AMMC</span>
            </div>
            <h2 className="text-2xl font-black text-primary">
              Marché OPCVM marocain
            </h2>
            <p className="text-primary/50 text-sm mt-1">
              Semaine du {stats.reportDate} · {stats.totalNbFonds} OPCVM ·{' '}
              <span className="font-semibold text-primary">
                {stats.totalActifNetBn.toLocaleString('fr-MA', { maximumFractionDigits: 0 })} Mrd MAD
              </span>{' '}
              d&apos;actif net total
            </p>
          </div>
          <a
            href="https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary/40 hover:text-secondary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open Data Maroc
          </a>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.categories.map((cat) => (
            <CategoryCard key={cat.category} cat={cat} totalBn={stats.totalActifNetBn} />
          ))}
        </div>
      </div>
    </section>
  );
}
