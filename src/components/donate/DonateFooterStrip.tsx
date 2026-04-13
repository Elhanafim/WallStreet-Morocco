'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function DonateFooterStrip() {
  const { t } = useTranslation('donate');
  return (
    <div className="bg-[var(--bg-surface)] border-t border-[var(--border)] py-8 px-[var(--space-md)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-display text-[22px] font-medium text-[var(--text-primary)] leading-tight mb-1">
            {t('footerMessage')}
          </p>
          <p className="font-body text-[14px] text-[var(--text-secondary)]">{t('footerSub')}</p>
        </div>
        <Link
          href="/donate"
          className="bg-[var(--gold)] text-[var(--bg-base)] px-8 py-3 rounded-[6px] font-body text-[14px] font-medium transition-all hover:brightness-110 whitespace-nowrap"
        >
          {t('footerCta')}
        </Link>
      </div>
    </div>
  );
}
