import Link from 'next/link';
import { Twitter, Linkedin, Mail, TrendingUp, BookOpen, Users, Award, Target, Heart } from 'lucide-react';

const values = [
  {
    icon: BookOpen,
    title: 'Éducation avant tout',
    description: 'Nous croyons que chaque Marocain mérite d\'accéder à une éducation financière de qualité, en français et adaptée à notre contexte local.',
  },
  {
    icon: Target,
    title: 'Rigueur et transparence',
    description: 'Toutes nos analyses sont basées sur des données vérifiables. Nous distinguons clairement opinion et fait, analyse et conseil.',
  },
  {
    icon: Users,
    title: 'Communauté et partage',
    description: 'WallStreet Morocco est avant tout une communauté d\'investisseurs qui s\'entraident pour progresser collectivement.',
  },
  {
    icon: Heart,
    title: 'Passion pour le Maroc',
    description: 'Nous croyons au potentiel économique du Maroc et souhaitons contribuer à l\'émergence d\'une culture de l\'investissement dans notre pays.',
  },
];

const achievements = [
  { icon: Users, value: '12 400+', label: 'Membres de la communauté' },
  { icon: BookOpen, value: '250+', label: 'Articles publiés' },
  { icon: TrendingUp, value: '4 ans', label: 'D\'expérience de la plateforme' },
  { icon: Award, value: 'Top 3', label: 'Plateformes finance Maroc' },
];

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-hero py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl transform translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Photo Placeholder */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-gradient-to-br from-secondary/20 to-accent/20 border-4 border-accent/30 rounded-3xl flex items-center justify-center">
                  <span className="text-6xl font-black text-white/80">EM</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
                <span className="text-accent text-sm font-semibold">Fondateur</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
                El Hanafi Mohammed
              </h1>
              <p className="text-accent font-semibold text-lg mb-4">
                Expert en marchés financiers marocains
              </p>
              <p className="text-white/70 text-base leading-relaxed mb-6 max-w-xl">
                Passionné d&apos;investissement depuis plus de 10 ans, j&apos;ai créé WallStreet Morocco
                pour combler un manque criant : il n&apos;existait pas de plateforme de qualité,
                en français, dédiée à l&apos;investissement marocain.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#0A66C2]/20 text-[#0A66C2] border border-[#0A66C2]/30 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0A66C2]/30 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/30 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1DA1F2]/30 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
                <a
                  href="mailto:founder@wallstreetmorocco.com"
                  className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-surface-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.label} className="bg-white rounded-2xl p-5 text-center shadow-card border border-surface-200">
                <achievement.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-black text-primary mb-1">{achievement.value}</p>
                <p className="text-primary/50 text-xs">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-black text-primary mb-6">Mon parcours</h2>
              <div className="space-y-4 text-primary/70 leading-relaxed">
                <p>
                  Né à Casablanca, j&apos;ai découvert la Bourse marocaine à l&apos;âge de 22 ans,
                  presque par hasard. Comme beaucoup de jeunes Marocains, j&apos;ignorais
                  tout de l&apos;investissement et de la façon dont les marchés financiers fonctionnent.
                </p>
                <p>
                  Après des années à apprendre seul — en lisant des livres en anglais, en suivant
                  des formations étrangères, en faisant des erreurs coûteuses — j&apos;ai réalisé
                  qu&apos;il manquait cruellement une ressource de qualité en français, adaptée
                  à la réalité du marché marocain.
                </p>
                <p>
                  En 2020, j&apos;ai lancé WallStreet Morocco avec une mission simple :
                  <strong className="text-primary"> démocratiser l&apos;accès à l&apos;investissement au Maroc</strong>.
                  Que vous soyez étudiant, cadre ou retraité, tout le monde mérite de comprendre
                  comment faire fructifier son épargne.
                </p>
                <p>
                  Aujourd&apos;hui, la plateforme compte plus de 12 000 membres actifs et je continue
                  à publier des analyses chaque semaine sur la Bourse de Casablanca, les OPCVM
                  et les stratégies d&apos;investissement long terme.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div>
              <h2 className="text-3xl font-black text-primary mb-6">Ma vision</h2>
              <div className="bg-gradient-card rounded-2xl p-6 text-white mb-6">
                <div className="text-4xl mb-4">&ldquo;</div>
                <p className="text-white/90 text-lg leading-relaxed italic mb-4">
                  Je rêve d&apos;un Maroc où chaque citoyen sait comment investir intelligemment
                  pour construire son avenir financier. La Bourse de Casablanca est un outil
                  formidable pour créer de la richesse — il faut juste apprendre à l&apos;utiliser.
                </p>
                <div className="text-4xl text-right">&rdquo;</div>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
                <h4 className="font-bold text-primary mb-3">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Analyse Fondamentale',
                    'Analyse Technique',
                    'OPCVM Maroc',
                    'Bourse de Casablanca',
                    'Marchés africains',
                    'Allocation d\'actifs',
                    'Gestion du risque',
                    'Finance personnelle',
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-white text-primary/70 border border-surface-200 px-3 py-1.5 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-surface-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
              Nos valeurs
            </h2>
            <p className="text-primary/60 text-lg">
              Ce qui guide chaque article, analyse et fonctionnalité de WallStreet Morocco
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 shadow-card border border-surface-200 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-primary text-lg mb-2">{value.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-primary mb-4">
            Restons en contact
          </h2>
          <p className="text-primary/60 text-lg mb-8">
            Une question, une suggestion ou une collaboration ? Je réponds personnellement
            à chaque message.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contact@wallstreetmorocco.com"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:bg-secondary transition-colors shadow-md text-lg"
            >
              <Mail className="w-5 h-5" />
              contact@wallstreetmorocco.com
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-surface-100 text-primary font-semibold px-8 py-4 rounded-xl hover:bg-surface-200 transition-colors text-lg"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
