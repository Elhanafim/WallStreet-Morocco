import { NextResponse } from 'next/server';
import { getLatestCapitalMarketIndicators, generateMarketInsights } from '@/lib/capitalMarketData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLatestCapitalMarketIndicators();
    const insights = generateMarketInsights(data);
    
    return NextResponse.json({
      ...data,
      insights
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch capital market indicators' },
      { status: 500 }
    );
  }
}
