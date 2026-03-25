"use client";

/**
 * Builds the per-request context object injected into every chatbot message.
 * Reads: current route, auth session, i18n language, market status, portfolio.
 */

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import type { ChatContext } from "@/services/chatService";

interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  gainLossPercent: number;
  holdingsCount: number;
  bestTickers: string;
}

const PRICE_SERVICE_URL =
  process.env.NEXT_PUBLIC_PRICE_SERVICE_URL || "http://localhost:8001";

export function useChatContext(): ChatContext {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { i18n } = useTranslation();

  const [marketStatus, setMarketStatus] = useState<"open" | "closed" | "unknown">("unknown");
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);

  const isAuthenticated = status === "authenticated";

  // Market status — poll once on mount
  useEffect(() => {
    fetch(`${PRICE_SERVICE_URL}/market/status`)
      .then((r) => r.json())
      .then((data) => setMarketStatus(data.open ? "open" : "closed"))
      .catch(() => setMarketStatus("unknown"));
  }, []);

  // Portfolio summary — only for authenticated users
  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) {
      setPortfolioSummary(null);
      return;
    }
    try {
      const res = await fetch("/api/portfolios/summary");
      if (!res.ok) return;
      const data = await res.json();
      setPortfolioSummary({
        totalInvested: data.totalInvested ?? 0,
        currentValue: data.currentValue ?? 0,
        gainLossPercent: data.gainLossPercent ?? 0,
        holdingsCount: data.holdingsCount ?? 0,
        bestTickers: data.bestTickers ?? "N/A",
      });
    } catch {
      // non-fatal
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const lang = i18n.language?.slice(0, 2) || "fr";

  return {
    language: lang,
    currentPage: pathname || "/",
    isAuthenticated,
    portfolioSummary: isAuthenticated ? portfolioSummary : null,
    marketStatus,
  };
}
