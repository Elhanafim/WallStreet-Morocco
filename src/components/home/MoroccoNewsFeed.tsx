'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCalendarEvents } from '@/services/calendarService';
import { LiveCalendarEvent } from '@/types';
import { useTranslation } from 'react-i18next';

// ── Helpers ───────────────────────────────────────────────────────────────────

const IMPACT_COLORS: Record<number, { bg: string; color: string }> = {
  5: { bg: '#ede9fe', color: '#6d28d9' },
  4: { bg: '#fee2e2', color: '#b91c1c' },
  3: { bg: '#ffedd5', color: '#c2410c' },
  2: { bg: '#fef3c7', color: '#b45309' },
  1: { bg: '#f3f4f6', color: '#6b7280' },
};

function ImpactPill({ score }: { score: number }) {
  const c = IMPACT_COLORS[Math.max(1, Math.min(5, score))];
  return (
    <span
      className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 leading-none"
      style={{ background: c.bg, color: c.color }}
    >
      {score}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MoroccoNewsFeed() {
  const [events,  setEvents]  = useState<LiveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  useEffect(() => {
    fetchCalendarEvents({ moroccoOnly: true, limit: 50 })
      .then((res) => {
        // Keep only MA events, then apply: today → upcoming asc → past desc
        const morocco = res.events.filter((e) => e.country === 'MA');
        const todayStr = new Date().toISOString().slice(0, 10);
        const today    = morocco.filter(e => e.date.slice(0, 10) === todayStr);
        const upcoming = morocco
          .filter(e => e.date.slice(0, 10) > todayStr)
          .sort((a, b) => a.date.localeCompare(b.date));
        const past = morocco
          .filter(e => e.date.slice(0, 10) < todayStr)
          .sort((a, b) => b.date.localeCompare(a.date));
        setEvents([...today, ...upcoming, ...past].slice(0, 5));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function formatShortDate(dateStr: string): { label: string; isPast: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T12:00:00');
    const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    if (diff === 0)  return { label: t('calendar.today'),                                         isPast: false };
    if (diff === 1)  return { label: t('calendar.tomorrow'),                                      isPast: false };
    if (diff === -1) return { label: t('calendar.yesterday'),                                     isPast: true  };
    if (diff < 0)   return { label: t('calendar.daysAgo', { n: Math.abs(diff) }),                isPast: true  };
    return {
      label: d.toLocaleDateString(lang === 'fr' ? 'fr-MA' : lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }),
      isPast: false,
    };
  }

  // Separator index: first upcoming event after at least one past/today
  const separatorIdx = (() => {
    if (events.length === 0) return -1;
    const todayStr = new Date().toISOString().slice(0, 10);
    const firstFuture = events.findIndex(e => e.date.slice(0, 10) > todayStr);
    const hasPastBefore = firstFuture > 0;
    return hasPastBefore ? firstFuture : -1;
  })();

  return (
    <div className="mt-6 sm:mt-10 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-white font-black text-base">
            🇲🇦 {t('calendar.moroccoFeed.title')}
          </h3>
          <p className="text-white/40 text-xs mt-0.5">
            {t('calendar.moroccoFeed.subtitle')}
          </p>
        </div>
        <Link
          href="/calendar"
          className="text-white/40 hover:text-white/70 text-xs font-semibold whitespace-nowrap transition-colors"
        >
          {t('buttons.seeAll')} →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
              <div className="w-5 h-4 bg-white/10 rounded-full flex-shrink-0" />
              <div className="w-16 h-3 bg-white/10 rounded flex-shrink-0" />
              <div className="flex-1 h-3 bg-white/8 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-white/30 text-sm text-center py-6">
          {t('calendar.moroccoFeed.unavailable')}{' '}
          <Link href="/calendar" className="underline hover:text-white/60 transition-colors">
            {t('calendar.moroccoFeed.seeCalendar')}
          </Link>
        </p>
      ) : events.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-6">
          {t('calendar.moroccoFeed.empty')}{' '}
          <Link href="/calendar" className="underline hover:text-white/60 transition-colors">
            {t('calendar.moroccoFeed.seeCalendar')}
          </Link>
        </p>
      ) : (
        <div className="divide-y divide-white/5">
          {events.map((ev, idx) => {
            const { label: dateLabel, isPast } = formatShortDate(ev.date.slice(0, 10));
            return (
              <div key={ev.id}>
                {/* Separator before first upcoming event */}
                {idx === separatorIdx && (
                  <div className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-wide">
                      {t('calendar.moroccoFeed.upcomingDivider')}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
                <div className="flex items-start gap-3 py-2 sm:py-3">
                  <ImpactPill score={ev.impactScore} />
                  <span className={`text-[10px] font-semibold flex-shrink-0 w-[4.5rem] ${isPast ? 'text-white/30' : 'text-white/60'}`}>
                    {dateLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 truncate leading-snug">
                      {ev.titleFr || ev.title}
                    </p>
                    {(ev.actual || ev.forecast) && (
                      <p className="text-[10px] text-white/35 mt-0.5 flex items-center gap-1.5">
                        {ev.actual && (
                          <span className={
                            ev.actual.startsWith('-') ? 'text-red-400' : 'text-emerald-400'
                          }>
                            {t('calendar.moroccoFeed.actual')} : {ev.actual}
                          </span>
                        )}
                        {ev.actual && ev.forecast && (
                          <span className="text-white/20">·</span>
                        )}
                        {ev.forecast && <span>{t('calendar.moroccoFeed.forecast')} : {ev.forecast}</span>}
                      </p>
                    )}
                  </div>
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 text-sm leading-none mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Source"
                  >
                    →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-white/8">
        <Link
          href="/calendar"
          className="flex items-center justify-center gap-2 text-xs font-semibold text-white/50 border border-white/12 rounded-xl px-4 py-2.5 hover:bg-white/5 hover:text-white/75 transition-colors"
        >
          {t('calendar.moroccoFeed.seeAll')}
        </Link>
      </div>
    </div>
  );
}
