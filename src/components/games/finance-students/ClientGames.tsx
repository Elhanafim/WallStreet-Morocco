'use client';

// next/dynamic with `ssr: false` is only allowed in Client Components (Next.js 15+).
// Server pages import these browser-only widgets from here.
import dynamic from 'next/dynamic';

export const FactoryBreakEvenGame = dynamic(() => import('@/components/games/finance-students/cost-controller/FactoryBreakEvenGame'), { ssr: false });
export const RatioRaceGame = dynamic(() => import('@/components/games/finance-students/financial-analyst/RatioRaceGame'), { ssr: false });
export const CapitalBudgetingGame = dynamic(() => import('@/components/games/finance-students/investment-manager/CapitalBudgetingGame'), { ssr: false });
export const RiskRadarGame = dynamic(() => import('@/components/games/finance-students/risk-manager/RiskRadarGame'), { ssr: false });
export const HedgeOrHoldGame = dynamic(() => import('@/components/games/finance-students/risk-manager/HedgeOrHoldGame'), { ssr: false });
