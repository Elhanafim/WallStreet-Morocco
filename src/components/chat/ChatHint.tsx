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
  prefillMessage?: string;
  variant?: "banner" | "card";
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function openChatBubble(prefill?: string) {
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
        if (Date.now() - ts < TTL_MS) return;
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

  const closeIcon = (
    <button
      onClick={dismiss}
      aria-label="Fermer"
      style={{ color: 'var(--text-muted)' }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  if (variant === "card") {
    return (
      <div
        className="p-5 mt-6"
        style={{
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-elevated)',
        }}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <span
              className="shrink-0"
              style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}
            >
              {icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
            <button
              onClick={handleCta}
              className="mt-3 transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--gold)',
              }}
            >
              {ctaLabel} →
            </button>
          </div>
          {closeIcon}
        </div>
      </div>
    );
  }

  // variant = "banner"
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{
        border: '1px solid var(--border)',
        borderRadius: '6px',
        backgroundColor: 'var(--bg-elevated)',
      }}
    >
      {icon && (
        <span
          className="shrink-0"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}
        >
          {icon}
        </span>
      )}
      <p
        className="flex-1"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 300,
          color: 'var(--text-secondary)',
        }}
      >
        {message}
      </p>
      <button
        onClick={handleCta}
        className="shrink-0 transition-colors whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--gold)',
        }}
      >
        {ctaLabel} →
      </button>
      {closeIcon}
    </div>
  );
}
