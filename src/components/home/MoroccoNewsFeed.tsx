'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCalendarEvents } from '@/services/calendarService';
import { LiveCalendarEvent } from '@/types';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const IMPACT_COLORS: Record<number, { bg: string; color: string }> = {
  5: { bg: 'var(--bg-elevated)',   color: 'var(--text-primary)' },
  4: { bg: 'var(--loss)',           color: '#FFFFFF' },
  3: { bg: 'var(--gold)',           color: '#FFFFFF' },
  2: { bg: 'var(--border-strong)', color: 'var(--text-primary)' },
  1: { bg: 'var(--bg-elevated)',   color: 'var(--text-secondary)' },
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
  const [events, setEvents] = useState<LiveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  useEffect(() => {
    fetchCalendarEvents({ moroccoOnly: true, limit: 50 })
      .then((res) => {
        const morocco = res.events.filter((e) => e.country === 'MA');
        const todayStr = new Date().toISOString().slice(0, 10);
        const today = morocco.filter(e => e.date.slice(0, 10) === todayStr);
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
    if (diff === 0) return { label: t('calendar.today'), isPast: false };
    if (diff === 1) return { label: t('calendar.tomorrow'), isPast: false };
    if (diff === -1) return { label: t('calendar.yesterday'), isPast: true };
    if (diff < 0) return { label: t('calendar.daysAgo', { n: Math.abs(diff) }), isPast: true };
    return {
      label: d.toLocaleDateString(lang === 'fr' ? 'fr-MA' : lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }),
      isPast: false,
    };
  }

  const separatorIdx = (() => {
    if (events.length === 0) return -1;
    const todayStr = new Date().toISOString().slice(0, 10);
    const firstFuture = events.findIndex(e => e.date.slice(0, 10) > todayStr);
    return firstFuture > 0 ? firstFuture : -1;
  })();

  return (
    <div className="premium-card mt-10">
      {/* Header */}
      <div className="card-header-accent flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="card-header-bar" />
            <h3 className="card-header-title">
              {t('calendar.moroccoFeed.title').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}
            </h3>
          </div>
          <span className="card-header-subtitle">
            {t('calendar.moroccoFeed.subtitle')}
          </span>
        </div>
        <Link
          href="/calendar"
          className="font-body text-[12px] font-medium text-[var(--gold)] hover:brightness-110 transition-all uppercase tracking-wider"
        >
          {t('buttons.seeAll')} →
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
              <div className="w-8 h-4 bg-[var(--bg-elevated)] rounded" />
              <div className="flex-1 h-4 bg-[var(--bg-elevated)] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-[var(--text-muted)] font-body text-[14px] text-center py-10">
          {t('calendar.moroccoFeed.unavailable')}{' '}
          <Link href="/calendar" icon={<ArrowRight size={14} />} className="text-[var(--gold)] underline hover:no-underline">
            {t('calendar.moroccoFeed.seeCalendar')}
          </Link>
        </p>
      ) : events.length === 0 ? (
        <p className="text-[var(--text-muted)] font-body text-[14px] text-center py-10">
          {t('calendar.moroccoFeed.empty')}{' '}
          <Link href="/calendar" className="text-[var(--gold)] underline hover:no-underline font-medium">
            {t('calendar.moroccoFeed.seeCalendar')}
          </Link>
        </p>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {events.map((ev, idx) => {
            const { label: dateLabel, isPast } = formatShortDate(ev.date.slice(0, 10));
            const impactColor = ev.impactScore >= 4 ? 'var(--loss)' : ev.impactScore === 3 ? 'var(--gold)' : 'var(--text-muted)';
            
            return (
              <div key={ev.id}>
                {idx === separatorIdx && (
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      {t('calendar.moroccoFeed.upcomingDivider')}
                    </span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>
                )}
                <div className="group flex items-start gap-4 py-4 transition-all border-l-2 border-transparent hover:border-[var(--gold)] hover:bg-[var(--bg-base)] -mx-6 px-6">
                  <div className="flex flex-col items-center gap-1 w-10 flex-shrink-0 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: impactColor }} />
                    <span className="font-body text-[9px] font-bold" style={{ color: impactColor }}>{ev.impactScore}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-body text-[11px] font-medium uppercase tracking-wider block mb-1",
                      isPast ? "text-[var(--text-muted)]" : "text-[var(--gold)]"
                    )}>
                      {dateLabel}
                    </span>
                    <p className="font-display text-[16px] font-medium leading-tight text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                      {ev.titleFr || ev.title}
                    </p>
                    {(ev.actual || ev.forecast) && (
                      <p className="font-body text-[12px] mt-2 flex items-center gap-3 text-[var(--text-muted)]">
                        {ev.actual && (
                          <span className="flex items-center gap-1">
                            <span className="uppercase text-[10px] tracking-wide opacity-70">{t('calendar.moroccoFeed.actual')}</span>
                            <span className="font-medium text-[var(--text-primary)]">{ev.actual}</span>
                          </span>
                        )}
                        {ev.forecast && (
                          <span className="flex items-center gap-1">
                            <span className="uppercase text-[10px] tracking-wide opacity-70">{t('calendar.moroccoFeed.forecast')}</span>
                            <span className="font-medium">{ev.forecast}</span>
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors h-8 w-8 flex items-center justify-center border border-[var(--border)] rounded-full group-hover:bg-[var(--bg-surface)]"
                  >
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link in same style as header but bottom */}
      <div className="mt-8">
        <Link
          href="/calendar"
          className="flex items-center justify-center w-full py-3 border border-[var(--gold)] text-[var(--gold)] font-body text-[13px] font-medium rounded-[6px] hover:bg-[var(--gold)] hover:text-[var(--bg-base)] transition-all"
        >
          {t('calendar.moroccoFeed.seeAll')}
        </Link>
      </div>
    </div>
  );
}
