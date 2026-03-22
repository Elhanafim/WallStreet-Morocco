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
    <section className="py-20 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
            WallStreet Morocco en chiffres
          </h2>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto">
            Nous aidons des milliers d&apos;investisseurs marocains à prendre de meilleures décisions financières
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-surface-200"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.value}</p>
              <p className="text-primary font-bold text-base mb-1">{stat.label}</p>
              <p className="text-primary/50 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Extra trust bar */}
        <div className="mt-12 bg-primary rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-white font-bold text-lg mb-1">
              Données en temps réel de la Bourse de Casablanca
            </p>
            <p className="text-white/60 text-sm">
              Cours, volumes, indices MASI et MADEX mis à jour en continu
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Données live</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-2 h-2 bg-accent rounded-full" />
              <span>Historique 10 ans</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-2 h-2 bg-secondary rounded-full" />
              <span>Analyses quotidiennes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
