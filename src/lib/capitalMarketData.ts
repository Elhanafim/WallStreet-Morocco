import fs from 'fs';
import path from 'path';

export interface OPCVMCategory {
  category: string;
  funds: number;
  assets: number;
  change_ytd: string;
}

export interface CapitalMarketIndicators {
  title: string;
  date: string;
  url: string;
  scraped_at: string;
  market_cap: number | null;
  masi: number | null;
  volume: number | null;
  transactions: number | null;
  opcvm: {
    total_assets: number | null;
    total_funds: number | null;
    categories: OPCVMCategory[];
  };
  capital_raises: {
    total: number | null;
    equity: number | null;
    bonds: number | null;
    tcn: number | null;
  };
  securities_lending: {
    volume: number | null;
    outstanding: number | null;
  };
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
      opcvm: { total_assets: null, total_funds: null, categories: [] },
      capital_raises: { total: null, equity: null, bonds: null, tcn: null },
      securities_lending: { volume: null, outstanding: null },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generates detailed insights based on the enriched indicators
 */
export function generateMarketInsights(data: CapitalMarketIndicators): string[] {
  const insights: string[] = [];
  
  // Market Bourse
  if (data.market_cap && data.market_cap > 1000) {
    insights.push(`Capitalisation boursière solide à ${data.market_cap.toFixed(2)} MMDH.`);
  }
  
  // OPCVM
  if (data.opcvm.total_assets) {
    insights.push(`L'actif net global des OPCVM s'établit à ${data.opcvm.total_assets.toFixed(2)} MMDH.`);
    
    const topCategory = [...data.opcvm.categories].sort((a,b) => b.assets - a.assets)[0];
    if (topCategory) {
      insights.push(`La catégorie "${topCategory.category}" reste prédominante avec ${topCategory.assets.toFixed(2)} MMDH.`);
    }
  }
  
  // Capital Raises
  if (data.capital_raises.equity && data.capital_raises.equity > 0) {
    insights.push(`Activité soutenue sur le marché primaire avec ${data.capital_raises.equity.toFixed(0)} MDH levés en titres de capital.`);
  }

  // Securities Lending
  if (data.securities_lending.outstanding) {
    insights.push(`L'encours du prêt-emprunt de titres se maintient à ${data.securities_lending.outstanding.toFixed(1)} MMDH.`);
  }

  if (insights.length === 0) {
    insights.push("Données en cours de traitement pour les indicateurs mensuels.");
  }
  
  return insights;
}
