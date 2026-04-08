/**
 * ammcReportsMap.ts
 *
 * Maps BVC tickers → static JSON file names served from
 * /public/data/ammc-reports/*.json
 *
 * Generated from: /Users/user/auto/AMMC_rapports_2024_json/
 * File naming convention: {COMPANY_KEY}_RAPPORTS_ANNUELS_2024.json
 */

const BASE = '/data/ammc-reports';

const TICKER_TO_FILE: Record<string, string> = {
  // Immobilier
  ADH: 'ADDOHA',
  ADI: 'ALLIANCES_DEVELOPPEMENT_IMMOBILIER_ADI',
  RDS: 'RESIDENCES_DAR_SAADA_RDS',
  ARD: 'ARADEI_CAPITAL',
  RIS: 'RISMA',
  BAL: 'BALIMA',

  // Banques
  ATW: 'ATTIJARIWAFA_BANK',
  BCP: 'BANQUE_CENTRALE_POPULAIRE_BCP',
  BOA: 'BANK_OF_AFRICA_GROUPE_BMCE_BOA',
  BCI: 'BMCI',
  CDM: 'CREDIT_DU_MAROC_CDM',
  CIH: 'CIH_BANK',

  // Assurances
  WAA: 'WAFA_ASSURANCE',
  ATL: 'ATLANTASANAD',
  SAH: 'SANLAM_MAROC_EX_SAHAM_ASSURANCE',
  AGM: 'AGMA',
  AFM: 'AFMA',

  // Sociétés de financement
  EQD: 'EQDOM',
  SLF: 'SALAFIN',
  MAB: 'MAGHREBAIL',
  MLE: 'MAROC_LEASING_SA',

  // Télécommunications
  IAM: 'MAROC_TELECOM',

  // Mines
  MNG: 'MANAGEM',
  SMI: 'SMI',
  CMT: 'COMPAGNIE_MINIERE_DE_TOUISSIT_CMT',
  ZDJ: 'ZELLIDJA',
  ALM: 'ALUMINIUM_DU_MAROC',

  // BTP & Matériaux
  LHM: 'LAFARGEHOLCIM_MAROC',
  CMA: 'CIMENTS_DU_MAROC',
  JET: 'JET_CONTRACTORS',
  STR: 'STROC',
  TGC: 'TGCC_SA',

  // Pétrole et Gaz
  TMA: 'TOTALENERGIES_MARKETING_MAROC',

  // Énergie
  TQM: 'TAQA_MOROCCO_EX_JLEC',

  // Agroalimentaire
  CSR: 'COSUMAR',
  LES: 'LESIEUR_CRISTAL',
  OUL: 'OULMES',
  SBM: 'SOCIETE_DES_BOISSONS_DU_MAROC_SBM',
  CRS: 'CARTIER_SAADA',
  DRI: 'DARI_COUSPATE',
  MUT: 'MUTANDIS_SCA',
  UMR: 'UNIMER',

  // Distribution
  LBV: 'LABEL_VIE_S_A',
  ATH: 'AUTO_HALL',
  NEJ: 'AUTO_NEJMA',
  NKL: 'ENNAKL_AUTOMOBILES',

  // Santé
  PRO: 'PROMOPHARM',
  AKT: 'AKDITAL',

  // Technologie
  HPS: 'HPS_SA',
  S2M: 'S2M',
  DWY: 'DISWAY',
  M2M: 'M2M_GROUP',
  DYT: 'DISTY_TECHNOLOGIES',
  INV: 'INVOLYS',
  MIC: 'MICRODATA',

  // Transport
  MSA: 'MARSA_MAROC',
  CTM: 'CTM',

  // Industrie
  DHO: 'DELTA_HOLDING_S_A',
  SID: 'SONASID',
  SNA: 'STOKVIS_NORD_AFRIQUE',
  FBR: 'FENIE_BROSSETTE',
  MDP: 'MED_PAPER_EX_PAPELERA_DE_TETUAN',
  AFI: 'AFRIC_INDUSTRIES_SA',
  SNP: 'SNEP',
  COL: 'COLORADO_SA',

  // Holdings
  REB: 'REBAB_COMPANY',

  // Infra / Public
  ADM: 'ADM',
  ANP: 'AGENCE_NATIONALE_DES_PORTS_ANP',
};

/** Returns the public URL for a ticker's AMMC raw JSON, or null if unmapped. */
export function getAmmcReportUrl(ticker: string): string | null {
  const key = TICKER_TO_FILE[ticker.toUpperCase()];
  if (!key) return null;
  return `${BASE}/${key}_RAPPORTS_ANNUELS_2024.json`;
}

/** All tickers that have a raw AMMC JSON file available. */
export const AMMC_COVERED_TICKERS = new Set(Object.keys(TICKER_TO_FILE));
