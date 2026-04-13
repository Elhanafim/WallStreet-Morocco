'use client';

import Link from 'next/link';
import { Mail, Linkedin, Instagram, Globe, Shield, ExternalLink, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DonateFooterStrip from '@/components/donate/DonateFooterStrip';
import { CONTACT } from '@/data/contact';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const CookieBanner = dynamic(() => import('@/components/legal/CookieBanner'), { ssr: false });

export default function Footer() {
  const { t } = useTranslation('common');
  const { t: tl } = useTranslation('legal');
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const platformLinks = [
    { href: '/simulator', label: t('footer.links.simulator') },
    { href: '/calendar',  label: t('footer.links.calendar') },
    { href: '/opcvm',     label: t('footer.links.opcvm') },
    { href: '/terminal',  label: '◈ Terminal BVC' },
    { href: '/donate',    label: t('footer.links.donate') },
  ];

  const learnLinks = [
    { href: '/learn?category=Bases',    label: t('footer.links.basics') },
    { href: '/learn?category=Actions',  label: t('footer.links.stocks') },
    { href: '/learn?category=OPCVM',    label: 'OPCVM' },
    { href: '/learn?category=Stratégie', label: t('footer.links.strategies') },
  ];

  const companyLinks = [
    { href: '/donate', label: t('footer.links.donate') },
    { href: '/terms',  label: tl('footer.terms') },
  ];

  return (
    <>
      {showCookieBanner && <CookieBanner onClose={() => setShowCookieBanner(false)} />}

      <footer className="relative bg-[var(--bg-surface)] border-t border-[var(--border)] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gold-gradient opacity-20" />
        
        <DonateFooterStrip />

        <div className="container-max py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">

            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-icon.svg" alt="W" className="w-6 h-6 invert brightness-0" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight">
                  WallStreet <span className="text-gold-gradient">Morocco</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xs">
                {t('footer.tagline')}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {[
                  { icon: <Instagram className="w-4 h-4" />, href: CONTACT.instagram, label: 'Instagram' },
                  { icon: <Linkedin className="w-4 h-4" />, href: CONTACT.linkedin, label: 'LinkedIn' },
                  { icon: <Mail className="w-4 h-4" />, href: `mailto:${CONTACT.email}`, label: 'Email' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)] hover:-translate-y-1 transition-all duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h3 className="section-label mb-8">{t('footer.platform')}</h3>
              <ul className="space-y-4">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:translate-x-1 transition-all flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)] group-hover:bg-[var(--gold)] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn Column */}
            <div>
              <h3 className="section-label mb-8">{t('footer.learn')}</h3>
              <ul className="space-y-4">
                {learnLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:translate-x-1 transition-all flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)] group-hover:bg-[var(--gold)] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company/Newsletter Column */}
            <div>
              <h3 className="section-label mb-8">{t('footer.company')}</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold mb-3">{t('footer.newsletter')}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {t('footer.newsletterDesc')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder={t('footer.emailPlaceholder')}
                      className="flex-1 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--gold)] transition-colors"
                    />
                    <Button variant="primary" size="xs" className="h-[38px]">
                      {t('buttons.subscribe')}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] group hover:border-[var(--gold)] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border)] group-hover:text-[var(--gold)] transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Support</p>
                    <a href={`mailto:${CONTACT.email}`} className="text-xs font-medium hover:text-[var(--gold)] transition-colors">
                      {CONTACT.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer Text */}
          <div className="mt-20 pt-10 border-t border-[var(--border)]">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 text-[var(--gold)] opacity-60">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Compliance & Safety</span>
              </div>
              <p className="text-[11px] text-center leading-relaxed text-[var(--text-muted)] max-w-4xl mx-auto italic">
                {tl('footer.disclaimer')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[var(--bg-elevated)]/30 border-t border-[var(--border)]">
          <div className="container-max py-8 gap-8 flex flex-col items-center justify-between md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { href: '/mentions-legales', label: tl('footer.mentions') },
                { href: '/terms',            label: tl('footer.terms') },
                { href: '/confidentialite',  label: tl('footer.privacy') },
                { href: '/politique-risques', label: tl('footer.riskPolicy') },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setShowCookieBanner(true)}
                className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
              >
                {tl('footer.manageCookies')}
              </button>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[11px] font-bold text-[var(--text-primary)]">
                © {new Date().getFullYear()} WallStreet Morocco
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="xs" className="opacity-70">Independent Project</Badge>
                <Badge variant="danger" size="xs" className="opacity-70">Non-agréé AMMC</Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
