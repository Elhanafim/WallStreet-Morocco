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
  open: () => void;
  close: () => void;
  sendMessage: (text: string, context: ChatContext) => void;
  cancelStream: () => void;
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
    open,
    close,
    sendMessage,
    cancelStream,
    clearUnread,
    setHasGreeted,
    streamingContent,
  };
}
