/**
 * WallStreet Morocco — Application-wide constants
 */

/** Prefix for Droits d'Attribution instruments (BVC API) */
export const DA_PREFIX = 'DA';

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
  'DA ATW': 'ATW',
  'DA BCP': 'BCP',
  'DA BOA': 'BOA',
  'DA IAM': 'IAM',
  'DA CIH': 'CIH',
  'DA CDM': 'CDM',
  'DA BCI': 'BCI',
  'DA LHM': 'LHM',
  'DA WAA': 'WAA',
  'DA ATL': 'ATL',
  'DA SAH': 'SAH',
  'DA MNG': 'MNG',
  'DA CSR': 'CSR',
  'DA LBV': 'LBV',
  'DA ADH': 'ADH',
  'DA ADI': 'ADI',
  'DA HPS': 'HPS',
  'DA MSA': 'MSA',
  'DA TQM': 'TQM',
  'DA TMA': 'TMA',
  'DA AKT': 'AKT',
};
