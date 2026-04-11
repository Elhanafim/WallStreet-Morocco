'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Vue d\'ensemble',
  '/dashboard/portfolio': 'Mon Portfolio',
  '/dashboard/profile': 'Mon Profil',
};

function roleBadge(role: string) {
  const map: Record<string, { label: string; className: string }> = {
    FREE:    { label: 'Gratuit', className: 'bg-[#A8B4C8]/15 text-[#A8B4C8]' },
    PREMIUM: { label: 'Premium', className: 'bg-[#C9A84C]/15 text-[#C9A84C]' },
    ADMIN:   { label: 'Admin',   className: 'bg-purple-500/15 text-purple-300' },
  };
  return map[role] ?? map['FREE'];
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = pageTitles[pathname] ?? 'Dashboard';
  const role = (session?.user as any)?.role ?? 'FREE';
  const badge = roleBadge(role);

  return (
    <div className="flex h-screen bg-[#0A1628] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 bg-[#0A1628] border-b border-[#C9A84C]/10 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#A8B4C8] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-white font-display">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-[#A8B4C8] hover:text-white hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#C9A84C] rounded-full" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] text-xs font-bold">
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white leading-none">{session?.user?.name ?? 'Utilisateur'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0A1628]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardInner>{children}</DashboardInner>;
}
