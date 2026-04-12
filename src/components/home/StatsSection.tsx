import { Users, TrendingUp, BookOpen, PieChart } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '12 400+',
    label: 'Investisseurs actifs',
    description: 'Communauté en croissance chaque mois',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: TrendingUp,
    value: '820 Mrd MAD',
    label: 'Actifs suivis',
    description: 'Capitalisation boursière totale trackée',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: BookOpen,
    value: '250+',
    label: 'Articles publiés',
    description: 'Guides, analyses et stratégies en français',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: PieChart,
    value: '180+',
    label: 'OPCVM suivis',
    description: 'Fonds des 4 principales banques marocaines',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            WallStreet Morocco en chiffres
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Nous aidons des milliers d&apos;investisseurs marocains à prendre de meilleures décisions financières
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              >
                <stat.icon className="w-6 h-6" style={{ color: 'var(--gold)' }} />
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--gold)' }}>{stat.value}</p>
              <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{stat.label}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Extra trust bar */}
        <div
          className="mt-12 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-center sm:text-left">
            <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              Données en temps réel de la Bourse de Casablanca
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Cours, volumes, indices MASI et MADEX mis à jour en continu
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gain)' }} />
              <span>Données live</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--gold)' }} />
              <span>Historique 10 ans</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
