/**
 * FinancialDisclaimer — reusable legal disclaimer component.
 *
 * Three variants:
 *   full   — amber card with left border (Fondateur, Portfolio, legal pages)
 *   short  — compact grey bar (Market, Calendar, Dashboard, Learn)
 *   inline — grey italic text below metrics/charts
 */

interface Props {
  variant?: 'full' | 'short' | 'inline';
  className?: string;
}

export default function FinancialDisclaimer({ variant = 'short', className = '' }: Props) {
  if (variant === 'full') {
    return (
      <div
        className={`rounded-xl border border-amber-200 bg-amber-50 border-l-4 border-l-amber-400 px-5 py-4 ${className}`}
        role="note"
        aria-label="Avertissement légal"
      >
        <p className="text-amber-800 font-bold text-sm mb-1">
          ⚠️ Avertissement légal
        </p>
        <p className="text-amber-700 text-xs leading-relaxed">
          Les informations fournies sur ce site sont à titre éducatif uniquement et ne constituent
          en aucun cas un conseil en investissement, une recommandation d&apos;achat ou de vente de
          valeurs mobilières, ni une sollicitation de quelque nature que ce soit.
          L&apos;investissement en bourse comporte des risques importants de perte en capital,
          pouvant aller jusqu&apos;à la perte totale des sommes investies.{' '}
          <strong className="text-amber-800">
            Les performances passées ne préjugent pas des performances futures.
          </strong>{' '}
          Avant toute décision d&apos;investissement, consultez un conseiller financier agréé par
          l&apos;AMMC (Autorité Marocaine du Marché des Capitaux) sur{' '}
          <a
            href="https://www.ammc.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            ammc.ma
          </a>
          .
        </p>
      </div>
    );
  }

  if (variant === 'short') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-surface-100 border border-surface-200 rounded-lg ${className}`}
        role="note"
      >
        <span className="text-[11px] text-primary/40 leading-relaxed">
          ℹ️ Informations éducatives uniquement · Pas un conseil en investissement · Risque de perte
          en capital
        </span>
      </div>
    );
  }

  // inline
  return (
    <p className={`text-[11px] text-primary/40 italic leading-relaxed ${className}`} role="note">
      Les performances affichées sont calculées sur données historiques et ne garantissent pas de
      résultats futurs.
    </p>
  );
}
