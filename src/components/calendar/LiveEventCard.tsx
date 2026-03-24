'use client';

import { LiveCalendarEvent } from '@/types';
import { Clock, ExternalLink } from 'lucide-react';

// ── Impact bars (dark theme) ───────────────────────────────────────────────────

function ImpactBars({ score }: { score: number }) {
  const fillColor =
    score >= 5 ? 'bg-red-500' :
    score >= 4 ? 'bg-orange-400' :
    score >= 3 ? 'bg-yellow-400' :
    score >= 2 ? 'bg-blue-400' :
    'bg-white/20';

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`rounded-full ${i < score ? fillColor : 'bg-white/10'}`}
          style={{ width: '3px', height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  );
}

// ── Category pill ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  monetary_policy: 'bg-red-500/15 text-red-400 border-red-500/25',
  inflation: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  employment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  gdp: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pmi: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  trade: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  consumer: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  oil: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  commodities: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  housing: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  market: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  earnings: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  statistics: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  news: 'bg-white/10 text-white/50 border-white/10',
  macro: 'bg-white/8 text-white/40 border-white/8',
};

const CATEGORY_LABELS: Record<string, string> = {
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
  const cls = CATEGORY_COLORS[category] || 'bg-white/8 text-white/40 border-white/8';
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

// ── Data row ──────────────────────────────────────────────────────────────────

function DataGrid({ actual, forecast, previous }: {
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
}) {
  if (!actual && !forecast && !previous) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {[
        { label: 'Précédent', value: previous, cls: 'text-white/50' },
        { label: 'Prévision', value: forecast, cls: 'text-blue-400' },
        { label: 'Réel', value: actual, cls: actual ? 'text-emerald-400 font-bold' : 'text-white/25' },
      ].map(({ label, value, cls }) => (
        <div key={label} className={`rounded-lg p-2 text-center ${value && label === 'Réel' ? 'bg-emerald-500/8' : 'bg-white/4'}`}>
          <p className="text-white/30 text-[9px] uppercase tracking-wide mb-0.5">{label}</p>
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
        <ImpactBars score={event.impactScore} />
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-4 hover:bg-white/8 hover:border-white/15 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl flex-shrink-0">{event.countryFlag}</span>
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-white/40">{event.country}</span>
              {event.currency && (
                <span className="text-[10px] text-white/25">{event.currency}</span>
              )}
              {event.time && (
                <span className="flex items-center gap-0.5 text-[10px] text-white/30">
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
            event.impactScore >= 5 ? 'text-red-400' :
            event.impactScore >= 4 ? 'text-orange-400' :
            event.impactScore >= 3 ? 'text-yellow-400' :
            'text-white/35'
          }`}>
            {event.impactLabel}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white/90 mb-1.5 leading-snug">
        {event.titleFr || event.title}
      </h3>

      {/* Summary */}
      {event.summary && (
        <p className="text-[11px] text-white/45 leading-relaxed line-clamp-2 mb-2">
          {event.summary}
        </p>
      )}

      {/* Data */}
      <DataGrid actual={event.actual} forecast={event.forecast} previous={event.previous} />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/6">
        <div className="flex items-center gap-2">
          {event.isMoroccoRelevant && (
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full font-semibold">
              🇲🇦 Pertinent
            </span>
          )}
          {event.isUpcoming && (
            <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded-full font-semibold">
              À venir
            </span>
          )}
        </div>
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/60 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
          {event.sourceName}
        </a>
      </div>
    </div>
  );
}

export { CategoryPill, CATEGORY_LABELS };
