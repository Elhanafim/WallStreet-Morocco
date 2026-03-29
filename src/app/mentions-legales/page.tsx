import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales | WallStreet Morocco',
  description:
    "Mentions légales de WallStreet Morocco — éditeur, hébergeur, propriété intellectuelle, limitation de responsabilité. Site d'éducation financière sur la Bourse de Casablanca.",
};

export default function MentionsLegalesPage() {
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
              <Scale className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Mentions légales</h1>
              <p className="text-white/50 text-sm mt-1">
                Dernière mise à jour : 25 mars 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 sm:p-10 space-y-10">

          <Section title="1. Éditeur du site">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <Row label="Nom" value="Mohammed El Hanafi" />
                <Row label="Qualité" value="Particulier — Responsable éditorial" />
                <Row label="Email" value={<a href="mailto:mohamed345el@gmail.com" className="text-secondary hover:underline">mohamed345el@gmail.com</a>} />
                <Row label="Téléphone" value="+33 7 43 52 76 04" />
                <Row label="WhatsApp" value={<a href="https://wa.me/33743527604" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">wa.me/33743527604</a>} />
                <Row label="Instagram" value={<a href="https://www.instagram.com/wallstreet.morocco" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">@wallstreet.morocco</a>} />
                <Row label="Pays de résidence" value="France" />
                <Row label="Nationalité" value="Marocaine" />
              </tbody>
            </table>
          </Section>

          <Section title="2. Responsable de la publication">
            <p>
              Mohammed El Hanafi est le seul responsable du contenu publié sur WallStreet Morocco.
              Ce site est un projet personnel indépendant, sans actionnaire ni structure juridique commerciale.
            </p>
          </Section>

          <Section title="3. Hébergeur du site">
            <p className="mb-3">Le site est hébergé par :</p>
            <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-sm space-y-1">
              <p className="font-bold text-primary">Vercel Inc.</p>
              <p className="text-primary/70">340 Pine Street, Suite 700</p>
              <p className="text-primary/70">San Francisco, CA 94104, USA</p>
              <p className="text-primary/70">
                Site :{' '}
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                  vercel.com
                </a>
              </p>
            </div>
            <p className="mt-3 text-primary/60 text-sm">
              La base de données est hébergée par Neon (PostgreSQL) dans la région EU-West-2 (Irlande).
            </p>
          </Section>

          <Section title="4. Nature du site">
            <p>
              WallStreet Morocco est un <strong>site d&apos;information et d&apos;éducation financière</strong> à
              destination du grand public, consacré à la Bourse de Casablanca (BVC) et aux marchés
              financiers marocains. Ce site est un projet personnel indépendant, sans lien avec la
              Bourse de Casablanca SA, Bank Al-Maghrib, l&apos;AMMC ou tout autre organisme officiel.
            </p>
          </Section>

          <Section title="5. Absence d'agrément">
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-5 space-y-2">
              <p className="font-bold text-danger text-sm">⚠️ WallStreet Morocco N&apos;EST PAS agréé par :</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2"><Bullet /><span>L&apos;Autorité Marocaine du Marché des Capitaux (AMMC) — <a href="https://www.ammc.ma" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">ammc.ma</a></span></li>
                <li className="flex items-start gap-2"><Bullet /><span>Le Conseil Déontologique des Valeurs Mobilières (CDVM)</span></li>
                <li className="flex items-start gap-2"><Bullet /><span>Aucune autorité de régulation financière marocaine ou européenne</span></li>
              </ul>
              <p className="text-sm text-primary/70 pt-2 border-t border-danger/10">
                Ce site ne fournit <strong>PAS</strong> de services d&apos;investissement au sens de la loi
                marocaine n° 43-12 relative à l&apos;AMMC, ni de conseil financier réglementé au sens de
                la Directive MIF 2 (Union européenne).
              </p>
            </div>
          </Section>

          <Section title="6. Propriété intellectuelle">
            <p>
              L&apos;ensemble du contenu de ce site (textes, analyses, graphiques, code source, mise en
              page) est la propriété exclusive de Mohammed El Hanafi, sauf mention contraire. Toute
              reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
            <p className="mt-3">
              Les données de marché sont fournies par des sources tierces (Bourse de Casablanca,
              Leboursier.ma, Finnhub, ForexFactory, TradingView) et restent la propriété de leurs
              fournisseurs respectifs. WallStreet Morocco ne revendique aucun droit de propriété sur
              ces données tierces.
            </p>
          </Section>

          <Section title="7. Limitation de responsabilité">
            <p className="mb-3">
              Mohammed El Hanafi ne peut être tenu responsable :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Des décisions financières prises sur la base des informations publiées sur ce site</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Des pertes financières en résultant, en totalité ou en partie</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Des erreurs, retards ou omissions dans les données de marché affichées</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Des interruptions de service, indisponibilités ou dysfonctionnements techniques</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Du contenu de sites tiers vers lesquels ce site pointe par des liens hypertexte</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>De tout accès non autorisé résultant d&apos;un acte malveillant tiers (piratage, intrusion)</span></li>
            </ul>
          </Section>

          <Section title="8. Données personnelles">
            <p>
              Le traitement des données personnelles est décrit dans la{' '}
              <Link href="/confidentialite" className="text-secondary hover:underline font-medium">
                Politique de confidentialité
              </Link>
              , conforme à la Loi 09-08 (Maroc) et au RGPD (Union européenne).
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              L&apos;utilisation des cookies est décrite dans la{' '}
              <Link href="/politique-cookies" className="text-secondary hover:underline font-medium">
                Politique de cookies
              </Link>
              . Vous pouvez gérer vos préférences à tout moment via le lien en pied de page.
            </p>
          </Section>

          <Section title="10. Droit applicable et juridiction">
            <p>
              Les présentes mentions légales sont régies par le <strong>droit marocain</strong>. Tout
              litige découlant de l&apos;utilisation de ce site, non résolu à l&apos;amiable, sera soumis à la
              compétence exclusive des tribunaux compétents de <strong>Casablanca, Maroc</strong>.
            </p>
          </Section>

          <Section title="11. Contact">
            <ul className="space-y-1 text-sm">
              <li><span className="text-primary/50">Email :</span>{' '}<a href="mailto:mohamed345el@gmail.com" className="text-secondary hover:underline">mohamed345el@gmail.com</a></li>
              <li><span className="text-primary/50">Instagram :</span>{' '}<a href="https://www.instagram.com/wallstreet.morocco" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">@wallstreet.morocco</a></li>
            </ul>
          </Section>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4 text-sm flex-wrap">
          <Link href="/confidentialite" className="text-secondary hover:underline font-medium">Politique de confidentialité</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/terms" className="text-secondary hover:underline font-medium">Conditions d&apos;utilisation</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/politique-cookies" className="text-secondary hover:underline font-medium">Politique de cookies</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/politique-risques" className="text-secondary hover:underline font-medium">Politique de risques</Link>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-surface-100 last:border-0">
      <td className="py-2 pr-4 font-semibold text-primary/50 whitespace-nowrap">{label}</td>
      <td className="py-2 text-primary">{value}</td>
    </tr>
  );
}

function Bullet() {
  return <span className="flex-shrink-0 w-1.5 h-1.5 bg-secondary rounded-full mt-1.5" />;
}
