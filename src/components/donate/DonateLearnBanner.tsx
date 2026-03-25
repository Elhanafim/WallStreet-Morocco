'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

/** Static donate nudge at the end of every learning article. Always visible, never dismissible. */
export default function DonateLearnBanner() {
  const { t } = useTranslation('donate');
  return (
    <div
      className="mt-10 rounded-xl p-6"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)',
        borderLeft: '3px solid #f59e0b',
        border: '1px solid #fde68a',
        borderLeftWidth: '3px',
        borderLeftColor: '#f59e0b',
      }}
    >
      <p className="text-sm font-bold text-amber-900 mb-2">📚 {t('learningTitle')}</p>
      <p className="text-xs text-amber-800/80 leading-relaxed mb-1">{t('learningBody')}</p>
      <p className="text-xs text-amber-800/80 leading-relaxed mb-4">{t('learningAsk')}</p>
      <Link
        href="/donate"
        className="inline-flex items-center gap-2 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors hover:opacity-90"
        style={{ background: '#c1272d' }}
      >
        {t('learningBtn')}
      </Link>
    </div>
  );
}
