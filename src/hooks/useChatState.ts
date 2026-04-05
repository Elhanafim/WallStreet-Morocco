"use client";

/**
 * All chat UI state in one custom hook.
 * Handles messages, streaming, open/close, and unread badge.
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
  responseCount: number;    // total completed AI responses this session
  showDonateNudge: boolean; // true every 3rd response (or after 5 messages)
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
    if (isStreaming) {
      abortRef.current?.abort();
      abortRef.current = null;
      setIsStreaming(false);
    }
    setMessages([]);
    setStreamingContent("");
    streamBufferRef.current = "";
    setResponseCount(0);
    setShowDonateNudge(false);
  }, [isStreaming]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    // Commit whatever was streamed so far
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

      const userMsg: ChatMessage = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      streamBufferRef.current = "";
      setStreamingContent("");

      // Build history including the new user message
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
          // Badge only if panel is closed
          setUnreadCount((c) => (isOpen ? c : c + 1));
          // Donation nudge: show every 3rd response or after 5+ messages
          setResponseCount((prev) => {
            const next = prev + 1;
            const totalMsgs = messages.length + 2; // +1 user +1 assistant just added
            if (next % 3 === 0 || totalMsgs >= 10) {
              setShowDonateNudge(true);
            }
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
