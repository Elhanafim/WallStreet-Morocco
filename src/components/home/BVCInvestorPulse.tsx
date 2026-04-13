'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  BarChart2,
  LineChart,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  History,
} from 'lucide-react';
import { fetchCalendarEvents } from '@/services/calendarService';
import { fetchMovers, BVCMovers, BVCPrice } from '@/lib/bvcPriceService';
import { useTranslation } from 'react-i18next';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ── Market hours: Mon–Fri 09:30–15:30 Morocco time (UTC+1, no DST) ─────────────

function isBvcOpen(): boolean {
  const now = new Date();
  const moroccoMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + 60; // UTC+1
  const day = now.getUTCDay(); // 0=Sun 6=Sat
  return day >= 1 && day <= 5 && moroccoMinutes >= 570 && moroccoMinutes < 930;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BVCInvestorPulse() {
  const [open, setOpen]                   = useState(false);
  const [nextBam, setNextBam]             = useState<string | null>(null);
  const [movers, setMovers]               = useState<BVCMovers | null>(null);
  const [moversLoading, setMoversLoading] = useState(true);
  const [moversError, setMoversError]     = useState(false);
  const [lastUpdate, setLastUpdate]       = useState<string>('');
  const intervalRef                       = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t, i18n } = useTranslation('common');
  const { t: th }   = useTranslation('home');
  const lang = i18n.language?.slice(0, 2) ?? 'fr';

  useEffect(() => {
    setOpen(isBvcOpen());
    const id = setInterval(() => setOpen(isBvcOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadMovers() {
      setMoversLoading(true);
      setMoversError(false);
      try {
        const data = await fetchMovers();
        if (data) {
          setMovers(data);
          const now = new Date();
          setLastUpdate(
            now.toLocaleTimeString(
              lang === 'fr' ? 'fr-MA' : lang === 'es' ? 'es-ES' : 'en-US',
              { hour: '2-digit', minute: '2-digit' },
            ),
          );
        } else {
          setMoversError(true);
        }
      } catch {
        setMoversError(true);
      } finally {
        setMoversLoading(false);
      }
    }
    loadMovers();
    intervalRef.current = setInterval(loadMovers, 5 * 60 * 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [lang]);

  useEffect(() => {
    fetchCalendarEvents({ moroccoOnly: true, category: 'monetary_policy', upcomingOnly: true, limit: 5 })
      .then((res) => {
        const next = res.events.find(
          (e) => e.country === 'MA' && e.category === 'monetary_policy' && e.isUpcoming,
        );
        if (next) {
          const d      = new Date(next.date.slice(0, 10) + 'T12:00:00');
          const locale = lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
          setNextBam(d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }));
        }
      })
      .catch(() => {});
  }, [lang]);

  const metrics = [
    { icon: <Building2 className="w-4 h-4" />, label: t('bvc.marketCap'),       value: '~1 050 Mrd MAD', note: t('bvc.quarterly') },
    { icon: <Building2 className="w-4 h-4" />, label: t('bvc.listedCompanies'), value: '78',              note: 'Casablanca Bourse' },
    { icon: <Landmark   className="w-4 h-4" />, label: t('bvc.bamRate'),         value: '2,25 %',          note: t('bvc.unchanged') },
    { icon: <BarChart2  className="w-4 h-4" />, label: t('bvc.avgVolume'),       value: '~350 M MAD',      note: t('bvc.monthly') },
    { icon: <LineChart  className="w-4 h-4" />, label: t('bvc.avgPE'),           value: '~17×',            note: t('bvc.indicative') },
    { icon: <Calendar   className="w-4 h-4" />, label: t('bvc.nextBamDecision'), value: null,              note: 'Bank Al-Maghrib' },
  ];

  return (
    <Section
      variant="base"
      title={t('bvc.dashboardTitle')}
      subtitle={t('bvc.dashboardSubtitle')}
    >
      {/* ── Status Bar ── */}
      <Card variant="glass" className="flex flex-wrap items-center gap-6 px-6 py-4 mb-10 rounded-2xl animate-fadeIn">
        <div className="flex items-center gap-3">
          <Badge variant="outline" size="md" dot>
            <span className={open ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}>
              {open ? t('market.open') : t('market.closed')}
            </span>
          </Badge>
        </div>
        <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--gold)]" />
          <span className="text-sm font-bold tracking-tight">MASI · Bourse de Casablanca</span>
        </div>
        <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />
        <p className="text-xs text-[var(--text-secondary)] font-medium">{t('market.sessionHours')}</p>
        <div className="hidden sm:block w-px h-6 bg-[var(--border)]" />
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
          <History className="w-3.5 h-3.5" />
          {t('market.delayed')}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Top Movers */}
        <Card variant="premium" className="lg:col-span-3 flex flex-col p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight">{t('bvc.topMovers')}</h3>
            <Badge variant="outline" size="xs">Live Update</Badge>
          </div>

          {moversLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 flex-1 animate-pulse">
              {[0, 1].map((col) => (
                <div key={col} className="space-y-6">
                  <div className="h-4 w-24 bg-[var(--bg-elevated)] rounded-full mb-6" />
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex justify-between items-center h-4">
                      <div className="w-10 bg-[var(--bg-elevated)] rounded h-3" />
                      <div className="flex-1 mx-4 bg-[var(--bg-elevated)] rounded h-2" />
                      <div className="w-12 bg-[var(--bg-elevated)] rounded h-3" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : moversError || !movers ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
              <AlertTriangle className="w-10 h-10 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)] max-w-xs">{th('movers_unavailable')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 flex-1">
              {[
                { title: th('movers_gainers'), items: movers.gainers, positive: true },
                { title: th('movers_losers'),  items: movers.losers,  positive: false },
              ].map(({ title, items, positive }) => (
                <div key={title}>
                  <p className={`text-xs font-bold uppercase tracking-[0.15em] mb-6 ${positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                    {title}
                  </p>
                  <div className="space-y-1">
                    {items.map((stock) => (
                      <div key={stock.ticker} className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-all cursor-default">
                        <span className="w-12 font-mono text-xs font-bold">{stock.ticker}</span>
                        <span className="flex-1 px-4 text-[11px] text-[var(--text-secondary)] truncate group-hover:text-[var(--text-primary)] transition-colors">
                          {stock.name}
                        </span>
                        <span className={`font-mono text-xs font-bold ${positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
                          {positive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-[var(--border)] flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
              {lastUpdate ? th('movers_last_update', { time: lastUpdate }) : t('bvc.liveUnavailable')}
            </p>
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
              <Link href="/market">{t('bvc.seeAllStocks')}</Link>
            </Button>
          </div>
        </Card>

        {/* Right: Key Metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card variant="premium" className="flex-1 p-8 overflow-hidden relative">
            <h3 className="text-2xl font-bold tracking-tight mb-8">{t('bvc.indicators')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="bg-[var(--bg-elevated)]/50 border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--gold)] transition-all group">
                  <div className="text-[var(--gold)] mb-3 group-hover:scale-110 transition-transform origin-left">{m.icon}</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    {m.label}
                  </p>
                  <p className="text-2xl font-bold font-display leading-tight mb-1">
                    {i === 5 ? (nextBam ?? t('bvc.toConfirm')) : m.value}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">{m.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 text-[var(--text-muted)]">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <p className="text-[9px] font-medium tracking-wider uppercase">{t('bvc.indicativeData')}</p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
