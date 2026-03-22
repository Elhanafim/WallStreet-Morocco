import Link from 'next/link';
import { Check, X, Star, Zap, Shield, TrendingUp, BookOpen, Bell, BarChart2, Users } from 'lucide-react';
import PricingCard from '@/components/premium/PricingCard';
import { PricingTier } from '@/types';

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'MAD',
    billing: 'gratuit',
    description: 'Parfait pour commencer à explorer l\'investissement marocain',
    cta: 'Commencer gratuitement',
    features: [
      { label: 'Accès aux articles de base', included: true },
      { label: 'Données marchés en différé (15 min)', included: true },
      { label: 'Simulateur de portefeuille basique', included: true },
      { label: 'Calendrier économique', included: true },
      { label: '5 articles par mois', included: true },
      { label: 'Analyses approfondies', included: false },
      { label: 'Alertes marchés', included: false },
      { label: 'Données en temps réel', included: false },
      { label: 'Recommandations d\'achat/vente', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9,
    currency: '€',
    billing: 'mensuel',
    description: 'Pour l\'investisseur sérieux qui veut prendre les meilleures décisions',
    cta: 'Commencer — 7 jours gratuits',
    highlighted: true,
    badge: '⭐ Le plus populaire',
    features: [
      { label: 'Tout ce qui est inclus dans Gratuit', included: true },
      { label: 'Analyses approfondies illimitées', included: true, detail: '50+ nouvelles analyses par mois' },
      { label: 'Données marchés en temps réel', included: true },
      { label: 'Recommandations achat/vente', included: true, detail: 'Avec niveaux cibles précis' },
      { label: 'Alertes personnalisées', included: true, detail: 'Email & notification push' },
      { label: 'Simulateur avancé', included: true, detail: 'Scénarios multiples' },
      { label: 'Screening OPCVM complet', included: true },
      { label: 'Analyses techniques avancées', included: true },
      { label: 'Accès à tous les articles', included: true },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: '€',
    billing: 'mensuel',
    description: 'Pour les investisseurs professionnels et les gérants de patrimoine',
    cta: 'Passer Pro',
    features: [
      { label: 'Tout ce qui est inclus dans Premium', included: true },
      { label: 'Portefeuille multi-comptes', included: true, detail: 'Jusqu\'à 5 portefeuilles' },
      { label: 'API données marchés', included: true, detail: 'Accès développeur' },
      { label: 'Rapports PDF exportables', included: true },
      { label: 'Analyse fondamentale complète', included: true, detail: 'Bilan, compte de résultat, ratios' },
      { label: 'Accès early aux nouvelles analyses', included: true },
      { label: 'Consultation mensuelle (1h)', included: true, detail: 'Avec El Hanafi Mohammed' },
      { label: 'Groupe WhatsApp VIP', included: true },
      { label: 'Formation vidéo complète', included: true },
      { label: 'Support prioritaire 24/7', included: true },
    ],
  },
];

const features = [
  {
    icon: TrendingUp,
    title: 'Données de marché en temps réel',
    description: 'Cours, volumes, MASI, MADEX et toutes les valeurs cotées en temps réel.',
  },
  {
    icon: BookOpen,
    title: 'Analyses approfondies',
    description: 'Analyse fondamentale et technique des principales valeurs marocaines.',
  },
  {
    icon: Bell,
    title: 'Alertes personnalisées',
    description: 'Notifications email et push pour vos valeurs et événements préférés.',
  },
  {
    icon: BarChart2,
    title: 'Simulateur avancé',
    description: 'Simulez différents scénarios d\'investissement avec des hypothèses personnalisées.',
  },
  {
    icon: Shield,
    title: 'Recommandations vérifiées',
    description: 'Niveaux d\'achat, objectifs de cours et stop-loss pour chaque recommandation.',
  },
  {
    icon: Users,
    title: 'Communauté d\'investisseurs',
    description: 'Rejoignez des centaines d\'investisseurs marocains passionnés.',
  },
];

const testimonials = [
  {
    name: 'Karim B.',
    city: 'Casablanca',
    text: 'WallStreet Morocco a transformé ma façon d\'investir. Les analyses sont claires, en français et adaptées au marché marocain. Mon portefeuille a progressé de 18% cette année.',
    rating: 5,
    plan: 'Premium',
    initials: 'KB',
  },
  {
    name: 'Fatima Z.',
    city: 'Rabat',
    text: 'Enfin une plateforme qui explique les OPCVM simplement. J\'ai pu choisir le bon fonds pour mon épargne retraite grâce aux comparatifs détaillés.',
    rating: 5,
    plan: 'Premium',
    initials: 'FZ',
  },
  {
    name: 'Ahmed M.',
    city: 'Marrakech',
    text: 'Le simulateur de portefeuille est excellent. J\'ai pu planifier ma stratégie sur 20 ans avec des projections réalistes. Je recommande à tous les investisseurs marocains.',
    rating: 5,
    plan: 'Pro',
    initials: 'AM',
  },
];

export default function PremiumPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-hero py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold">Premium — Accès immédiat</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Investissez comme un{' '}
            <span className="gradient-text-gold">professionnel</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
            Accédez aux outils, analyses et données qui font la différence sur
            le marché boursier marocain.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-success" />
              7 jours gratuits
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-success" />
              Annulable à tout moment
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-success" />
              Sans engagement
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
            Choisissez votre formule
          </h2>
          <p className="text-primary/60 text-lg">
            Tous les abonnements incluent un essai gratuit de 7 jours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        {/* Comparison note */}
        <p className="text-center text-primary/40 text-sm mt-8">
          Tous les prix sont en euros. Paiement sécurisé via Stripe.
          TVA applicable selon votre pays de résidence.
        </p>
      </div>

      {/* Features Grid */}
      <div className="bg-surface-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
              Ce qui est inclus dans Premium
            </h2>
            <p className="text-primary/60 text-lg">
              Tous les outils dont vous avez besoin pour investir avec confiance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-primary mb-4">
              Comparaison détaillée
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-primary/60 text-sm w-1/2">Fonctionnalité</th>
                  <th className="py-3 px-4 font-bold text-center text-sm">Gratuit</th>
                  <th className="py-3 px-4 font-bold text-center text-sm bg-primary/5 rounded-t-xl">Premium</th>
                  <th className="py-3 px-4 font-bold text-center text-sm">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Articles de base', free: true, premium: true, pro: true },
                  { feature: 'Données en différé', free: true, premium: false, pro: false },
                  { feature: 'Données en temps réel', free: false, premium: true, pro: true },
                  { feature: 'Analyses approfondies', free: false, premium: true, pro: true },
                  { feature: 'Recommandations achat/vente', free: false, premium: true, pro: true },
                  { feature: 'Alertes personnalisées', free: false, premium: true, pro: true },
                  { feature: 'Simulateur avancé', free: false, premium: true, pro: true },
                  { feature: 'Analyse technique avancée', free: false, premium: true, pro: true },
                  { feature: 'API données', free: false, premium: false, pro: true },
                  { feature: 'Rapports PDF', free: false, premium: false, pro: true },
                  { feature: 'Consultation mensuelle', free: false, premium: false, pro: true },
                  { feature: 'Groupe VIP', free: false, premium: false, pro: true },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-surface-50' : 'bg-white'}>
                    <td className="py-3 px-4 text-sm text-primary font-medium rounded-l-lg">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.free ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary/20 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-primary/5">
                      {row.premium ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary/20 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center rounded-r-lg">
                      {row.pro ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-primary/20 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-surface-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-primary mb-4">
              Ce que disent nos membres
            </h2>
            <p className="text-primary/60">Rejoignez des milliers d&apos;investisseurs satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-primary/80 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-accent font-black text-xs">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">{testimonial.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-primary/50 text-xs">{testimonial.city}</p>
                      <span className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-medium">
                        {testimonial.plan}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-primary mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui, absolument. Vous pouvez annuler votre abonnement à tout moment depuis votre espace membre. Aucun engagement de durée.',
              },
              {
                q: 'Comment fonctionne l\'essai gratuit de 7 jours ?',
                a: 'Vous bénéficiez d\'un accès complet pendant 7 jours sans aucune restriction. Aucune carte bancaire requise pour commencer.',
              },
              {
                q: 'Les données sont-elles vraiment en temps réel ?',
                a: 'Les données Premium sont en temps réel pendant les heures de marché (9h30-15h30 du lundi au vendredi). La version gratuite affiche les données avec 15 minutes de délai.',
              },
              {
                q: 'Les analyses sont-elles des conseils en investissement ?',
                a: 'Non. WallStreet Morocco fournit des informations et analyses à titre éducatif uniquement. Toute décision d\'investissement reste de votre responsabilité.',
              },
              {
                q: 'Y a-t-il une réduction pour un abonnement annuel ?',
                a: 'Oui ! L\'abonnement annuel offre 2 mois gratuits. Contactez-nous pour en bénéficier.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-surface-50 rounded-2xl p-6 border border-surface-200">
                <h3 className="font-bold text-primary mb-2">{faq.q}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-hero py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            Prêt à investir comme un pro ?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Rejoignez 12 400+ investisseurs marocains qui font confiance à WallStreet Morocco
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup?plan=premium">
              <button className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-8 py-4 rounded-xl hover:bg-accent-600 transition-colors shadow-md text-lg">
                <Zap className="w-5 h-5" />
                Démarrer l&apos;essai gratuit
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-lg">
                Compte gratuit
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
