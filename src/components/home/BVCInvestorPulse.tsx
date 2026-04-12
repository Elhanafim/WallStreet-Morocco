'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  Landmark,
  BarChart2,
  LineChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { fetchCalendarEvents } from '@/services/calendarService';
import { fetchMovers, BVCMovers, BVCPrice } from '@/lib/bvcPriceService';
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

  // Live market status, refreshed every minute
  useEffect(() => {
    setOpen(isBvcOpen());
    const id = setInterval(() => setOpen(isBvcOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch movers with 5-minute auto-refresh
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

  // Next BAM monetary policy decision from calendar service
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
    { icon: <Building2 size={16} />, label: t('bvc.marketCap'),       value: '~1 050 Mrd MAD', note: t('bvc.quarterly') },
    { icon: <Building2 size={16} />, label: t('bvc.listedCompanies'), value: '78',              note: 'Casablanca Bourse' },
    { icon: <Landmark   size={16} />, label: t('bvc.bamRate'),         value: '2,25 %',          note: t('bvc.unchanged') },
    { icon: <BarChart2  size={16} />, label: t('bvc.avgVolume'),       value: '~350 M MAD',      note: t('bvc.monthly') },
    { icon: <LineChart  size={16} />, label: t('bvc.avgPE'),           value: '~17×',            note: t('bvc.indicative') },
    { icon: <Calendar   size={16} />, label: t('bvc.nextBamDecision'), value: null,              note: 'Bank Al-Maghrib' },
  ];

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            {t('bvc.dashboardTitle')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            {t('bvc.dashboardSubtitle')}
          </p>
        </div>

        {/* ── Status Bar ("Marché ouvert/fermé") ─────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '16px 16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              flexShrink: 0,
              backgroundColor: open ? 'var(--gain)' : 'var(--loss)',
            }} />
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: open ? 'var(--gain)' : 'var(--loss)',
            }}>
              {open ? t('market.open') : t('market.closed')}
            </span>
          </div>

          <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} className="hidden sm:block" />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            MASI · Bourse de Casablanca
          </span>
          <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} className="hidden sm:block" />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t('market.sessionHours')}
          </span>
          <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} className="hidden sm:block" />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {t('market.delayed')}
          </span>
        </div>

        {/* ── Two-column layout ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Top Movers (60%) */}
          <div className="lg:col-span-3">
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h3 className="section-label" style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '20px' }}>
                {t('bvc.topMovers')}
              </h3>

              {moversLoading ? (
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {[0, 1].map((col) => (
                    <div key={col}>
                      <div style={{
                        width: '96px', height: '12px', borderRadius: '4px',
                        backgroundColor: 'var(--bg-elevated)',
                        marginBottom: '12px',
                        animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Array.from({ length: 10 }, (_, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '40px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                            <div style={{ flex: 1, height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                            <div style={{ width: '48px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : moversError || !movers ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--text-muted)' }} />
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      lineHeight: '1.5',
                      maxWidth: '280px',
                    }}>
                      {th('movers_unavailable')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {([
                    { title: th('movers_gainers'), items: movers.gainers, positive: true },
                    { title: th('movers_losers'),  items: movers.losers,  positive: false },
                  ] as { title: string; items: BVCPrice[]; positive: boolean }[]).map(({ title, items, positive }) => (
                    <div key={title}>
                      <div className="section-label" style={{ marginBottom: '12px' }}>
                        <p style={{
                          color: positive ? 'var(--gain)' : 'var(--loss)',
                          fontWeight: 500,
                        }}>
                          {title}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {items.map((stock) => (
                          <div
                            key={stock.ticker}
                            className="group flex items-center gap-8 py-1.5 px-2 rounded-md hover:bg-[var(--bg-elevated)] transition-colors duration-120"
                          >
                            <span style={{
                              width: '40px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              flexShrink: 0,
                            }}>
                              {stock.ticker}
                            </span>
                            <span style={{
                              flex: 1,
                              fontFamily: 'var(--font-sans)',
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {stock.name}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              fontWeight: 500,
                              flexShrink: 0,
                              color: positive ? 'var(--gain)' : 'var(--loss)',
                            }}>
                              {positive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {lastUpdate ? th('movers_last_update', { time: lastUpdate }) : t('bvc.liveUnavailable')}
                </p>
                <Link
                  href="/market"
                  className="btn-ghost-secondary inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ textDecoration: 'none' }}
                >
                  {t('bvc.seeAllStocks')}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Key Metrics (40%) */}
          <div className="lg:col-span-2">
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h3 className="section-label" style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '20px' }}>
                {t('bvc.indicators')}
              </h3>

              <div className="grid grid-cols-2 gap-3 flex-1">
                 {metrics.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '20px 22px',
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)' }}>{m.icon}</div>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--text-secondary)',
                      marginTop: '8px',
                      lineHeight: 1.2,
                    }}>
                      {m.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                      lineHeight: 1.1,
                    }}>
                      {i === 5 ? (nextBam ?? t('bvc.toConfirm')) : m.value}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      lineHeight: 1.3,
                    }}>
                      {m.note}
                    </p>
                  </div>
                ))}
              </div>

              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                color: 'var(--text-muted)',
                marginTop: '16px',
                lineHeight: 1.5,
              }}>
                {t('bvc.indicativeData')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
