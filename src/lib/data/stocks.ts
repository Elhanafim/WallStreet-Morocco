import { Stock } from '@/types';

export const stocks: Stock[] = [
  {
    symbol: 'ATW',
    name: 'Attijariwafa Bank',
    price: 535.40,
    change: 8.40,
    changePercent: 1.59,
    volume: 142_580,
    sector: 'Banques',
    marketCap: 115_200_000_000,
    high52w: 562.00,
    low52w: 478.50,
  },
  {
    symbol: 'BCP',
    name: 'Banque Centrale Populaire',
    price: 291.75,
    change: -2.25,
    changePercent: -0.77,
    volume: 89_340,
    sector: 'Banques',
    marketCap: 62_800_000_000,
    high52w: 312.00,
    low52w: 268.00,
  },
  {
    symbol: 'IAM',
    name: 'Maroc Telecom',
    price: 142.80,
    change: 0.80,
    changePercent: 0.56,
    volume: 215_670,
    sector: 'Télécoms',
    marketCap: 122_400_000_000,
    high52w: 155.00,
    low52w: 130.50,
  },
  {
    symbol: 'MASI',
    name: 'Moroccan All Shares Index',
    price: 13_428.56,
    change: 87.34,
    changePercent: 0.65,
    volume: 0,
    sector: 'Indice',
    marketCap: 0,
    high52w: 14_120.00,
    low52w: 11_890.00,
  },
  {
    symbol: 'MADEX',
    name: 'Most Active Shares Index',
    price: 11_034.21,
    change: 72.18,
    changePercent: 0.66,
    volume: 0,
    sector: 'Indice',
    marketCap: 0,
    high52w: 11_580.00,
    low52w: 9_750.00,
  },
  {
    symbol: 'BMCE',
    name: 'Bank of Africa',
    price: 231.50,
    change: -1.00,
    changePercent: -0.43,
    volume: 56_820,
    sector: 'Banques',
    marketCap: 38_900_000_000,
    high52w: 258.00,
    low52w: 218.00,
  },
  {
    symbol: 'CIH',
    name: 'CIH Bank',
    price: 348.90,
    change: 5.90,
    changePercent: 1.72,
    volume: 34_150,
    sector: 'Banques',
    marketCap: 12_100_000_000,
    high52w: 368.00,
    low52w: 290.00,
  },
  {
    symbol: 'LAFA',
    name: 'LafargeHolcim Maroc',
    price: 1_870.00,
    change: -30.00,
    changePercent: -1.58,
    volume: 8_240,
    sector: 'BTP & Matériaux',
    marketCap: 28_700_000_000,
    high52w: 1_980.00,
    low52w: 1_650.00,
  },
  {
    symbol: 'WAA',
    name: 'Wafa Assurance',
    price: 4_230.00,
    change: 45.00,
    changePercent: 1.08,
    volume: 2_150,
    sector: 'Assurances',
    marketCap: 16_900_000_000,
    high52w: 4_450.00,
    low52w: 3_850.00,
  },
  {
    symbol: 'LESI',
    name: 'Lesieur Cristal',
    price: 178.50,
    change: 2.50,
    changePercent: 1.42,
    volume: 18_760,
    sector: 'Agroalimentaire',
    marketCap: 5_800_000_000,
    high52w: 195.00,
    low52w: 160.00,
  },
  {
    symbol: 'CDM',
    name: 'Crédit du Maroc',
    price: 548.00,
    change: -8.00,
    changePercent: -1.44,
    volume: 12_340,
    sector: 'Banques',
    marketCap: 8_900_000_000,
    high52w: 590.00,
    low52w: 500.00,
  },
  {
    symbol: 'AUTO',
    name: 'Auto Nejma',
    price: 1_120.00,
    change: 0.00,
    changePercent: 0.00,
    volume: 1_850,
    sector: 'Distribution',
    marketCap: 3_360_000_000,
    high52w: 1_200.00,
    low52w: 980.00,
  },
  {
    symbol: 'ADDH',
    name: 'ADDOHA',
    price: 43.25,
    change: 1.25,
    changePercent: 2.98,
    volume: 345_210,
    sector: 'Immobilier',
    marketCap: 7_850_000_000,
    high52w: 52.00,
    low52w: 35.50,
  },
  {
    symbol: 'ALLE',
    name: 'Alliances Développement Immobilier',
    price: 285.00,
    change: -5.00,
    changePercent: -1.72,
    volume: 15_680,
    sector: 'Immobilier',
    marketCap: 5_200_000_000,
    high52w: 320.00,
    low52w: 255.00,
  },
  {
    symbol: 'LBV',
    name: "Label'Vie",
    price: 4_580.00,
    change: 80.00,
    changePercent: 1.78,
    volume: 3_420,
    sector: 'Distribution',
    marketCap: 9_600_000_000,
    high52w: 4_780.00,
    low52w: 3_900.00,
  },
];

export const marketIndices = stocks.filter((s) => s.sector === 'Indice');
export const listedStocks = stocks.filter((s) => s.sector !== 'Indice');

export function getStockBySymbol(symbol: string): Stock | undefined {
  return stocks.find((s) => s.symbol === symbol);
}

export function getStocksBySector(sector: string): Stock[] {
  return stocks.filter((s) => s.sector === sector);
}

export function getTopGainers(count: number = 5): Stock[] {
  return [...listedStocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count);
}

export function getTopLosers(count: number = 5): Stock[] {
  return [...listedStocks]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count);
}

export const tickerStocks = [
  { symbol: 'MASI', value: 13428.56, change: 0.65 },
  { symbol: 'MADEX', value: 11034.21, change: 0.66 },
  { symbol: 'ATW', value: 535.40, change: 1.59 },
  { symbol: 'BCP', value: 291.75, change: -0.77 },
  { symbol: 'IAM', value: 142.80, change: 0.56 },
  { symbol: 'BMCE', value: 231.50, change: -0.43 },
  { symbol: 'CIH', value: 348.90, change: 1.72 },
  { symbol: 'LAFA', value: 1870.00, change: -1.58 },
  { symbol: 'WAA', value: 4230.00, change: 1.08 },
  { symbol: 'LESI', value: 178.50, change: 1.42 },
  { symbol: 'ADDH', value: 43.25, change: 2.98 },
  { symbol: 'LBV', value: 4580.00, change: 1.78 },
];
