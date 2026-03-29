'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCalendarEvents } from '@/services/calendarService';
import { useTranslation } from 'react-i18next';

// ── Market hours: Mon–Fri 09:30–15:30 Morocco time (UTC+1, no DST) ─────────────

function isBvcOpen(): boolean {
  const now = new Date();
  const moroccoMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + 60; // UTC+1
  const day = now.getUTCDay(); // 0=Sun 6=Sat
  return day >= 1 && day <= 5 && moroccoMinutes >= 570 && moroccoMinutes < 930;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BVCInvestorPulse() {
  const [open, setOpen]       = useState(false);
  const [nextBam, setNextBam] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  // Live market status, refreshed every minute
  useEffect(() => {
    setOpen(isBvcOpen());
    const id = setInterval(() => setOpen(isBvcOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Next BAM monetary policy decision from calendar service
  useEffect(() => {
    fetchCalendarEvents({ moroccoOnly: true, category: 'monetary_policy', upcomingOnly: true, limit: 5 })
      .then((res) => {
        const next = res.events.find(
          (e) => e.country === 'MA' && e.category === 'monetary_policy' && e.isUpcoming,
        );
        if (next) {
          const d = new Date(next.date.slice(0, 10) + 'T12:00:00');
          const locale = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
          setNextBam(d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }));
        }
      })
      .catch(() => {});
  }, [lang]);

  const metrics = [
    { icon: '🏦', label: t('bvc.marketCap'),        value: '~1 050 Mrd MAD', note: t('bvc.quarterly') },
    { icon: '🏢', label: t('bvc.listedCompanies'),  value: '78',              note: 'Casablanca Bourse' },
    { icon: '🏛️', label: t('bvc.bamRate'),          value: '2,25 %',          note: t('bvc.unchanged') },
    { icon: '📊', label: t('bvc.avgVolume'),        value: '~350 M MAD',      note: t('bvc.monthly') },
    { icon: '📐', label: t('bvc.avgPE'),            value: '~17×',            note: t('bvc.indicative') },
    { icon: '📅', label: t('bvc.nextBamDecision'),  value: null,              note: 'Bank Al-Maghrib' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mb-10">
          <h2 className="text-3xl font-black text-primary mb-2">
            {t('bvc.dashboardTitle')}
          </h2>
          <p className="text-primary/60 text-sm">
            {t('bvc.dashboardSubtitle')}
          </p>
        </div>

        {/* ── Market Status Strip ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-white border border-surface-200 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-8 shadow-card">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${open ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
            <span className={`font-bold text-sm ${open ? 'text-green-700' : 'text-red-600'}`}>
              {open ? t('market.open') : t('market.closed')}
            </span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-surface-200" />
          <span className="text-sm text-primary/60 font-medium">MASI · Bourse de Casablanca</span>
          <span className="hidden sm:block w-px h-4 bg-surface-200" />
          <span className="text-xs text-primary/40">{t('market.sessionHours')}</span>
          <span className="hidden sm:block w-px h-4 bg-surface-200" />
          <span className="text-xs text-primary/40">{t('market.delayed')}</span>
        </div>

        {/* ── Two-column layout ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Top Movers (60%) */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card h-full flex flex-col">
              <h3 className="font-black text-primary text-base mb-5">{t('bvc.topMovers')}</h3>
              <div className="grid grid-cols-2 gap-6 flex-1">
                {([t('bvc.topGains'), t('bvc.topLosses')] as const).map((title, col) => (
                  <div key={title}>
                    <p className={`text-xs font-bold mb-3 ${col === 0 ? 'text-success' : 'text-danger'}`}>{title}</p>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="flex items-center gap-2 animate-pulse">
                          <div className="w-10 h-3 bg-surface-100 rounded" />
                          <div className="flex-1 h-3 bg-surface-100 rounded" />
                          <div className="w-12 h-3 bg-surface-100 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-surface-100 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[10px] text-primary/30">
                  {t('bvc.liveUnavailable')}
                </p>
                <Link
                  href="/market"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary border border-surface-200 rounded-xl px-3 py-1.5 hover:bg-surface-50 transition-colors"
                >
                  {t('bvc.seeAllStocks')}
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Key Metrics (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card h-full flex flex-col">
              <h3 className="font-black text-primary text-base mb-5">{t('bvc.indicators')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 flex-1">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-surface-50 border border-surface-100 rounded-xl p-3">
                    <span className="text-lg">{m.icon}</span>
                    <p className="text-[10px] text-primary/50 font-medium mt-1 leading-tight">{m.label}</p>
                    <p className="text-sm font-black text-primary mt-0.5">
                      {i === 5 ? (nextBam ?? t('bvc.toConfirm')) : m.value}
                    </p>
                    <p className="text-[9px] text-primary/30 mt-0.5 leading-tight">{m.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-primary/30 mt-4 leading-relaxed">
                {t('bvc.indicativeData')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
