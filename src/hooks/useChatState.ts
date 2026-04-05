"use client";

/**
 * All chat UI state in one custom hook.
 * Handles messages, streaming, open/close, unread badge,
 * client-side rate limiting, and investment advice pre-filter.
 */

import { useCallback, useRef, useState } from "react";
import { streamChat } from "@/services/chatService";
import type { ChatMessage, ChatContext } from "@/services/chatService";

export interface UseChatStateReturn {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  unreadCount: number;
  hasGreeted: boolean;
  responseCount: number;
  showDonateNudge: boolean;
  hideDonateNudge: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (text: string, context: ChatContext) => void;
  cancelStream: () => void;
  clearMessages: () => void;
  clearUnread: () => void;
  setHasGreeted: (v: boolean) => void;
  streamingContent: string;
}

// ── Client-side rate limit: 20 messages/hour via localStorage ─────────────────

const RL_KEY = "wsma_chat_rl";
const RL_MAX = 20;

function checkClientRateLimit(): { ok: boolean; error?: string } {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(RL_KEY);
    const entries: number[] = stored ? JSON.parse(stored) : [];
    const recent = entries.filter((t) => now - t < 3_600_000);
    if (recent.length >= RL_MAX) {
      const resetIn = Math.ceil((recent[0] + 3_600_000 - now) / 60_000);
      return {
        ok: false,
        error: `Vous avez atteint la limite de ${RL_MAX} messages par heure. Réessayez dans ${resetIn} min.`,
      };
    }
    recent.push(now);
    localStorage.setItem(RL_KEY, JSON.stringify(recent));
    return { ok: true };
  } catch {
    return { ok: true }; // if localStorage unavailable, don't block
  }
}

// ── Investment advice pre-filter (client-side, before hitting the API) ────────

const ADVICE_PATTERNS = [
  /dois.je\s+acheter\b/i,
  /dois.je\s+vendre\b/i,
  /dois.je\s+investir\b/i,
  /\binvestir\s+dans\s+[a-z]/i,
  /\bmettre\s+m(?:on|es)\s+argent/i,
  /\bplacer\s+m(?:on|es)\s+argent/i,
  /\brecommand[ae][sz]?.{1,20}(action|titre|valeur|fond)/i,
  /\btu\s+me\s+conseill/i,
];

const ADVICE_REPLY =
  "Je suis un assistant éducatif. Je ne peux pas vous conseiller sur des décisions d'investissement spécifiques. " +
  "Consultez un **conseiller financier agréé AMMC** (ammc.ma) ou un courtier agréé BVC.\n\n" +
  "Je peux en revanche vous expliquer comment analyser une action, comprendre un bilan ou lire des résultats financiers. " +
  "Quel aspect vous intéresse ?";

function isInvestmentAdviceRequest(text: string): boolean {
  return ADVICE_PATTERNS.some((p) => p.test(text));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChatState(): UseChatStateReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [responseCount, setResponseCount] = useState(0);
  const [showDonateNudge, setShowDonateNudge] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef("");

  const open = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const hideDonateNudge = useCallback(() => {
    setShowDonateNudge(false);
  }, []);

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreamingContent("");
    streamBufferRef.current = "";
    setIsStreaming(false);
    setShowDonateNudge(false);
    setUnreadCount(0);
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    const partial = streamBufferRef.current;
    if (partial) {
      setMessages((prev) => [...prev, { role: "assistant", content: partial }]);
      setStreamingContent("");
      streamBufferRef.current = "";
    }
  }, []);

  const sendMessage = useCallback(
    (text: string, context: ChatContext) => {
      if (isStreaming) return;

      // 1. Client-side rate limit
      const rl = checkClientRateLimit();
      if (!rl.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: `⚠️ ${rl.error}` },
        ]);
        return;
      }

      // 2. Investment advice pre-filter
      if (isInvestmentAdviceRequest(text)) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: ADVICE_REPLY },
        ]);
        setUnreadCount((c) => (isOpen ? c : c + 1));
        return;
      }

      const userMsg: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      streamBufferRef.current = "";
      setStreamingContent("");

      const history = [...messages, userMsg];

      abortRef.current = streamChat(history, context, {
        onToken: (token) => {
          streamBufferRef.current += token;
          setStreamingContent(streamBufferRef.current);
        },
        onDone: () => {
          const final = streamBufferRef.current;
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: final },
          ]);
          setStreamingContent("");
          streamBufferRef.current = "";
          setIsStreaming(false);
          abortRef.current = null;
          setUnreadCount((c) => (isOpen ? c : c + 1));
          setResponseCount((prev) => {
            const next = prev + 1;
            const totalMsgs = messages.length + 2;
            if (next % 3 === 0 || totalMsgs >= 10) setShowDonateNudge(true);
            return next;
          });
        },
        onError: (msg) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ ${msg}` },
          ]);
          setStreamingContent("");
          streamBufferRef.current = "";
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [isStreaming, messages, isOpen]
  );

  return {
    messages,
    isOpen,
    isStreaming,
    unreadCount,
    hasGreeted,
    responseCount,
    showDonateNudge,
    hideDonateNudge,
    open,
    close,
    sendMessage,
    cancelStream,
    clearMessages,
    clearUnread,
    setHasGreeted,
    streamingContent,
  };
}
