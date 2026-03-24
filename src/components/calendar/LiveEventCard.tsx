'use client';

import { LiveCalendarEvent } from '@/types';
import { Clock, ExternalLink } from 'lucide-react';

// ── Impact bars ────────────────────────────────────────────────────────────────

function ImpactBars({ score, dark = false }: { score: number; dark?: boolean }) {
  const fillColor =
    score >= 5 ? 'bg-red-500' :
    score >= 4 ? 'bg-orange-400' :
    score >= 3 ? 'bg-yellow-400' :
    score >= 2 ? 'bg-amber-400' :
    'bg-gray-300';

  const emptyColor = dark ? 'bg-white/10' : 'bg-gray-200';

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`rounded-full ${i < score ? fillColor : emptyColor}`}
          style={{ width: '3px', height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  );
}

// ── Category pill (white bg + colored left border) ─────────────────────────────

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  monetary_policy: '#ef4444',
  inflation: '#f97316',
  employment: '#eab308',
  gdp: '#10b981',
  pmi: '#6366f1',
  trade: '#06b6d4',
  consumer: '#8b5cf6',
  oil: '#f59e0b',
  commodities: '#f59e0b',
  housing: '#14b8a6',
  market: '#6366f1',
  earnings: '#10b981',
  statistics: '#0ea5e9',
  news: '#9ca3af',
  macro: '#9ca3af',
};

export const CATEGORY_LABELS: Record<string, string> = {
  monetary_policy: 'Politique monétaire',
  inflation: 'Inflation',
  employment: 'Emploi',
  gdp: 'PIB',
  pmi: 'PMI',
  trade: 'Commerce',
  consumer: 'Consommation',
  oil: 'Pétrole',
  commodities: 'Matières premières',
  housing: 'Immobilier',
  market: 'Bourse',
  earnings: 'Résultats',
  statistics: 'Statistiques',
  news: 'Actualité',
  macro: 'Macro',
  holiday: 'Jour férié',
};

function CategoryPill({ category }: { category: string }) {
  const color = CATEGORY_BORDER_COLORS[category] || '#9ca3af';
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-white text-gray-700 rounded-sm"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {label}
    </span>
  );
}

// ── Data row (light theme) ────────────────────────────────────────────────────

function DataGrid({ actual, forecast, previous }: {
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
}) {
  if (!actual && !forecast && !previous) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {[
        { label: 'Précédent', value: previous, cls: 'text-gray-500' },
        { label: 'Prévision', value: forecast, cls: 'text-gray-600' },
        { label: 'Réel', value: actual, cls: actual ? 'text-emerald-600 font-bold' : 'text-gray-300' },
      ].map(({ label, value, cls }) => (
        <div key={label} className={`rounded-lg p-2 text-center ${value && label === 'Réel' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
          <p className="text-gray-400 text-[9px] uppercase tracking-wide mb-0.5">{label}</p>
          <p className={`text-xs ${cls}`}>{value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface LiveEventCardProps {
  event: LiveCalendarEvent;
  variant?: 'default' | 'compact';
}

export default function LiveEventCard({ event, variant = 'default' }: LiveEventCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-white/6 last:border-0">
        <span className="text-lg flex-shrink-0 mt-0.5">{event.countryFlag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[10px] text-white/35">{event.date}</span>
            {event.time && (
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-white/80 line-clamp-2 leading-snug">
            {event.titleFr || event.title}
          </p>
        </div>
        <ImpactBars score={event.impactScore} dark />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl flex-shrink-0">{event.countryFlag}</span>
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-gray-500">{event.country}</span>
              {event.currency && (
                <span className="text-[10px] text-gray-400">{event.currency}</span>
              )}
              {event.time && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Clock className="w-2.5 h-2.5" />
                  {event.time}
                </span>
              )}
            </div>
            <CategoryPill category={event.category} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <ImpactBars score={event.impactScore} />
          <span className={`text-[10px] font-bold ${
            event.impactScore >= 5 ? 'text-red-500' :
            event.impactScore >= 4 ? 'text-orange-500' :
            event.impactScore >= 3 ? 'text-yellow-600' :
            'text-gray-400'
          }`}>
            {event.impactLabel}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">
        {event.titleFr || event.title}
      </h3>

      {/* Summary */}
      {event.summary && (
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
          {event.summary}
        </p>
      )}

      {/* Data */}
      <DataGrid actual={event.actual} forecast={event.forecast} previous={event.previous} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {event.isMoroccoRelevant && (
            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
              🇲🇦 Pertinent
            </span>
          )}
          {event.isUpcoming && (
            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">
              À venir
            </span>
          )}
        </div>
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          {event.sourceName}
        </a>
      </div>
    </div>
  );
}

export { CategoryPill };
