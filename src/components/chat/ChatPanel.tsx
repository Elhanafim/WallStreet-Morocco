"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "@/services/chatService";
import type { ChatContext } from "@/services/chatService";
import ChatInput from "./ChatInput";
import QuickPrompts from "./QuickPrompts";

interface ChatPanelProps {
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  onCancel: () => void;
  context: ChatContext;
  hasGreeted: boolean;
  prefillInput?: string;
  onPrefillConsumed?: () => void;
  showDonateNudge?: boolean;
  onHideDonateNudge?: () => void;
}

// Minimal markdown renderer: bold, inline code, links, bullet lines
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const key = i;
    const isBullet = /^[-*•]\s/.test(line);
    const content = isBullet ? line.replace(/^[-*•]\s/, "") : line;

    const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|\[.+?\]\(.+?\))/g);
    const rendered = parts.map((part, j) => {
      if (/^\*\*(.+)\*\*$/.test(part)) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      if (/^`(.+)`$/.test(part)) {
        return (
          <code key={j} className="bg-gray-100 dark:bg-gray-700 rounded px-1 text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
      if (linkMatch) {
        return (
          <a key={j} href={linkMatch[2]} className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={key} className="flex gap-1.5 items-start">
          <span className="mt-0.5 shrink-0 text-emerald-500">•</span>
          <span>{rendered}</span>
        </div>
      );
    }
    return (
      <div key={key} className={line === "" ? "h-2" : ""}>
        {rendered}
      </div>
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel({
  messages,
  streamingContent,
  isStreaming,
  isOpen,
  onClose,
  onSend,
  onCancel,
  context,
  hasGreeted,
  prefillInput,
  onPrefillConsumed,
  showDonateNudge,
  onHideDonateNudge,
}: ChatPanelProps) {
  const { t } = useTranslation("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const showQuickPrompts = messages.length === 0 || (messages.length === 1 && messages[0].role === "assistant");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 sm:inset-auto sm:bottom-20 sm:right-4 sm:w-[380px] sm:h-[580px] z-[999] flex flex-col overflow-hidden rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      role="dialog"
      aria-label={t("panelTitle", "Assistant WallStreet Morocco")}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-700 text-white shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          W
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">
            {t("assistantName", "Assistant WallStreet Morocco")}
          </p>
          <p className="text-emerald-200 text-xs">
            {isStreaming
              ? t("typing", "En train d'écrire…")
              : t("online", "En ligne · Powered by Groq")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-1 p-1 rounded-full hover:bg-blue-600 transition"
          aria-label={t("close", "Fermer")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
              W
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-gray-800 dark:text-gray-200 leading-relaxed">
              {renderMarkdown(
                t(
                  "welcome",
                  "Bonjour ! 👋 Je suis l'assistant IA de **WallStreet Morocco**.\n\nJe peux vous aider à naviguer sur le site, comprendre les données boursières, ou apprendre les bases de l'investissement à la BVC.\n\nComment puis-je vous aider ?"
                )
              )}
            </div>
          </div>
        )}

        {/* Chat history */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                W
              </div>
            )}
            <div
              className={`rounded-2xl px-3 py-2 max-w-[85%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
              }`}
            >
              {msg.role === "assistant"
                ? renderMarkdown(msg.content)
                : msg.content}
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
              W
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-gray-800 dark:text-gray-200 leading-relaxed">
              {streamingContent ? (
                <>
                  {renderMarkdown(streamingContent)}
                  <span className="inline-block w-0.5 h-3.5 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                </>
              ) : (
                <TypingIndicator />
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <QuickPrompts
        currentPage={context.currentPage}
        onSelect={onSend}
        hidden={!showQuickPrompts || isStreaming}
      />

      {/* Donation nudge — shown every 3rd response, never on /donate */}
      {showDonateNudge && !isStreaming && context.currentPage !== '/donate' && (
        <div className="mx-3 mb-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs animate-fade-in-up">
          <div className="flex items-start justify-between gap-2">
            <p className="text-amber-900 dark:text-amber-200 leading-snug">
              {t("donateNudge", "♥ Ce service est gratuit et independant. Si cette reponse vous a aide, soutenez-nous.")}
            </p>
            <button
              onClick={onHideDonateNudge}
              className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <a
            href="/donate"
            onClick={onHideDonateNudge}
            className="mt-1.5 inline-block font-semibold text-red-600 dark:text-red-400 hover:underline"
          >
            {t("donateCta", "Faire un don →")}
          </a>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={(text) => { onHideDonateNudge?.(); onSend(text); }}
        disabled={false}
        isStreaming={isStreaming}
        onCancel={onCancel}
        prefillValue={prefillInput}
        onPrefillConsumed={onPrefillConsumed}
        onTypingStart={onHideDonateNudge}
      />
    </div>
  );
}
