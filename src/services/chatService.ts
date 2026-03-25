/**
 * SSE streaming client for the WallStreet Morocco chatbot.
 * Calls the FastAPI /chat/stream endpoint and yields tokens incrementally.
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

const PRICE_SERVICE_URL =
  process.env.NEXT_PUBLIC_PRICE_SERVICE_URL || "http://localhost:8001";

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
      const response = await fetch(`${PRICE_SERVICE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          language: context.language,
          currentPage: context.currentPage,
          isAuthenticated: context.isAuthenticated,
          portfolioSummary: context.portfolioSummary ?? null,
          marketStatus: context.marketStatus,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        callbacks.onError(err.detail || "Erreur de connexion au service.");
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
        buffer = lines.pop() ?? ""; // keep incomplete line

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
            // malformed JSON line — ignore
          }
        }
      }

      callbacks.onDone();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return; // user cancelled
      callbacks.onError("Service temporairement indisponible. Réessayez dans quelques secondes.");
    }
  })();

  return controller;
}
