/**
 * SSE streaming client for the WallStreet Morocco chatbot.
 *
 * Routing:
 *  - With NEXT_PUBLIC_PRICE_SERVICE_URL set (local dev with Python running):
 *      → calls ${PRICE_SERVICE_URL}/chat/stream  (FastAPI + Groq)
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
 * Build rich context from the current browser state.
 * Reads portfolio from localStorage if available.
 */
export function buildChatContext(base: Omit<ChatContext, "portfolioSummary">): ChatContext {
  if (typeof window === "undefined") return { ...base, portfolioSummary: null };

  let portfolioSummary: ChatContext["portfolioSummary"] = null;
  try {
    const raw = localStorage.getItem("wsm_portfolio") || localStorage.getItem("wsma_portfolio");
    if (raw) {
      const holdings = JSON.parse(raw);
      if (Array.isArray(holdings) && holdings.length > 0) {
        const totalInvested = holdings.reduce((s: number, h: Record<string, unknown>) => s + (Number(h.totalCost) || 0), 0);
        const currentValue  = holdings.reduce((s: number, h: Record<string, unknown>) => s + (Number(h.currentValue) || 0), 0);
        const gainLossPercent = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
        const tickers = holdings
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
            (Number(b.currentValue) || 0) - (Number(a.currentValue) || 0)
          )
          .slice(0, 5)
          .map((h: Record<string, unknown>) => String(h.ticker || ""))
          .filter(Boolean)
          .join(", ");
        portfolioSummary = {
          totalInvested: Math.round(totalInvested),
          currentValue:  Math.round(currentValue),
          gainLossPercent: Math.round(gainLossPercent * 100) / 100,
          holdingsCount: holdings.length,
          bestTickers: tickers,
        };
      }
    }
  } catch {
    // localStorage access error — skip portfolio context
  }

  return { ...base, portfolioSummary };
}

/**
 * Send a chat request and stream the response token-by-token.
 * Returns an AbortController so the caller can cancel the stream.
 * Keeps last 20 messages (10 pairs) for conversation memory.
 */
export function streamChat(
  messages: ChatMessage[],
  context: ChatContext,
  callbacks: StreamCallbacks
): AbortController {
  const controller = new AbortController();
  const trimmedMessages = messages.slice(-20);

  (async () => {
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: trimmedMessages,
          language:         context.language,
          currentPage:      context.currentPage,
          isAuthenticated:  context.isAuthenticated,
          portfolioSummary: context.portfolioSummary ?? null,
          marketStatus:     context.marketStatus,
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
