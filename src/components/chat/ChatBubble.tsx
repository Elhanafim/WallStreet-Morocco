"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useChatState } from "@/hooks/useChatState";
import { useChatContext } from "@/hooks/useChatContext";
import ChatPanel from "./ChatPanel";

const GREETED_KEY = "wsma_chat_greeted";
const BOUNCE_KEY = "wsma_chat_bounce_done"; // sessionStorage
const HINT_KEY = "wsma_chat_hint_shown";   // sessionStorage

export default function ChatBubble() {
  const { t } = useTranslation("chat");
  const chat = useChatState();
  const context = useChatContext();

  const [pulsing, setPulsing] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [prefillInput, setPrefillInput] = useState("");

  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: schedule bounce + hint (once per session)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const bounceDone = sessionStorage.getItem(BOUNCE_KEY) === "1";
    const hintShown = sessionStorage.getItem(HINT_KEY) === "1";

    if (!bounceDone) {
      bounceTimerRef.current = setTimeout(() => {
        setBouncing(true);
        setShowTooltip(true);
        sessionStorage.setItem(BOUNCE_KEY, "1");
        // Stop bounce after animation, hide tooltip after 4 s
        setTimeout(() => setBouncing(false), 700);
        setTimeout(() => setShowTooltip(false), 4700);
      }, 3000);
    }

    if (!hintShown) {
      hintTimerRef.current = setTimeout(() => {
        setShowHint(true);
        sessionStorage.setItem(HINT_KEY, "1");
        setTimeout(() => setShowHint(false), 6000);
      }, 1500);
    }

    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const handleOpen = () => {
    setShowTooltip(false);
    setShowHint(false);
    setPulsing(false); // stop pulsing after first interaction
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (typeof window !== "undefined") {
      localStorage.setItem(GREETED_KEY, "1");
    }
    chat.open();
  };

  const handleToggle = () => {
    if (chat.isOpen) {
      chat.close();
      chat.hideDonateNudge();
    } else {
      handleOpen();
    }
  };

  const handleSend = (text: string) => {
    chat.sendMessage(text, context);
  };

  // Stop pulse once user has opened chat before (persisted)
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(GREETED_KEY) === "1") {
      setPulsing(false);
    }
  }, []);

  // Listen for external open-with-prefill events (from ChatHint component)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ prefill?: string }>).detail;
      setPrefillInput(detail?.prefill ?? "");
      handleOpen();
    };
    window.addEventListener("wsma:open-chat", handler);
    return () => window.removeEventListener("wsma:open-chat", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
        prefillInput={prefillInput}
        onPrefillConsumed={() => setPrefillInput("")}
        showDonateNudge={chat.showDonateNudge}
        onHideDonateNudge={chat.hideDonateNudge}
      />

      {/* bottom-[100px] puts the button above the LanguageSwitcher (which sits at bottom-[28px]) */}
      <div className="fixed bottom-[100px] right-5 z-[1000] flex flex-col items-end gap-2">
        {/* ── Intro hint strip ─────────────────────────────────────── */}
        <div
          className={`
            chat-hint-strip transition-all duration-300
            ${showHint && !chat.isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-28 pointer-events-none"}
          `}
          style={{ willChange: "transform, opacity" }}
        >
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
            💬 {t("proactiveTooltip", "Posez vos questions sur la BVC →")}
          </span>
          <button
            onClick={() => setShowHint(false)}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
          {/* Down-right arrow pointing at bubble */}
          <span className="hint-arrow" />
        </div>

        {/* ── Bounce tooltip ───────────────────────────────────────── */}
        {showTooltip && !chat.isOpen && (
          <div className="
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
            text-xs font-medium rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
            px-3 py-2 max-w-[200px] animate-fade-in
          ">
            👋 {t("bounceTooltip", "Bonjour ! Je peux vous aider.")}
            <span className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45 block" />
          </div>
        )}

        {/* ── Bubble button ─────────────────────────────────────────── */}
        <button
          onClick={handleToggle}
          aria-label={chat.isOpen ? t("closeChat", "Fermer le chat") : t("openChat", "Ouvrir l'assistant")}
          className={`
            chat-bubble-btn
            relative flex items-center gap-2.5
            text-white font-semibold
            transition-all duration-200 active:scale-95
            ${bouncing ? "chat-bounce" : ""}
            ${pulsing && !chat.isOpen ? "chat-pulse" : ""}
          `}
        >
          {/* Unread badge */}
          {!chat.isOpen && chat.unreadCount > 0 && (
            <span className="
              absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1
              rounded-full bg-red-500 text-white text-[10px] font-bold
              flex items-center justify-center
              animate-badge-in
            ">
              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
            </span>
          )}

          {/* Icon */}
          <span className="shrink-0 flex items-center justify-center w-7 h-7">
            {chat.isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </span>

          {/* Label — visible on md+ screens */}
          <span className="hidden md:block text-sm pr-1">
            {chat.isOpen ? t("closeChat", "Fermer") : t("assistantLabel", "Assistant IA")}
          </span>
        </button>
      </div>

      <style jsx>{`
        /* ── Bubble shape ── */
        .chat-bubble-btn {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 12px 18px 12px 14px;
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.45), 0 2px 8px rgba(0,0,0,0.2);
        }
        .chat-bubble-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
        }
        @media (max-width: 767px) {
          .chat-bubble-btn {
            padding: 16px;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            justify-content: center;
          }
        }

        /* ── Pulse animation ── */
        @keyframes chat-pulse-ring {
          0%   { box-shadow: 0 8px 24px rgba(29,78,216,0.45), 0 0 0 0   rgba(37,99,235,0.5); }
          70%  { box-shadow: 0 8px 24px rgba(29,78,216,0.45), 0 0 0 12px rgba(37,99,235,0); }
          100% { box-shadow: 0 8px 24px rgba(29,78,216,0.45), 0 0 0 0   rgba(37,99,235,0); }
        }
        .chat-pulse {
          animation: chat-pulse-ring 2s ease-out infinite;
        }

        /* ── Bounce animation ── */
        @keyframes chat-bounce-once {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.15); }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .chat-bounce {
          animation: chat-bounce-once 0.6s ease-out forwards;
        }

        /* ── Badge pop-in ── */
        @keyframes badge-in {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-badge-in {
          animation: badge-in 0.25s ease-out forwards;
        }

        /* ── Fade in (tooltip) ── */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        /* ── Fade in up (donate nudge) ── */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-fade-in-up) {
          animation: fade-in-up 0.25s ease-out forwards;
        }

        /* ── Hint strip ── */
        .chat-hint-strip {
          background: white;
          border: 1px solid #e5e7eb;
          border-left: 3px solid #1d4ed8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          position: relative;
        }
        :global(.dark) .chat-hint-strip {
          background: #1f2937;
          border-color: #374151;
          border-left-color: #3b82f6;
        }
        .hint-arrow {
          position: absolute;
          bottom: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: white;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          transform: rotate(45deg);
        }
        :global(.dark) .hint-arrow {
          background: #1f2937;
          border-color: #374151;
        }
      `}</style>
    </>
  );
}
