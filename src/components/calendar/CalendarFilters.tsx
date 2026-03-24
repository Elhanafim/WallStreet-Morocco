'use client';

import { Globe, Flag, Filter, Zap } from 'lucide-react';
import { CATEGORY_LABELS } from './LiveEventCard';

export type RegionFilter = 'all' | 'morocco' | 'international';
export type ImpactFilter = 1 | 2 | 3 | 4 | 5 | null;

interface CalendarFiltersProps {
  region: RegionFilter;
  onRegionChange: (v: RegionFilter) => void;
  impactMin: ImpactFilter;
  onImpactMinChange: (v: ImpactFilter) => void;
  category: string | null;
  onCategoryChange: (v: string | null) => void;
  availableCategories: string[];
  upcomingOnly: boolean;
  onUpcomingOnlyChange: (v: boolean) => void;
}

const REGION_OPTS: { id: RegionFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Tous', icon: <Filter className="w-3.5 h-3.5" /> },
  { id: 'morocco', label: 'Maroc', icon: <span>🇲🇦</span> },
  { id: 'international', label: 'International', icon: <Globe className="w-3.5 h-3.5" /> },
];

const IMPACT_OPTS: { score: ImpactFilter; label: string; color: string }[] = [
  { score: null, label: 'Tous', color: 'text-white/60' },
  { score: 3, label: '3+', color: 'text-yellow-400' },
  { score: 4, label: '4+', color: 'text-orange-400' },
  { score: 5, label: 'Critique', color: 'text-red-400' },
];

export default function CalendarFilters({
  region, onRegionChange,
  impactMin, onImpactMinChange,
  category, onCategoryChange,
  availableCategories,
  upcomingOnly, onUpcomingOnlyChange,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Row 1 — Region + Upcoming */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Region */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
          {REGION_OPTS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onRegionChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                region === id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Upcoming toggle */}
        <button
          onClick={() => onUpcomingOnlyChange(!upcomingOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
            upcomingOnly
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
              : 'bg-white/5 border-white/8 text-white/40 hover:text-white/70'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          À venir uniquement
        </button>
      </div>

      {/* Row 2 — Impact filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/30 font-semibold uppercase tracking-wide">Impact min :</span>
        {IMPACT_OPTS.map(({ score, label, color }) => (
          <button
            key={String(score)}
            onClick={() => onImpactMinChange(score)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all duration-150 ${
              impactMin === score
                ? `${color} bg-white/10 border-white/20`
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
          <span className="text-xs text-white/30 font-semibold uppercase tracking-wide">Catégorie :</span>
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              !category
                ? 'bg-white/15 text-white border-white/20'
                : 'text-white/30 bg-transparent border-white/8 hover:text-white/60'
            }`}
          >
            Toutes
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat === category ? null : cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                category === cat
                  ? 'bg-white/15 text-white border-white/20'
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
