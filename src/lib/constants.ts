/**
 * WallStreet Morocco — Application-wide constants
 */

/** Prefix for Droits d'Attribution instruments (BVC API) */
export const DA_PREFIX = 'DA';

/**
 * Actual BVC ticker codes for Droits d'Attribution instruments.
 * These are returned by the Casablanca Bourse API without spaces.
 * Used to filter DA instruments out of the equity list and into the DA sub-tab.
 */
export const DA_TICKERS: ReadonlySet<string> = new Set([
  'AADHA', // DA ADH 1/1 2008
  'AATHA', // DA ATH 1/3 1999
  'AATHB', // DA ATH 1/1 2008
  'ABCIA', // DA BCI 1/5 2006
  'ABOAA', // DA BOA 2/7 1996
  'ABOAB', // DA BOA 1/10 2000
  'ABOAF', // DA BOA 1/48 2025
  'ACRSA', // DA CRS 1/5 2007
  'ADISA', // DA DIS 1/5 1999
  'ADRIA', // DA DRI 1/10 2006
  'AIBCA', // DA IBC 1/1 2001
  'ALHMA', // DA LHM 8/3 2007
  'AMLEA', // DA MLE 1/4 1999
  'ANEJA', // DA NEJ 1/5 2000
  'ANEJB', // DA NEJ 1/10 2006
  'AOULA', // DA OUL 7/3 1999
  'AOULB', // DA OUL 2/1 2006
]);

/**
 * BVC ticker codes for listed obligations / bonds.
 * Excluded from both the equity list and DA sub-tab.
 */
export const BOND_TICKERS: ReadonlySet<string> = new Set([
  'OATWM', // 28JUN2016 3.74% 10A 100K ATW
  'OBOAE', // 28JUN2016 3.74% 10A 100K BOA
  'OCAMF', // 12OCT2016 4.43% 10A 100K CAM
  'OCAMG', // 01NOV2018 4.10% 10A 100K CAM
  'OCAMJ', // 11OCT2017 4.22% 10A 100K CAM
  'OCDMC', // 21DEC2016 3.93% 10A 100K CDM
  'OCDMD', // 17DEC2018 4.05% 10A 100K CDM
  'OCFGC', // 23DEC2021 4.69% IND 100K CFG
  'OCIHC', // 18MAI2018 4.02% 10A 100K CIH
  'OFECA', // 20JAN2012 5.30% 15A 100K FEC
  'OOCFC', // 20OCT2011 5.11% 15A 100K OCF
  'OOCPB', // 23DEC2016 4.07% IND 100K OCP
  'OOCPC', // 14MAI2018 4.03% IND 100K OCP
  'OSOGD', // 28JUN2018 4.00% 10A 100K SOG
]);

/**
 * Official BVC listed equities — 78 tickers.
 * Source: Bourse de Casablanca official instruments list.
 * Excludes Droits d'Attribution (DA) and OPCVM instruments.
 * Used to filter the Actions sub-tab in Valeurs BVC.
 */
export const BVC_STOCKS_78: string[] = [
  // Banques (6)
  'ATW', 'BCP', 'BOA', 'BCI', 'CDM', 'CIH',
  // Assurances (5)
  'WAA', 'ATL', 'SAH', 'AGM', 'AFM',
  // Sociétés de financement (5)
  'EQD', 'SLF', 'MAB', 'MLE', 'DIS',
  // Télécommunications (1)
  'IAM',
  // Mines (5)
  'MNG', 'SMI', 'CMT', 'ZDJ', 'ALM',
  // BTP & Matériaux (5)
  'LHM', 'CMA', 'JET', 'STR', 'TGC',
  // Immobilier (7)
  'ADH', 'ADI', 'RDS', 'ARD', 'IMO', 'RIS', 'BAL',
  // Pétrole et Gaz (3)
  'GAZ', 'TMA', 'SAM',
  // Énergie (1)
  'TQM',
  // Agroalimentaire (9)
  'CSR', 'LES', 'OUL', 'SBM', 'CDA', 'CRS', 'DRI', 'MUT', 'UMR',
  // Distribution (4)
  'LBV', 'ATH', 'NEJ', 'NKL',
  // Santé (3)
  'SOT', 'PRO', 'AKT',
  // Technologie (8)
  'HPS', 'S2M', 'DWY', 'M2M', 'DYT', 'INV', 'IBC', 'MIC',
  // Transport (3)
  'MSA', 'CTM', 'TIM',
  // Industrie (11)
  'DHO', 'SID', 'SNA', 'FBR', 'MOX', 'SRM', 'MDP', 'AFI', 'SNP', 'COL', 'DLM',
  // Holdings (2)
  'CFG', 'REB',
];

/**
 * Bloomberg terminal color palette.
 * Apply EXCLUSIVELY to charts and visualizations.
 * Do NOT apply to general UI backgrounds, sidebars, or text outside of chart contexts.
 */
export const BLOOMBERG_COLORS = {
  primaryBg:    '#000000',  // Primary background
  chartBg:      '#0D0D0D',  // Chart background
  gridLines:    '#1A1A1A',  // Grid lines
  priceLine:    '#FF8C00',  // Price line / main series (amber/orange)
  positive:     '#39FF14',  // Positive / uptick (neon green)
  negative:     '#FF3333',  // Negative / downtick (red)
  volumeBars:   '#CC6600',  // Volume bars (muted orange)
  movingAvg:    '#00BFFF',  // Moving averages (deep sky blue)
  secondary:    '#FF00FF',  // Secondary line (magenta)
  axisLabels:   '#CCCCCC',  // Axis labels / text (light grey)
  highlight:    '#FFFFFF',  // Highlight / selected (white)
  heatmapPosLo: '#003300',  // Sector heatmap positive — dark end
  heatmapPosHi: '#00FF00',  // Sector heatmap positive — bright end
  heatmapNegLo: '#330000',  // Sector heatmap negative — dark end
  heatmapNegHi: '#FF0000',  // Sector heatmap negative — bright end
} as const;

/**
 * DA parent stock mapping — resolves a DA instrument to its underlying equity.
 * Key  : full DA ticker as returned by BVC API (e.g. "DA ATW")
 * Value: parent equity ticker              (e.g. "ATW")
 * Used in the DA sub-tab to render a clickable "Valeur mère" link.
 */
export const DA_PARENT_MAP: Record<string, string> = {
  // Actual BVC ticker codes
  'AADHA': 'ADH',
  'AATHA': 'ATH',
  'AATHB': 'ATH',
  'ABCIA': 'BCI',
  'ABOAA': 'BOA',
  'ABOAB': 'BOA',
  'ABOAF': 'BOA',
  'ACRSA': 'CRS',
  'ADISA': 'DWY',
  'ADRIA': 'DRI',
  'AIBCA': 'IBC',
  'ALHMA': 'LHM',
  'AMLEA': 'MLE',
  'ANEJA': 'NEJ',
  'ANEJB': 'NEJ',
  'AOULA': 'OUL',
  'AOULB': 'OUL',
  // Legacy space-format keys for backward compatibility
  'DA ATW': 'ATW', 'DA BCP': 'BCP', 'DA BOA': 'BOA', 'DA IAM': 'IAM',
  'DA CIH': 'CIH', 'DA CDM': 'CDM', 'DA BCI': 'BCI', 'DA LHM': 'LHM',
  'DA WAA': 'WAA', 'DA ATL': 'ATL', 'DA SAH': 'SAH', 'DA MNG': 'MNG',
  'DA CSR': 'CSR', 'DA LBV': 'LBV', 'DA ADH': 'ADH', 'DA ADI': 'ADI',
  'DA HPS': 'HPS', 'DA MSA': 'MSA', 'DA TQM': 'TQM', 'DA TMA': 'TMA',
  'DA AKT': 'AKT',
};
