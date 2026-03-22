export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Bases' | 'Actions' | 'OPCVM' | 'Stratégie';
  readTime: number;
  date: string;
  premium: boolean;
  author?: string;
  coverImage?: string;
  tags?: string[];
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
  marketCap?: number;
  high52w?: number;
  low52w?: number;
}

export interface OPCVMFund {
  id: string;
  bank: string;
  bankCode: string;
  name: string;
  type: 'Actions' | 'Obligataire' | 'Monétaire' | 'Diversifié' | 'Contractuel';
  performance1Y: number;
  performance3Y: number;
  performanceYTD?: number;
  risk: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  minInvestment: number;
  currency: string;
  nav?: number;
  totalAssets?: number;
  inception?: string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  country: string;
  countryFlag: string;
  title: string;
  category: 'Politique Monétaire' | 'Emploi' | 'Inflation' | 'Croissance' | 'Commerce' | 'Marché Boursier' | 'Résultats';
  impactScore: 1 | 2 | 3 | 4 | 5;
  description: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  time?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing: 'mensuel' | 'annuel' | 'gratuit';
  description: string;
  features: PricingFeature[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingFeature {
  label: string;
  included: boolean;
  detail?: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SimulatorInput {
  monthlyAmount: number;
  riskLevel: 'conservateur' | 'equilibre' | 'croissance';
  timeHorizon: number;
  initialAmount?: number;
}

export interface SimulatorResult {
  year: number;
  value: number;
  contributions: number;
  returns: number;
}

export interface Allocation {
  name: string;
  percentage: number;
  color: string;
}
