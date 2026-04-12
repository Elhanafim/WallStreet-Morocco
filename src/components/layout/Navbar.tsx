'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, LayoutDashboard, LogOut, ChevronDown, User, Heart, Sun, Moon } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');
  const { t: td } = useTranslation('donate');

  const navLinks: { href: string; label: string }[] = [
    { href: '/learn',     label: t('nav.learn') },
    { href: '/simulator', label: t('nav.simulator') },
    { href: '/calendar',  label: t('nav.calendrier') },
    { href: '/opcvm',     label: t('nav.opcvm') },
    { href: '/market',    label: t('nav.marches') },
    { href: '/terminal',  label: '◈ ' + t('nav.terminal') },
  ];

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync theme state from localStorage on mount
  useEffect(() => {
    const saved = (localStorage.getItem('wsm-theme') || 'dark') as 'dark' | 'light';
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wsm-theme', next);
  }

  const themeToggleStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    flexShrink: 0,
    color: 'var(--text-secondary)',
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-150"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.svg"
              alt="WallStreet Morocco"
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 group-hover:opacity-80 transition-opacity"
            />
            <span
              className="font-medium text-[15px] hidden sm:block"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
            >
              WallStreet{' '}
              <span style={{ color: 'var(--gold)' }}>Morocco</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 transition-colors duration-150 hover:text-[var(--text-primary)]"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: active ? 500 : 400,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3"
                      style={{
                        height: '2px',
                        backgroundColor: 'var(--gold)',
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Donate / Primary CTA */}
            <Link
              href="/donate"
              className="ml-1 flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150 group/donate btn-primary-cta"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
              }}
            >
              <Heart className="w-3.5 h-3.5 animate-heartbeat" />
              <span>{td('navLabel')}</span>
            </Link>
          </div>

          {/* Desktop Right: Auth + Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 transition-colors duration-150"
                  style={{
                    fontSize: '13px',
                    fontWeight: pathname.startsWith('/dashboard') ? 500 : 400,
                    color: pathname.startsWith('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {t('nav.dashboard')}
                </Link>

                <Link
                  href="/portfolio"
                  className="flex items-center gap-1.5 px-3 py-2 transition-colors duration-150"
                  style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {t('nav.portfolio')}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <div
                      className="w-6 h-6 flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                      }}
                    >
                      <User className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <ChevronDown className={cn('w-3 h-3 transition-transform', userMenuOpen && 'rotate-180')} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-52 py-1 z-50 shadow-lg"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        className="px-4 py-2.5"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {session.user?.name ?? t('nav.investor')}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        <User className="w-3.5 h-3.5" />
                        {t('nav.profile')}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
                        style={{ color: 'var(--loss)' }}
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
                  className="text-[13px] px-3 py-2 transition-colors"
                  style={{ color: 'var(--text-secondary)', fontWeight: 400 }}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-[13px] font-medium transition-colors"
                  style={{
                    color: 'var(--text-primary)',
                    border: '1px solid var(--gold)',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--bg-elevated)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent')}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={themeToggleStyle}
            >
              {theme === 'dark'
                ? <Sun size={16} />
                : <Moon size={16} />
              }
            </button>
          </div>

          {/* Mobile header right */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={themeToggleStyle}
            >
              {theme === 'dark'
                ? <Sun size={16} />
                : <Moon size={16} />
              }
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 transition-colors"
              style={{ color: 'var(--text-secondary)', borderRadius: '6px' }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div
          className="px-4 py-4 space-y-0.5"
          style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--nav-bg)' }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2.5 text-[13px] transition-colors"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 500 : 400,
                  borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                  paddingLeft: '12px',
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/donate"
            className="flex items-center gap-2 px-3 py-2.5 text-[13px] mt-1"
            style={{ color: 'var(--loss)' }}
          >
            <Heart className="w-3.5 h-3.5 animate-heartbeat" />
            {td('navLabelMobile')}
          </Link>

          <div className="pt-3 flex flex-col gap-1.5" style={{ borderTop: '1px solid var(--border)' }}>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2.5 text-[13px] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </Link>
                <Link
                  href="/portfolio"
                  className="flex items-center gap-2 px-3 py-2.5 text-[13px] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Briefcase className="w-4 h-4" /> {t('nav.portfolio')}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-3 py-2.5 text-[13px] transition-colors"
                  style={{ color: 'var(--loss)' }}
                >
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center px-4 py-2.5 text-[13px] transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-4 py-2.5 text-[13px] font-medium transition-colors"
                  style={{
                    color: 'var(--text-primary)',
                    border: '1px solid var(--gold)',
                    borderRadius: '6px',
                  }}
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
