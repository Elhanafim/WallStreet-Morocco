'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw, AlertTriangle } from 'lucide-react';
import { LiveCalendarEvent } from '@/types';
import { fetchCalendarEvents } from '@/services/calendarService';
import CalendarKPIStrip from '@/components/calendar/CalendarKPIStrip';
import CalendarFilters, { RegionFilter, ImpactFilter } from '@/components/calendar/CalendarFilters';
import EventGroupByDate from '@/components/calendar/EventGroupByDate';
import LiveEventCard from '@/components/calendar/LiveEventCard';

// ── Fallback skeleton ─────────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-8 h-8 bg-white/8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/8 rounded w-1/3" />
          <div className="h-4 bg-white/8 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-white/6 rounded w-full mb-1" />
      <div className="h-3 bg-white/6 rounded w-2/3" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [events, setEvents] = useState<LiveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [region, setRegion] = useState<RegionFilter>('all');
  const [impactMin, setImpactMin] = useState<ImpactFilter>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const loadEvents = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const res = await fetchCalendarEvents({ limit: 300 });
      setEvents(res.events);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError('Impossible de charger les données du calendrier. Le service est peut-être hors ligne.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // Auto-refresh every 15 min
    const interval = setInterval(() => loadEvents(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered events
  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (region === 'morocco' && !ev.isMoroccoRelevant) return false;
      if (region === 'international' && ev.country === 'MA') return false;
      if (impactMin !== null && ev.impactScore < impactMin) return false;
      if (category && ev.category !== category) return false;
      if (upcomingOnly && !ev.isUpcoming) return false;
      return true;
    });
  }, [events, region, impactMin, category, upcomingOnly]);

  // Available categories (from loaded events)
  const availableCategories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return Array.from(cats).sort();
  }, [events]);

  // Upcoming high-impact for sidebar
  const upcomingHighImpact = useMemo(
    () => events.filter((e) => e.isUpcoming && e.impactScore >= 4).slice(0, 8),
    [events],
  );

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#0A2540' }}>
      {/* ── Hero header ── */}
      <div className="bg-gradient-hero py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold">Calendrier économique live</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Événements &amp; Données{' '}
            <span className="gradient-text-gold">clés</span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto">
            Données en temps réel depuis 6 sources — Finnhub, ForexFactory, Bank Al-Maghrib, HCP Maroc, Médias24, BourseNews.
          </p>

          {/* Last refresh */}
          <div className="flex items-center justify-center gap-4 mt-5 text-white/40 text-xs">
            {lastRefresh && (
              <span>Mis à jour {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <button
              onClick={() => loadEvents(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">{error}</p>
              <p className="text-white/40 text-xs mt-0.5">
                Vérifiez que le service price_service tourne sur le port 8001.
              </p>
            </div>
          </div>
        )}

        {/* KPI strip */}
        {!loading && <CalendarKPIStrip events={events} />}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <CalendarFilters
              region={region}
              onRegionChange={setRegion}
              impactMin={impactMin}
              onImpactMinChange={setImpactMin}
              category={category}
              onCategoryChange={setCategory}
              availableCategories={availableCategories}
              upcomingOnly={upcomingOnly}
              onUpcomingOnlyChange={setUpcomingOnly}
            />

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 9 }, (_, i) => <EventSkeleton key={i} />)}
              </div>
            ) : (
              <EventGroupByDate events={filtered} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming high-impact */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-black text-sm mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Prochains événements clés
              </h3>
              <p className="text-white/30 text-[10px] mb-4">Impact 4+ uniquement</p>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingHighImpact.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-4">
                  Aucun événement fort à venir
                </p>
              ) : (
                <div>
                  {upcomingHighImpact.map((ev) => (
                    <LiveEventCard key={ev.id} event={ev} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            {/* Source legend */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">
                Sources de données
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Finnhub', desc: 'Macro monde', color: 'bg-blue-400' },
                  { name: 'ForexFactory', desc: 'Forex impact', color: 'bg-yellow-400' },
                  { name: 'Bank Al-Maghrib', desc: 'Politique BAM', color: 'bg-emerald-400' },
                  { name: 'HCP Maroc', desc: 'Stats nationales', color: 'bg-emerald-400' },
                  { name: 'Médias24', desc: 'Actualité éco', color: 'bg-white/30' },
                  { name: 'BourseNews', desc: 'Marché boursier', color: 'bg-white/30' },
                ].map(({ name, desc, color }) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`} />
                    <div>
                      <p className="text-white/60 text-xs font-semibold">{name}</p>
                      <p className="text-white/25 text-[10px]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/8 border border-accent/15 rounded-2xl p-5">
              <h4 className="text-white/80 font-bold text-xs mb-3">
                💡 Comment lire ce calendrier
              </h4>
              <ul className="space-y-1.5 text-[11px] text-white/45">
                <li>• Impact critique (rouge) = forte volatilité possible</li>
                <li>• La décision BAM influence les taux marocains</li>
                <li>• La NFP américaine impacte les marchés mondiaux</li>
                <li>• Pétrole &amp; or — impact via OCP et imports énergie</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
