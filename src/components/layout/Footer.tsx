import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Mail, Phone } from 'lucide-react';

const platformLinks = [
  { href: '/simulator', label: 'Simulateur' },
  { href: '/calendar', label: 'Calendrier Économique' },
  { href: '/opcvm', label: 'OPCVM & Fonds' },
  { href: '/premium', label: 'Abonnement Premium' },
];

const learnLinks = [
  { href: '/learn?category=Bases', label: 'Les Bases' },
  { href: '/learn?category=Actions', label: 'Actions' },
  { href: '/learn?category=OPCVM', label: 'OPCVM' },
  { href: '/learn?category=Stratégie', label: 'Stratégies' },
];

const companyLinks = [
  { href: '/about', label: 'À propos' },
  { href: '/about#contact', label: 'Contact' },
  { href: '/premium', label: 'Tarifs' },
  { href: '#', label: 'Mentions légales' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <Image
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
              La plateforme de référence pour les investisseurs marocains.
              Apprenez, analysez et investissez intelligemment au Maroc.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@wallstreetmorocco.com"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-accent mb-5">
              Plateforme
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
              Apprendre
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
              Entreprise
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
                href="mailto:contact@wallstreetmorocco.com"
                className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                contact@wallstreetmorocco.com
              </a>
              <a
                href="tel:+212600000000"
                className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +212 6 00 00 00 00
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-white mb-1">
                Restez informé des marchés marocains
              </h4>
              <p className="text-white/50 text-sm">
                Newsletter hebdomadaire • Analyses • Alertes marchés
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
              <button className="px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-secondary-600 transition-colors whitespace-nowrap">
                S&apos;abonner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} WallStreet Morocco. Tous droits réservés.
          </p>
          <p className="text-white/30 text-xs text-center">
            ⚠️ Les informations fournies ne constituent pas des conseils en investissement.
            Investir comporte des risques.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
