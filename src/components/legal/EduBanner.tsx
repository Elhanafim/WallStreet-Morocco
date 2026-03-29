'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function EduBanner() {
  const { t } = useTranslation('legal');

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 py-1.5 px-4">
      <p className="text-center text-xs text-amber-800 font-medium leading-snug flex items-center justify-center gap-1 flex-wrap">
        <span>⚠️ {t('edubanner.text')}</span>
        <Link
          href="/politique-risques"
          className="underline hover:text-amber-900 font-semibold whitespace-nowrap"
        >
          {t('edubanner.link')} →
        </Link>
      </p>
    </div>
  );
}
