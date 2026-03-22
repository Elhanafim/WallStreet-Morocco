import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Moroccan Dirham currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'MAD',
  locale: string = 'fr-MA'
): string {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} Mrd MAD`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)} M MAD`;
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)} MAD`;
  }

  return `${new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} MAD`;
}

/**
 * Format a number as a percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  showSign: boolean = true
): string {
  const formatted = Math.abs(value).toFixed(decimals);
  if (showSign) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${value >= 0 ? '' : '-'}${formatted}%`;
}

/**
 * Format a date string to French locale
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }[format] as Intl.DateTimeFormatOptions;

  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Format a large number with K/M/B abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}Mrd`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Compound interest calculation
 * A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
 */
export function calculateCompoundInterest(
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  years: number,
  compoundsPerYear: number = 12
): number {
  const r = annualRate / 100;
  const n = compoundsPerYear;
  const t = years;

  // Future value of principal
  const fvPrincipal = principal * Math.pow(1 + r / n, n * t);

  // Future value of monthly contributions (annuity)
  let fvAnnuity = 0;
  if (r > 0) {
    fvAnnuity =
      monthlyPayment * (Math.pow(1 + r / n, n * t) - 1) / (r / n);
  } else {
    fvAnnuity = monthlyPayment * n * t;
  }

  return fvPrincipal + fvAnnuity;
}

/**
 * Get color class based on value (positive/negative)
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-danger';
  return 'text-primary/60';
}

/**
 * Get background color class based on value
 */
export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-success/10 text-success';
  if (value < 0) return 'bg-danger/10 text-danger';
  return 'bg-surface-200 text-primary/60';
}

/**
 * Get impact color based on score 1-5
 */
export function getImpactColor(score: number): string {
  if (score >= 5) return 'bg-danger text-white';
  if (score >= 4) return 'bg-warning text-white';
  if (score >= 3) return 'bg-accent text-primary';
  if (score >= 2) return 'bg-secondary/20 text-secondary';
  return 'bg-surface-200 text-primary/60';
}

/**
 * Get risk level label in French
 */
export function getRiskLabel(risk: number): string {
  const labels: Record<number, string> = {
    1: 'Très faible',
    2: 'Faible',
    3: 'Modéré',
    4: 'Élevé',
    5: 'Très élevé',
    6: 'Agressif',
    7: 'Très agressif',
  };
  return labels[risk] || 'Inconnu';
}

/**
 * Get risk color based on score
 */
export function getRiskColor(risk: number): string {
  if (risk <= 2) return 'text-success';
  if (risk <= 4) return 'text-warning';
  return 'text-danger';
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Get relative time in French
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} ans`;
}
