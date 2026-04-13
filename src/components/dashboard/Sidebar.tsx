'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Calendar,
  User,
  TrendingUp,
  LogOut,
  X,
  BarChart2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/portfolio',         label: 'Mon Portefeuille', icon: Briefcase },
  { href: '/dashboard/market',  label: 'Marchés',          icon: BarChart2 },
  { href: '/learn',             label: 'Apprendre',        icon: BookOpen },
  { href: '/calendar',          label: 'Calendrier',       icon: Calendar },
  { href: '/dashboard/profile', label: 'Profil',           icon: User },
];

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="w-64 h-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-base)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          >
            WallStreet <span style={{ color: 'var(--gold)' }}>Morocco</span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="transition-colors p-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p
          className="text-2xs font-medium uppercase tracking-widest px-2 mb-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-2 py-2.5 text-sm transition-colors"
              style={{
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: active ? 500 : 400,
                fontFamily: 'var(--font-body)',
                // Gold 2px left border for active — the 1 gold use in sidebar
                borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                paddingLeft: '10px',
                borderRadius: '0 6px 6px 0',
                backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: active ? 'var(--text-secondary)' : 'var(--text-muted)' }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 pb-5 pt-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-2 py-2.5 text-sm transition-colors"
          style={{
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            borderRadius: '6px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--loss)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
