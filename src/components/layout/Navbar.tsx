'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';


const navLinks = [
  { href: '/learn', label: 'Apprendre' },
  { href: '/simulator', label: 'Simulateur' },
  { href: '/calendar', label: 'Calendrier' },
  { href: '/opcvm', label: 'OPCVM' },
  { href: '/market', label: 'Marchés' },
  { href: '/about', label: 'Fondateur' },
  { href: '/premium', label: 'Premium', highlight: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                    pathname.startsWith('/dashboard')
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-primary/70 hover:text-primary hover:bg-surface-100'
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Tableau de bord
                </Link>

                {/* Portfolio link */}
                <Link
                  href="/portfolio"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                    pathname === '/portfolio' || pathname.startsWith('/portfolio/')
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                  )}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Mon Portefeuille
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-primary/70 hover:text-primary hover:bg-surface-100 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-surface-200 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-surface-100">
                        <p className="text-xs font-semibold text-primary truncate">{session.user?.name ?? 'Investisseur'}</p>
                        <p className="text-xs text-primary/40 truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary/70 hover:text-primary hover:bg-surface-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    pathname.startsWith('/dashboard')
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                </Link>
                <Link
                  href="/portfolio"
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    pathname === '/portfolio' || pathname.startsWith('/portfolio/')
                      ? 'bg-secondary text-white'
                      : 'bg-secondary/10 text-secondary border border-secondary/20'
                  )}
                >
                  <Briefcase className="w-4 h-4" /> Mon Portefeuille
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
