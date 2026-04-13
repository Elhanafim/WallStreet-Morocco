import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | WallStreet Morocco',
  description:
    'Comment WallStreet Morocco collecte, utilise et protège vos données personnelles. Conformité Loi 09-08 (Maroc) et RGPD.',
};

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium text-white">
                Politique de confidentialité
              </h1>
              <p className="text-white/50 text-sm mt-1">Dernière mise à jour : 25 mars 2026</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-2xl">
            Cette politique explique comment WallStreet Morocco collecte, utilise et protège vos
            données personnelles, en conformité avec la Loi 09-08 (Maroc) et le RGPD (Union
            européenne).
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 sm:p-10 space-y-10">

          {/* Section 1 */}
          <Section title="1. Responsable du traitement">
            <p>
              <strong>WallStreet Morocco</strong> — projet indépendant, non enregistré comme société
            </p>
            <ul className="mt-2 space-y-1">
              <li><span className="text-primary/50">Email :</span> <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">moroccowallstreet@gmail.com</a></li>
              <li><span className="text-primary/50">Instagram :</span> <a href="https://www.instagram.com/wallstreet.morocco" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">@wallstreet.morocco</a></li>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section title="2. Données collectées">
            <SubSection title="a) Données de compte (si inscription)">
              <li>Adresse email</li>
              <li>Mot de passe (stocké sous forme hashée avec bcrypt — jamais en clair)</li>
              <li>Prénom et nom</li>
              <li>Date d&apos;inscription</li>
            </SubSection>
            <SubSection title="b) Données de portefeuille">
              <li>Actions et OPCVM ajoutés par l&apos;utilisateur</li>
              <li>Prix d&apos;achat, quantités, dates d&apos;achat</li>
              <li>Notes personnelles sur les positions</li>
            </SubSection>
            <SubSection title="c) Données techniques">
              <li>Adresse IP (journaux de serveur, conservée 30 jours)</li>
              <li>Navigateur et système d&apos;exploitation</li>
              <li>Pages visitées et durée des visites (si consentement analytique donné)</li>
            </SubSection>
            <SubSection title="d) Données NON collectées">
              <li>Aucune donnée bancaire ou financière réelle</li>
              <li>Aucun document d&apos;identité</li>
              <li>Aucune donnée de localisation précise</li>
              <li>Aucune donnée vendue ou transmise à des tiers à des fins commerciales</li>
            </SubSection>
          </Section>

          {/* Section 3 */}
          <Section title="3. Finalités du traitement">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Fonctionnement du compte utilisateur et du portefeuille</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Amélioration et développement du service</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Sécurité du service et prévention des abus</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Communication si vous nous contactez directement</span></li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section title="4. Base légale (RGPD)">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span><strong>Exécution du contrat</strong> — compte utilisateur, accès aux fonctionnalités</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Consentement</strong> — cookies analytiques et fonctionnels</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Intérêt légitime</strong> — sécurité du service, prévention des fraudes</span></li>
            </ul>
          </Section>

          {/* Section 5 */}
          <Section title="5. Durée de conservation">
            <table className="w-full text-sm mt-2 border-collapse">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Type de donnée</th>
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border border-surface-200">Données de compte</td>
                  <td className="py-2 px-3 border border-surface-200">Jusqu&apos;à suppression du compte</td>
                </tr>
                <tr className="bg-surface-50">
                  <td className="py-2 px-3 border border-surface-200">Journaux de sécurité (IP)</td>
                  <td className="py-2 px-3 border border-surface-200">30 jours</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-surface-200">Données de portefeuille</td>
                  <td className="py-2 px-3 border border-surface-200">Jusqu&apos;à suppression explicite</td>
                </tr>
                <tr className="bg-surface-50">
                  <td className="py-2 px-3 border border-surface-200">Cookies fonctionnels/analytiques</td>
                  <td className="py-2 px-3 border border-surface-200">Jusqu&apos;au retrait du consentement</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Section 6 */}
          <Section title="6. Vos droits (Loi 09-08 Maroc + RGPD pour utilisateurs UE)">
            <p className="mb-3">Vous disposez des droits suivants concernant vos données personnelles :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit d&apos;accès</strong> — consulter les données que nous détenons sur vous</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit de rectification</strong> — corriger des données inexactes</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit à l&apos;effacement</strong> — supprimer toutes vos données (« droit à l&apos;oubli »)</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit à la portabilité</strong> — recevoir vos données dans un format lisible par machine</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit d&apos;opposition</strong> — s&apos;opposer au traitement pour des motifs légitimes</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Droit de retrait du consentement</strong> — à tout moment, sans effet rétroactif</span></li>
            </ul>
            <div className="mt-4 bg-secondary/5 border border-secondary/20 rounded-xl p-4">
              <p className="text-sm font-medium text-primary mb-1">Pour exercer ces droits :</p>
              <p className="text-sm text-primary/70">Email : <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">moroccowallstreet@gmail.com</a></p>
              <p className="text-sm text-primary/70">Délai de réponse : <strong>30 jours maximum</strong></p>
            </div>
          </Section>

          {/* Section 7 */}
          <Section title="7. Cookies">
            <table className="w-full text-sm mt-2 border-collapse">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Catégorie</th>
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Usage</th>
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Consentement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border border-surface-200 font-medium">Essentiels</td>
                  <td className="py-2 px-3 border border-surface-200">Session d&apos;authentification, langue, préférences UI</td>
                  <td className="py-2 px-3 border border-surface-200 text-success font-medium">Toujours actifs</td>
                </tr>
                <tr className="bg-surface-50">
                  <td className="py-2 px-3 border border-surface-200 font-medium">Fonctionnels</td>
                  <td className="py-2 px-3 border border-surface-200">Sauvegarde historique portefeuille, préférences avancées</td>
                  <td className="py-2 px-3 border border-surface-200 text-warning font-medium">Consentement requis</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-surface-200 font-medium">Analytiques</td>
                  <td className="py-2 px-3 border border-surface-200">Pages visitées, durée (via Vercel Analytics — anonymisé)</td>
                  <td className="py-2 px-3 border border-surface-200 text-warning font-medium">Consentement requis</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm text-primary/60">
              Vous pouvez modifier vos préférences à tout moment via le lien &laquo; Gestion des cookies &raquo; en pied de page.
            </p>
          </Section>

          {/* Section 8 */}
          <Section title="8. Sécurité des données">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Mots de passe hashés avec bcrypt (facteur de coût : 12)</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Communications chiffrées (HTTPS/TLS) avec HSTS activé</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>En-têtes de sécurité HTTP (CSP, X-Frame-Options, etc.)</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Accès à la base de données restreint par réseau privé</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Sauvegardes automatiques gérées par Neon (30 jours de rétention)</span></li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section title="9. Transferts internationaux">
            <p>
              Ce site est hébergé sur Vercel (serveurs en Europe) et utilise Neon PostgreSQL (région
              EU-West-2, Irlande). Aucun transfert vers des pays tiers sans niveau de protection
              adéquat reconnu par la Commission européenne n&apos;est effectué.
            </p>
          </Section>

          {/* Section 10 */}
          <Section title="10. Modifications de cette politique">
            <p>
              Cette politique peut être mise à jour pour refléter des changements dans nos pratiques
              ou pour des raisons légales. En cas de modifications importantes, les utilisateurs
              connectés en seront informés par notification dans l&apos;application. La date de
              &laquo; Dernière mise à jour &raquo; sera modifiée en conséquence.
            </p>
          </Section>

          {/* Section 11 */}
          <Section title="11. Contact et réclamations">
            <p className="mb-3">Pour toute question relative à cette politique ou à vos données :</p>
            <ul className="space-y-1">
              <li><span className="text-primary/50">Email :</span> <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">moroccowallstreet@gmail.com</a></li>
            </ul>
            <p className="mt-4 text-sm text-primary/60">
              Si vous estimez que le traitement de vos données porte atteinte à vos droits, vous
              pouvez déposer une réclamation auprès de :
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li><strong>CNIL</strong> (France / UE) — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">cnil.fr</a></li>
              <li><strong>CNDP</strong> (Maroc) — <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">cndp.ma</a></li>
            </ul>
          </Section>

        </div>

        {/* Footer disclaimer */}
        <p className="text-center text-primary/40 text-xs mt-8 mb-4">
          WallStreet Morocco — Projet indépendant · moroccowallstreet@gmail.com
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-primary mb-4 pb-2 border-b border-surface-200">{title}</h2>
      <div className="text-primary/75 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="font-medium text-primary mb-2">{title}</p>
      <ul className="space-y-1 pl-2">{children}</ul>
    </div>
  );
}

function Bullet() {
  return <span className="flex-shrink-0 w-1.5 h-1.5 bg-secondary rounded-full mt-1.5" />;
}
