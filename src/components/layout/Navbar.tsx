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
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border)]"
      style={{ height: '64px' }}
    >
      <div className="max-w-7xl mx-auto h-full px-[var(--space-md)]">
        <div className="flex items-center justify-between h-full">
          
          {/* LOGO (LEFT) */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-[18px] text-[var(--text-primary)] tracking-tight">
              WallStreet <span className="text-[var(--gold)] italic">Morocco</span>
            </span>
          </Link>

          {/* NAV LINKS (CENTER) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-body text-[14px] font-normal tracking-[0.02em] transition-colors duration-150 py-1",
                    active ? "text-[var(--text-primary)] border-b-2 border-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ACTIONS (RIGHT) */}
          <div className="flex items-center gap-5">
            {/* Mode Toggle */}
            <button
              onClick={toggleTheme}
              style={themeToggleStyle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language Switcher (placeholder/placeholder logic if it exists in data) */}
            <div className="hidden sm:flex items-center gap-3 font-body text-[13px]">
              <span className="text-[var(--text-primary)] font-medium">FR</span>
              <span className="w-px h-3 bg-[var(--border)]" />
              <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">EN</span>
              <span className="w-px h-3 bg-[var(--border)]" />
              <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">ES</span>
            </div>

            {/* CTA */}
            <Link
              href="/donate"
              className="hidden sm:block border border-[var(--gold)] text-[var(--gold)] bg-transparent font-body text-[13px] font-medium px-5 py-2 rounded-[6px] transition-all hover:bg-[var(--gold)] hover:text-[var(--bg-base)]"
            >
              Soutenir · 1$
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-[var(--text-secondary)]"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden absolute top-[64px] left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border)] transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 py-8 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block font-body text-[15px] font-normal text-[var(--text-secondary)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-6 border-t border-[var(--border)] space-y-4">
            <Link href="/donate" className="block text-[var(--gold)] font-medium">
              Soutenir · 1$
            </Link>
            <div className="flex gap-4 text-[13px]">
              <span className="text-[var(--text-primary)] font-medium">FR</span>
              <span className="text-[var(--text-muted)]">EN</span>
              <span className="text-[var(--text-muted)]">ES</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
