'use client';

// next/dynamic with `ssr: false` is only allowed in Client Components (Next.js 15+).
// Server pages import these browser-only widgets from here.
import dynamic from 'next/dynamic';

export const TradingViewTicker = dynamic(() => import('@/components/market/TradingViewTicker'), { ssr: false });
export const TradingViewChart = dynamic(() => import('@/components/market/TradingViewChart'), { ssr: false });
export const WatchlistPanel = dynamic(() => import('@/components/market/WatchlistPanel'), { ssr: false });
export const MarketSummary = dynamic(() => import('@/components/market/MarketSummary'), { ssr: false });
export const MarketStockGrid = dynamic(() => import('@/components/market/MarketStockGrid'), { ssr: false });
export const MarketHeatmap = dynamic(() => import('@/components/market/MarketHeatmap'), { ssr: false });
export const ChatHint = dynamic(() => import('@/components/chat/ChatHint'), { ssr: false });
