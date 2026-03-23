import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Linkedin, Mail, Globe,
  BookOpen, TrendingUp, Target, Users,
  GraduationCap, Briefcase, Rocket, Lightbulb,
  ArrowRight, CheckCircle,
} from 'lucide-react';
import FounderPortfolio from '@/components/about/FounderPortfolio';

export const metadata: Metadata = {
  title: 'Fondateur & Mon Parcours | WallStreet Morocco',
  description:
    'El Hanafi Mohammed — fondateur de WallStreet Morocco, investisseur actif à la BVC depuis 2024. Découvrez son parcours, sa stratégie et ses résultats réels.',
};

// ─── Data ────────────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    year: '2022',
    icon: BookOpen,
    title: 'Découverte des marchés financiers',
    desc: 'Première rencontre avec la Bourse de Casablanca et les marchés internationaux. Début d\'un apprentissage intensif : analyse fondamentale, gestion de portefeuille, économie marocaine.',
    color: 'bg-secondary/20 text-secondary border-secondary/30',
    dot: 'bg-secondary',
  },
  {
    year: '2023',
    icon: GraduationCap,
    title: 'Formation académique en finance',
    desc: 'Études spécialisées en marchés de capitaux avec un focus sur l\'analyse des titres marocains — banques, télécoms, agroalimentaire. Construction d\'un cadre d\'analyse rigoureux.',
    color: 'bg-accent/20 text-accent-600 border-accent/30',
    dot: 'bg-accent',
  },
  {
    year: '2024',
    icon: Briefcase,
    title: 'Passage à l\'action — DCA réel',
    desc: 'Novembre 2024 : premier investissement de $100 à la BVC. Début d\'un suivi mensuel rigoureux et transparent. Sélection ciblée sur les titres les plus prometteurs de la cote.',
    color: 'bg-success/15 text-success border-success/30',
    dot: 'bg-success',
  },
  {
    year: '2025',
    icon: Rocket,
    title: 'Création de WallStreet Morocco',
    desc: 'Lancement de la plateforme avec une mission claire : démocratiser l\'investissement au Maroc. Outils de simulation, éducation financière, données OPCVM officielles, transparence totale.',
    color: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
  {
    year: '2026',
    icon: TrendingUp,
    title: '+51% — Les résultats parlent',
    desc: 'Mars 2026 : $1 700 investis → $2 567. +51% de rendement sur 17 mois grâce à une sélection rigoureuse et un positionnement parfait sur le run-up BVC. La méthode est prouvée.',
    color: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    dot: 'bg-emerald-500',
  },
];

const VALUES = [
  {
    icon: BookOpen,
    title: 'Éducation Financière',
    desc: 'Rendre les connaissances financières accessibles à tous les Marocains, quel que soit leur niveau de départ.',
  },
  {
    icon: TrendingUp,
    title: 'Investissement Long Terme',
    desc: 'Promouvoir une culture d\'investissement patient et discipliné, en phase avec les réalités du marché marocain.',
  },
  {
    icon: Target,
    title: 'Transparence Totale',
    desc: 'Partager mon propre parcours d\'investisseur — les gains comme les défis — sans filtre ni mise en scène.',
  },
  {
    icon: Users,
    title: 'Communauté Active',
    desc: 'Construire une communauté d\'investisseurs marocains qui apprennent et progressent ensemble.',
  },
];

const VISION_PILLARS = [
  {
    icon: Lightbulb,
    title: 'Simplifier l\'investissement au Maroc',
    body: 'La BVC reste sous-investie par les particuliers. Notre plateforme supprime les barrières à l\'entrée : données claires, outils accessibles, parcours pédagogique structuré.',
  },
  {
    icon: Target,
    title: 'Investir avec méthode, pas avec chance',
    body: 'Une sélection rigoureuse des titres, une discipline DCA, une compréhension du cycle de marché. Ce sont ces éléments qui ont produit +51% — pas la chance.',
  },
  {
    icon: CheckCircle,
    title: 'Prouver par l\'exemple',
    body: 'Chaque mois, les données sont mises à jour. Le portefeuille est documenté en temps réel. La transparence est notre différenciateur.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="pt-16 min-h-screen bg-surface-50">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-primary via-[#112d5e] to-[#0d3060] overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* ── Text ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-bold uppercase tracking-widest">Fondateur · Investisseur · BVC</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                El Hanafi
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-accent leading-tight mb-6">
                Mohammed
              </h2>

              <p className="text-white/70 text-lg leading-relaxed mb-4">
                Étudiant en finance, investisseur actif à la Bourse de Casablanca depuis novembre 2024.
                J&apos;ai lancé <strong className="text-white">WallStreet Morocco</strong> pour démocratiser
                l&apos;investissement au Maroc et prouver qu&apos;on peut bâtir un patrimoine
                réel dès <strong className="text-white">100$/mois</strong>.
              </p>

              {/* Achievement badge */}
              <div className="inline-flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3 mb-8">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-black text-xl leading-none">+51%</p>
                  <p className="text-white/50 text-xs mt-0.5">portefeuille BVC · 17 mois · DCA 100$/mois</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { icon: Linkedin, label: 'LinkedIn',           href: 'https://linkedin.com' },

                  { icon: Mail,     label: 'Email',              href: 'mailto:contact@wallstreetmorocco.com' },
                  { icon: Globe,    label: 'WallStreet Morocco', href: '/' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/75 hover:bg-white/20 hover:text-white transition-all text-sm font-medium"
                  >
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Photo ── */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-3xl border-2 border-accent/20 scale-105" />
                <div className="absolute inset-0 rounded-3xl border border-white/8 scale-110" />

                <div className="relative w-72 sm:w-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/founder.jpg"
                    alt="El Hanafi Mohammed — Fondateur WallStreet Morocco"
                    width={320}
                    height={400}
                    className="w-full h-96 object-cover object-top"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/90 to-transparent p-5">
                    <p className="text-white font-bold text-lg">El Hanafi Mohammed</p>
                    <p className="text-accent text-sm font-medium">Fondateur · WallStreet Morocco</p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                  🇲🇦 Actif depuis Nov 2024
                </div>

                {/* Perf badge */}
                <div className="absolute -bottom-4 -left-4 bg-accent text-primary text-xs font-black px-4 py-2 rounded-2xl shadow-lg">
                  +51% en 17 mois
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VISION QUOTE ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 border-b border-surface-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote>
            <div className="text-8xl text-primary/8 font-serif leading-none mb-2 select-none">&ldquo;</div>
            <p className="text-2xl sm:text-3xl font-bold text-primary leading-relaxed -mt-10">
              L&apos;investissement n&apos;est pas un privilège réservé aux riches.
              Avec <span className="text-secondary">100$ par mois</span> et une sélection
              de titres rigoureuse,{' '}
              <span className="text-secondary">n&apos;importe quel Marocain peut bâtir un patrimoine.</span>
            </p>
            <p className="mt-6 text-primary/40 text-sm font-medium">
              — El Hanafi Mohammed, Fondateur de WallStreet Morocco
            </p>
          </blockquote>
        </div>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════════ */}
      <section className="bg-surface-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
              <Briefcase className="w-3.5 h-3.5 text-secondary" />
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Parcours</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">
              De la curiosité à l&apos;expertise
            </h2>
            <p className="text-primary/50">Académique · Professionnel · Entrepreneurial</p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary/40 via-accent/30 to-emerald-500/40 -translate-x-px" />

            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                >
                  {/* Dot */}
                  <div className={`absolute left-[22px] sm:left-1/2 w-5 h-5 ${item.dot} rounded-full border-4 border-surface-50 -translate-x-1/2 mt-4 z-10 shadow-md`} />

                  {/* Card */}
                  <div className={`ml-14 sm:ml-0 sm:w-[46%] ${i % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12 sm:ml-auto'}`}>
                    <div className={`bg-white border rounded-2xl p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 ${item.color}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm opacity-80">{item.year}</span>
                      </div>
                      <h3 className="font-black text-primary text-base mb-2">{item.title}</h3>
                      <p className="text-primary/60 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PORTFOLIO PERFORMANCE ══════════════════════════════════════════════ */}
      <FounderPortfolio />

      {/* ══ VISION ════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
              <Lightbulb className="w-3.5 h-3.5 text-accent-600" />
              <span className="text-accent-600 text-xs font-bold uppercase tracking-widest">Vision</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">
              Pourquoi WallStreet Morocco ?
            </h2>
            <p className="text-primary/50 max-w-2xl mx-auto">
              La Bourse de Casablanca reste sous-utilisée par les particuliers marocains.
              Cette plateforme existe pour changer cela.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {VISION_PILLARS.map((p, i) => (
              <div key={i} className="bg-surface-50 border border-surface-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200">
                <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-black text-primary text-base mb-3">{p.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="group bg-gradient-hero rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <v.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-surface-50 py-20 border-t border-surface-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-6">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            <span className="text-success text-xs font-semibold">Accessible à tous · Dès 100 MAD/mois</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
            Commencez votre propre parcours
          </h2>
          <p className="text-primary/60 mb-10 text-lg leading-relaxed">
            Simulez ce que 100$/mois peut vous rapporter à la Bourse de Casablanca.
            Les outils sont gratuits. La méthode est prouvée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-600 transition-colors shadow-md text-base"
            >
              Créer mon compte <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-surface-200 text-primary font-semibold rounded-xl hover:bg-surface-50 hover:shadow-card transition-all text-base"
            >
              Simuler mon portefeuille
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
