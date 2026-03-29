'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
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
    { href: '/calendar', label: t('footer.links.calendar') },
    { href: '/opcvm', label: t('footer.links.opcvm') },
    { href: '/donate', label: t('footer.links.donate') },
  ];

  const learnLinks = [
    { href: '/learn?category=Bases', label: t('footer.links.basics') },
    { href: '/learn?category=Actions', label: t('footer.links.stocks') },
    { href: '/learn?category=OPCVM', label: 'OPCVM' },
    { href: '/learn?category=Stratégie', label: t('footer.links.strategies') },
  ];

  const companyLinks = [
    { href: '/about', label: t('footer.links.about') },
    { href: '/about#contact', label: t('footer.links.contact') },
    { href: '/donate', label: t('footer.links.donate') },
    { href: '/terms', label: tl('footer.terms') },
  ];

  return (
    <>
    {showCookieBanner && <CookieBanner onClose={() => setShowCookieBanner(false)} />}
    <footer className="bg-primary text-white">
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
                width={40}
                height={40}
                className="w-10 h-10 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-extrabold text-xl text-white">
                WallStreet <span className="text-accent">Morocco</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href={CONTACT.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="Suivre WallStreet Morocco sur Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href={CONTACT.whatsapp.hrefWithMsg}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="Contacter sur WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {/* Email */}
              <a
                href={CONTACT.email.href}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="Envoyer un email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-accent mb-5">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-accent mb-5">
              {t('footer.learn')}
            </h3>
            <ul className="space-y-3">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-accent mb-5">
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <a
                href={CONTACT.email.href}
                className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {CONTACT.email.display}
              </a>
              <a
                href={CONTACT.whatsapp.hrefWithMsg}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {CONTACT.phone.display}
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-white mb-1">
                {t('footer.newsletter')}
              </h4>
              <p className="text-white/50 text-sm">
                {t('footer.newsletterDesc')}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
              <button className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-secondary-600 transition-colors whitespace-nowrap">
                {t('buttons.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Disclaimer */}
      <div className="border-t border-white/10 bg-primary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-white/30 text-xs text-center leading-relaxed">
            ⚠️ {tl('footer.disclaimer')}
          </p>
        </div>
      </div>

      {/* Bottom Bar — legal links + cookie management */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-3">
          {/* Legal links row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <Link href="/mentions-legales" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              {tl('footer.mentions')}
            </Link>
            <span className="text-white/15 text-xs hidden sm:block">·</span>
            <Link href="/terms" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              {tl('footer.terms')}
            </Link>
            <span className="text-white/15 text-xs hidden sm:block">·</span>
            <Link href="/confidentialite" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              {tl('footer.privacy')}
            </Link>
            <span className="text-white/15 text-xs hidden sm:block">·</span>
            <Link href="/politique-cookies" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              {tl('footer.cookiePolicy')}
            </Link>
            <span className="text-white/15 text-xs hidden sm:block">·</span>
            <Link href="/politique-risques" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              {tl('footer.riskPolicy')}
            </Link>
            <span className="text-white/15 text-xs hidden sm:block">·</span>
            <button
              onClick={() => setShowCookieBanner(true)}
              className="text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer"
            >
              {tl('footer.manageCookies')}
            </button>
          </div>
          {/* Copyright */}
          <p className="text-white/25 text-xs text-center">
            © {new Date().getFullYear()} WallStreet Morocco · Mohammed El Hanafi · Projet personnel indépendant · Non agréé AMMC
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
