import * as XLSX from 'xlsx';

// Most recent weekly file from data.gov.ma (AMMC — Open Data Maroc)
// Dataset: https://data.gov.ma/data/fr/dataset/stat-hebdo-opcvm-2025
// Updated to latest available file (26 Dec 2025)
const LATEST_XLS_URL =
  'https://data.gov.ma/data/fr/dataset/7225c7ee-2d16-4402-a84b-20b6a5d7606f/resource/c5e0d1db-7e6f-47c1-bea3-5e1d17545ba0/download/stat_opcvm_hebdo_ammc_26122025.xls';

export interface CategoryStat {
  category: string;
  label: string;          // display label in French
  nbFonds: number;
  actifNetBn: number;     // actif net in billion MAD
  structure: number;      // % of total market
  varHebdo: number;       // weekly variation %
  varMensuel: number;     // monthly variation %
  varAnnuel: number;      // annual variation %
}

export interface OpcvmMarketStats {
  reportDate: string;
  totalActifNetBn: number;
  totalNbFonds: number;
  categories: CategoryStat[];
}

// Category name → friendly display label
const CATEGORY_LABELS: Record<string, string> = {
  'Actions':          'Actions',
  'Diversifiés':      'Diversifiés',
  'Monétaire':        'Monétaire',
  'Obligations CT':   'Oblig. Court Terme',
  'Obligations MLT':  'Oblig. Long Terme',
};

const TRACKED_CATEGORIES = Object.keys(CATEGORY_LABELS);

// Convert raw numeric value to billion MAD.
// AMMC files typically store amounts in millions of MAD (MMAD).
function toBillions(raw: number): number {
  if (raw > 1e9) return raw / 1e9;        // stored in MAD
  if (raw > 1e6) return raw / 1e3;        // stored in thousands of MAD (KMAD)
  if (raw > 1e3) return raw / 1e3;        // stored in millions → billions
  return raw;                             // already in billions
}

// Convert raw cell to percentage (handles both 0.05 and 5.0 formats)
function toPercent(raw: number): number {
  return Math.abs(raw) < 1 ? raw * 100 : raw;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function fetchOpcvmMarketStats(): Promise<OpcvmMarketStats | null> {
  try {
    const res = await fetch(LATEST_XLS_URL, {
      next: { revalidate: 86400 }, // cache for 24 hours
    });
    if (!res.ok) return null;

    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Prefer "Français" sheet; fall back to first sheet
    const sheetName = workbook.SheetNames.includes('Français')
      ? 'Français'
      : workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    const categories: CategoryStat[] = [];
    let totalActifNetBn = 0;
    let totalNbFonds = 0;

    for (const row of rows) {
      if (!row || !row[0]) continue;
      const cellVal = String(row[0]).trim();

      // Handle TOTAL row for aggregate figures
      if (cellVal === 'TOTAL') {
        const nb = typeof row[1] === 'number' ? row[1] : 0;
        const an = typeof row[2] === 'number' ? row[2] : 0;
        totalNbFonds = Math.round(nb);
        totalActifNetBn = round2(toBillions(an));
        continue;
      }

      if (!TRACKED_CATEGORIES.includes(cellVal)) continue;

      // Expected columns: [category, nbFonds, actifNet, structure%, varHebdo%, varMensuel%, varAnnuel%]
      const nbFonds   = typeof row[1] === 'number' ? Math.round(row[1])          : 0;
      const actifRaw  = typeof row[2] === 'number' ? row[2]                      : 0;
      const structRaw = typeof row[3] === 'number' ? row[3]                      : 0;
      const hebdoRaw  = typeof row[4] === 'number' ? row[4]                      : 0;
      const mensRaw   = typeof row[5] === 'number' ? row[5]                      : 0;
      const annRaw    = typeof row[6] === 'number' ? row[6]                      : 0;

      categories.push({
        category: cellVal,
        label: CATEGORY_LABELS[cellVal],
        nbFonds,
        actifNetBn:  round2(toBillions(actifRaw)),
        structure:   round2(toPercent(structRaw)),
        varHebdo:    round2(toPercent(hebdoRaw)),
        varMensuel:  round2(toPercent(mensRaw)),
        varAnnuel:   round2(toPercent(annRaw)),
      });
    }

    if (categories.length === 0) return null;

    // If TOTAL row was missing, derive totals from categories
    if (totalNbFonds === 0) totalNbFonds = categories.reduce((s, c) => s + c.nbFonds, 0);
    if (totalActifNetBn === 0) totalActifNetBn = round2(categories.reduce((s, c) => s + c.actifNetBn, 0));

    return {
      reportDate: '26 décembre 2025',
      totalActifNetBn,
      totalNbFonds,
      categories,
    };
  } catch (err) {
    console.error('[opcvm-stats] Failed to fetch or parse AMMC data:', err);
    return null;
  }
}
