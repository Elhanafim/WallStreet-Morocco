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
    <aside className="w-64 h-full bg-[#0A1628] flex flex-col border-r border-[#C9A84C]/10">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#C9A84C]/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
          </div>
          <span className="font-black text-sm text-white leading-tight font-sans">
            WallStreet<br />
            <span className="text-[#C9A84C]">Morocco</span>
          </span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="text-[#A8B4C8] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Moroccan geometry accent */}
      <div className="px-6 py-3">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[#A8B4C8]/40 text-2xs font-semibold uppercase tracking-widest px-3 mb-3 font-sans">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              isActive(href)
                ? 'bg-[#C9A84C]/12 text-white border border-[#C9A84C]/25'
                : 'text-[#A8B4C8] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive(href) ? 'text-[#C9A84C]' : 'text-[#A8B4C8]/50 group-hover:text-[#A8B4C8]'
              }`}
            />
            {label}
            {isActive(href) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6 pt-4 border-t border-[#1A3050]">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#A8B4C8] hover:text-[#E74C3C] hover:bg-[#E74C3C]/8 border border-transparent hover:border-[#E74C3C]/15 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 text-[#A8B4C8]/50 group-hover:text-[#E74C3C] transition-colors" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
