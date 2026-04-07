import fs from 'fs';
import path from 'path';

export interface CapitalMarketIndicators {
  title: string;
  date: string;
  url: string;
  scraped_at: string;
  market_cap: number | null;
  masi: number | null;
  volume: number | null;
  transactions: number | null;
  other_indicators?: Record<string, any>;
  error?: string;
}

const DATA_PATH = path.join(process.cwd(), 'data', 'capital_market_latest.json');

export async function getLatestCapitalMarketIndicators(): Promise<CapitalMarketIndicators> {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      throw new Error('Data file not found');
    }
    
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return data;
  } catch (error) {
    console.error('Error reading capital market indicators:', error);
    return {
      title: 'Unknown',
      date: 'N/A',
      url: '',
      scraped_at: new Date().toISOString(),
      market_cap: null,
      masi: null,
      volume: null,
      transactions: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generates simple insights based on the indicators
 */
export function generateMarketInsights(data: CapitalMarketIndicators): string[] {
  const insights: string[] = [];
  
  if (data.market_cap && data.market_cap > 1000) {
    insights.push("La capitalisation boursière se maintient au-dessus de 1 000 MMDH.");
  }
  
  if (data.masi && data.masi > 18000) {
    insights.push("L'indice MASI affiche une performance robuste au-delà des 18 000 points.");
  }
  
  if (data.volume && data.volume > 5000) {
    insights.push("L'activité transactionnelle est soutenue avec un volume mensuel significatif.");
  }

  if (insights.length === 0) {
    insights.push("Données en cours de mise à jour pour le mois courant.");
  }
  
  return insights;
}
