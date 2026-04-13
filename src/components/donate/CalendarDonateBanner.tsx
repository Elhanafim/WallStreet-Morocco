'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  canShowPrompt,
  markShown,
  canShowAnotherPrompt,
  registerPromptVisible,
  registerPromptHidden,
  DONATE_KEYS,
} from '@/services/donatePromptService';

/** Slides in between the filter bar and the event list after 3 minutes on the calendar page. */
export default function CalendarDonateBanner() {
  const { t } = useTranslation('donate');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      !canShowPrompt(DONATE_KEYS.calendarDismissed) ||
      !canShowAnotherPrompt()
    ) return;

    const timer = setTimeout(() => {
      setShow(true);
      registerPromptVisible();
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    markShown(DONATE_KEYS.calendarDismissed);
    registerPromptHidden();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-4"
      style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
      }}
    >
      <p className="text-xs text-amber-800 leading-relaxed flex-1">
        ♥ {t('calendarBanner')}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/donate"
          onClick={dismiss}
          className="text-white font-medium text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-90 whitespace-nowrap"
          style={{ background: '#c1272d' }}
        >
          {t('calendarBtn')}
        </Link>
        <button
          onClick={dismiss}
          className="text-amber-600/60 hover:text-amber-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
