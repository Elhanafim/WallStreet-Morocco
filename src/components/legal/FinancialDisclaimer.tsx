/**
 * FinancialDisclaimer — reusable legal disclaimer component.
 *
 * Three variants:
 *   full   — amber card with left border (Fondateur, Portfolio, legal pages)
 *   short  — compact dark bar (Market, Calendar, Dashboard, Learn)
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
        className={`rounded-xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 border-l-4 border-l-[#C9A84C]/60 px-5 py-4 ${className}`}
        role="note"
        aria-label="Avertissement légal"
      >
        <p className="text-[#C9A84C] font-bold text-sm mb-1 font-sans">
          ⚠️ Avertissement légal
        </p>
        <p className="text-[#A8B4C8] text-xs leading-relaxed font-sans">
          Les informations fournies sur ce site sont à titre éducatif uniquement et ne constituent
          en aucun cas un conseil en investissement, une recommandation d&apos;achat ou de vente de
          valeurs mobilières, ni une sollicitation de quelque nature que ce soit.
          L&apos;investissement en bourse comporte des risques importants de perte en capital,
          pouvant aller jusqu&apos;à la perte totale des sommes investies.{' '}
          <strong className="text-[#C9A84C]">
            Les performances passées ne préjugent pas des performances futures.
          </strong>{' '}
          Avant toute décision d&apos;investissement, consultez un conseiller financier agréé par
          l&apos;AMMC (Autorité Marocaine du Marché des Capitaux) sur{' '}
          <a
            href="https://www.ammc.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#C9A84C] transition-colors"
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
        className={`flex items-center gap-2 px-3 py-2 bg-[#112240] border border-[#C9A84C]/10 rounded-lg ${className}`}
        role="note"
      >
        <span className="text-[11px] text-[#A8B4C8]/50 leading-relaxed font-sans">
          ℹ️ Informations éducatives uniquement · Pas un conseil en investissement · Risque de perte
          en capital
        </span>
      </div>
    );
  }

  // inline
  return (
    <p className={`text-[11px] text-[#A8B4C8]/40 italic leading-relaxed font-sans ${className}`} role="note">
      Les performances affichées sont calculées sur données historiques et ne garantissent pas de
      résultats futurs.
    </p>
  );
}
