'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function LearnCTA() {
  const { t } = useTranslation('portfolio');

  return (
    <div
      className="rounded-2xl shadow-lg p-8 text-center"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
    >
      <h2 className="text-2xl font-medium text-white mb-3">
        {t('learn_cta_title')}
      </h2>
      <p className="text-white/75 text-sm mb-6 max-w-md mx-auto">
        {t('learn_cta_body')}
      </p>
      <Link
        href="/learn"
        className="inline-block bg-white text-blue-700 font-medium px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-md text-sm"
      >
        {t('learn_cta_button')}
      </Link>
      <p className="text-white/50 text-xs mt-4">
        {t('learn_cta_disclaimer')}
      </p>
    </div>
  );
}
