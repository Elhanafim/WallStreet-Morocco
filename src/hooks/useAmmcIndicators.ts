'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AmmcDataset, Observation, EnrichedObservation, IndicatorCategory } from '@/types/ammc-indicators';

// ── Fallback labels for indicator_ids not in the catalog ──────────────────────
const FALLBACK_LABELS: Record<string, { label_fr: string; category: IndicatorCategory; subcategory: string }> = {
  masi_usd_performance:          { label_fr: 'Performance MASI (USD)',         category: 'Marche boursier',   subcategory: 'Indices'        },
  central_market_volume:         { label_fr: 'Volume Marché Central',           category: 'Marche boursier',   subcategory: 'Volumes'        },
  block_market_volume:           { label_fr: 'Volume Bloc',                     category: 'Marche boursier',   subcategory: 'Volumes'        },
  liquidity_ratio:               { label_fr: 'Ratio de Liquidité',              category: 'Marche boursier',   subcategory: 'Liquidité'      },
  securities_lending_volume:     { label_fr: 'Volume Prêt de Titres',           category: 'Marche boursier',   subcategory: 'Prêt titres'    },
  securities_lending_outstanding:{ label_fr: 'Encours Prêt de Titres',          category: 'Marche boursier',   subcategory: 'Prêt titres'    },
  opcvm_funds_count:             { label_fr: 'Nombre de fonds OPCVM',           category: 'Gestion collective', subcategory: 'OPCVM'         },
  opcvm_actions_aum:             { label_fr: 'Actif net OPCVM Actions',         category: 'Gestion collective', subcategory: 'OPCVM'         },
  opcvm_diversifies_aum:         { label_fr: 'Actif net OPCVM Diversifiés',     category: 'Gestion collective', subcategory: 'OPCVM'         },
  fpct_total_aum:                { label_fr: 'Actif net FPCT',                  category: 'Gestion collective', subcategory: 'FPCT'          },
  opcc_total_aum:                { label_fr: 'Actif net OPCC',                  category: 'Gestion collective', subcategory: 'OPCC'          },
  opci_count:                    { label_fr: "Nombre d'OPCI",                   category: 'Gestion collective', subcategory: 'OPCI'          },
  agreements_granted_count:      { label_fr: 'Agréments accordés',              category: 'Supervision',       subcategory: 'Agréments'      },
};

export type AmmcIndicatorsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseAmmcIndicatorsResult {
  dataset:  AmmcDataset | null;
  status:   AmmcIndicatorsStatus;
  enriched: EnrichedObservation[];

  /** Latest (year=2024) value for a single indicator */
  getLatest: (id: string) => Observation | null;

  /** All observations for one indicator, sorted chronologically */
  getTimeSeries: (id: string) => Observation[];

  /** 2024 observations for all indicators in a category */
  getCategorySnapshot: (category: IndicatorCategory, year?: number) => EnrichedObservation[];
}

export function useAmmcIndicators(): UseAmmcIndicatorsResult {
  const [dataset, setDataset] = useState<AmmcDataset | null>(null);
  const [status,  setStatus]  = useState<AmmcIndicatorsStatus>('idle');

  useEffect(() => {
    setStatus('loading');
    fetch('/data/ammc-indicators-2024.json')
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d: AmmcDataset) => { setDataset(d); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  // Index: indicator_id → catalog entry
  const catalogIndex = useMemo(() => {
    if (!dataset) return new Map<string, AmmcDataset['indicators'][0]>();
    return new Map(dataset.indicators.map(i => [i.indicator_id, i]));
  }, [dataset]);

  // All observations enriched with labels
  const enriched = useMemo<EnrichedObservation[]>(() => {
    if (!dataset) return [];
    return dataset.observations.map(obs => {
      const cat = catalogIndex.get(obs.indicator_id);
      const fb  = FALLBACK_LABELS[obs.indicator_id];
      return {
        ...obs,
        label_fr:    cat?.label_fr    ?? fb?.label_fr    ?? obs.indicator_id,
        category:    cat?.category    ?? fb?.category    ?? 'Autre',
        subcategory: cat?.subcategory ?? fb?.subcategory ?? '',
      };
    });
  }, [dataset, catalogIndex]);

  const getLatest = useMemo(() => (id: string): Observation | null => {
    if (!dataset) return null;
    return dataset.observations
      .filter(o => o.indicator_id === id)
      .sort((a, b) => b.year - a.year)[0] ?? null;
  }, [dataset]);

  const getTimeSeries = useMemo(() => (id: string): Observation[] => {
    if (!dataset) return [];
    return dataset.observations
      .filter(o => o.indicator_id === id)
      .sort((a, b) => a.year - b.year);
  }, [dataset]);

  const getCategorySnapshot = useMemo(() => (
    category: IndicatorCategory,
    year = 2024,
  ): EnrichedObservation[] => {
    return enriched
      .filter(o => o.category === category && o.year === year)
      .sort((a, b) => b.value - a.value);
  }, [enriched]);

  return { dataset, status, enriched, getLatest, getTimeSeries, getCategorySnapshot };
}
