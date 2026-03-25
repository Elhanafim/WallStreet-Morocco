'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  canShowPrompt,
  markShown,
  registerPromptVisible,
  registerPromptHidden,
  DONATE_KEYS,
} from '@/services/donatePromptService';

interface Props {
  ticker: string;
  onClose: () => void;
}

const COUNTDOWN = 5;

/**
 * Shown once after a user adds their first holding (or after 30-day cooldown).
 * Auto-closes in 5 seconds with a countdown progress bar.
 */
export default function AfterHoldingDonateModal({ ticker, onClose }: Props) {
  const { t } = useTranslation('donate');
  const router = useRouter();
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    registerPromptVisible();
    markShown(DONATE_KEYS.promptLastShown);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          registerPromptHidden();
          onClose();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      clearInterval(intervalRef.current!);
      registerPromptHidden();
    };
  }, [onClose]);

  const handleDonate = () => {
    clearInterval(intervalRef.current!);
    registerPromptHidden();
    onClose();
    router.push('/donate');
  };

  const handleSkip = () => {
    clearInterval(intervalRef.current!);
    registerPromptHidden();
    onClose();
  };

  const progress = ((COUNTDOWN - seconds) / COUNTDOWN) * 100;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,37,64,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-[#c1272d] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>

          <h2 className="text-base font-black text-gray-900 mb-1">
            ✅ {ticker} — {t('afterHoldingTitle')}
          </h2>

          <div className="w-12 h-px bg-gray-100 mx-auto my-4" />

          <p className="text-sm text-gray-600 leading-relaxed mb-1">
            {t('afterHoldingBody')}
          </p>
          <p className="text-sm font-semibold text-gray-800 mb-6">
            {t('afterHoldingAsk')}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDonate}
              className="flex-1 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors hover:opacity-90"
              style={{ background: '#c1272d' }}
            >
              {t('afterHoldingBtn')}
            </button>
            <button
              onClick={handleSkip}
              className="flex-shrink-0 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              {t('afterHoldingSkip')}
            </button>
          </div>

          <p className="text-xs text-gray-300 mt-4">
            {t('afterHoldingCountdown', { n: seconds })}
          </p>
        </div>
      </div>
    </div>
  );
}
