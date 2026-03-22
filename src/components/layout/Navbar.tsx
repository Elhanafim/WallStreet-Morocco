'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';


const navLinks = [
  { href: '/learn', label: 'Apprendre' },
  { href: '/simulator', label: 'Simulateur' },
  { href: '/calendar', label: 'Calendrier' },
  { href: '/opcvm', label: 'OPCVM' },
  { href: '/about', label: 'Fondateur' },
  { href: '/premium', label: 'Premium', highlight: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-surface-200'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.svg"
              alt="WallStreet Morocco"
              width={36}
              height={36}
              className="w-9 h-9 group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-extrabold text-primary text-lg leading-tight hidden sm:block">
              WallStreet{' '}
              <span className="text-accent">Morocco</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  link.highlight
                    ? 'bg-accent text-primary hover:bg-accent-600 font-semibold shadow-sm'
                    : pathname === link.href
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-primary/70 hover:text-primary hover:bg-surface-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary/70 hover:text-primary transition-colors"
            >
              Se connecter
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" variant="primary">
                S&apos;inscrire
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-primary hover:bg-surface-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-white border-t border-surface-200 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                link.highlight
                  ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                  : pathname === link.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-primary/70 hover:text-primary hover:bg-surface-50'
              )}
            >
              {link.label}
              {link.highlight && (
                <span className="ml-auto text-xs bg-accent text-primary px-1.5 py-0.5 rounded-full font-bold">
                  ✦
                </span>
              )}
            </Link>
          ))}
          <div className="pt-3 border-t border-surface-100 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-primary border border-surface-200 hover:bg-surface-50 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-secondary text-white hover:bg-secondary-600 transition-colors"
            >
              S&apos;inscrire gratuitement
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
