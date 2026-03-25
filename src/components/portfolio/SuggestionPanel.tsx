'use client';
import { AlertTriangle, TrendingUp, Info, AlertCircle, Lightbulb } from 'lucide-react';
import type { Suggestion, SuggestionType } from '@/services/suggestionEngine';

const TYPE_CONFIG: Record<SuggestionType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  badge: string;
  badgeText: string;
  label: string;
}> = {
  alert: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Alerte',
    label: 'Alerte',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: 'Attention',
    label: 'Attention',
  },
  success: {
    icon: TrendingUp,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    badgeText: 'Opportunité',
    label: 'Opportunité',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: 'Info',
    label: 'Info',
  },
};

interface Props {
  suggestions: Suggestion[];
}

export default function SuggestionPanel({ suggestions }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-secondary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-primary">Analyse & Suggestions</h3>
          <p className="text-xs text-primary/40">Basé sur la composition de votre portefeuille</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
          {suggestions.length}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => {
          const cfg = TYPE_CONFIG[s.type];
          const Icon = cfg.icon;
          return (
            <div key={s.id} className={`flex gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.badgeText}
                  </span>
                  {s.ticker && (
                    <span className="text-xs font-mono text-primary/50 bg-white/60 px-1.5 py-0.5 rounded-md border border-white/80">
                      {s.ticker}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-primary">{s.title}</span>
                </div>
                <p className="text-xs text-primary/70 leading-relaxed">{s.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-primary/25 mt-3 text-right">
        Analyse automatique · Pas de conseil financier
      </p>
    </div>
  );
}
