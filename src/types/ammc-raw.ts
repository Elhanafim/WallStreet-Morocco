/**
 * ammc-raw.ts
 *
 * TypeScript interfaces for the raw AI-extracted AMMC annual report JSON files.
 * Files live in /public/data/ammc-reports/ and come from PDF extraction, so
 * every section can have 2–4 incompatible schema variants depending on the
 * company's PDF format.
 *
 * Rule: every optional field is nullable. Union types model variant schemas.
 * Use the type-guard helpers at the bottom to safely narrow unions at runtime.
 */

// ── Meta ──────────────────────────────────────────────────────────────────────

export interface RawMeta {
  company_name:       string | null;
  ticker:             string | null;
  isin:               string | null;
  report_type:        string | null;
  fiscal_year:        string | number | null;
  currency:           string | null;
  auditor_name:       string | null;
  audit_opinion_type: string | null;
}

// ── Income statement ──────────────────────────────────────────────────────────

/** Variant A — one row per accounting period (Microdata style) */
export interface RawISPeriodRow {
  period:                    string;
  products_of_exploitation?: number | null;
  charges_of_exploitation?:  number | null;
  operating_result?:         number | null;
  financial_result?:         number | null;
  current_result?:           number | null;
  non_current_result?:       number | null;
  result_before_taxes?:      number | null;
  corporate_tax?:            number | null;
  net_result?:               number | null;
}

/** Variant B — wide metric rows with year columns (AKDITAL style) */
export interface RawISMetricRow {
  metric:             string;
  year_2024?:         number | null;
  year_2023?:         number | null;
  variation_percent?: number | null;
}

export type RawIncomeStatementRow = RawISPeriodRow | RawISMetricRow;

// ── Balance sheet ─────────────────────────────────────────────────────────────

/** Variant A — flat period snapshot */
export interface RawBSPeriodRow {
  period:                        string;
  total_assets?:                 number | null;
  current_assets?:               number | null;
  non_current_assets?:           number | null;
  total_equity_and_liabilities?: number | null;
  capital_own?:                  number | null;
  current_liabilities?:          number | null;
}

/** Variant B — wide metric rows with year columns */
export interface RawBSMetricRow {
  metric:             string;
  year_2024?:         number | null;
  year_2023?:         number | null;
  variation_percent?: number | null;
}

/** Sub-line item for Variant C */
export interface RawBSLineItem {
  name:       string;
  gross_ats?: number | null;
  net_ats?:   number | null;
}

/** Variant C — nested category breakdown (Aluminium du Maroc style) */
export interface RawBSCategoryRow {
  period:       string;
  category:     string;
  details?:     RawBSLineItem[];
  sub_details?: RawBSLineItem[];
}

export type RawBalanceSheetRow = RawBSPeriodRow | RawBSMetricRow | RawBSCategoryRow;

// ── Cash flow ─────────────────────────────────────────────────────────────────

export interface RawCashFlowRow {
  period?:       string;
  account_name?: string;
  amount?:       number | string | null;
  operating?:    number | null;
  investing?:    number | null;
  financing?:    number | null;
}

// ── Financial statements container ────────────────────────────────────────────

export interface RawFinancialStatements {
  income_statement?:    RawIncomeStatementRow[];
  balance_sheet?:       RawBalanceSheetRow[];
  cash_flow_statement?: RawCashFlowRow[];
  // Artefact fields present in malformed extractions (e.g. ADDOHA)
  company_name?: string;
  section?:      string;
  period?:       string;
  accounts?:     Array<{ account_name: string; amount: string | number | null }>;
}

// ── Capital & shareholders ────────────────────────────────────────────────────

export type RawShareCapital =
  | { share_capital: number }
  | { amount: string | number; currency_code: string }
  | null
  | Record<string, never>;

export type RawShareholder =
  | { stakeholder: string;  percentage?: number | string | null }
  | { holder_name: string;  shares?: number | null }
  | { group: string;        percentage?: number | string | null; details?: string }
  | { shareholder: string;  percentage?: number | string | null };

export type RawDividend =
  | { type: string;           amount: number;           period: string }
  | { amount: string | number; currency_code: string;   year: string | number };

export interface RawCapitalAndShareholders {
  share_capital:          RawShareCapital;
  shareholding_structure: RawShareholder[];
  dividends:              RawDividend[];
}

// ── Governance ────────────────────────────────────────────────────────────────

export type RawBoardMember =
  | { name: string; role: string; type?: string; period?: string }
  | string;

export type RawExecutiveMember =
  | { name: string; role: string; details?: string }
  | { role: string; value?: string | number }
  | string;

export interface RawGovernance {
  board_of_directors: RawBoardMember[];
  executive_team:     RawExecutiveMember[];
}

// ── Extraction quality ────────────────────────────────────────────────────────

export interface RawExtractionQuality {
  overall_confidence: 'high' | 'medium' | 'low' | string;
  missing_sections:   string[];
  notes:              string;
}

// ── Top-level report ──────────────────────────────────────────────────────────

export interface RawAmmcReport {
  meta:                      RawMeta;
  financial_statements:      RawFinancialStatements;
  ratios_and_metrics:        Record<string, unknown>;
  segments_and_breakdowns:   Record<string, unknown>;
  capital_and_shareholders:  RawCapitalAndShareholders;
  risks_and_compliance:      Record<string, unknown>;
  governance_and_management: RawGovernance;
  esg_and_sustainability:    Record<string, unknown>;
  other_important_tables:    unknown[];
  narrative_summaries:       Record<string, unknown>;
  extraction_quality:        RawExtractionQuality;
}

// ── Type guards ───────────────────────────────────────────────────────────────

export function isISPeriodRow(r: RawIncomeStatementRow): r is RawISPeriodRow {
  return 'period' in r;
}
export function isISMetricRow(r: RawIncomeStatementRow): r is RawISMetricRow {
  return 'metric' in r;
}

export function isBSPeriodRow(r: RawBalanceSheetRow): r is RawBSPeriodRow {
  return 'period' in r && !('category' in r);
}
export function isBSMetricRow(r: RawBalanceSheetRow): r is RawBSMetricRow {
  return 'metric' in r;
}
export function isBSCategoryRow(r: RawBalanceSheetRow): r is RawBSCategoryRow {
  return 'category' in r;
}

export function isBoardMemberObject(m: RawBoardMember): m is Exclude<RawBoardMember, string> {
  return typeof m === 'object' && m !== null;
}
export function isExecutiveMemberObject(m: RawExecutiveMember): m is Exclude<RawExecutiveMember, string> {
  return typeof m === 'object' && m !== null && 'role' in m;
}

/** Normalise a raw shareholder entry to { name, pct | shares } */
export function normalizeShareholderName(s: RawShareholder): string {
  if ('stakeholder' in s) return s.stakeholder;
  if ('holder_name' in s) return s.holder_name;
  if ('group' in s) return s.group;
  if ('shareholder' in s) return String(s.shareholder);
  return '—';
}
export function normalizeShareholderPct(s: RawShareholder): number | null {
  const raw =
    'percentage' in s ? s.percentage :
    'shares' in s     ? null : null;
  if (raw == null) return null;
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  return isNaN(n) ? null : n;
}
export function normalizeShareholderShares(s: RawShareholder): number | null {
  return 'shares' in s ? (s.shares ?? null) : null;
}
