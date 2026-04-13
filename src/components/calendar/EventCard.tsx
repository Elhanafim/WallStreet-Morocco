import { CalendarEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { ImpactBadge, Badge, getCategoryBadgeVariant } from '@/components/ui/Badge';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'default' | 'compact';
}

function ImpactBars({ score }: { score: number }) {
  const colors = ['bg-surface-200', 'bg-surface-200', 'bg-surface-200', 'bg-surface-200', 'bg-surface-200'];
  const fillColors = {
    1: 'bg-primary/20',
    2: 'bg-secondary',
    3: 'bg-warning',
    4: 'bg-accent',
    5: 'bg-danger',
  };
  const fillColor = fillColors[score as keyof typeof fillColors] || 'bg-primary/20';

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i < score ? fillColor : 'bg-surface-200'
          )}
          style={{
            width: '4px',
            height: `${8 + i * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

function ActualVsForecast({ actual, forecast, previous }: {
  actual?: string;
  forecast?: string;
  previous?: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      <div className="bg-surface-50 rounded-lg p-2 text-center">
        <p className="text-primary/40 text-2xs uppercase tracking-wide mb-0.5">Précédent</p>
        <p className="text-primary/60 text-xs font-medium">{previous || '—'}</p>
      </div>
      <div className="bg-surface-50 rounded-lg p-2 text-center">
        <p className="text-primary/40 text-2xs uppercase tracking-wide mb-0.5">Prévision</p>
        <p className="text-secondary text-xs font-medium">{forecast || '—'}</p>
      </div>
      <div className={cn('rounded-lg p-2 text-center', actual ? 'bg-success/10' : 'bg-surface-50')}>
        <p className="text-primary/40 text-2xs uppercase tracking-wide mb-0.5">Réel</p>
        <p className={cn('text-xs font-medium', actual ? 'text-success' : 'text-primary/30')}>
          {actual || 'À venir'}
        </p>
      </div>
    </div>
  );
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-surface-100 last:border-0">
        <div className="flex-shrink-0 text-xl">{event.countryFlag}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-primary/50">{formatDate(event.date, 'short')}</span>
            {event.time && (
              <span className="flex items-center gap-1 text-xs text-primary/40">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-primary line-clamp-2 leading-snug">
            {event.title}
          </p>
        </div>
        <div className="flex-shrink-0">
          <ImpactBars score={event.impactScore} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{event.countryFlag}</span>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium text-primary/50">{event.country}</span>
              <span className="text-xs text-primary/30">•</span>
              <span className="text-xs text-primary/50">{formatDate(event.date, 'medium')}</span>
              {event.time && (
                <span className="flex items-center gap-1 text-xs text-primary/40">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
              )}
            </div>
            <Badge variant={getCategoryBadgeVariant(event.category)} size="xs">
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ImpactBars score={event.impactScore} />
          <ImpactBadge score={event.impactScore} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-primary mb-2 leading-snug">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-primary/60 leading-relaxed line-clamp-2 mb-3">
        {event.description}
      </p>

      {/* Data */}
      <ActualVsForecast
        actual={event.actual}
        forecast={event.forecast}
        previous={event.previous}
      />
    </div>
  );
}
