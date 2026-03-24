export interface CalendarRegion {
  id: string;
  label: string;
  flag: string;
  accentColor: string;
  countries: string[];
  priority: number;
}

export const REGIONS: CalendarRegion[] = [
  {
    id: 'maroc',
    label: 'Maroc',
    flag: '🇲🇦',
    accentColor: '#c1272d',
    countries: ['MA'],
    priority: 1,
  },
  {
    id: 'etats-unis',
    label: 'États-Unis',
    flag: '🇺🇸',
    accentColor: '#374151',
    countries: ['US'],
    priority: 2,
  },
  {
    id: 'zone-euro',
    label: 'Zone Euro',
    flag: '🇪🇺',
    accentColor: '#4b5563',
    countries: ['EU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'IE', 'GR', 'SK', 'SI', 'LU', 'CY', 'EE', 'LV', 'LT', 'MT'],
    priority: 3,
  },
  {
    id: 'mena',
    label: 'MENA',
    flag: '🌍',
    accentColor: '#d4af37',
    countries: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'TN', 'DZ', 'LY', 'IQ', 'IR', 'TR'],
    priority: 4,
  },
  {
    id: 'mondial',
    label: 'Mondial',
    flag: '🌐',
    accentColor: '#6b7280',
    countries: [],
    priority: 5,
  },
];

const COUNTRY_TO_REGION: Record<string, string> = {};
for (const region of REGIONS) {
  for (const country of region.countries) {
    COUNTRY_TO_REGION[country] = region.id;
  }
}

export function getRegionId(country: string): string {
  return COUNTRY_TO_REGION[country] ?? 'mondial';
}
