'use client';

import { LiveCalendarEvent } from '@/types';
import LiveEventCard from './LiveEventCard';

interface EventGroupByDateProps {
  events: LiveCalendarEvent[];
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = [
  'jan', 'fév', 'mar', 'avr', 'mai', 'jun',
  'jul', 'aoû', 'sep', 'oct', 'nov', 'déc',
];

function formatGroupDate(dateStr: string): { day: string; date: string; isToday: boolean; isTomorrow: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const d = new Date(dateStr + 'T12:00:00');
  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  return {
    day: isToday ? "Aujourd'hui" : isTomorrow ? 'Demain' : DAYS_FR[d.getDay()],
    date: `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`,
    isToday,
    isTomorrow,
  };
}

export default function EventGroupByDate({ events }: EventGroupByDateProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-white/25">
        <p className="text-4xl mb-3">📅</p>
        <p className="text-sm font-semibold">Aucun événement pour ces filtres</p>
        <p className="text-xs mt-1">Essayez d&apos;élargir les critères de recherche</p>
      </div>
    );
  }

  const grouped: Record<string, LiveCalendarEvent[]> = {};
  for (const ev of events) {
    const key = ev.date.slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }

  // Preserve insertion order (caller pre-sorts: today → upcoming asc → past desc)
  const sortedDates: string[] = [];
  const seenDates = new Set<string>();
  for (const ev of events) {
    const k = ev.date.slice(0, 10);
    if (!seenDates.has(k)) { seenDates.add(k); sortedDates.push(k); }
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((dateKey) => {
        const { day, date, isToday, isTomorrow } = formatGroupDate(dateKey);
        const dayEvents = grouped[dateKey];
        const maxImpact = Math.max(...dayEvents.map((e) => e.impactScore));

        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-xl px-3 py-1.5 ${
                isToday ? 'bg-gray-900 border border-gray-700' :
                isTomorrow ? 'bg-white/10 border border-white/15' :
                'bg-white/5 border border-white/8'
              }`}>
                <p className={`text-xs font-black uppercase tracking-wide ${
                  isToday ? 'text-white' : isTomorrow ? 'text-white/70' : 'text-white/50'
                }`}>
                  {day}
                </p>
                <p className="text-[10px] text-white/30 font-medium">{date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/25 font-semibold">
                  {dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}
                </span>
                {maxImpact >= 4 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    maxImpact >= 5
                      ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                      : 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                  }`}>
                    Impact {maxImpact >= 5 ? 'critique' : 'élevé'}
                  </span>
                )}
              </div>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Events grid */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {dayEvents.map((ev) => (
                <LiveEventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
