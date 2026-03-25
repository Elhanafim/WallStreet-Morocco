'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  trackPageView,
  getEngagementScore,
  canShowPrompt,
  canShowAnotherPrompt,
  markShown,
  registerPromptVisible,
  registerPromptHidden,
  DONATE_KEYS,
} from '@/services/donatePromptService';

/** Smart engagement toast — slides in from bottom-left, max once per 14 days, score ≥ 10. */
export default function DonateToast({ holdingsCount = 0 }: { holdingsCount?: number }) {
  const { t } = useTranslation('donate');
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shownThisSession = useRef(false);

  // Track every route change
  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  // Evaluate on route change (with 8-minute grace period built into score)
  useEffect(() => {
    if (pathname === '/donate') return;
    if (shownThisSession.current) return;

    const check = () => {
      const score = getEngagementScore(holdingsCount);
      if (
        score >= 10 &&
        canShowPrompt(DONATE_KEYS.toastLastShown) &&
        canShowAnotherPrompt()
      ) {
        setVisible(true);
        shownThisSession.current = true;
        registerPromptVisible();
        markShown(DONATE_KEYS.toastLastShown);
      }
    };

    // Slight delay so the score has time to accumulate on fast navigation
    const timer = setTimeout(check, 2000);
    return () => clearTimeout(timer);
  }, [pathname, holdingsCount]);

  const dismiss = () => {
    setVisible(false);
    registerPromptHidden();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-5 z-[60] w-80 animate-slide-in-left">
      <div
        className="bg-[#1a1a2e] text-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ borderLeft: '3px solid #c1272d' }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-bold leading-snug">{t('toastTitle')}</p>
            <button
              onClick={dismiss}
              className="text-white/40 hover:text-white/80 flex-shrink-0 transition-colors mt-0.5"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/60 text-xs leading-relaxed mb-4">{t('toastBody')}</p>
          <div className="flex items-center gap-2">
            <Link
              href="/donate"
              onClick={dismiss}
              className="flex-1 text-center text-xs font-bold py-2 px-3 rounded-xl transition-colors text-white"
              style={{ background: '#c1272d' }}
            >
              {t('toastBtn')}
            </Link>
            <button
              onClick={dismiss}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
