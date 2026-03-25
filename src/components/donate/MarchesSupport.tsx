'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

/** Permanent single-line strip between indices and stocks sections on the Marchés page. */
export default function MarchesSupport() {
  const { t } = useTranslation('donate');
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5"
      style={{
        borderTop: '1px solid #f3f4f6',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <p className="text-xs text-gray-400">
        📊 {t('marchesStrip')}
      </p>
      <Link
        href="/donate"
        className="text-xs font-bold px-3 py-1 rounded-full border transition-all hover:bg-[#c1272d] hover:text-white hover:border-[#c1272d] whitespace-nowrap"
        style={{ borderColor: '#c1272d', color: '#c1272d' }}
      >
        {t('marchesCta')}
      </Link>
    </div>
  );
}
