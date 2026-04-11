'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, LayoutDashboard, LogOut, ChevronDown, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  const { t: td } = useTranslation('donate');

  const navLinks: { href: string; label: string }[] = [
    { href: '/learn', label: t('nav.learn') },
    { href: '/simulator', label: t('nav.simulator') },
    { href: '/calendar', label: t('nav.calendrier') },
    { href: '/opcvm', label: t('nav.opcvm') },
    { href: '/market', label: t('nav.marches') },
    { href: '/terminal', label: '◈ ' + t('nav.terminal') },
  ];

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
          ? 'bg-[#0A1628]/98 backdrop-blur-md shadow-lg border-b border-[#C9A84C]/10'
          : 'bg-[#0A1628]/80 backdrop-blur-sm'
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
              loading="lazy"
              decoding="async"
              className="w-9 h-9 group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-extrabold text-white text-lg leading-tight hidden sm:block font-sans">
              WallStreet{' '}
              <span className="text-[#C9A84C]">Morocco</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-[#C9A84C] font-semibold'
                    : 'text-[#A8B4C8] hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#C9A84C] rounded-full" />
                )}
              </Link>
            ))}
            {/* Donate pill */}
            <Link
              href="/donate"
              className="ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border-[1.5px]"
              style={{ borderColor: '#c1272d', color: '#c1272d' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#c1272d';
                (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = '#c1272d';
              }}
            >
              <span className="animate-heartbeat">♥</span>
              <span>{td('navLabel')}</span>
            </Link>
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
                      ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30'
                      : 'text-[#A8B4C8] hover:text-white hover:bg-white/5'
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t('nav.dashboard')}
                </Link>

                {/* Portfolio link */}
                <Link
                  href="/portfolio"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                    pathname === '/portfolio' || pathname.startsWith('/portfolio/')
                      ? 'bg-[#C9A84C] text-[#0A1628]'
                      : 'bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 border border-[#C9A84C]/20'
                  )}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {t('nav.portfolio')}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#A8B4C8] hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#C9A84C]" />
                    </div>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#112240] rounded-xl shadow-2xl border border-[#C9A84C]/15 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-[#1A3050]">
                        <p className="text-xs font-semibold text-white truncate">{session.user?.name ?? t('nav.investor')}</p>
                        <p className="text-xs text-[#A8B4C8] truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A8B4C8] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.profile')}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#A8B4C8] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  {t('nav.login')}
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" variant="gold">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#A8B4C8] hover:text-white hover:bg-white/5 transition-colors"
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
        <div className="bg-[#0A1628] border-t border-[#C9A84C]/10 px-4 py-4 space-y-1 shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 font-semibold'
                  : 'text-[#A8B4C8] hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile donate row */}
          <Link
            href="/donate"
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold mt-1 bg-red-500/5 border border-red-500/20"
          >
            <div>
              <p style={{ color: '#c1272d' }}>
                <span className="animate-heartbeat mr-1">♥</span>
                {td('navLabelMobile')}
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">{td('navSubMobile')}</p>
            </div>
            <span style={{ color: '#c1272d' }} className="text-lg">→</span>
          </Link>
          <div className="pt-3 border-t border-[#1A3050] flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    pathname.startsWith('/dashboard')
                      ? 'bg-[#C9A84C] text-[#0A1628]'
                      : 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </Link>
                <Link
                  href="/portfolio"
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    pathname === '/portfolio' || pathname.startsWith('/portfolio/')
                      ? 'bg-[#C9A84C] text-[#0A1628]'
                      : 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20'
                  )}
                >
                  <Briefcase className="w-4 h-4" /> {t('nav.portfolio')}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-[#A8B4C8] border border-[#1A3050] hover:bg-white/5 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-[#C9A84C] text-[#0A1628] hover:bg-[#E8C45A] transition-colors"
                >
                  {t('nav.registerFree')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
