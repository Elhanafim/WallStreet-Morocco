'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function DonateFooterStrip() {
  const { t } = useTranslation('donate');
  return (
    <div style={{ background: '#1a1a2e' }} className="py-5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-white text-sm font-semibold">
            🇲🇦 {t('footerMessage')}
          </p>
          <p className="text-gray-400 text-xs mt-1">{t('footerSub')}</p>
        </div>
        <Link
          href="/donate"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#1a1a2e] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm"
        >
          {t('footerCta')}
        </Link>
      </div>
    </div>
  );
}
