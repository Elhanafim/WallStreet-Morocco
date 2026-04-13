// Triggering a new build with a fresh comment.
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
    <section className="py-[var(--space-xl)] px-[var(--space-md)]">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="mb-12">
          <span className="section-label mb-4">{t('bvc.dashboardLabel') || 'INDICATEURS DE MARCHÉ'}</span>
          <h2 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
            {t('bvc.dashboardTitle')}
          </h2>
          <p className="font-body text-[15px] text-[var(--text-secondary)] mt-2">
            {t('bvc.dashboardSubtitle')}
          </p>
        </div>

        {/* ── MARKET STATUS BAR ── */}
        <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[var(--border)] mb-12">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", open ? "bg-[var(--gain)] animate-pulse" : "bg-[var(--loss)]")} />
            <span className="font-body text-[13px] font-medium text-[var(--text-primary)] uppercase tracking-wider">
              {open ? t('market.open') : t('market.closed')}
            </span>
          </div>
          <span className="w-px h-4 bg-[var(--border)] hidden md:block" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--gold)]" />
            <span className="font-body text-[13px] text-[var(--text-secondary)]">MASI · Bourse de Casablanca</span>
          </div>
          <span className="w-px h-4 bg-[var(--border)] hidden md:block" />
          <span className="font-body text-[12px] text-[var(--text-muted)] italic">
            {t('market.delayed')}
          </span>
          <div className="ml-auto font-body text-[12px] text-[var(--text-muted)]">
            {lastUpdate ? th('movers_last_update', { time: lastUpdate }) : t('bvc.liveUnavailable')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT: TOP MOVERS */}
          <div className="lg:col-span-3 premium-card p-0">
            <div className="p-8 border-b border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="card-header-bar mt-1.5" />
                <div>
                  <h3 className="card-header-title">{t('bvc.topMovers')}</h3>
                  <span className="card-header-subtitle">Performance quotidienne des valeurs cotées</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {moversLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-[var(--bg-elevated)] rounded mb-6" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between h-4 bg-[var(--bg-elevated)] rounded" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-[var(--bg-elevated)] rounded mb-6" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between h-4 bg-[var(--bg-elevated)] rounded" />
                    ))}
                  </div>
                </div>
              ) : moversError || !movers ? (
                <div className="py-20 text-center">
                  <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="font-body text-[13px] text-[var(--text-muted)]">{th('movers_unavailable')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Gainers */}
                  <div>
                    <h4 className="font-body text-[11px] font-semibold text-[var(--gain)] uppercase tracking-[0.12em] mb-6">
                      Plus fortes hausses
                    </h4>
                    <div className="space-y-1">
                      {movers.gainers.slice(0, 8).map((stock) => (
                        <div key={stock.ticker} className="flex items-center justify-between h-[46px] border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-base)] px-2 transition-colors">
                          <span className="font-body text-[13px] font-bold text-[var(--text-primary)] w-12">{stock.ticker}</span>
                          <span className="font-body text-[13px] text-[var(--text-secondary)] flex-1 truncate px-4">{stock.name}</span>
                          <span className="font-body text-[13px] font-bold text-[var(--gain)]">+{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Losers */}
                  <div>
                    <h4 className="font-body text-[11px] font-semibold text-[var(--loss)] uppercase tracking-[0.12em] mb-6">
                      Plus fortes baisses
                    </h4>
                    <div className="space-y-1">
                      {movers.losers.slice(0, 8).map((stock) => (
                        <div key={stock.ticker} className="flex items-center justify-between h-[46px] border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-base)] px-2 transition-colors">
                          <span className="font-body text-[13px] font-bold text-[var(--text-primary)] w-12">{stock.ticker}</span>
                          <span className="font-body text-[13px] text-[var(--text-secondary)] flex-1 truncate px-4">{stock.name}</span>
                          <span className="font-body text-[13px] font-bold text-[var(--loss)]">{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-10">
                <Link href="/market" className="inline-flex items-center gap-2 font-body text-[13px] font-medium text-[var(--gold)] hover:underline">
                  Consulter toutes les valeurs <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: KEY INDICATORS */}
          <div className="lg:col-span-2 premium-card p-0">
            <div className="p-8 border-b border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="card-header-bar mt-1.5" />
                <div>
                  <h3 className="card-header-title">{t('bvc.indicators')}</h3>
                  <span className="card-header-subtitle">Statistiques et données macro-financières</span>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 gap-6">
              {[
                { icon: <Building2 size={18} />, label: t('bvc.marketCap'), value: '1 050 Mrd', note: 'MAD' },
                { icon: <Landmark size={18} />, label: t('bvc.bamRate'), value: '2,25 %', note: 'Directeur BAM' },
                { icon: <BarChart2 size={18} />, label: t('bvc.avgVolume'), value: '350 M', note: 'Volume MAD' },
                { icon: <Calendar size={18} />, label: t('bvc.nextBamDecision'), value: nextBam ?? 'Déc. 2024', note: 'Prochaine réunion' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/50">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--gold)]">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      {item.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[20px] font-medium text-[var(--text-primary)]">{item.value}</span>
                      <span className="font-body text-[12px] text-[var(--text-muted)]">{item.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 pt-0">
              <p className="font-body text-[11px] text-[var(--text-muted)] italic leading-relaxed">
                Les données sont fournies à titre indicatif et peuvent présenter un retard de 15 minutes.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
