'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function DonateFooterStrip() {
  const { t } = useTranslation('donate');
  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }} className="py-5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
            {t('footerMessage')}
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-1">{t('footerSub')}</p>
        </div>
        <Link
          href="/donate"
          className="btn-primary-cta flex-shrink-0 inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
        >
          {t('footerCta')}
        </Link>
      </div>
    </div>
  );
}
