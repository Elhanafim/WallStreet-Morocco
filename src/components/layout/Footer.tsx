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
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)] py-[var(--space-xl)] px-[var(--space-md)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          
          {/* LOGO + TAGLINE (LEFT) */}
          <div className="max-w-xs">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-[18px] text-[var(--text-primary)] tracking-tight">
                WallStreet <span className="text-[var(--gold)] italic">Morocco</span>
              </span>
            </Link>
            <p className="font-body text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* LINKS (RIGHT) */}
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div>
              <h4 className="font-body text-[13px] font-medium text-[var(--text-primary)] mb-6 uppercase tracking-wider">
                {t('footer.platform')}
              </h4>
              <ul className="space-y-4">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body text-[13px] font-medium text-[var(--text-primary)] mb-6 uppercase tracking-wider">
                {t('footer.learn')}
              </h4>
              <ul className="space-y-4">
                {learnLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-body text-[13px] font-medium text-[var(--text-primary)] mb-6 uppercase tracking-wider">
                {t('footer.company')}
              </h4>
              <ul className="space-y-4">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-body text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LANGUAGE SWITCHER (FAR RIGHT) */}
          <div className="flex items-center gap-3 font-body text-[13px] ml-auto md:ml-0">
            <span className="text-[var(--text-primary)] font-medium">FR</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">EN</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">ES</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-12 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-body text-[12px] text-[var(--text-muted)]">
            © {new Date().getFullYear()} WallStreet Morocco. Tous droits réservés.
          </p>
          <div className="flex gap-8">
            <Link href="/terms" className="font-body text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Terms
            </Link>
            <Link href="/confidentialite" className="font-body text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Privacy
            </Link>
            <Link href="/politique-risques" className="font-body text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Risks
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
