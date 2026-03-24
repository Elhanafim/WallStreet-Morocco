const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-MA',
  en: 'en-US',
  es: 'es-ES',
};

export function getLocale(lang: string): string {
  return LOCALE_MAP[lang] ?? 'fr-MA';
}

export function formatNumber(value: number, lang: string, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getLocale(lang), opts).format(value);
}

export function formatCurrency(value: number, lang: string, currency = 'MAD'): string {
  return new Intl.NumberFormat(getLocale(lang), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, lang: string): string {
  return new Intl.NumberFormat(getLocale(lang), {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100);
}

export function formatDate(date: Date | string, lang: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getLocale(lang), opts ?? { dateStyle: 'medium' }).format(d);
}
