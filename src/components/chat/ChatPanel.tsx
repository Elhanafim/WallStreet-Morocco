"use client";

import { useEffect, useRef, useState } from "react";
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
  onClear: () => void;
  context: ChatContext;
  hasGreeted: boolean;
  prefillInput?: string;
  onPrefillConsumed?: () => void;
  showDonateNudge?: boolean;
  onHideDonateNudge?: () => void;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
// Supports: ## headers, **bold**, *italic*, `code`, [links](url),
//           - bullets, 1. numbered lists, --- hr, blank lines
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const key = i;

    // ## / ### heading
    if (/^#{2,3}\s/.test(line)) {
      nodes.push(
        <p key={key} className="font-bold text-sm mt-2 mb-0.5 text-emerald-700 dark:text-emerald-400">
          {inlineMarkdown(line.replace(/^#{2,3}\s/, ""))}
        </p>
      );
      return;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      nodes.push(<hr key={key} className="my-2 border-gray-200 dark:border-gray-600" />);
      return;
    }

    // Unordered bullet
    if (/^[-*•]\s/.test(line)) {
      nodes.push(
        <div key={key} className="flex gap-1.5 items-start leading-snug my-0.5">
          <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span>{inlineMarkdown(line.replace(/^[-*•]\s/, ""))}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      nodes.push(
        <div key={key} className="flex gap-2 items-start leading-snug my-0.5">
          <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400 text-xs w-4">{numMatch[1]}.</span>
          <span>{inlineMarkdown(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (line.trim() === "") {
      nodes.push(<div key={key} className="h-1.5" />);
      return;
    }

    // Normal paragraph
    nodes.push(
      <div key={key} className="leading-snug">
        {inlineMarkdown(line)}
      </div>
    );
  });

  return <>{nodes}</>;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[.+?\]\(.+?\))/g);
  return parts.map((part, j) => {
    if (/^\*\*(.+)\*\*$/.test(part)) {
      return <strong key={j} className="font-medium">{part.slice(2, -2)}</strong>;
    }
    if (/^\*(.+)\*$/.test(part)) {
      return <em key={j}>{part.slice(1, -1)}</em>;
    }
    if (/^`(.+)`$/.test(part)) {
      return (
        <code key={j} className="bg-gray-200 dark:bg-gray-700 rounded px-1 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
    if (linkMatch) {
      return (
        <a key={j} href={linkMatch[2]} className="text-emerald-600 dark:text-emerald-400 underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce opacity-70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
      title="Copier"
    >
      {copied ? "✓" : "📋"}
    </button>
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
  onClear,
  context,
  prefillInput,
  onPrefillConsumed,
  showDonateNudge,
  onHideDonateNudge,
}: ChatPanelProps) {
  const { t } = useTranslation("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const showQuickPrompts =
    messages.length === 0 || (messages.length === 1 && messages[0].role === "assistant");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 sm:inset-auto sm:bottom-20 sm:right-4 sm:w-[420px] sm:h-[620px] z-[999] flex flex-col overflow-hidden rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      role="dialog"
      aria-label={t("panelTitle", "Assistant WallStreet Morocco")}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-700 text-white shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm shrink-0">
          W
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">
            {t("assistantName", "Assistant WallStreet Morocco")}
          </p>
          <p className="text-blue-200 text-[11px]">
            {isStreaming
              ? t("typing", "En train d'écrire…")
              : t("online", "Éducatif · Powered by Groq")}
          </p>
        </div>

        {/* Clear button — visible when there are messages */}
        {messages.length > 0 && !isStreaming && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-full hover:bg-blue-600 transition text-blue-200 hover:text-white"
            title="Effacer la conversation"
            aria-label="Effacer la conversation"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-blue-600 transition"
          aria-label={t("close", "Fermer")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Disclaimer banner ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 shrink-0">
        <span className="text-amber-600 shrink-0 text-sm leading-none">⚠️</span>
        <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-tight">
          <strong>Usage éducatif uniquement.</strong>{" "}
          Pas de conseil en investissement. Risque de perte en capital.
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">

        {/* Welcome */}
        {messages.length === 0 && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5">
              W
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[88%] text-gray-800 dark:text-gray-200 leading-relaxed">
              {renderMarkdown(
                "Bonjour ! Je suis l'assistant éducatif de **WallStreet Morocco**.\n\nJe peux vous aider à comprendre la Bourse de Casablanca, les OPCVM, l'analyse financière, ou naviguer sur le site.\n\nComment puis-je vous aider ?"
              )}
            </div>
          </div>
        )}

        {/* Chat history */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 items-start group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5">
                W
              </div>
            )}
            <div className="flex items-end gap-1 max-w-[88%]">
              <div
                className={`rounded-2xl px-3 py-2 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
              </div>
              {msg.role === "assistant" && <CopyButton text={msg.content} />}
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5">
              W
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[88%] text-gray-800 dark:text-gray-200 leading-relaxed">
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

      {/* ── Quick prompts ── */}
      <QuickPrompts
        currentPage={context.currentPage}
        onSelect={onSend}
        hidden={!showQuickPrompts || isStreaming}
      />

      {/* ── Donation nudge ── */}
      {showDonateNudge && !isStreaming && context.currentPage !== "/donate" && (
        <div className="mx-3 mb-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <p className="text-amber-900 dark:text-amber-200 leading-snug">
              {t("donateNudge", "♥ Ce service est gratuit. Si cette réponse vous a aidé, soutenez-nous.")}
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
            className="mt-1.5 inline-block font-medium text-red-600 dark:text-red-400 hover:underline"
          >
            {t("donateCta", "Faire un don →")}
          </a>
        </div>
      )}

      {/* ── Input ── */}
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
