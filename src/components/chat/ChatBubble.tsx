"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useChatState } from "@/hooks/useChatState";
import { useChatContext } from "@/hooks/useChatContext";
import ChatPanel from "./ChatPanel";

const GREETED_KEY  = "wsma_chat_greeted";
const BOUNCE_KEY   = "wsma_chat_bounce_done";
const HINT_KEY     = "wsma_chat_hint_shown";

export default function ChatBubble() {
  const { t } = useTranslation("chat");
  const chat    = useChatState();
  const context = useChatContext();

  const [pulsing,     setPulsing]     = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [bouncing,    setBouncing]    = useState(false);
  const [showHint,    setShowHint]    = useState(false);
  const [prefillInput, setPrefillInput] = useState("");

  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const bounceDone = sessionStorage.getItem(BOUNCE_KEY) === "1";
    const hintShown  = sessionStorage.getItem(HINT_KEY)   === "1";

    if (!bounceDone) {
      bounceTimerRef.current = setTimeout(() => {
        setBouncing(true);
        setShowTooltip(true);
        sessionStorage.setItem(BOUNCE_KEY, "1");
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
      if (hintTimerRef.current)   clearTimeout(hintTimerRef.current);
    };
  }, []);

  const handleOpen = useCallback(() => {
    setShowTooltip(false);
    setShowHint(false);
    setPulsing(false);
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    if (hintTimerRef.current)   clearTimeout(hintTimerRef.current);
    if (typeof window !== "undefined") localStorage.setItem(GREETED_KEY, "1");
    chat.open();
  }, [chat]);

  const handleToggle = useCallback(() => {
    if (chat.isOpen) {
      chat.close();
      chat.hideDonateNudge();
    } else {
      handleOpen();
    }
  }, [chat, handleOpen]);

  const handleClear = useCallback(() => {
    chat.clearMessages();
  }, [chat]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(GREETED_KEY) === "1") setPulsing(false);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ prefill?: string }>).detail;
      setPrefillInput(detail?.prefill ?? "");
      handleOpen();
    };
    window.addEventListener("wsma:open-chat", handler);
    return () => window.removeEventListener("wsma:open-chat", handler);
  }, [handleOpen]);

  return (
    <>
      <ChatPanel
        messages={chat.messages}
        streamingContent={chat.streamingContent}
        isStreaming={chat.isStreaming}
        isOpen={chat.isOpen}
        onClose={chat.close}
        onSend={(text) => chat.sendMessage(text, context)}
        onCancel={chat.cancelStream}
        onClear={handleClear}
        context={context}
        hasGreeted={chat.hasGreeted}
        prefillInput={prefillInput}
        onPrefillConsumed={() => setPrefillInput("")}
        showDonateNudge={chat.showDonateNudge}
        onHideDonateNudge={chat.hideDonateNudge}
      />

      {/* Floating button — hidden on mobile when panel is open */}
      <div className={`fixed bottom-[100px] right-5 z-[1000] flex-col items-end gap-2 ${chat.isOpen ? "hidden" : "flex"}`}>

        {/* Hint strip */}
        <div
          className={`chat-hint-strip transition-all duration-300 ${
            showHint && !chat.isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-28 pointer-events-none"
          }`}
          style={{ willChange: "transform, opacity" }}
        >
          <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
            ★ {t("proactiveTooltip", "Posez vos questions sur la BVC →")}
          </span>
          <button
            onClick={() => setShowHint(false)}
            className="ml-2 text-gray-400 hover:text-gray-600 text-base leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
          <span className="hint-arrow" />
        </div>

        {/* Bounce tooltip */}
        {showTooltip && !chat.isOpen && (
          <div className="bg-white text-gray-800 text-xs font-medium rounded-xl shadow-lg border border-gray-200 px-3 py-2 max-w-[200px] animate-fade-in relative">
            ★ {t("bounceTooltip", "Bonjour ! Casablanca peut vous aider.")}
            <span className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45 block" />
          </div>
        )}

        {/* Bubble button */}
        <button
          onClick={handleToggle}
          aria-label={chat.isOpen ? "Fermer Casablanca" : "Ouvrir Casablanca — Assistant IA BVC"}
          className={`
            chat-bubble-btn relative flex items-center gap-2.5 text-white font-semibold
            transition-all duration-200 active:scale-95
            ${bouncing ? "chat-bounce" : ""}
            ${pulsing && !chat.isOpen ? "chat-pulse" : ""}
          `}
        >
          {/* Unread badge */}
          {!chat.isOpen && chat.unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[#C1272D] text-[10px] font-bold flex items-center justify-center animate-badge-in border border-red-200">
              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
            </span>
          )}

          {/* Morocco star icon */}
          <span className="shrink-0 flex items-center justify-center w-7 h-7">
            {chat.isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            )}
          </span>

          <span className="hidden md:block text-sm pr-1">
            {chat.isOpen ? "Fermer" : "Casablanca"}
          </span>
        </button>
      </div>

      <style jsx>{`
        .chat-bubble-btn {
          background: linear-gradient(135deg, #C1272D 0%, #8B0000 100%);
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
          padding: 12px 18px 12px 14px;
          box-shadow: 0 8px 24px rgba(193, 39, 45, 0.45), 0 2px 8px rgba(0,0,0,0.2);
        }
        .chat-bubble-btn:hover {
          background: linear-gradient(135deg, #a01f24 0%, #6b0000 100%);
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

        @keyframes chat-pulse-ring {
          0%   { box-shadow: 0 8px 24px rgba(193,39,45,0.45), 0 0 0 0   rgba(193,39,45,0.5); }
          70%  { box-shadow: 0 8px 24px rgba(193,39,45,0.45), 0 0 0 12px rgba(193,39,45,0); }
          100% { box-shadow: 0 8px 24px rgba(193,39,45,0.45), 0 0 0 0   rgba(193,39,45,0); }
        }
        .chat-pulse { animation: chat-pulse-ring 2s ease-out infinite; }

        @keyframes chat-bounce-once {
          0%   { transform: scale(1);    }
          30%  { transform: scale(1.15); }
          60%  { transform: scale(0.95); }
          100% { transform: scale(1);    }
        }
        .chat-bounce { animation: chat-bounce-once 0.6s ease-out forwards; }

        @keyframes badge-in {
          0%   { transform: scale(0);   }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   }
        }
        .animate-badge-in { animation: badge-in 0.25s ease-out forwards; }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }

        .chat-hint-strip {
          background: white;
          border: 1px solid #e5e7eb;
          border-left: 3px solid #C1272D;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          position: relative;
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
      `}</style>
    </>
  );
}
