'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, TrendingUp, Terminal, Heart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/market',    label: 'Markets'     },
  { href: '/opcvm',     label: 'OPCVM'       },
  { href: '/simulator', label: 'Simulator'   },
  { href: '/calendar',  label: 'Calendar'    },
  { href: '/learn',     label: 'Learn'       },
];

export default function Navbar() {
  const [isOpen, setIsOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const pathname  = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Click-outside for user menu
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-[var(--bg-surface)] shadow-[0_1px_0_var(--border)]'
          : 'bg-[var(--bg-surface)] border-b border-[var(--border)]'
      )}
      style={{ height: '60px' }}
    >
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between gap-8">

        {/* ── LOGO ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div
            className="w-7 h-7 flex items-center justify-center rounded-[5px]"
            style={{ backgroundColor: 'var(--gold)', boxShadow: '0 0 0 1px rgba(184,151,74,0.3)' }}
          >
            <TrendingUp size={14} className="text-[#fff]" />
          </div>
          <span className="font-display text-[17px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            WallStreet <span style={{ color: 'var(--gold)' }} className="italic">Morocco</span>
          </span>
        </Link>

        {/* ── NAV LINKS (Desktop) ── */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-[5px] font-body text-[13.5px] font-normal tracking-[0.01em] transition-all duration-150',
                  active
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                    style={{ backgroundColor: 'var(--gold)' }}
                  />
                )}
              </Link>
            );
          })}

          {/* ── Terminal — special design ── */}
          {(() => {
            const active = pathname === '/terminal' || pathname.startsWith('/terminal');
            return (
              <Link
                href="/terminal"
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-[5px] font-body text-[13.5px] font-semibold tracking-[0.01em] transition-all duration-150',
                )}
                style={{
                  background: active
                    ? 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)'
                    : 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
                  color: '#fff',
                  border: `1.5px solid ${active ? 'var(--gold)' : 'rgba(184,151,74,0.4)'}`,
                  boxShadow: active ? '0 0 0 3px rgba(184,151,74,0.15)' : 'none',
                }}
              >
                <Terminal size={13} />
                Terminal
              </Link>
            );
          })()}
        </div>

        {/* ── ACTIONS (Right) ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Support Us */}
          <Link
            href="/donate"
            className="hidden sm:flex items-center gap-1.5 font-body text-[13px] font-semibold px-3.5 py-1.5 rounded-[6px] transition-all duration-150 hover:brightness-110"
            style={{
              backgroundColor: 'var(--gold)',
              color: '#fff',
            }}
          >
            <Heart size={12} />
            Support Us
          </Link>
          {session ? (
            /* ── Authenticated: avatar + dropdown ── */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-[6px] transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  {session.user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="font-body text-[13px] text-[var(--text-primary)] hidden sm:block max-w-[100px] truncate">
                  {session.user?.name ?? 'Account'}
                </span>
                <ChevronDown
                  size={14}
                  className={cn('text-[var(--text-muted)] transition-transform', userMenuOpen && 'rotate-180')}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-52 py-1.5 rounded-[8px] overflow-hidden z-50"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="font-body text-[12px] text-[var(--text-muted)] truncate">{session.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 font-body text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-[var(--text-muted)]" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 px-3 py-2 font-body text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <User size={14} className="text-[var(--text-muted)]" />
                      Profile
                    </Link>
                  </div>
                  <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2.5 w-full px-3 py-2 font-body text-[13px] text-[var(--loss)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Log In + Sign Up ── */
            <>
              <Link
                href="/auth/login"
                className="hidden sm:block font-body text-[13.5px] font-medium px-4 py-1.5 rounded-[6px] transition-all duration-150 hover:bg-[var(--bg-elevated)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="font-body text-[13.5px] font-semibold px-4 py-1.5 rounded-[6px] transition-all duration-150 hover:brightness-110"
                style={{
                  backgroundColor: 'var(--gold)',
                  color: '#fff',
                }}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-1.5 rounded-[5px] transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={cn(
          'lg:hidden absolute top-[60px] left-0 right-0 transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="px-6 py-6 space-y-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2.5 rounded-[6px] font-body text-[14px] transition-colors',
                  active
                    ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {/* Terminal — mobile special */}
          <Link
            href="/terminal"
            className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] font-body text-[14px] font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', color: '#fff', border: '1.5px solid rgba(184,151,74,0.5)' }}
          >
            <Terminal size={14} /> Terminal
          </Link>
          {/* Support Us — mobile */}
          <Link
            href="/donate"
            className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] font-body text-[14px] font-semibold"
            style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
          >
            <Heart size={14} /> Support Us
          </Link>

          {!session && (
            <div className="pt-4 border-t flex gap-3" style={{ borderColor: 'var(--border)' }}>
              <Link
                href="/auth/login"
                className="flex-1 text-center py-2.5 rounded-[6px] font-body text-[14px] font-medium border transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="flex-1 text-center py-2.5 rounded-[6px] font-body text-[14px] font-semibold"
                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
