import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de risques | WallStreet Morocco',
  description:
    "Avertissements sur les risques financiers liés à l'investissement en bourse. À lire avant d'utiliser le portefeuille WallStreet Morocco.",
};

export default function PolitiqueRisquesPage() {
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
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Politique de risques et avertissements
              </h1>
              <p className="text-white/50 text-sm mt-1">Dernière mise à jour : 25 mars 2026</p>
            </div>
          </div>
          <div className="bg-warning/20 border border-warning/40 rounded-xl px-5 py-3 mt-4">
            <p className="text-warning text-sm font-semibold">
              ⚠️ À lire attentivement avant d&apos;utiliser le portefeuille ou de prendre toute
              décision d&apos;investissement.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8 sm:p-10 space-y-10">

          {/* Main warning box */}
          <div className="bg-danger/5 border-l-4 border-danger rounded-xl p-5">
            <p className="font-black text-danger text-base mb-2">⚠️ AVERTISSEMENT GÉNÉRAL</p>
            <p className="text-primary/80 text-sm leading-relaxed">
              <strong>WallStreet Morocco est un outil éducatif.</strong> Aucune information publiée
              ici ne doit être considérée comme un conseil financier professionnel. WallStreet Morocco
              n&apos;est <strong>pas agréé par l&apos;AMMC</strong> (Autorité Marocaine du Marché des Capitaux)
              et ne fournit pas de services d&apos;investissement réglementés.
            </p>
          </div>

          <Section title="1. Risques liés à l'investissement en bourse">
            <p className="mb-4">
              L&apos;investissement en valeurs mobilières cotées à la Bourse de Casablanca ou sur tout
              autre marché financier expose l&apos;investisseur aux risques suivants :
            </p>

            <div className="space-y-4">
              <RiskCard
                color="red"
                title="Risque de perte en capital"
                description="Le cours d'une action peut baisser de manière significative, voire tomber à zéro en cas de faillite de l'émetteur. Vous pouvez perdre tout ou partie du capital investi. Cette perte peut être totale et définitive."
              />
              <RiskCard
                color="red"
                title="Risque de marché"
                description="Les cours sont influencés par des facteurs macro-économiques, géopolitiques, sectoriels et psychologiques (sentiment de marché) qui peuvent provoquer des baisses soudaines, importantes et imprévisibles."
              />
              <RiskCard
                color="orange"
                title="Risque de liquidité"
                description="Certains titres cotés à la BVC présentent des volumes d'échange faibles, rendant difficile la revente rapide à un prix satisfaisant. Vous pourriez ne pas pouvoir vendre vos titres au moment souhaité."
              />
              <RiskCard
                color="orange"
                title="Risque de change"
                description="Pour les instruments libellés en devises étrangères, les fluctuations du taux de change (MAD/EUR, MAD/USD) peuvent amplifier les pertes, indépendamment de la performance du titre lui-même."
              />
              <RiskCard
                color="yellow"
                title="Risque de concentration"
                description="Investir une part importante de son capital dans un seul titre, un seul secteur ou un seul marché augmente significativement le risque global de perte par rapport à un portefeuille diversifié."
              />
              <RiskCard
                color="yellow"
                title="Risque sectoriel"
                description="Certains secteurs (mines, immobilier, banques) sont plus sensibles aux cycles économiques, aux taux d'intérêt ou aux matières premières. Une exposition sectorielle forte amplifie la volatilité du portefeuille."
              />
            </div>
          </Section>

          <Section title="2. Les performances passées ne garantissent pas les performances futures">
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <p className="font-black text-warning-700 text-sm mb-2">
                ⚠️ AVERTISSEMENT ESSENTIEL
              </p>
              <p className="text-primary/80 text-sm leading-relaxed">
                Toutes les performances historiques affichées sur ce site — qu&apos;il s&apos;agisse du
                portefeuille du fondateur, des données MASI, des performances de fonds OPCVM ou de
                toute autre donnée chiffrée — sont présentées à titre{' '}
                <strong>informatif et éducatif uniquement</strong>. Elles ne constituent en aucun cas
                une garantie, une promesse ou une projection de résultats futurs. Les conditions de
                marché passées ne se reproduiront pas nécessairement.
              </p>
            </div>
          </Section>

          <Section title="3. Obligation de se renseigner">
            <p className="mb-3">
              Avant tout investissement, l&apos;utilisateur est tenu de :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span>Lire les notes d&apos;information et prospectus des émetteurs, disponibles sur <a href="https://www.ammc.ma" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">ammc.ma</a></span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Comprendre les caractéristiques, les risques et la liquidité du titre visé</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Évaluer sa propre situation financière, son horizon d&apos;investissement et sa tolérance au risque</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Consulter un conseiller financier agréé AMMC si nécessaire</span></li>
              <li className="flex items-start gap-2"><Bullet /><span>Ne jamais investir des sommes dont il aurait besoin à court terme ou des sommes empruntées</span></li>
            </ul>
          </Section>

          <Section title="4. Spécificités de la Bourse de Casablanca (BVC)">
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><Bullet /><span><strong>Marché de taille moyenne</strong> : la BVC est plus petite et moins liquide que les grandes bourses mondiales (NYSE, Euronext, LSE), ce qui amplifie les risques de liquidité</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Concentration sectorielle</strong> : les secteurs bancaire, télécom et immobilier représentent une part importante du MASI, réduisant la diversification naturelle de l&apos;indice</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Horaires limités</strong> : séances du lundi au vendredi de 09h30 à 15h30 (heure de Casablanca) — impossibilité de réagir en dehors de ces horaires</span></li>
              <li className="flex items-start gap-2"><Bullet /><span><strong>Données en différé</strong> : les cours affichés sur WallStreet Morocco sont fournis avec un délai minimum de 15 minutes et ne doivent pas être utilisés pour des décisions de trading en temps réel</span></li>
            </ul>
          </Section>

          <Section title="5. Ressources officielles">
            <p className="mb-3">Avant d&apos;investir, consultez les sources officielles :</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'Bourse de Casablanca', url: 'https://www.casablanca-bourse.com', desc: 'Cours officiels, émetteurs, actualités BVC' },
                { name: 'AMMC', url: 'https://www.ammc.ma', desc: "Autorité de régulation — notes d'information, agrément des intermédiaires" },
                { name: 'Bank Al-Maghrib', url: 'https://www.bkam.ma', desc: 'Politique monétaire, taux directeur, données macro' },
                { name: 'HCP', url: 'https://www.hcp.ma', desc: 'Données économiques et sociales du Maroc' },
              ].map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-surface-200 rounded-xl p-4 hover:border-secondary/50 hover:shadow-card transition-all group"
                >
                  <p className="font-bold text-primary text-sm group-hover:text-secondary transition-colors">
                    {r.name} ↗
                  </p>
                  <p className="text-primary/50 text-xs mt-1">{r.desc}</p>
                </a>
              ))}
            </div>
          </Section>

          <Section title="6. Limitation de responsabilité de WallStreet Morocco">
            <p>
              Dans les limites permises par la loi applicable, WallStreet Morocco décline toute
              responsabilité pour les pertes financières, directes ou indirectes, consécutives à
              l&apos;utilisation des informations publiées sur ce site, à l&apos;utilisation du portefeuille
              simulatif ou à des décisions d&apos;investissement prises sur la base des contenus de ce
              site. L&apos;utilisateur reconnaît avoir pris connaissance des risques mentionnés dans cette
              politique et assume l&apos;entière responsabilité de ses décisions financières.
            </p>
          </Section>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-4 text-sm flex-wrap">
          <Link href="/mentions-legales" className="text-secondary hover:underline font-medium">Mentions légales</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/terms" className="text-secondary hover:underline font-medium">Conditions d&apos;utilisation</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/confidentialite" className="text-secondary hover:underline font-medium">Politique de confidentialité</Link>
          <span className="text-primary/20 hidden sm:block">·</span>
          <Link href="/politique-cookies" className="text-secondary hover:underline font-medium">Politique de cookies</Link>
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

function RiskCard({ color, title, description }: { color: 'red' | 'orange' | 'yellow'; title: string; description: string }) {
  const styles: Record<string, string> = {
    red:    'bg-red-50 border-red-200 text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  const dots: Record<string, string> = { red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-amber-500' };
  return (
    <div className={`border rounded-xl p-4 ${styles[color]}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[color]}`} />
        <p className="font-bold text-sm">{title}</p>
      </div>
      <p className="text-xs leading-relaxed opacity-90 pl-4">{description}</p>
    </div>
  );
}

function Bullet() {
  return <span className="flex-shrink-0 w-1.5 h-1.5 bg-secondary rounded-full mt-1.5" />;
}
