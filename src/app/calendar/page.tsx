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
import CalendarDonateBanner from '@/components/donate/CalendarDonateBanner';
import EduBannerInline from '@/components/legal/EduBannerInline';

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
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.impactScore - a.impactScore;
  });

  return [...today, ...upcoming, ...past];
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div
      className="rounded-[8px] p-4 animate-pulse"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="flex gap-3 mb-3">
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--border)' }} />
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--border)' }} />
        </div>
      </div>
      <div className="h-3 rounded w-full mb-1" style={{ backgroundColor: 'var(--border)' }} />
      <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--border)' }} />
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
      className="rounded-[10px] overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-colors"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--border)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl">{flag}</span>
          <span
            className="font-body text-[13.5px] font-medium"
            style={{ color: events.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {label}
          </span>
          <span
            className="font-body text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {events.length > 0
              ? t('calendar.events_other', { count: events.length })
              : t('calendar.noEvents_region')}
          </span>
          {maxImpact >= 4 && (
            <span
              className="font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: maxImpact >= 5 ? 'rgba(192,57,43,0.1)' : 'rgba(176,125,42,0.1)',
                color: maxImpact >= 5 ? 'var(--loss)' : 'var(--gold)',
                border: `1px solid ${maxImpact >= 5 ? 'rgba(192,57,43,0.25)' : 'rgba(176,125,42,0.25)'}`,
              }}
            >
              {maxImpact >= 5 ? t('calendar.impactCritical') : t('calendar.impactHigh')}
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
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

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (activeTab !== 'all' && getRegionId(ev.country) !== activeTab) return false;
      if (impactMin !== null && ev.impactScore < impactMin) return false;
      if (category && ev.category !== category) return false;
      if (upcomingOnly && !ev.isUpcoming) return false;
      return true;
    });
  }, [events, activeTab, impactMin, category, upcomingOnly]);

  const eventsByRegion = useMemo(() => {
    const map: Record<string, LiveCalendarEvent[]> = {};
    for (const region of REGIONS) map[region.id] = [];
    for (const ev of filtered) {
      const rid = getRegionId(ev.country);
      if (map[rid]) map[rid].push(ev);
      else map['mondial'].push(ev);
    }
    for (const rid of Object.keys(map)) {
      map[rid] = sortCalendarEvents(map[rid]);
    }
    return map;
  }, [filtered]);

  const sortedFiltered = useMemo(() => sortCalendarEvents([...filtered]), [filtered]);

  const availableCategories = useMemo(() => {
    return Object.keys(events.reduce((acc, e) => { acc[e.category] = true; return acc; }, {} as Record<string, boolean>)).sort();
  }, [events]);

  const upcomingHighImpact = useMemo(
    () => events.filter((e) => e.isUpcoming && e.impactScore >= 4).slice(0, 8),
    [events],
  );

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
    <div className="pt-16 min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── Hero header with bg image ── */}
      <div
        className="page-hero-bg py-14 px-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/annie-spratt-IT6aov1ScW0-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ backgroundColor: 'rgba(184,151,74,0.12)', border: '1px solid rgba(184,151,74,0.4)' }}
          >
            <Calendar className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="font-body text-[12px] font-semibold" style={{ color: 'var(--gold)' }}>
              {t('page.badge')}
            </span>
          </div>
          <h1 className="font-display font-medium mb-4" style={{ fontSize: 'clamp(32px,5vw,48px)', lineHeight: 1.1, color: 'var(--navy)' }}>
            {t('page.title1')}{' '}
            <span style={{ color: 'var(--gold)' }} className="italic">{t('page.title2')}</span>
          </h1>
          <p className="font-body text-[15px] max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('page.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {lastRefresh && (
              <span>
                {tCommon('calendar.updatedAt')}{' '}
                {lastRefresh.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => loadEvents(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 transition-colors disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--navy)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {tCommon('calendar.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Region Tabs ── */}
      <div
        className="sticky top-16 z-10"
        style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
      >
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
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? 'var(--navy)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--navy)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                    {count > 0 && (
                      <span
                        className="font-body text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)',
                          color: isActive ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, var(--bg-surface))' }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div
            className="flex items-start gap-3 rounded-[10px] p-4 mb-6"
            style={{ backgroundColor: 'var(--loss-bg)', border: '1px solid rgba(192,57,43,0.25)' }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--loss)' }} />
            <p className="font-body text-[13px] font-medium" style={{ color: 'var(--loss)' }}>{error}</p>
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

            <CalendarDonateBanner />
            <EduBannerInline />

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
          <div className="space-y-5">
            {/* Upcoming high-impact */}
            <div
              className="rounded-[10px] p-5"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h3 className="font-body font-semibold text-[13px] mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {t('sidebar.upcomingTitle')}
              </h3>
              <p className="font-body text-[10.5px] mb-4" style={{ color: 'var(--text-muted)' }}>
                {t('sidebar.upcomingImpact')}
              </p>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-12 rounded-[8px] animate-pulse" style={{ backgroundColor: 'var(--bg-elevated)' }} />
                  ))}
                </div>
              ) : upcomingHighImpact.length === 0 ? (
                <p className="font-body text-[12px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  {tCommon('calendar.noHighImpact')}
                </p>
              ) : (
                <div>
                  {upcomingHighImpact.map((ev) => (
                    <LiveEventCard key={ev.id} event={ev} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            {/* Sources */}
            <div
              className="rounded-[10px] p-5"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h3
                className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {t('sidebar.sourcesTitle')}
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Finnhub',        desc: t('sidebar.sources.finnhub'),      color: 'var(--gold)' },
                  { name: 'ForexFactory',   desc: t('sidebar.sources.forexfactory'), color: 'var(--gold)' },
                  { name: 'Bank Al-Maghrib', desc: t('sidebar.sources.bam'),         color: 'var(--gain)' },
                  { name: 'HCP Maroc',      desc: t('sidebar.sources.hcp'),          color: 'var(--gain)' },
                  { name: 'Médias24',       desc: t('sidebar.sources.medias24'),     color: 'var(--text-muted)' },
                  { name: 'BourseNews',     desc: t('sidebar.sources.boursenews'),   color: 'var(--text-muted)' },
                ].map(({ name, desc, color }) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div>
                      <p className="font-body text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                      <p className="font-body text-[10.5px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div
              className="rounded-[10px] p-5"
              style={{
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid rgba(184,151,74,0.2)',
              }}
            >
              <h4 className="font-body font-semibold text-[12px] mb-3" style={{ color: 'var(--text-primary)' }}>
                💡 {t('sidebar.howToReadTitle')}
              </h4>
              <ul className="space-y-1.5 font-body text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
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
