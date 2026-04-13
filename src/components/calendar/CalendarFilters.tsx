'use client';

import { Zap } from 'lucide-react';
import { CATEGORY_LABELS } from './LiveEventCard';

export type ImpactFilter = 1 | 2 | 3 | 4 | 5 | null;

interface CalendarFiltersProps {
  impactMin: ImpactFilter;
  onImpactMinChange: (v: ImpactFilter) => void;
  category: string | null;
  onCategoryChange: (v: string | null) => void;
  availableCategories: string[];
  upcomingOnly: boolean;
  onUpcomingOnlyChange: (v: boolean) => void;
}

const IMPACT_OPTS: { score: ImpactFilter; label: string; color: string }[] = [
  { score: null, label: 'Tous', color: 'text-white' },
  { score: 3, label: '3+', color: 'text-yellow-400' },
  { score: 4, label: '4+', color: 'text-orange-400' },
  { score: 5, label: 'Critique', color: 'text-red-400' },
];

export default function CalendarFilters({
  impactMin, onImpactMinChange,
  category, onCategoryChange,
  availableCategories,
  upcomingOnly, onUpcomingOnlyChange,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Row 1 — Upcoming toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onUpcomingOnlyChange(!upcomingOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
            upcomingOnly
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          À venir uniquement
        </button>
      </div>

      {/* Row 2 — Impact filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/30 font-medium uppercase tracking-wide">Impact min :</span>
        {IMPACT_OPTS.map(({ score, label, color }) => (
          <button
            key={String(score)}
            onClick={() => onImpactMinChange(score)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
              impactMin === score
                ? `${color} bg-gray-900 border-gray-600`
                : 'text-white/30 bg-transparent border-white/8 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Row 3 — Category filter */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/30 font-medium uppercase tracking-wide">Catégorie :</span>
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
              !category
                ? 'bg-gray-900 text-white border-gray-600'
                : 'text-white/30 bg-transparent border-white/8 hover:text-white/60'
            }`}
          >
            Toutes
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === category ? null : cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${
                category === cat
                  ? 'bg-gray-900 text-white border-gray-600'
                  : 'text-white/30 bg-transparent border-white/8 hover:text-white/60'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
