/**
 * SSE streaming client for the WallStreet Morocco chatbot.
 *
 * Routing:
 *  - With NEXT_PUBLIC_PRICE_SERVICE_URL set (local dev with Python running):
 *      → calls ${PRICE_SERVICE_URL}/chat/stream  (FastAPI)
 *  - Without it (Vercel production):
 *      → calls /api/chat/stream  (Next.js route → Groq directly)
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  language: string;
  currentPage: string;
  isAuthenticated: boolean;
  portfolioSummary?: {
    totalInvested: number;
    currentValue: number;
    gainLossPercent: number;
    holdingsCount: number;
    bestTickers: string;
  } | null;
  marketStatus: "open" | "closed" | "unknown";
  // Real-time market data injected into every Claude request
  masi?: string;
  masiChange?: string;
  bamRate?: string;
  usdMad?: string;
  eurMad?: string;
  nextEvent?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

// Same pattern as calendarService: use external URL in dev, /api route in production
const PRICE_SERVICE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PRICE_SERVICE_URL) || "";

const CHAT_URL = PRICE_SERVICE ? `${PRICE_SERVICE}/chat/stream` : "/api/chat/stream";

/**
 * Send a chat request and stream the response token-by-token.
 * Returns an AbortController so the caller can cancel the stream.
 */
export function streamChat(
  messages: ChatMessage[],
  context: ChatContext,
  callbacks: StreamCallbacks
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          language:         context.language,
          currentPage:      context.currentPage,
          isAuthenticated:  context.isAuthenticated,
          portfolioSummary: context.portfolioSummary ?? null,
          marketStatus:     context.marketStatus,
          masi:             context.masi,
          masiChange:       context.masiChange,
          bamRate:          context.bamRate,
          usdMad:           context.usdMad,
          eurMad:           context.eurMad,
          nextEvent:        context.nextEvent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        callbacks.onError(
          err.detail || "Erreur de connexion au service. Réessayez dans un instant."
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError("Stream non disponible.");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);
            if (event.type === "token" && event.content) {
              callbacks.onToken(event.content);
            } else if (event.type === "done") {
              callbacks.onDone();
              return;
            } else if (event.type === "error") {
              callbacks.onError(event.content || "Erreur inconnue.");
              return;
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }

      callbacks.onDone();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        callbacks.onError(
          "Impossible de contacter le service de chat. Vérifiez votre connexion."
        );
        return;
      }
      callbacks.onError("Service temporairement indisponible. Réessayez dans quelques secondes.");
    }
  })();

  return controller;
}
