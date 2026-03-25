"use client";

/**
 * Contextual chat hint banner — dismissible, shown max once per 7 days.
 * Used on Marchés, Portfolio (empty state), and Learn pages.
 */

import { useEffect, useState } from "react";

interface ChatHintProps {
  storageKey: string;
  icon: string;
  message: string;
  ctaLabel: string;
  /** Optional prefill message to send when CTA is clicked */
  prefillMessage?: string;
  variant?: "banner" | "card"; // banner = slim top strip, card = padded box
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function openChatBubble(prefill?: string) {
  // Dispatch a custom event that ChatBubble listens to
  window.dispatchEvent(
    new CustomEvent("wsma:open-chat", { detail: { prefill: prefill ?? "" } })
  );
}

export default function ChatHint({
  storageKey,
  icon,
  message,
  ctaLabel,
  prefillMessage,
  variant = "banner",
}: ChatHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (Date.now() - ts < TTL_MS) return; // still dismissed
      }
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(storageKey, String(Date.now())); } catch { /* noop */ }
  };

  const handleCta = () => {
    dismiss();
    openChatBubble(prefillMessage);
  };

  if (!visible) return null;

  if (variant === "card") {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{message}</p>
            <button
              onClick={handleCta}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {ctaLabel} →
            </button>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1 shrink-0"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // variant = "banner"
  return (
    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5 text-sm">
      <span className="shrink-0">{icon}</span>
      <p className="flex-1 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{message}</p>
      <button
        onClick={handleCta}
        className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap"
      >
        {ctaLabel} →
      </button>
      <button
        onClick={dismiss}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
        aria-label="Fermer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
