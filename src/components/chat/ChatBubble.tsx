"use client";

/**
 * Floating chat bubble — the entry point for the AI chatbot.
 * Mounts globally (via ConditionalLayout), manages all chat state.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useChatState } from "@/hooks/useChatState";
import { useChatContext } from "@/hooks/useChatContext";
import ChatPanel from "./ChatPanel";

const TOOLTIP_DELAY_MS = 20_000; // 20 s before proactive tooltip
const GREETED_KEY = "wsma_chat_greeted";

export default function ChatBubble() {
  const { t } = useTranslation("chat");
  const chat = useChatState();
  const context = useChatContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Proactive tooltip — show once ever after 20 s if panel never opened
  useEffect(() => {
    const alreadyGreeted =
      typeof window !== "undefined" && localStorage.getItem(GREETED_KEY) === "1";
    if (alreadyGreeted || chat.isOpen) return;

    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, TOOLTIP_DELAY_MS);

    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark greeted on first open
  const handleOpen = () => {
    setShowTooltip(false);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    if (typeof window !== "undefined") {
      localStorage.setItem(GREETED_KEY, "1");
    }
    chat.open();
  };

  const handleSend = (text: string) => {
    chat.sendMessage(text, context);
  };

  return (
    <>
      {/* Chat panel */}
      <ChatPanel
        messages={chat.messages}
        streamingContent={chat.streamingContent}
        isStreaming={chat.isStreaming}
        isOpen={chat.isOpen}
        onClose={chat.close}
        onSend={handleSend}
        onCancel={chat.cancelStream}
        context={context}
        hasGreeted={chat.hasGreeted}
      />

      {/* Floating bubble */}
      <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
        {/* Proactive tooltip */}
        {showTooltip && !chat.isOpen && (
          <div className="relative max-w-[220px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 animate-fade-in">
            {t("proactiveTooltip", "Une question sur la Bourse de Casablanca ? 💬")}
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] flex items-center justify-center leading-none"
              aria-label="Fermer"
            >
              ×
            </button>
            {/* Arrow */}
            <span className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
          </div>
        )}

        {/* Bubble button */}
        <button
          onClick={chat.isOpen ? chat.close : handleOpen}
          className="relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg transition-all duration-200 flex items-center justify-center"
          aria-label={
            chat.isOpen
              ? t("closeChat", "Fermer le chat")
              : t("openChat", "Ouvrir l'assistant")
          }
        >
          {/* Unread badge */}
          {!chat.isOpen && chat.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
            </span>
          )}

          {/* Icon: chat / close */}
          {chat.isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
