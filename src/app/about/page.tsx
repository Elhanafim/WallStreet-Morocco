import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Mail, Globe, BookOpen, TrendingUp, Target, Users } from 'lucide-react';
import FounderPortfolio from '@/components/about/FounderPortfolio';

export const metadata: Metadata = {
  title: 'À propos du Fondateur',
  description:
    'El Hanafi Mohammed — étudiant en finance, investisseur actif à la Bourse de Casablanca, et fondateur de WallStreet Morocco.',
};

const values = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Éducation Financière',
    desc: "Rendre les connaissances financières accessibles à tous les Marocains, quel que soit leur niveau.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Investissement Long Terme',
    desc: "Promouvoir une culture d'investissement patient et discipliné, en phase avec les réalités du marché marocain.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Transparence Totale',
    desc: "Partager mon propre parcours d'investisseur — les gains comme les défis — sans filtre ni mise en scène.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Communauté Active',
    desc: "Construire une communauté d'investisseurs marocains qui apprennent et progressent ensemble.",
  },
];

const timeline = [
  {
    year: '2022',
    title: 'Première rencontre avec les marchés',
    desc: "Découverte de la Bourse de Casablanca et des marchés financiers internationaux. Début d'un apprentissage intensif et autodidacte.",
  },
  {
    year: '2023',
    title: 'Formation & Immersion Académique',
    desc: "Études en finance avec un focus sur les marchés de capitaux, l'analyse fondamentale et la gestion de portefeuille.",
  },
  {
    year: '2024',
    title: "Lancement de l'investissement réel",
    desc: "Novembre 2024 : premier investissement de $100 à la BVC. Début d'un suivi mensuel rigoureux et documenté.",
  },
  {
    year: '2025',
    title: 'Création de WallStreet Morocco',
    desc: "Lancement de la plateforme avec une mission claire : démocratiser l'investissement au Maroc et accompagner une nouvelle génération d'investisseurs.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-16">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary to-[#0d3060] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <div>
              <span className="inline-block bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                Fondateur &amp; Investisseur
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                El Hanafi<br />
                <span className="text-accent">Mohammed</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Étudiant en finance passionné par les marchés financiers marocains.
                J&apos;ai créé WallStreet Morocco pour démocratiser l&apos;investissement
                au Maroc et prouver qu&apos;on peut bâtir un patrimoine dès 100$/mois
                à la Bourse de Casablanca.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', href: 'https://linkedin.com' },
                  { icon: <Twitter className="w-4 h-4" />, label: 'Twitter / X', href: 'https://twitter.com' },
                  { icon: <Mail className="w-4 h-4" />, label: 'Email', href: 'mailto:contact@wallstreetmorocco.com' },
                  { icon: <Globe className="w-4 h-4" />, label: 'WallStreet Morocco', href: '/' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm font-medium"
                  >
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Photo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl border-2 border-accent/30 scale-105" />
                <div className="absolute inset-0 rounded-3xl border border-white/10 scale-110" />

                <div className="relative w-72 sm:w-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  <Image
                    src="/images/founder.jpg"
                    alt="El Hanafi Mohammed — Fondateur WallStreet Morocco"
                    width={320}
                    height={400}
                    className="w-full h-96 object-cover object-top"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-5">
                    <p className="text-white font-bold text-lg">El Hanafi Mohammed</p>
                    <p className="text-accent text-sm font-medium">Fondateur · WallStreet Morocco</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-accent text-primary text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                  🇲🇦 Actif depuis Nov 2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION QUOTE ─────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="relative">
            <div className="text-7xl text-primary/10 font-serif leading-none mb-2">&ldquo;</div>
            <p className="text-2xl sm:text-3xl font-bold text-primary leading-relaxed -mt-8">
              L&apos;investissement n&apos;est pas un privilège réservé aux riches.
              Avec 100$ par mois et une discipline constante,
              <span className="text-secondary"> n&apos;importe quel Marocain peut bâtir un patrimoine.</span>
            </p>
            <div className="mt-6 text-primary/50 text-sm font-medium">
              — El Hanafi Mohammed, Fondateur de WallStreet Morocco
            </div>
          </blockquote>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-primary mb-3">Mon Parcours</h2>
            <p className="text-primary/60">De la curiosité à l&apos;entrepreneuriat financier</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-primary/10 -translate-x-px" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 sm:gap-0 ${
                    i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  <div className="absolute left-6 sm:left-1/2 w-4 h-4 bg-secondary rounded-full border-4 border-white -translate-x-1/2 mt-1.5 z-10" />

                  <div className={`ml-14 sm:ml-0 sm:w-[45%] ${i % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10 sm:ml-auto'}`}>
                    <span className="text-accent font-black text-sm">{item.year}</span>
                    <h3 className="text-primary font-bold text-lg mt-0.5 mb-2">{item.title}</h3>
                    <p className="text-primary/60 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTMENT JOURNEY CHART ─────────────────────── */}
      <FounderPortfolio />

      {/* ── VALUES ───────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-primary mb-3">Mes Valeurs</h2>
            <p className="text-primary/60">Les principes qui guident WallStreet Morocco</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-primary mb-2">{v.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-primary py-16" id="contact">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-white/60 mb-8">
            Rejoignez WallStreet Morocco et commencez à investir intelligemment au Maroc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-colors"
            >
              Créer mon compte gratuitement
            </Link>
            <Link
              href="/simulator"
              className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 border border-white/20 transition-colors"
            >
              Simuler mon portefeuille
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
