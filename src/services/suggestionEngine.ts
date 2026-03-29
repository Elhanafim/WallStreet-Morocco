/**
 * Rule-based suggestion engine for portfolio analysis.
 * No AI API calls — pure deterministic rules.
 */

import type { PortfolioPerformance } from './performanceService';
import { STOCK_ASSETS } from '@/lib/data/assets';

export type SuggestionType = 'alert' | 'warning' | 'success' | 'info';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  message: string;
  ticker?: string;
}

interface HoldingInput {
  id: string;
  assetSymbol: string;
  assetName: string;
  assetType: 'STOCK' | 'OPCVM';
  quantity: number;
  purchasePrice: number;
}

function stockSector(symbol: string): string | null {
  const ticker = symbol.split(':')[1] ?? symbol;
  const asset = STOCK_ASSETS.find((a) => (a.symbol.split(':')[1] ?? a.symbol) === ticker);
  return asset ? asset.sector : null;
}

export function generateSuggestions(
  holdings: HoldingInput[],
  perf: PortfolioPerformance
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const { totalCost, totalValue, totalGain, totalGainPct, holdings: holdingPerfs } = perf;

  // ── Rule 7: New portfolio ─────────────────────────────────────────────────
  if (holdings.length > 0 && holdings.length < 3) {
    suggestions.push({
      id: 'new_portfolio',
      type: 'info',
      title: 'Portefeuille peu diversifié',
      message: `Vous avez ${holdings.length} position${holdings.length > 1 ? 's' : ''}. Ajoutez au moins 3 positions pour réduire le risque de concentration.`,
    });
  }

  // ── Rule 6: Strong overall performance ────────────────────────────────────
  if (totalGainPct >= 20 && totalGain > 0) {
    suggestions.push({
      id: 'strong_perf',
      type: 'success',
      title: 'Performance positive',
      message: `Votre portefeuille a \u00e9volu\u00e9 de +${totalGainPct.toFixed(1)}% depuis votre entr\u00e9e. Continuez \u00e0 suivre vos positions r\u00e9guli\u00e8rement.`,
    });
  }

  // Per-holding rules
  for (const h of holdings) {
    if (h.assetType !== 'STOCK') continue;
    const hp = holdingPerfs[h.id];
    if (!hp) continue;

    const cost = h.quantity * h.purchasePrice;
    const weight = totalCost > 0 ? cost / totalCost : 0;
    const hasLivePrice = hp.currentPrice !== null && hp.currentPrice > 0;

    // ── Rule 1: Concentration risk ─────────────────────────────────────────
    if (weight > 0.30 && totalCost > 0) {
      suggestions.push({
        id: `concentration_${h.id}`,
        type: 'warning',
        title: 'Risque de concentration',
        ticker: h.assetSymbol.split(':')[1] ?? h.assetSymbol,
        message: `${h.assetName} représente ${(weight * 100).toFixed(0)}% de votre capital investi. Envisagez de diversifier pour réduire le risque.`,
      });
    }

    if (!hasLivePrice) continue;

    // ── Rule 2: Loss alert (> -15%) ────────────────────────────────────────
    if (hp.gainLossPct < -15) {
      suggestions.push({
        id: `loss_alert_${h.id}`,
        type: 'alert',
        title: 'Position en forte perte',
        ticker: h.assetSymbol.split(':')[1] ?? h.assetSymbol,
        message: `${h.assetName} est en baisse de ${hp.gainLossPct.toFixed(1)}% depuis votre achat. Réévaluez votre thèse d'investissement.`,
      });
    }

    // ── Rule 3: Strong gain (> +30%) ───────────────────────────────────────
    if (hp.gainLossPct > 30) {
      suggestions.push({
        id: `strong_gain_${h.id}`,
        type: 'success',
        title: 'Performance positive',
        ticker: h.assetSymbol.split(':')[1] ?? h.assetSymbol,
        message: `${h.assetName} affiche une variation de +${hp.gainLossPct.toFixed(1)}% depuis votre prix d\u2019entr\u00e9e. Consultez les derni\u00e8res publications financi\u00e8res sur casablanca-bourse.com.`,
      });
    }

    // ── Rule 4: Stagnation (< ±2% and has live price) ─────────────────────
    if (Math.abs(hp.gainLossPct) < 2) {
      suggestions.push({
        id: `stagnation_${h.id}`,
        type: 'info',
        title: 'Position stable',
        ticker: h.assetSymbol.split(':')[1] ?? h.assetSymbol,
        message: `${h.assetName} \u00e9volue peu depuis votre achat (${hp.gainLossPct >= 0 ? '+' : ''}${hp.gainLossPct.toFixed(2)}%). Consultez les derni\u00e8res publications financi\u00e8res de la soci\u00e9t\u00e9 pour mieux comprendre les fondamentaux.`,
      });
    }

    // ── Rule 8: Mining sector context ─────────────────────────────────────
    const sector = stockSector(h.assetSymbol);
    if (sector && sector.toLowerCase().includes('mines')) {
      suggestions.push({
        id: `mining_${h.id}`,
        type: 'info',
        title: 'Valeur minière',
        ticker: h.assetSymbol.split(':')[1] ?? h.assetSymbol,
        message: `${h.assetName} est une valeur minière. Suivez l'évolution des cours des matières premières (phosphates, argent) qui influencent directement ses résultats.`,
      });
    }
  }

  // ── Rule 5: Sector concentration ─────────────────────────────────────────
  const sectorWeights: Record<string, number> = {};
  for (const h of holdings) {
    if (h.assetType !== 'STOCK') continue;
    const sector = stockSector(h.assetSymbol);
    if (!sector) continue;
    const cost = h.quantity * h.purchasePrice;
    sectorWeights[sector] = (sectorWeights[sector] ?? 0) + cost;
  }
  for (const [sector, sectorCost] of Object.entries(sectorWeights)) {
    const sectorWeight = totalCost > 0 ? sectorCost / totalCost : 0;
    if (sectorWeight > 0.60) {
      suggestions.push({
        id: `sector_${sector}`,
        type: 'warning',
        title: 'Concentration sectorielle',
        message: `Plus de ${(sectorWeight * 100).toFixed(0)}% de votre portefeuille est exposé au secteur "${sector}". Une diversification sectorielle réduirait votre risque.`,
      });
    }
  }

  // Deduplicate by id and limit to 5 most relevant
  const seen = new Set<string>();
  const unique: Suggestion[] = [];
  for (const s of suggestions) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      unique.push(s);
    }
  }

  // Priority order: alert > warning > success > info
  const order: Record<SuggestionType, number> = { alert: 0, warning: 1, success: 2, info: 3 };
  return unique.sort((a, b) => order[a.type] - order[b.type]).slice(0, 5);
}
