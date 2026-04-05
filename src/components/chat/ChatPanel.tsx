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
  onClear: () => void;
  context: ChatContext;
  hasGreeted: boolean;
  prefillInput?: string;
  onPrefillConsumed?: () => void;
  showDonateNudge?: boolean;
  onHideDonateNudge?: () => void;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
// Handles: **bold**, `code`, [links](url), ## headers, - bullets, numbered lists
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const key = i;

    // Heading ## or ###
    if (/^#{2,3}\s/.test(line)) {
      const content = line.replace(/^#{2,3}\s/, "");
      nodes.push(
        <p key={key} className="font-bold text-sm mt-2 mb-0.5" style={{ color: "#C1272D" }}>
          {inlineMarkdown(content)}
        </p>
      );
      return;
    }

    // Horizontal rule ---
    if (/^-{3,}$/.test(line.trim())) {
      nodes.push(<hr key={key} className="my-2 border-gray-200" />);
      return;
    }

    // Unordered bullet
    if (/^[-*•]\s/.test(line)) {
      const content = line.replace(/^[-*•]\s/, "");
      nodes.push(
        <div key={key} className="flex gap-2 items-start leading-snug my-0.5">
          <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#C1272D] mt-1.5" />
          <span>{inlineMarkdown(content)}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      nodes.push(
        <div key={key} className="flex gap-2 items-start leading-snug my-0.5">
          <span className="shrink-0 font-bold text-[#C1272D] text-xs w-4">{numMatch[1]}.</span>
          <span>{inlineMarkdown(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty line → spacing
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
      return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (/^\*(.+)\*$/.test(part)) {
      return <em key={j}>{part.slice(1, -1)}</em>;
    }
    if (/^`(.+)`$/.test(part)) {
      return (
        <code key={j} className="bg-gray-100 rounded px-1 text-xs font-mono text-red-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
    if (linkMatch) {
      return (
        <a key={j} href={linkMatch[2]} className="text-[#C1272D] underline" target="_blank" rel="noopener noreferrer">
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
          className="w-2 h-2 rounded-full bg-[#C1272D] animate-bounce opacity-70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Morocco star SVG ──────────────────────────────────────────────────────────
function MoroccoStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
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
      className="fixed inset-x-0 bottom-0 top-16 sm:inset-auto sm:bottom-20 sm:right-4 sm:w-[390px] sm:h-[600px] z-[999] flex flex-col overflow-hidden rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 bg-white"
      role="dialog"
      aria-label="Casablanca — Assistant IA WallStreet Morocco"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 shrink-0"
        style={{ background: "linear-gradient(135deg, #C1272D 0%, #8B0000 100%)" }}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
          style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)" }}
          aria-hidden="true"
        >
          <MoroccoStar size={16} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white leading-tight">Casablanca</p>
          <p className="text-red-200 text-[11px] leading-tight">
            {isStreaming
              ? "En train de répondre…"
              : "Assistant IA · WallStreet Morocco"}
          </p>
        </div>

        {/* Clear + Close */}
        <div className="flex items-center gap-1">
          {messages.length > 0 && !isStreaming && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-full hover:bg-white/20 transition text-white/80 hover:text-white"
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
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
            aria-label={t("close", "Fermer")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Disclaimer banner ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-200 shrink-0">
        <span className="text-amber-600 shrink-0 text-base leading-none">⚠️</span>
        <p className="text-[10px] text-amber-700 leading-tight">
          <strong>Usage éducatif uniquement.</strong>{" "}
          Pas de conseil en investissement. Risque de perte en capital.
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-sm">

        {/* Welcome */}
        {messages.length === 0 && (
          <div className="flex gap-2 items-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
              style={{ background: "#C1272D" }}
              aria-hidden="true"
            >
              <MoroccoStar size={11} />
            </div>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "#C1272D" }}>
                Casablanca
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-gray-800 leading-relaxed">
                {renderMarkdown(
                  "Bonjour ! Je suis **Casablanca**, votre assistant éducatif sur la Bourse de Casablanca.\n\nPosez-moi vos questions sur la BVC, le MASI, les OPCVM, ou l'analyse financière. Comment puis-je vous aider ?"
                )}
              </div>
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
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                style={{ background: "#C1272D" }}
                aria-hidden="true"
              >
                <MoroccoStar size={11} />
              </div>
            )}

            <div className={msg.role === "assistant" ? "" : ""}>
              {msg.role === "assistant" && (
                <p className="text-[10px] font-semibold mb-1" style={{ color: "#C1272D" }}>
                  Casablanca
                </p>
              )}
              <div
                className={`rounded-2xl px-3 py-2 max-w-[85%] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#C1272D] text-white rounded-tr-sm ml-auto"
                    : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex gap-2 items-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
              style={{ background: "#C1272D" }}
              aria-hidden="true"
            >
              <MoroccoStar size={11} />
            </div>
            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "#C1272D" }}>
                Casablanca
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-gray-800 leading-relaxed">
                {streamingContent ? (
                  <>
                    {renderMarkdown(streamingContent)}
                    <span className="inline-block w-0.5 h-3 bg-[#C1272D] animate-pulse ml-0.5 align-middle" />
                  </>
                ) : (
                  <TypingIndicator />
                )}
              </div>
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
        <div className="mx-3 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <p className="text-amber-800 leading-snug">
              ♥ Ce service est gratuit. Si cette réponse vous a aidé, soutenez-nous.
            </p>
            <button
              onClick={onHideDonateNudge}
              className="text-amber-400 hover:text-amber-600 shrink-0 mt-0.5"
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
            className="mt-1.5 inline-block font-semibold text-[#C1272D] hover:underline"
          >
            Faire un don →
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

      {/* ── Footer ── */}
      <div className="flex items-center justify-center gap-1 py-1.5 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">◈ Casablanca · Propulsé par</span>
        <span className="text-[10px] font-semibold text-gray-500">Claude AI</span>
      </div>
    </div>
  );
}
