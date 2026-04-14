'use client';

import Link from 'next/link';
import { CONTACT } from '@/data/contact';
import {
  Mail, Globe,
  BookOpen, TrendingUp, Target, Users,
  GraduationCap, Briefcase, Rocket, Lightbulb,
  ArrowRight, CheckCircle,
} from 'lucide-react';
import StrategySection from '@/components/founder/StrategySection';
import { useTranslation } from 'react-i18next';

export default function AboutContent() {
  const { t } = useTranslation('fondateur');

  const TIMELINE = [
    {
      year: '2022',
      icon: BookOpen,
      title: t('timeline.items.2022.title'),
      desc: t('timeline.items.2022.desc'),
      color: 'bg-secondary/20 text-secondary border-secondary/30',
      dot: 'bg-secondary',
    },
    {
      year: '2023',
      icon: GraduationCap,
      title: t('timeline.items.2023.title'),
      desc: t('timeline.items.2023.desc'),
      color: 'bg-accent/20 text-accent-600 border-accent/30',
      dot: 'bg-accent',
    },
    {
      year: '2024',
      icon: Briefcase,
      title: t('timeline.items.2024.title'),
      desc: t('timeline.items.2024.desc'),
      color: 'bg-success/15 text-success border-success/30',
      dot: 'bg-success',
    },
    {
      year: '2025',
      icon: Rocket,
      title: t('timeline.items.2025.title'),
      desc: t('timeline.items.2025.desc'),
      color: 'bg-primary/10 text-primary border-primary/20',
      dot: 'bg-primary',
    },
    {
      year: '2026',
      icon: TrendingUp,
      title: t('timeline.items.2026.title'),
      desc: t('timeline.items.2026.desc'),
      color: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
      dot: 'bg-emerald-500',
    },
  ];

  const VALUES = [
    { icon: BookOpen,  title: t('values.education.title'), desc: t('values.education.desc') },
    { icon: TrendingUp, title: t('values.longTerm.title'), desc: t('values.longTerm.desc') },
    { icon: Target,    title: t('values.transparency.title'), desc: t('values.transparency.desc') },
    { icon: Users,     title: t('values.community.title'), desc: t('values.community.desc') },
  ];

  const VISION_PILLARS = [
    { icon: Lightbulb,    title: t('vision.pillars.simplify.title'), body: t('vision.pillars.simplify.body') },
    { icon: Target,       title: t('vision.pillars.method.title'),   body: t('vision.pillars.method.body') },
    { icon: CheckCircle,  title: t('vision.pillars.proof.title'),    body: t('vision.pillars.proof.body') },
  ];

  return (
    <main className="pt-16 min-h-screen bg-surface-50">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden page-hero-bg"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/nick-chong-N__BnvQ_w18-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.35)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gold)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>{t('hero.badge')}</span>
              </div>

              <h1 className="font-display font-medium leading-tight mb-1" style={{ fontSize: 'clamp(36px,5vw,60px)', color: 'var(--navy)' }}>
                El Hanafi
              </h1>
              <h2 className="font-display font-medium leading-tight mb-5 italic" style={{ fontSize: 'clamp(36px,5vw,60px)', color: 'var(--gold)' }}>
                Mohammed
              </h2>

              <p className="font-body text-[16px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                {t('hero.subtitle')}
              </p>

              <div
                className="inline-flex items-center gap-3 rounded-[10px] px-5 py-3 mb-7"
                style={{ backgroundColor: 'rgba(13,122,78,0.06)', border: '1px solid rgba(13,122,78,0.2)' }}
              >
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(13,122,78,0.1)' }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--gain)' }} />
                </div>
                <div>
                  <p className="font-body font-medium text-xl leading-none" style={{ color: 'var(--gain)' }}>+51%</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('hero.achievementBadge')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href={CONTACT.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-all"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-all"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-all"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  WallStreet Morocco
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl scale-105" style={{ border: '2px solid rgba(184,151,74,0.2)' }} />
                <div className="absolute inset-0 rounded-3xl scale-110" style={{ border: '1px solid var(--border)' }} />
                <div className="relative w-72 sm:w-80 rounded-3xl overflow-hidden shadow-xl" style={{ border: '1px solid var(--border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/founder.jpg"
                    alt="Fondateur WallStreet Morocco"
                    width={320}
                    height={400}
                    className="w-full h-96 object-cover object-top"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-5" style={{ background: 'linear-gradient(to top, rgba(15,45,82,0.92), transparent)' }}>
                    <p className="text-white font-medium text-lg">WallStreet Morocco</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--gold)' }}>{t('hero.founderTitle')}</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                  {t('hero.activeSince')}
                </div>
                <div className="absolute -bottom-4 -left-4 text-xs font-medium px-4 py-2 rounded-2xl shadow-lg" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                  {t('hero.returns')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VISION QUOTE ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 border-b border-surface-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote>
            <div className="text-8xl text-primary/8 font-serif leading-none mb-2 select-none">&ldquo;</div>
            <p className="text-2xl sm:text-3xl font-medium text-primary leading-relaxed -mt-10">
              {t('quote.text')}
            </p>
            <p className="mt-6 text-primary/40 text-sm font-medium">
              {t('quote.author')}
            </p>
          </blockquote>
        </div>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════════ */}
      <section className="bg-surface-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
              <Briefcase className="w-3.5 h-3.5 text-secondary" />
              <span className="text-secondary text-xs font-medium uppercase tracking-widest">{t('timeline.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-primary mb-3">
              {t('timeline.title')}
            </h2>
            <p className="text-primary/50">{t('timeline.subtitle')}</p>
          </div>

          <div className="relative">
            <div className="absolute left-[22px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary/40 via-accent/30 to-emerald-500/40 -translate-x-px" />
            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                >
                  <div className={`absolute left-[22px] sm:left-1/2 w-5 h-5 ${item.dot} rounded-full border-4 border-surface-50 -translate-x-1/2 mt-4 z-10 shadow-md`} />
                  <div className={`ml-14 sm:ml-0 sm:w-[46%] ${i % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12 sm:ml-auto'}`}>
                    <div className={`bg-white border rounded-2xl p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 ${item.color}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm opacity-80">{item.year}</span>
                      </div>
                      <h3 className="font-medium text-primary text-base mb-2">{item.title}</h3>
                      <p className="text-primary/60 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STRATÉGIE & PERFORMANCE ════════════════════════════════════════════ */}
      <StrategySection />

      {/* ══ VISION ════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
              <Lightbulb className="w-3.5 h-3.5 text-accent-600" />
              <span className="text-accent-600 text-xs font-medium uppercase tracking-widest">{t('vision.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-primary mb-3">
              {t('vision.title')}
            </h2>
            <p className="text-primary/50 max-w-2xl mx-auto">
              {t('vision.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {VISION_PILLARS.map((p, i) => (
              <div key={i} className="bg-surface-50 border border-surface-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200">
                <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-primary text-base mb-3">{p.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="group rounded-[12px] p-6 hover:-translate-y-1 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-[8px] flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.25)' }}
                >
                  <v.icon className="w-5 h-5" style={{ color: 'var(--gold)' } as React.CSSProperties} />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-surface-50 py-20 border-t border-surface-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1 mb-6">
            <CheckCircle className="w-3.5 h-3.5 text-success" />
            <span className="text-success text-xs font-medium">{t('cta.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-primary mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-primary/60 mb-10 text-lg leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-medium rounded-xl hover:bg-secondary-600 transition-colors shadow-md text-base"
            >
              {t('cta.button1')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-surface-200 text-primary font-medium rounded-xl hover:bg-surface-50 hover:shadow-card transition-all text-base"
            >
              {t('cta.button2')}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
