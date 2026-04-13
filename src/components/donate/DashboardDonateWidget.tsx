'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  canShowPrompt,
  markShown,
  registerPromptVisible,
  registerPromptHidden,
  canShowAnotherPrompt,
  DONATE_KEYS,
} from '@/services/donatePromptService';

/** Dashboard widget — shown once every 30 days, hidden after visiting /donate. */
export default function DashboardDonateWidget() {
  const { t } = useTranslation('donate');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      canShowPrompt(DONATE_KEYS.dashboardDismissed) &&
      canShowAnotherPrompt()
    ) {
      setShow(true);
      registerPromptVisible();
    }
  }, []);

  const dismiss = () => {
    markShown(DONATE_KEYS.dashboardDismissed);
    registerPromptHidden();
    setShow(false);
  };

  const snooze = () => {
    // 7-day snooze: set timestamp to 23 days ago so cooldown fires in 7 more days
    const sevenDaysAgo = Date.now() - 23 * 86_400_000;
    try { localStorage.setItem(DONATE_KEYS.dashboardDismissed, String(sevenDaysAgo)); } catch {}
    registerPromptHidden();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="bg-white rounded-xl p-5 mb-6"
      style={{
        border: '1px solid #fee2e2',
        borderTop: '3px solid #c1272d',
      }}
    >
      <p className="text-sm font-medium text-gray-900 mb-2">🏗️ {t('dashboardTitle')}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{t('dashboardBody')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/donate"
          onClick={dismiss}
          className="inline-flex items-center gap-1.5 text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors hover:opacity-90"
          style={{ background: '#c1272d' }}
        >
          {t('dashboardBtn')}
        </Link>
        <button
          onClick={snooze}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t('dashboardSnooze')}
        </button>
      </div>
    </div>
  );
}
