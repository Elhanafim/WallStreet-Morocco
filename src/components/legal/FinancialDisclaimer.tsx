/**
 * FinancialDisclaimer — reusable legal disclaimer component.
 *
 * Three variants:
 *   full   — bordered card (legal pages, Portfolio, Fondateur)
 *   short  — compact dark bar (Market, Calendar, Dashboard, Learn)
 *   inline — small muted text below metrics/charts
 */

interface Props {
  variant?: 'full' | 'short' | 'inline';
  className?: string;
}

export default function FinancialDisclaimer({ variant = 'short', className = '' }: Props) {
  if (variant === 'full') {
    return (
      <div
        className={className}
        role="note"
        aria-label="Avertissement légal"
        style={{
          borderRadius: '6px',
          border: '1px solid var(--border)',
          borderLeft: '2px solid var(--gold)',
          backgroundColor: 'var(--bg-elevated)',
          padding: '16px 20px',
        }}
      >
        <p
          className="text-xs font-medium mb-1.5 uppercase tracking-wide"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-sans)' }}
        >
          Avertissement légal
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
        >
          Les informations fournies sur ce site sont à titre éducatif uniquement et ne constituent
          en aucun cas un conseil en investissement, une recommandation d&apos;achat ou de vente de
          valeurs mobilières, ni une sollicitation de quelque nature que ce soit.
          L&apos;investissement en bourse comporte des risques importants de perte en capital,
          pouvant aller jusqu&apos;à la perte totale des sommes investies.{' '}
          <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            Les performances passées ne préjugent pas des performances futures.
          </strong>{' '}
          Avant toute décision d&apos;investissement, consultez un conseiller financier agréé par
          l&apos;AMMC sur{' '}
          <a
            href="https://www.ammc.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: 'var(--text-secondary)' }}
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
        className={`flex items-center gap-2 px-3 py-2 ${className}`}
        role="note"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
        }}
      >
        <span
          className="text-[11px] leading-relaxed"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
        >
          Informations éducatives uniquement · Pas un conseil en investissement · Risque de perte en capital
        </span>
      </div>
    );
  }

  // inline
  return (
    <p
      className={`text-[11px] leading-relaxed italic ${className}`}
      role="note"
      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
    >
      Les performances affichées sont calculées sur données historiques et ne garantissent pas de
      résultats futurs.
    </p>
  );
}
