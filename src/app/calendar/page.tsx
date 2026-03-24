'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { LiveCalendarEvent } from '@/types';
import { fetchCalendarEvents } from '@/services/calendarService';
import CalendarKPIStrip from '@/components/calendar/CalendarKPIStrip';
import CalendarFilters, { ImpactFilter } from '@/components/calendar/CalendarFilters';
import EventGroupByDate from '@/components/calendar/EventGroupByDate';
import LiveEventCard from '@/components/calendar/LiveEventCard';
import { REGIONS, getRegionId } from '@/data/calendarRegions';
import { useTranslation } from 'react-i18next';

// ── Sort: today → upcoming asc → past desc ─────────────────────────────────────

function sortCalendarEvents(evts: LiveCalendarEvent[]): LiveCalendarEvent[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const today    = evts.filter(e => e.date.slice(0, 10) === todayStr);
  const upcoming = evts.filter(e => e.date.slice(0, 10) >  todayStr);
  const past     = evts.filter(e => e.date.slice(0, 10) <  todayStr);

  const byTimeImpact = (a: LiveCalendarEvent, b: LiveCalendarEvent) => {
    const t = (a.time || '00:00').localeCompare(b.time || '00:00');
    return t !== 0 ? t : b.impactScore - a.impactScore;
  };

  today.sort(byTimeImpact);
  upcoming.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : byTimeImpact(a, b);
  });
  past.sort((a, b) => {
    const d = b.date.localeCompare(a.date); // descending
    return d !== 0 ? d : b.impactScore - a.impactScore;
  });

  return [...today, ...upcoming, ...past];
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-50 rounded w-full mb-1" />
      <div className="h-3 bg-gray-50 rounded w-2/3" />
    </div>
  );
}

// ── Region section (collapsible) ───────────────────────────────────────────────

interface RegionSectionProps {
  label: string;
  flag: string;
  accentColor: string;
  events: LiveCalendarEvent[];
  collapsed: boolean;
  onToggle: () => void;
}

function RegionSection({ label, flag, accentColor, events, collapsed, onToggle }: RegionSectionProps) {
  const maxImpact = events.length > 0 ? Math.max(...events.map((e) => e.impactScore)) : 0;
  const { t } = useTranslation('common');

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl">{flag}</span>
          <span className={`text-sm font-bold ${events.length > 0 ? 'text-white' : 'text-white/40'}`}>
            {label}
          </span>
          <span className="text-[10px] text-white/40 font-semibold bg-white/8 px-2 py-0.5 rounded-full">
            {events.length > 0
              ? t('calendar.events_other', { count: events.length })
              : t('calendar.noEvents_region')}
          </span>
          {maxImpact >= 4 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              maxImpact >= 5
                ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                : 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
            }`}>
              {maxImpact >= 5 ? t('calendar.impactCritical') : t('calendar.impactHigh')}
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
        }
      </button>
      {!collapsed && events.length > 0 && (
        <div className="px-5 pb-5 pt-4">
          <EventGroupByDate events={events} />
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ActiveTab = 'all' | string;

export default function CalendarPage() {
  const { t, i18n } = useTranslation('calendrier');
  const tCommon = useTranslation('common').t;
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  const TABS = [
    { id: 'all', label: tCommon('calendar.allRegions'), flag: '🌐' },
    ...REGIONS.map((r) => ({ id: r.id, label: r.label, flag: r.flag })),
  ];
  const [events, setEvents] = useState<LiveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [impactMin, setImpactMin] = useState<ImpactFilter>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // Collapse states: false = expanded, true = collapsed
  const [collapseStates, setCollapseStates] = useState<Record<string, boolean>>({
    maroc: false,
    'etats-unis': true,
    'zone-euro': true,
    mena: true,
    mondial: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('calendar_region_states');
      if (stored) {
        setCollapseStates(JSON.parse(stored));
      } else if (window.innerWidth >= 1024) {
        // Desktop: expand all by default
        setCollapseStates({ maroc: false, 'etats-unis': false, 'zone-euro': false, mena: false, mondial: false });
      }
    } catch { /* ignore */ }
  }, []);

  const toggleRegion = (regionId: string) => {
    setCollapseStates((prev) => {
      const next = { ...prev, [regionId]: !prev[regionId] };
      try { localStorage.setItem('calendar_region_states', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const loadEvents = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const res = await fetchCalendarEvents({ limit: 300 });
      setEvents(res.events);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => loadEvents(), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters + tab
  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (activeTab !== 'all' && getRegionId(ev.country) !== activeTab) return false;
      if (impactMin !== null && ev.impactScore < impactMin) return false;
      if (category && ev.category !== category) return false;
      if (upcomingOnly && !ev.isUpcoming) return false;
      return true;
    });
  }, [events, activeTab, impactMin, category, upcomingOnly]);

  // Group filtered events by region (for "all" tab)
  const eventsByRegion = useMemo(() => {
    const map: Record<string, LiveCalendarEvent[]> = {};
    for (const region of REGIONS) map[region.id] = [];
    for (const ev of filtered) {
      const rid = getRegionId(ev.country);
      if (map[rid]) map[rid].push(ev);
      else map['mondial'].push(ev);
    }
    // Sort within each region: today → upcoming asc → past desc
    for (const rid of Object.keys(map)) {
      map[rid] = sortCalendarEvents(map[rid]);
    }
    return map;
  }, [filtered]);

  const sortedFiltered = useMemo(() => sortCalendarEvents([...filtered]), [filtered]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.category))).sort();
  }, [events]);

  const upcomingHighImpact = useMemo(
    () => events.filter((e) => e.isUpcoming && e.impactScore >= 4).slice(0, 8),
    [events],
  );

  // Tab event counts (based on filtered without tab constraint)
  const tabCounts = useMemo(() => {
    const base = events.filter((ev) => {
      if (impactMin !== null && ev.impactScore < impactMin) return false;
      if (category && ev.category !== category) return false;
      if (upcomingOnly && !ev.isUpcoming) return false;
      return true;
    });
    const counts: Record<string, number> = { all: base.length };
    for (const region of REGIONS) {
      counts[region.id] = base.filter((ev) => getRegionId(ev.country) === region.id).length;
    }
    return counts;
  }, [events, impactMin, category, upcomingOnly]);

  return (
    <div className="pt-16 min-h-screen" style={{ background: '#0A2540' }}>
      {/* ── Hero header ── */}
      <div className="bg-gradient-hero py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm font-semibold">{t('page.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            {t('page.title1')}{' '}
            <span className="gradient-text-gold">{t('page.title2')}</span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto">
            {t('page.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-5 text-white/40 text-xs">
            {lastRefresh && (
              <span>{tCommon('calendar.updatedAt')} {lastRefresh.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <button
              onClick={() => loadEvents(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {tCommon('calendar.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Region Tabs ── */}
      <div className="sticky top-16 z-10 border-b border-white/8" style={{ background: '#0A2540' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div
              className="flex overflow-x-auto gap-1 py-2 pr-12"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
            >
              {TABS.map(({ id, label, flag }) => {
                const count = tabCounts[id] ?? 0;
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/8'
                    }`}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-white/40'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Right fade mask */}
            <div
              className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, #0A2540)' }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl p-4 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 font-semibold text-sm">{error}</p>
          </div>
        )}

        {!loading && <CalendarKPIStrip events={events} />}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <CalendarFilters
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
            ) : activeTab === 'all' ? (
              <div className="space-y-4">
                {REGIONS.map((region) => (
                  <RegionSection
                    key={region.id}
                    label={region.label}
                    flag={region.flag}
                    accentColor={region.accentColor}
                    events={eventsByRegion[region.id] || []}
                    collapsed={collapseStates[region.id] ?? true}
                    onToggle={() => toggleRegion(region.id)}
                  />
                ))}
              </div>
            ) : (
              <EventGroupByDate events={sortedFiltered} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white font-black text-sm mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {t('sidebar.upcomingTitle')}
              </h3>
              <p className="text-white/30 text-[10px] mb-4">{t('sidebar.upcomingImpact')}</p>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingHighImpact.length === 0 ? (
                <p className="text-white/25 text-xs text-center py-4">{tCommon('calendar.noHighImpact')}</p>
              ) : (
                <div>
                  {upcomingHighImpact.map((ev) => (
                    <LiveEventCard key={ev.id} event={ev} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">{t('sidebar.sourcesTitle')}</h3>
              <div className="space-y-2">
                {[
                  { name: 'Finnhub', desc: t('sidebar.sources.finnhub'), color: 'bg-amber-400' },
                  { name: 'ForexFactory', desc: t('sidebar.sources.forexfactory'), color: 'bg-yellow-400' },
                  { name: 'Bank Al-Maghrib', desc: t('sidebar.sources.bam'), color: 'bg-emerald-400' },
                  { name: 'HCP Maroc', desc: t('sidebar.sources.hcp'), color: 'bg-emerald-400' },
                  { name: 'Médias24', desc: t('sidebar.sources.medias24'), color: 'bg-white/30' },
                  { name: 'BourseNews', desc: t('sidebar.sources.boursenews'), color: 'bg-white/30' },
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

            <div className="bg-accent/8 border border-accent/15 rounded-2xl p-5">
              <h4 className="text-white/80 font-bold text-xs mb-3">💡 {t('sidebar.howToReadTitle')}</h4>
              <ul className="space-y-1.5 text-[11px] text-white/45">
                <li>• {t('sidebar.tips.critical')}</li>
                <li>• {t('sidebar.tips.bam')}</li>
                <li>• {t('sidebar.tips.nfp')}</li>
                <li>• {t('sidebar.tips.oil')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
