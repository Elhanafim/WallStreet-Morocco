import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import type { Metadata } from 'next';
import EduBannerInline from '@/components/legal/EduBannerInline';

export const metadata: Metadata = {
  title: 'Politique de cookies | WallStreet Morocco',
  description:
    'Politique de cookies et traceurs de WallStreet Morocco — quels cookies nous utilisons, pourquoi, et comment les gérer. Conformité Loi 09-08 et RGPD.',
};

export default function PolitiqueCookiesPage() {
  return (
    <div className="min-h-screen bg-surface-50 pt-16">
      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.25)' }}
            >
              <Cookie className="w-6 h-6" style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium" style={{ color: 'var(--text-primary)' }}>
                Politique de cookies et traceurs
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Dernière mise à jour : 25 mars 2026</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Conformément à la Loi 09-08 (Maroc) et au RGPD (Union européenne), cette page explique
            comment WallStreet Morocco utilise les cookies et comment vous pouvez contrôler vos
            préférences.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 sm:p-10 space-y-10">

          <Section title="1. Qu'est-ce qu'un cookie ?">
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone,
              tablette) lorsque vous visitez un site web. Il permet de mémoriser certaines informations
              et de reconnaître votre navigateur lors de visites ultérieures. Les cookies ne peuvent
              pas exécuter de programmes ni transmettre de virus à votre ordinateur.
            </p>
          </Section>

          <Section title="2. Cookies utilisés sur ce site">
            <p className="mb-4">Nous utilisons trois catégories de cookies :</p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="border border-success/30 bg-success/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <p className="font-bold text-primary text-sm">
                    a) Cookies ESSENTIELS — <span className="text-success font-medium">Toujours actifs (pas de consentement requis)</span>
                  </p>
                </div>
                <ul className="space-y-1 text-sm text-primary/70 pl-4">
                  <li>• Session d&apos;authentification (cookie de connexion)</li>
                  <li>• Préférence de langue (fr / en / es)</li>
                  <li>• Mémorisation de votre choix de consentement</li>
                </ul>
                <p className="text-xs text-primary/50 mt-2 italic">
                  Durée de conservation : durée de session ou jusqu&apos;à 12 mois
                </p>
              </div>

              {/* Functional */}
              <div className="border border-warning/30 bg-warning/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-warning rounded-full" />
                  <p className="font-bold text-primary text-sm">
                    b) Cookies FONCTIONNELS — <span className="text-warning font-medium">Consentement requis</span>
                  </p>
                </div>
                <ul className="space-y-1 text-sm text-primary/70 pl-4">
                  <li>• Historique des snapshots de portefeuille</li>
                  <li>• Préférences d&apos;affichage avancées</li>
                </ul>
                <p className="text-xs text-primary/50 mt-2 italic">
                  Durée de conservation : jusqu&apos;à 6 mois
                </p>
              </div>

              {/* Analytics */}
              <div className="border border-secondary/30 bg-secondary/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-secondary rounded-full" />
                  <p className="font-bold text-primary text-sm">
                    c) Cookies ANALYTIQUES — <span className="text-secondary font-medium">Consentement requis</span>
                  </p>
                </div>
                <ul className="space-y-1 text-sm text-primary/70 pl-4">
                  <li>• Pages visitées et durée de visite (via Vercel Analytics — anonymisé)</li>
                  <li>• Aucune donnée personnelle identifiable n&apos;est collectée</li>
                </ul>
                <p className="text-xs text-primary/50 mt-2 italic">
                  Durée de conservation : jusqu&apos;à 12 mois
                </p>
              </div>
            </div>
          </Section>

          <Section title="3. Ce site n'utilise PAS">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><BulletNo /><span>Google Analytics ou tout équivalent</span></li>
              <li className="flex items-start gap-2"><BulletNo /><span>Facebook Pixel ou traceurs de réseaux sociaux</span></li>
              <li className="flex items-start gap-2"><BulletNo /><span>Cookies publicitaires ou de reciblage commercial</span></li>
              <li className="flex items-start gap-2"><BulletNo /><span>Traceurs de comportement à des fins commerciales</span></li>
              <li className="flex items-start gap-2"><BulletNo /><span>Partage de données avec des tiers à des fins publicitaires</span></li>
            </ul>
          </Section>

          <Section title="4. Votre consentement">
            <p className="mb-3">
              Conformément à la Loi 09-08 et au RGPD, seuls les cookies essentiels sont déposés sans
              votre consentement. Les cookies fonctionnels et analytiques ne sont activés qu&apos;après
              votre accord explicite.
            </p>
            <p>
              Aucune case n&apos;est pré-cochée — vous faites un choix actif. Vous pouvez modifier
              votre consentement à tout moment via le bouton &laquo; Gestion des cookies &raquo; en
              pied de page.
            </p>
          </Section>

          <Section title="5. Comment gérer vos cookies ?">
            <p className="mb-3">Vous disposez de plusieurs options :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span><strong>Via notre bannière :</strong> cliquez sur &laquo; Gestion des cookies &raquo; en bas de chaque page pour modifier vos préférences à tout moment</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Via votre navigateur — Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et autres données de sites</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Via votre navigateur — Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies et données de sites</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Via votre navigateur — Safari :</strong> Préférences &gt; Confidentialité &gt; Cookies et données de sites web</span></li>
            </ul>
            <p className="mt-3 text-primary/60 italic">
              Attention : la suppression des cookies essentiels peut empêcher l&apos;accès à votre compte
              et désactiver certaines fonctionnalités du site.
            </p>
          </Section>

          <Section title="6. Durées de conservation">
            <table className="w-full text-sm mt-2 border-collapse">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Catégorie</th>
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Durée</th>
                  <th className="text-left py-2 px-3 font-medium text-primary/70 border border-surface-200">Consentement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border border-surface-200 font-medium">Essentiels</td>
                  <td className="py-2 px-3 border border-surface-200">Session à 12 mois</td>
                  <td className="py-2 px-3 border border-surface-200 text-success font-medium">Non requis</td>
                </tr>
                <tr className="bg-surface-50">
                  <td className="py-2 px-3 border border-surface-200 font-medium">Fonctionnels</td>
                  <td className="py-2 px-3 border border-surface-200">6 mois</td>
                  <td className="py-2 px-3 border border-surface-200 text-warning font-medium">Requis</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-surface-200 font-medium">Analytiques</td>
                  <td className="py-2 px-3 border border-surface-200">12 mois</td>
                  <td className="py-2 px-3 border border-surface-200 text-warning font-medium">Requis</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="7. Autorités de contrôle">
            <ul className="space-y-1 text-sm">
              <li><span className="text-primary/50">Maroc :</span> CNDP —{' '}<a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">cndp.ma</a></li>
              <li><span className="text-primary/50">France (utilisateurs UE) :</span> CNIL —{' '}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">cnil.fr</a></li>
            </ul>
          </Section>

          <Section title="8. Contact">
            <p>
              Pour toute question relative à l&apos;utilisation des cookies sur ce site :{' '}
              <a href="mailto:moroccowallstreet@gmail.com" className="text-secondary hover:underline">
                moroccowallstreet@gmail.com
              </a>
            </p>
          </Section>

        </div>

        <EduBannerInline />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4 text-sm flex-wrap">
          <Link href="/mentions-legales" className="text-secondary hover:underline font-medium">Mentions légales</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/confidentialite" className="text-secondary hover:underline font-medium">Politique de confidentialité</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/politique-risques" className="text-secondary hover:underline font-medium">Politique de risques</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/" className="text-primary/50 hover:text-primary transition-colors">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium mb-4 pb-2 border-b border-[var(--border)]" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>{children}</div>
    </section>
  );
}

function Bullet() {
  return <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: 'var(--gold)' }} />;
}

function BulletNo() {
  return <span className="flex-shrink-0 text-danger font-medium text-xs mt-0.5">✕</span>;
}
