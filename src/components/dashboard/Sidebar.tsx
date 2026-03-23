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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Mon Portefeuille', icon: Briefcase },
  { href: '/dashboard/market', label: 'Marchés', icon: BarChart2 },
  { href: '/learn', label: 'Apprendre', icon: BookOpen },
  { href: '/calendar', label: 'Calendrier', icon: Calendar },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
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
    <aside className="w-64 h-full bg-[#0A2540] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <span className="font-black text-sm text-white leading-tight">
            WallStreet<br />
            <span className="text-accent">Morocco</span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-2xs font-semibold uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? 'bg-secondary/20 text-white border border-secondary/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive(href) ? 'text-secondary' : 'text-white/40 group-hover:text-white/70'
              }`}
            />
            {label}
            {isActive(href) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group"
        >
          <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
