"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onCancel?: () => void;
  isStreaming?: boolean;
  prefillValue?: string;
  onPrefillConsumed?: () => void;
  onTypingStart?: () => void;
}

const MAX_CHARS = 1000;

export default function ChatInput({
  onSend,
  disabled,
  onCancel,
  isStreaming,
  prefillValue,
  onPrefillConsumed,
  onTypingStart,
}: ChatInputProps) {
  const { t } = useTranslation("chat");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply prefill from external source (ChatHint)
  useEffect(() => {
    if (prefillValue) {
      setValue(prefillValue.slice(0, MAX_CHARS));
      textareaRef.current?.focus();
      onPrefillConsumed?.();
    }
  }, [prefillValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 4 + 16; // 4 rows
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const remaining = MAX_CHARS - value.length;
  const nearLimit = remaining <= 100;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                if (e.target.value && !value) onTypingStart?.(); // first keystroke
                setValue(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder", "Posez votre question…")}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition"
            style={{ minHeight: "40px", maxHeight: "112px" }}
          />
          {nearLimit && (
            <span
              className={`absolute bottom-1 right-2 text-xs ${
                remaining <= 0 ? "text-red-500" : "text-yellow-500"
              }`}
            >
              {remaining}
            </span>
          )}
        </div>

        {isStreaming ? (
          <button
            onClick={onCancel}
            className="shrink-0 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition"
            title={t("cancel", "Annuler")}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!value.trim() || disabled}
            className="shrink-0 w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition"
            title={t("send", "Envoyer")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
