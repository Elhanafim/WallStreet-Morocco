'use client';

import { useState, useMemo } from 'react';
import { Calendar, Filter, Globe, Flag, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import EventCard from '@/components/calendar/EventCard';
import { calendarEvents } from '@/lib/data/calendar';
import { CalendarEvent } from '@/types';
import { Badge, ImpactBadge, getCategoryBadgeVariant } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

type FilterType = 'Tous' | 'Maroc' | 'International';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function CalendarPage() {
  const [filter, setFilter] = useState<FilterType>('Tous');
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      const matchesFilter =
        filter === 'Tous' ||
        (filter === 'Maroc' && event.country === 'Maroc') ||
        (filter === 'International' && event.country !== 'Maroc');
      return matchesFilter;
    });
  }, [filter]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get days in current month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getDateString = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${d}`;
  };

  const upcomingEvents = filteredEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  const highImpactCount = filteredEvents.filter((e) => e.impactScore >= 4).length;

  return (
    <div className="pt-16 min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-gradient-hero py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold">Calendrier économique</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Événements & Données{' '}
            <span className="gradient-text-gold">clés</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Suivez tous les événements économiques importants pour le marché marocain
            et international. Ne manquez aucune publication majeure.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mt-6 text-white/60 text-sm">
            <span>{calendarEvents.length} événements</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span>{highImpactCount} à fort impact</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span>Mis à jour quotidiennement</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 shadow-sm">
            {(['Tous', 'Maroc', 'International'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  filter === f
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-primary/60 hover:text-primary'
                }`}
              >
                {f === 'Maroc' && <span>🇲🇦</span>}
                {f === 'International' && <Globe className="w-4 h-4" />}
                {f === 'Tous' && <Filter className="w-4 h-4" />}
                {f}
              </button>
            ))}
          </div>

          {/* Impact legend */}
          <div className="flex items-center gap-3 text-xs text-primary/50">
            <span className="font-semibold">Impact :</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <ImpactBadge key={score} score={score as 1|2|3|4|5} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            {/* Month Navigation */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-primary" />
                </button>
                <h3 className="font-black text-primary text-lg">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-primary/40 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first day */}
                {Array.from({ length: adjustedFirstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="h-14 rounded-lg" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = getDateString(day);
                  const dayEvents = eventsByDate[dateStr] || [];
                  const hasHighImpact = dayEvents.some((e) => e.impactScore >= 4);
                  const today = new Date();
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === currentMonth &&
                    today.getFullYear() === currentYear;

                  return (
                    <div
                      key={day}
                      className={`h-14 rounded-xl flex flex-col items-center justify-start pt-1.5 cursor-pointer transition-all duration-200 relative ${
                        dayEvents.length > 0
                          ? 'bg-secondary/5 hover:bg-secondary/10 border border-secondary/20'
                          : 'hover:bg-surface-50'
                      } ${isToday ? 'ring-2 ring-secondary' : ''}`}
                      onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                    >
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'bg-secondary text-white w-5 h-5 rounded-full flex items-center justify-center'
                            : 'text-primary/70'
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map((event, ei) => (
                            <span
                              key={ei}
                              className={`w-1.5 h-1.5 rounded-full ${
                                event.impactScore >= 5 ? 'bg-danger' :
                                event.impactScore >= 4 ? 'bg-warning' :
                                event.impactScore >= 3 ? 'bg-accent' :
                                'bg-secondary'
                              }`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-2xs text-primary/40">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Event Detail */}
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-card border border-secondary/30 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-primary">Détail de l&apos;événement</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-primary/40 hover:text-primary text-sm"
                  >
                    ✕ Fermer
                  </button>
                </div>
                <EventCard event={selectedEvent} />
              </div>
            )}

            {/* Events List for current month */}
            <div className="space-y-4">
              <h3 className="font-black text-primary text-lg">
                Événements — {MONTHS[currentMonth]}
              </h3>
              {Object.entries(eventsByDate)
                .filter(([dateStr]) => {
                  const date = new Date(dateStr);
                  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                })
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateStr, events]) => (
                  <div key={dateStr}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-px h-4 bg-accent" />
                      <p className="text-sm font-bold text-primary/60">{formatDate(dateStr, 'medium')}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              {!Object.entries(eventsByDate).some(([dateStr]) => {
                const date = new Date(dateStr);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
              }) && (
                <div className="text-center py-12 text-primary/40">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Aucun événement ce mois-ci</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Upcoming Events */}
          <div className="space-y-6">
            {/* Upcoming High-Impact */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6">
              <h3 className="font-black text-primary mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-danger" />
                Prochains événements clés
              </h3>
              <div className="space-y-1">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="compact" />
                ))}
              </div>
            </div>

            {/* Categories Legend */}
            <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6">
              <h3 className="font-bold text-primary/50 text-xs uppercase tracking-wider mb-4">
                Catégories
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Politique Monétaire',
                  'Emploi',
                  'Inflation',
                  'Croissance',
                  'Commerce',
                  'Marché Boursier',
                  'Résultats',
                ].map((cat) => (
                  <Badge
                    key={cat}
                    variant={getCategoryBadgeVariant(cat)}
                    size="xs"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5">
              <h4 className="font-bold text-primary text-sm mb-3">
                💡 Comment utiliser ce calendrier
              </h4>
              <ul className="space-y-2 text-xs text-primary/70">
                <li>• Les événements à fort impact (rouge) peuvent créer de la volatilité</li>
                <li>• La décision BAM sur les taux est cruciale pour les obligations</li>
                <li>• Les résultats d&apos;entreprises impactent directement les actions</li>
                <li>• La NFP américaine influence les marchés mondiaux</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
