// Single source of truth for Bourse de Casablanca sector taxonomy.
// Both the Marchés page and the portfolio builder read from here.

export interface MarketSector {
  id: string;
  name: string;
  icon: string;           // emoji
  symbols: string[];      // raw tickers WITHOUT exchange prefix (e.g. "ATW", not "CSEMA:ATW")
}

export const SECTORS: MarketSector[] = [
  {
    id: 'banques',
    name: 'Banques & Services Financiers',
    icon: '🏦',
    symbols: ['ATW', 'BCP', 'BOA', 'BCI', 'CIH', 'CDM', 'CFG',
              'WAA', 'ATL', 'SAH', 'AGM', 'AFM',
              'EQD', 'SLF', 'MAB', 'MLE'],
  },
  {
    id: 'telecoms',
    name: 'Télécommunications',
    icon: '📡',
    symbols: ['IAM'],
  },
  {
    id: 'mines',
    name: 'Mines & Matériaux',
    icon: '⛏️',
    symbols: ['MNG', 'CMT', 'SMI', 'ZDJ', 'ALM'],
  },
  {
    id: 'btp',
    name: 'BTP & Construction',
    icon: '🏗️',
    symbols: ['LHM', 'CMA', 'GTM', 'TGC', 'JET', 'STR'],
  },
  {
    id: 'immobilier',
    name: 'Immobilier',
    icon: '🏢',
    symbols: ['ADH', 'ADI', 'RDS', 'ARD', 'IMO', 'RIS', 'BAL'],
  },
  {
    id: 'energie',
    name: 'Pétrole, Gaz & Énergie',
    icon: '⚡',
    symbols: ['GAZ', 'TQM', 'TMA'],
  },
  {
    id: 'agro',
    name: 'Agroalimentaire & Boissons',
    icon: '🌾',
    symbols: ['CSR', 'LES', 'OUL', 'MUT', 'SBM', 'CRS', 'DRI', 'UMR'],
  },
  {
    id: 'distribution',
    name: 'Distribution',
    icon: '🛒',
    symbols: ['LBV', 'ATH', 'NEJ', 'NKL'],
  },
  {
    id: 'sante',
    name: 'Santé & Pharmacie',
    icon: '🏥',
    symbols: ['SOT', 'AKT', 'PRO'],
  },
  {
    id: 'tech',
    name: 'Technologie & IT',
    icon: '💻',
    symbols: ['HPS', 'S2M', 'MIC', 'DYT', 'M2M', 'INV', 'IBC', 'CMG', 'DWY'],
  },
  {
    id: 'transport',
    name: 'Transport & Logistique',
    icon: '🚢',
    symbols: ['MSA', 'CTM', 'CAP'],
  },
  {
    id: 'industrie',
    name: 'Industrie & Conglomérats',
    icon: '🏭',
    symbols: ['DHO', 'SID', 'SNA', 'FBR', 'MOX', 'SRM', 'MDP', 'AFI', 'SNP', 'COL'],
  },
  {
    id: 'autres',
    name: 'Autres & Divers',
    icon: '📊',
    symbols: ['VCN', 'REB'],
  },
];

/** Return the sector for a given raw ticker (e.g. "ATW") */
export function getSectorForTicker(ticker: string): MarketSector | undefined {
  return SECTORS.find((s) => s.symbols.includes(ticker));
}
