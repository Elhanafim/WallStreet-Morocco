'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie, Settings, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  consentGiven,
  needsNewConsent,
  saveConsent,
  clearNonEssentialData,
} from '@/utils/consentManager';

type View = 'banner' | 'manage';

interface CategoryRow {
  key: 'functional' | 'analytics';
  labelKey: string;
  descKey: string;
}

const CATEGORIES: CategoryRow[] = [
  { key: 'functional', labelKey: 'cookies.categories.functional', descKey: 'cookies.categories.functionalDesc' },
  { key: 'analytics',  labelKey: 'cookies.categories.analytics',  descKey: 'cookies.categories.analyticsDesc' },
];

interface Props {
  /** Called when the banner is dismissed (any choice). */
  onClose?: () => void;
}

export default function CookieBanner({ onClose }: Props) {
  const { t } = useTranslation('legal');
  const [visible, setVisible]     = useState(false);
  const [view, setView]           = useState<View>('banner');
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics]   = useState(false);

  // Determine whether to show on mount
  useEffect(() => {
    if (needsNewConsent()) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    onClose?.();
  };

  const acceptAll = () => {
    saveConsent({ essential: true, functional: true, analytics: true });
    dismiss();
  };

  const essentialOnly = () => {
    saveConsent({ essential: true, functional: false, analytics: false });
    clearNonEssentialData();
    dismiss();
  };

  const decline = () => {
    saveConsent({ essential: true, functional: false, analytics: false });
    clearNonEssentialData();
    dismiss();
  };

  const saveManaged = () => {
    saveConsent({ essential: true, functional, analytics });
    if (!functional && !analytics) clearNonEssentialData();
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#1a1a2e] border-t border-white/10 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des cookies"
    >
      {view === 'banner' ? (
        /* ── Simple banner view ─────────────────────────────────────────── */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Icon + text */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-1">{t('cookies.bannerTitle')}</p>
                <p className="text-white/60 text-xs leading-relaxed">
                  {t('cookies.bannerText')}{' '}
                  {t('cookies.learnMore')}{' '}
                  <Link href="/confidentialite" className="text-accent underline hover:text-accent/80">
                    {t('cookies.privacyLink')}
                  </Link>{' '}
                  {t('cookies.and')}{' '}
                  <Link href="/terms" className="text-accent underline hover:text-accent/80">
                    {t('cookies.termsLink')}
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setView('manage')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/20 text-white/60 text-xs font-medium hover:border-white/40 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                {t('cookies.manage')}
              </button>
              <button
                onClick={decline}
                className="px-3 py-2 rounded-lg border border-white/20 text-white/60 text-xs font-medium hover:border-white/40 hover:text-white transition-colors"
              >
                {t('cookies.decline')}
              </button>
              <button
                onClick={essentialOnly}
                className="px-3 py-2 rounded-lg border border-white/40 text-white text-xs font-medium hover:bg-white/10 transition-colors"
              >
                {t('cookies.essentialOnly')}
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors shadow-md"
              >
                {t('cookies.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Manage view ─────────────────────────────────────────────────── */
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-medium text-base">{t('cookies.manage')}</h2>
            <button
              onClick={() => setView('banner')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Retour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {/* Essential — always on, cannot toggle */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
              <div>
                <p className="text-white text-sm font-medium">{t('cookies.categories.essential')}</p>
                <p className="text-white/50 text-xs mt-0.5">{t('cookies.categories.essentialDesc')}</p>
              </div>
              <div className="flex items-center gap-1.5 text-success text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                Actifs
              </div>
            </div>

            {CATEGORIES.map(({ key, labelKey, descKey }) => (
              <div key={key} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <p className="text-white text-sm font-medium">{t(labelKey)}</p>
                  <p className="text-white/50 text-xs mt-0.5">{t(descKey)}</p>
                </div>
                <button
                  onClick={() =>
                    key === 'functional'
                      ? setFunctional((p) => !p)
                      : setAnalytics((p) => !p)
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    (key === 'functional' ? functional : analytics)
                      ? 'bg-success'
                      : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={key === 'functional' ? functional : analytics}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      (key === 'functional' ? functional : analytics)
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveManaged}
              className="flex-1 py-2.5 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
            >
              {t('cookies.savePreferences')}
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {t('cookies.acceptAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
