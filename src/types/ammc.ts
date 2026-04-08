/**
 * Rich AMMC financial data structure.
 * All monetary values are in MDH (millions of Moroccan dirhams).
 * Percentages are plain numbers (e.g. 25.3 means 25.3%).
 * dividendeParAction and eps are in DH/action.
 */

export interface AmmcHistoricalPoint {
  year: number;
  value: number | null;
}

export interface AmmcEsg {
  effectif:             number | null;
  femmesPct:            number | null;
  hommesPct:            number | null;
  recrutements:         number | null;
  demissions:           number | null;
  accidentsTravail:     number | null;
  papierParEmployeKg:   number | null;
  energieParEmployeKwh: number | null;
  eauParEmployeM3:      number | null;
  nbAdministrateurs:    number | null;
  nbFemmesCA:           number | null;
  nbIndependants:       number | null;
}

export interface AmmcSubsidiary {
  name:             string;
  participationPct: number | null;
  caKdh:            number | null;
  rnKdh:            number | null;
}

export interface AmmcCompanyData {
  ticker:      string;
  companyName: string;
  sector:      string;
  annee:       number;

  // ── Income statement (MDH) ────────────────────────────────────────────────
  revenue:                  number | null;   // Chiffre d'affaires consolidé
  revenueN1:                number | null;
  ebitda:                   number | null;
  ebitdaN1:                 number | null;
  ebit:                     number | null;   // Résultat d'exploitation
  resultatFinancier:        number | null;
  resultatAvantImpot:       number | null;
  resultatNet:              number | null;
  rnpg:                     number | null;   // Résultat Net Part du Groupe
  rnpgN1:                   number | null;
  eps:                      number | null;   // DH/action
  dividendeParAction:       number | null;   // DH/action
  chargesPersonnel:         number | null;
  dotationsAmortissements:  number | null;

  // ── Balance sheet (MDH) ──────────────────────────────────────────────────
  totalActif:             number | null;
  totalPassif:            number | null;
  capitauxPropresGroupe:  number | null;
  capitauxPropres:        number | null;
  dettesFinancieresLT:    number | null;
  dettesFinancieresCT:    number | null;
  tresorerieActif:        number | null;
  detteNette:             number | null;

  // ── Cash flow (MDH) ──────────────────────────────────────────────────────
  cfo:                  number | null;   // Operating cash flow
  cfi:                  number | null;   // Investing cash flow
  cff:                  number | null;   // Financing cash flow
  capex:                number | null;   // Capital expenditure (positive)
  dividendesPaies:      number | null;
  variationTresorerie:  number | null;
  freeCashFlow:         number | null;

  // ── Pre-computed ratios (%) or multiples ─────────────────────────────────
  margeEbitdaPct:       number | null;
  margeNettePct:        number | null;
  margeExploitationPct: number | null;
  roe:                  number | null;
  detteNetteEbitda:     number | null;   // multiple (x)
  payoutRatioPct:       number | null;
  capexIntensityPct:    number | null;
  ratioEndettement:     number | null;   // multiple (x)

  // ── YoY growth (%) ───────────────────────────────────────────────────────
  revenueGrowthPct: number | null;
  ebitdaGrowthPct:  number | null;
  rnpgGrowthPct:    number | null;

  // ── Historical series (MDH) ──────────────────────────────────────────────
  historical: {
    revenue:   AmmcHistoricalPoint[];
    rnpg:      AmmcHistoricalPoint[];
    ebitda:    AmmcHistoricalPoint[];
    dividende: AmmcHistoricalPoint[];
  };

  // ── Subsidiaries ─────────────────────────────────────────────────────────
  subsidiaries?: AmmcSubsidiary[];

  // ── ESG ──────────────────────────────────────────────────────────────────
  esg: AmmcEsg;

  // ── Extraction quality ───────────────────────────────────────────────────
  extractionQuality: {
    fieldsCoveredPct: number;
    warnings:         string[];
  };
}
