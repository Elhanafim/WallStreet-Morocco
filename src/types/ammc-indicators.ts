/**
 * ammc-indicators.ts
 * TypeScript interfaces for ammc-indicators-2024.json
 */

export type IndicatorCategory =
  | 'Marche boursier'
  | 'Gestion collective'
  | 'Financement'
  | 'Supervision'
  | string;

export interface Indicator {
  indicator_id:    string;
  label_fr:        string;
  label_en:        string;
  category:        IndicatorCategory;
  subcategory:     string;
  unit:            string;
  frequency:       'annual' | 'quarterly' | 'monthly' | string;
  description:     string;
  source_chapter:  string;
  source_pages:    number[];
}

export interface Observation {
  indicator_id:    string;
  year:            number;
  period:          string;
  date:            string | null;
  value:           number;
  unit:            string;
  currency:        string | null;
  source_chapter:  string;
  source_pages:    number[];
}

export interface AmmcDatasetMetadata {
  report_title:    string;
  report_year:     number;
  source:          string;
  default_currency: string;
  extraction_date: string;
}

export interface AmmcDataset {
  metadata:     AmmcDatasetMetadata;
  indicators:   Indicator[];
  observations: Observation[];
}

/** Flat enriched row joining indicator label into the observation */
export interface EnrichedObservation extends Observation {
  label_fr: string;
  category: IndicatorCategory;
  subcategory: string;
}
