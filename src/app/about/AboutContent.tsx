'use client';

import Link from 'next/link';
import {
  Linkedin, Mail, Globe,
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
      <section className="relative bg-gradient-to-br from-primary via-[#112d5e] to-[#0d3060] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-bold uppercase tracking-widest">{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                El Hanafi
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-accent leading-tight mb-6">
                Mohammed
              </h2>

              <p className="text-white/70 text-lg leading-relaxed mb-4">
                {t('hero.subtitle')}
              </p>

              <div className="inline-flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-3 mb-8">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-black text-xl leading-none">+51%</p>
                  <p className="text-white/50 text-xs mt-0.5">{t('hero.achievementBadge')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                  { icon: Mail,     label: 'Email',    href: 'mailto:contact@wallstreetmorocco.com' },
                  { icon: Globe,    label: 'WallStreet Morocco', href: '/' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/75 hover:bg-white/20 hover:text-white transition-all text-sm font-medium"
                  >
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl border-2 border-accent/20 scale-105" />
                <div className="absolute inset-0 rounded-3xl border border-white/8 scale-110" />
                <div className="relative w-72 sm:w-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/founder.jpg"
                    alt="El Hanafi Mohammed — Fondateur WallStreet Morocco"
                    width={320}
                    height={400}
                    className="w-full h-96 object-cover object-top"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/90 to-transparent p-5">
                    <p className="text-white font-bold text-lg">El Hanafi Mohammed</p>
                    <p className="text-accent text-sm font-medium">{t('hero.founderTitle')}</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                  {t('hero.activeSince')}
                </div>
                <div className="absolute -bottom-4 -left-4 bg-accent text-primary text-xs font-black px-4 py-2 rounded-2xl shadow-lg">
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
            <p className="text-2xl sm:text-3xl font-bold text-primary leading-relaxed -mt-10">
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
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">{t('timeline.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">
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
                        <span className="font-black text-sm opacity-80">{item.year}</span>
                      </div>
                      <h3 className="font-black text-primary text-base mb-2">{item.title}</h3>
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
              <span className="text-accent-600 text-xs font-bold uppercase tracking-widest">{t('vision.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-3">
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
                <h3 className="font-black text-primary text-base mb-3">{p.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="group bg-gradient-hero rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <v.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
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
            <span className="text-success text-xs font-semibold">{t('cta.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-primary/60 mb-10 text-lg leading-relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-600 transition-colors shadow-md text-base"
            >
              {t('cta.button1')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-surface-200 text-primary font-semibold rounded-xl hover:bg-surface-50 hover:shadow-card transition-all text-base"
            >
              {t('cta.button2')}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
