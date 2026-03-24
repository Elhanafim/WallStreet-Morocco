'use client';

import { LiveCalendarEvent } from '@/types';

interface CalendarKPIStripProps {
  events: LiveCalendarEvent[];
}

export default function CalendarKPIStrip({ events }: CalendarKPIStripProps) {
  const total = events.length;
  const upcoming = events.filter((e) => e.isUpcoming).length;
  const moroccoRelevant = events.filter((e) => e.isMoroccoRelevant).length;
  const highImpact = events.filter((e) => e.impactScore >= 4).length;

  const stats = [
    { label: 'Événements', value: total, color: 'text-white' },
    { label: 'À venir', value: upcoming, color: 'text-amber-400' },
    { label: 'Impact fort', value: highImpact, color: 'text-orange-400' },
    { label: 'Maroc', value: moroccoRelevant, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 text-center"
        >
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-white/40 text-xs font-semibold mt-0.5 uppercase tracking-wide">{label}</p>
        </div>
      ))}
    </div>
  );
}
