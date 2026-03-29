import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation | WallStreet Morocco",
  description:
    "Conditions d'utilisation de WallStreet Morocco. Site d'information financière éducative sur la Bourse de Casablanca. Pas un conseil en investissement.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-[#112d5e] to-[#0d3060] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Conditions d&apos;utilisation
              </h1>
              <p className="text-white/50 text-sm mt-1">Dernière mise à jour : 25 mars 2026</p>
            </div>
          </div>
          {/* Important disclaimer */}
          <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 mt-4">
            <p className="text-warning text-sm font-semibold">
              ⚠️ WallStreet Morocco est un site d&apos;information et d&apos;éducation financière
              uniquement — pas un service de conseil en investissement réglementé.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 sm:p-10 space-y-10">

          <Section title="1. Présentation du service">
            <p>
              WallStreet Morocco est un projet indépendant fournissant des informations financières sur la
              Bourse de Casablanca (BVC) à titre éducatif et informatif. Ce site n&apos;est pas une
              entité commerciale enregistrée et n&apos;est soumis à aucun agrément financier.
            </p>
          </Section>

          <Section title="2. Acceptation des conditions">
            <p>
              En accédant à ce site web ou en créant un compte, vous acceptez sans réserve les
              présentes conditions d&apos;utilisation dans leur intégralité. Si vous n&apos;acceptez
              pas ces conditions, veuillez ne pas utiliser ce service.
            </p>
          </Section>

          <Section title="3. Nature du service — Avertissement important">
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-5 space-y-3">
              <p className="font-bold text-danger text-sm">
                ⚠️ WallStreet Morocco est un site d&apos;INFORMATION et d&apos;ÉDUCATION financière
                UNIQUEMENT.
              </p>
              <div>
                <p className="font-semibold text-primary mb-2">CE SITE NE FOURNIT PAS :</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2"><Bullet /><span>De conseil en investissement au sens de la réglementation AMMC</span></li>
                  <li className="flex items-start gap-2"><Bullet /><span>De recommandations personnalisées d&apos;achat ou de vente de titres financiers</span></li>
                  <li className="flex items-start gap-2"><Bullet /><span>De service de gestion de portefeuille professionnelle</span></li>
                  <li className="flex items-start gap-2"><Bullet /><span>De service réglementé par l&apos;AMMC, l&apos;AMF ou tout autre régulateur financier</span></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-2">LES DONNÉES AFFICHÉES :</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2"><Bullet /><span>Sont fournies avec un délai minimum de 15 minutes</span></li>
                  <li className="flex items-start gap-2"><Bullet /><span>Peuvent contenir des erreurs, des inexactitudes ou des omissions</span></li>
                  <li className="flex items-start gap-2"><Bullet /><span>Ne doivent en aucun cas servir de base unique à des décisions d&apos;investissement</span></li>
                </ul>
              </div>
              <div className="border-t border-danger/20 pt-3">
                <p className="font-bold text-primary text-sm">
                  INVESTIR COMPORTE DES RISQUES : vous pouvez perdre tout ou partie du capital
                  investi. Consultez un conseiller financier agréé avant toute décision
                  d&apos;investissement.
                </p>
              </div>
            </div>
          </Section>

          <Section title="4. Compte utilisateur">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Vous êtes seul responsable de la confidentialité de votre mot de passe et des actions effectuées depuis votre compte.</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Vous devez avoir <strong>au moins 18 ans</strong> pour créer un compte.</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Un seul compte par personne physique est autorisé.</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Nous nous réservons le droit de suspendre ou supprimer tout compte en cas d&apos;abus, de fraude ou de violation de ces conditions.</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Signalez immédiatement toute utilisation non autorisée de votre compte à <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">moroccowallstreet@gmail.com</a>.</span></li>
            </ul>
          </Section>

          <Section title="5. Propriété intellectuelle">
            <p>
              Le contenu original de ce site — textes, analyses, articles éducatifs, code source,
              design et interface graphique — est la propriété exclusive de{' '}
              <strong>WallStreet Morocco</strong>. Toute reproduction, distribution ou
              utilisation commerciale sans autorisation écrite préalable est strictement interdite.
            </p>
            <p className="mt-3">
              Les données de marché affichées proviennent de sources tierces (Bourse de Casablanca,
              Leboursier.ma, Finnhub, ForexFactory) et restent la propriété de leurs fournisseurs
              respectifs. WallStreet Morocco ne revendique aucun droit sur ces données.
            </p>
          </Section>

          <Section title="6. Limitation de responsabilité">
            <p className="mb-3">
              Dans les limites permises par la loi applicable, WallStreet Morocco ne peut être tenu
              responsable des préjudices suivants :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Pertes financières ou manques à gagner résultant de l&apos;utilisation des informations publiées sur ce site</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Interruptions de service, erreurs techniques, indisponibilité du site</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Inexactitudes, retards ou erreurs dans les données de marché affichées</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Décisions d&apos;investissement prises sur la base des informations présentes sur ce site</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Accès non autorisé aux données suite à un acte malveillant tiers</span></li>
            </ul>
          </Section>

          <Section title="7. Disponibilité du service">
            <p>
              Ce service est fourni <strong>&laquo; tel quel &raquo;</strong> et{' '}
              <strong>&laquo; tel que disponible &raquo;</strong>, sans garantie de disponibilité
              permanente ou de continuité de service. Des interruptions planifiées (maintenance) ou
              non planifiées (incidents techniques) peuvent survenir sans préavis.
            </p>
          </Section>

          <Section title="8. Conduite interdite">
            <p className="mb-3">
              Il est strictement interdit d&apos;utiliser ce site pour :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Tenter de pirater, compromettre ou tester des vulnérabilités de sécurité sans autorisation écrite</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Automatiser des requêtes en masse (scraping, bot) susceptibles de surcharger le service</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Usurper l&apos;identité d&apos;autres utilisateurs ou de tiers</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Publier, transmettre ou promouvoir du contenu illégal, diffamatoire, trompeur ou violant les droits d&apos;autrui</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Contourner les mesures de sécurité, de limitation de taux ou d&apos;accès</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Toute activité contraire aux lois marocaines ou aux lois du pays de l&apos;utilisateur</span></li>
            </ul>
          </Section>

          <Section title="9. Modifications des conditions">
            <p>
              Ces conditions d&apos;utilisation peuvent être modifiées à tout moment. La date de
              &laquo; Dernière mise à jour &raquo; sera actualisée. En continuant d&apos;utiliser le
              service après toute modification, vous acceptez les nouvelles conditions. En cas de
              modifications substantielles, une notification sera affichée sur le site.
            </p>
          </Section>

          <Section title="10. Droit applicable et juridiction compétente">
            <p>
              Ces conditions sont régies par le <strong>droit marocain</strong>. Tout litige
              découlant de l&apos;utilisation de ce service sera soumis à la compétence exclusive des
              tribunaux de <strong>Casablanca, Maroc</strong>, sauf disposition légale contraire
              applicable à l&apos;utilisateur.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Pour toute question relative à ces conditions, pour signaler un abus ou pour toute
              autre demande :
            </p>
            <ul className="mt-2 space-y-1">
              <li><span className="text-primary/50">Email :</span> <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">moroccowallstreet@gmail.com</a></li>
              <li><span className="text-primary/50">Instagram :</span> <a href="https://www.instagram.com/wallstreet.morocco" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">@wallstreet.morocco</a></li>
            </ul>
          </Section>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4">
          <Link href="/confidentialite" className="text-secondary hover:underline text-sm font-medium">
            Politique de confidentialité
          </Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/" className="text-primary/50 hover:text-primary text-sm transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b border-surface-200">{title}</h2>
      <div className="text-primary/75 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function Bullet() {
  return <span className="flex-shrink-0 w-1.5 h-1.5 bg-secondary rounded-full mt-1.5" />;
}
