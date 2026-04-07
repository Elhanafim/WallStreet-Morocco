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
 * Generates sophisticated market insights based on the latest indicators
 */
export function generateMarketInsights(data: CapitalMarketIndicators): string[] {
  const insights: string[] = [];
  
  // Market Bourse Analysis
  if (data.masi) {
    insights.push(`L'indice MASI affiche une performance stable, se situant à ${data.masi.toLocaleString('fr-MA')} points.`);
  }

  if (data.market_cap) {
    insights.push(`La capitalisation boursière globale s'établit à ${data.market_cap.toLocaleString('fr-MA')} MMDH.`);
  }
  
  // OPCVM Trends
  if (data.opcvm.total_assets) {
    insights.push(`L'industrie des OPCVM maintient son dynamisme avec un actif net sous gestion de ${data.opcvm.total_assets.toFixed(1)} MMDH.`);
    
    const sortedCategories = [...data.opcvm.categories].sort((a,b) => b.assets - a.assets);
    const topCat = sortedCategories[0];
    const growingCat = data.opcvm.categories.find(c => !c.change_ytd.includes('-') && parseFloat(c.change_ytd) > 5);

    if (topCat) {
      insights.push(`La prédominance des ${topCat.category} se confirme (${topCat.assets.toFixed(1)} MMDH).`);
    }
    if (growingCat) {
      insights.push(`Forte progression annuelle sur le segment ${growingCat.category} (+${growingCat.change_ytd}).`);
    }
  }
  
  // Capital Market Funding
  if (data.capital_raises.total && data.capital_raises.total > 0) {
    insights.push(`Le marché primaire a canalisé ${data.capital_raises.total.toLocaleString('fr-MA')} MDH de nouvelles levées ce mois.`);
  }

  // Securities Lending
  if (data.securities_lending.outstanding) {
    insights.push(`L'activité de prêt-emprunt de titres affiche un encours de ${data.securities_lending.outstanding.toFixed(1)} MMDH.`);
  }

  if (insights.length === 0) {
    insights.push("Données de marché en cours d'actualisation par l'AMMC.");
  }
  
  return insights.slice(0, 5); // Return top 5 most relevant insights
}
