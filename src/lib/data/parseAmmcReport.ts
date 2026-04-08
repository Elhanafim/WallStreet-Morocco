/**
 * parseAmmcReport.ts
 *
 * Normalizes a raw RawAmmcReport (AI-extracted PDF data with inconsistent
 * schemas) into a clean ParsedAmmcReport used by the frontend components.
 *
 * Key complexity: income_statement and balance_sheet each have 3–4 incompatible
 * schemas across the 88+ company files. Type guards from ammc-raw.ts narrow them.
 */

import type { RawAmmcReport, RawIncomeStatementRow, RawBalanceSheetRow } from '@/types/ammc-raw';
import {
  isISPeriodRow, isISMetricRow,
  isBSPeriodRow, isBSMetricRow, isBSCategoryRow,
  isBoardMemberObject, isExecutiveMemberObject,
  normalizeShareholderName, normalizeShareholderPct, normalizeShareholderShares,
} from '@/types/ammc-raw';

// ── Normalized output types ────────────────────────────────────────────────────

export interface NormalizedISPeriod {
  period: string;
  revenue:          number | null;   // products_of_exploitation
  charges:          number | null;
  operatingResult:  number | null;
  financialResult:  number | null;
  netResult:        number | null;
  corporateTax:     number | null;
}

export interface NormalizedBSSnapshot {
  period:        string;
  totalAssets:   number | null;
  equity:        number | null;
  currentLiab:   number | null;
  nonCurrentAssets: number | null;
}

export interface NormalizedBoardMember {
  name: string;
  role: string;
  meta: string | null;   // type / period / committee label
}

export interface NormalizedExecutive {
  name: string | null;
  role: string;
  detail: string | null;
}

export interface NormalizedShareholder {
  name:       string;
  pct:        number | null;   // percentage 0–100
  shares:     number | null;
}

export interface NormalizedDividend {
  period: string;
  type:   string;             // 'total' | 'per_share' | 'unknown'
  amount: number;
}

export interface ParsedAmmcReport {
  meta: {
    companyName:  string | null;
    ticker:       string | null;
    isin:         string | null;
    fiscalYear:   string | null;
    currency:     string | null;
    auditor:      string | null;
    confidence:   string;
    missingFields: string[];
  };
  incomeStatement:    NormalizedISPeriod[];
  balanceSheet:       NormalizedBSSnapshot[];
  boardOfDirectors:   NormalizedBoardMember[];
  executiveTeam:      NormalizedExecutive[];
  shareholding:       NormalizedShareholder[];
  dividends:          NormalizedDividend[];
  shareCapital:       number | null;
}

// ── Income statement normalization ────────────────────────────────────────────

function parseIS(rows: RawIncomeStatementRow[]): NormalizedISPeriod[] {
  if (!rows?.length) return [];

  const firstRow = rows[0];

  if (isISPeriodRow(firstRow)) {
    // Variant A: one row per period
    return rows
      .filter(isISPeriodRow)
      .filter(r => !r.period.startsWith('DGSM'))   // skip DGSM subsidiary rows
      .map(r => ({
        period:          r.period,
        revenue:         r.products_of_exploitation ?? null,
        charges:         r.charges_of_exploitation  ?? null,
        operatingResult: r.operating_result         ?? null,
        financialResult: r.financial_result         ?? null,
        netResult:       r.net_result               ?? null,
        corporateTax:    r.corporate_tax            ?? null,
      }));
  }

  if (isISMetricRow(firstRow)) {
    // Variant B: wide metric rows — pivot to per-period
    const periods: Record<string, NormalizedISPeriod> = {
      '2024': { period: '2024', revenue: null, charges: null, operatingResult: null, financialResult: null, netResult: null, corporateTax: null },
      '2023': { period: '2023', revenue: null, charges: null, operatingResult: null, financialResult: null, netResult: null, corporateTax: null },
    };

    const assign = (p: NormalizedISPeriod, key: keyof NormalizedISPeriod, v: number | null | undefined) => {
      if (v != null) (p as unknown as Record<string, unknown>)[key] = v;
    };

    for (const row of rows.filter(isISMetricRow)) {
      const m = row.metric?.toLowerCase() ?? '';
      const y24 = row.year_2024 ?? null;
      const y23 = row.year_2023 ?? null;

      if (m.includes('affaires') || m.includes('revenue') || m.includes('chiffre')) {
        assign(periods['2024'], 'revenue', y24);
        assign(periods['2023'], 'revenue', y23);
      } else if (m.includes('résultat net') || m.includes('net result') || m.includes('bénéfice')) {
        assign(periods['2024'], 'netResult', y24);
        assign(periods['2023'], 'netResult', y23);
      } else if (m.includes('exploitation') || m.includes('operating')) {
        assign(periods['2024'], 'operatingResult', y24);
        assign(periods['2023'], 'operatingResult', y23);
      } else if (m.includes('charges')) {
        assign(periods['2024'], 'charges', y24);
        assign(periods['2023'], 'charges', y23);
      } else if (m.includes('impôt') || m.includes('tax')) {
        assign(periods['2024'], 'corporateTax', y24);
        assign(periods['2023'], 'corporateTax', y23);
      }
    }

    return Object.values(periods).filter(p =>
      p.revenue != null || p.netResult != null || p.operatingResult != null
    );
  }

  return [];
}

// ── Balance sheet normalization ───────────────────────────────────────────────

function parseBS(rows: RawBalanceSheetRow[]): NormalizedBSSnapshot[] {
  if (!rows?.length) return [];

  const firstRow = rows[0];

  if (isBSPeriodRow(firstRow)) {
    return rows.filter(isBSPeriodRow).map(r => ({
      period:           r.period,
      totalAssets:      r.total_assets                 ?? null,
      equity:           r.capital_own                  ?? null,
      currentLiab:      r.current_liabilities          ?? null,
      nonCurrentAssets: r.non_current_assets           ?? null,
    }));
  }

  if (isBSMetricRow(firstRow)) {
    const snap24: NormalizedBSSnapshot = { period: '2024', totalAssets: null, equity: null, currentLiab: null, nonCurrentAssets: null };
    const snap23: NormalizedBSSnapshot = { period: '2023', totalAssets: null, equity: null, currentLiab: null, nonCurrentAssets: null };

    for (const row of rows.filter(isBSMetricRow)) {
      const m = row.metric?.toLowerCase() ?? '';
      const y24 = row.year_2024 ?? null;
      const y23 = row.year_2023 ?? null;

      if (m.includes('total actif') || m.includes('total asset')) {
        snap24.totalAssets = y24; snap23.totalAssets = y23;
      } else if (m.includes('capitaux propres') || m.includes('equity')) {
        snap24.equity = y24; snap23.equity = y23;
      } else if (m.includes('passif circulant') || m.includes('current liab')) {
        snap24.currentLiab = y24; snap23.currentLiab = y23;
      }
    }
    return [snap24, snap23].filter(s => s.totalAssets != null || s.equity != null);
  }

  if (isBSCategoryRow(firstRow)) {
    // Nested category — extract totals from the first period's details
    const snap: NormalizedBSSnapshot = { period: firstRow.period, totalAssets: null, equity: null, currentLiab: null, nonCurrentAssets: null };
    for (const row of rows.filter(isBSCategoryRow)) {
      const cat = row.category?.toLowerCase() ?? '';
      const total = row.details?.reduce((acc, d) => acc + (d.net_ats ?? 0), 0) ?? 0;
      if (cat.includes('non-current') || cat.includes('immobilisé')) snap.nonCurrentAssets = total;
      if (cat.includes('current asset') || cat.includes('actif circulant')) snap.totalAssets = (snap.totalAssets ?? 0) + total;
      if (cat.includes('equity') || cat.includes('capitaux')) snap.equity = total;
    }
    return snap.totalAssets != null || snap.equity != null ? [snap] : [];
  }

  return [];
}

// ── Governance normalization ──────────────────────────────────────────────────

function parseBoard(raw: unknown[]): NormalizedBoardMember[] {
  return raw
    .map(m => {
      if (typeof m === 'string') {
        return { name: m, role: 'Membre', meta: null };
      }
      const obj = m as Record<string, string>;
      return {
        name: obj.name ?? '—',
        role: obj.role ?? obj.function ?? 'Membre',
        meta: obj.type ?? obj.period ?? null,
      };
    })
    .filter(m => m.name.length > 1 && m.name.length < 80);   // filter narrative strings
}

function parseExecutives(raw: unknown[]): NormalizedExecutive[] {
  return raw
    .map(m => {
      if (typeof m === 'string') {
        return { name: null, role: m, detail: null };
      }
      const obj = m as Record<string, string>;
      if (isExecutiveMemberObject(m as Parameters<typeof isExecutiveMemberObject>[0])) {
        return {
          name:   obj.name ?? null,
          role:   obj.role ?? '—',
          detail: obj.details ?? obj.value?.toString() ?? null,
        };
      }
      return { name: null, role: String(obj.role ?? m), detail: null };
    })
    .filter(e => e.role.length > 1 && e.role.length < 120);
}

// ── Share capital normalization ───────────────────────────────────────────────

function parseShareCapital(raw: unknown): number | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const v = obj.share_capital ?? obj.amount;
  if (v == null) return null;
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^\d.]/g, '')) : Number(v);
  return isNaN(n) ? null : n;
}

// ── Main normalizer ───────────────────────────────────────────────────────────

export function parseAmmcReport(raw: RawAmmcReport): ParsedAmmcReport {
  const fs = raw.financial_statements ?? {};
  const cap = raw.capital_and_shareholders ?? { share_capital: null, shareholding_structure: [], dividends: [] };
  const gov = raw.governance_and_management ?? { board_of_directors: [], executive_team: [] };
  const eq = raw.extraction_quality ?? { overall_confidence: 'unknown', missing_sections: [], notes: '' };

  const incomeStatement = parseIS(Array.isArray(fs.income_statement) ? fs.income_statement : []);
  const balanceSheet    = parseBS(Array.isArray(fs.balance_sheet)    ? fs.balance_sheet    : []);

  const shareholding: NormalizedShareholder[] = (cap.shareholding_structure ?? []).map(s => ({
    name:   normalizeShareholderName(s),
    pct:    normalizeShareholderPct(s),
    shares: normalizeShareholderShares(s),
  })).filter(s => s.name.length > 0 && s.name !== '—');

  const dividends: NormalizedDividend[] = (cap.dividends ?? []).map(d => {
    const obj = d as Record<string, unknown>;
    const amount = typeof obj.amount === 'string'
      ? parseFloat(obj.amount.replace(/[^\d.]/g, ''))
      : Number(obj.amount ?? 0);
    return {
      period: String(obj.period ?? obj.year ?? '?'),
      type:   String(obj.type ?? 'unknown'),
      amount: isNaN(amount) ? 0 : amount,
    };
  }).filter(d => d.amount > 0);

  return {
    meta: {
      companyName:   raw.meta?.company_name    ?? null,
      ticker:        raw.meta?.ticker          ?? null,
      isin:          raw.meta?.isin            ?? null,
      fiscalYear:    String(raw.meta?.fiscal_year ?? '2024'),
      currency:      raw.meta?.currency        ?? 'MAD',
      auditor:       raw.meta?.auditor_name    ?? null,
      confidence:    eq.overall_confidence,
      missingFields: eq.missing_sections ?? [],
    },
    incomeStatement,
    balanceSheet,
    boardOfDirectors: parseBoard(Array.isArray(gov.board_of_directors) ? gov.board_of_directors : []),
    executiveTeam:    parseExecutives(Array.isArray(gov.executive_team) ? gov.executive_team : []),
    shareholding,
    dividends,
    shareCapital: parseShareCapital(cap.share_capital),
  };
}
