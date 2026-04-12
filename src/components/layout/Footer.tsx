'use client';

import Link from 'next/link';
import { Mail, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DonateFooterStrip from '@/components/donate/DonateFooterStrip';
import { CONTACT } from '@/data/contact';
import { useState } from 'react';
import dynamic from 'next/dynamic';

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

      {/* Zone 6: Footer */}
      <footer className="relative">

        {/* Border above footer */}
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

        {/* Background using var(--bg-surface) for contrast system compliance */}
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-surface)', zIndex: 0 }} />

        {/* Content */}
        <div className="relative" style={{ zIndex: 1 }}>
          <DonateFooterStrip />

          {/* Main Footer */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Brand */}
              <div className="lg:col-span-1">
                <Link href="/" className="flex items-center gap-3 mb-4 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-icon.svg"
                    alt="WallStreet Morocco"
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="w-9 h-9 group-hover:opacity-80 transition-opacity"
                  />
                  <span
                    className="font-medium text-base"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                  >
                    WallStreet <span style={{ color: 'var(--gold)' }}>Morocco</span>
                  </span>
                </Link>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('footer.tagline')}
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  <a
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                    }}
                    aria-label="Instagram"
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                    }}
                    aria-label="LinkedIn"
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="w-8 h-8 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                    }}
                    aria-label="Email"
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Platform Links */}
              <div>
                <h3
                  className="text-xs font-medium uppercase tracking-widest mb-5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('footer.platform')}
                </h3>
                <ul className="space-y-3">
                  {platformLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learn Links */}
              <div>
                <h3
                  className="text-xs font-medium uppercase tracking-widest mb-5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('footer.learn')}
                </h3>
                <ul className="space-y-3">
                  {learnLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3
                  className="text-xs font-medium uppercase tracking-widest mb-5"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
                >
                  {t('footer.company')}
                </h3>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-center gap-2 text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Mail className="w-3 h-3" />
                    {CONTACT.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div
              className="mt-12 pt-8"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h4
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                  >
                    {t('footer.newsletter')}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t('footer.newsletterDesc')}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder={t('footer.emailPlaceholder')}
                    className="flex-1 sm:w-60 px-3 py-2 text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                  <button
                    className="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {t('buttons.subscribe')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p
                className="text-xs text-center leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                {tl('footer.disclaimer')}
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {[
                  { href: '/mentions-legales', label: tl('footer.mentions') },
                  { href: '/terms',            label: tl('footer.terms') },
                  { href: '/confidentialite',  label: tl('footer.privacy') },
                  { href: '/politique-cookies', label: tl('footer.cookiePolicy') },
                  { href: '/politique-risques', label: tl('footer.riskPolicy') },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)')}
                  >
                    {l.label}
                  </Link>
                ))}
                <button
                  onClick={() => setShowCookieBanner(true)}
                  className="text-xs transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {tl('footer.manageCookies')}
                </button>
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                © {new Date().getFullYear()} WallStreet Morocco · Projet indépendant · Non agréé AMMC
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
