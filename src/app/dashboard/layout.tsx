'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard':           'Vue d\'ensemble',
  '/dashboard/portfolio': 'Mon Portfolio',
  '/dashboard/profile':   'Mon Profil',
};

function roleBadge(role: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    FREE:    { label: 'Gratuit', color: 'var(--text-muted)',    bg: 'var(--bg-elevated)' },
    PREMIUM: { label: 'Premium', color: 'var(--gold)',          bg: 'rgba(184,151,74,0.08)' },
    ADMIN:   { label: 'Admin',   color: 'var(--text-secondary)', bg: 'var(--bg-elevated)' },
  };
  return map[role] ?? map['FREE'];
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = pageTitles[pathname] ?? 'Dashboard';
  const role  = (session?.user as any)?.role ?? 'FREE';
  const badge = roleBadge(role);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(8,15,30,0.7)' }}
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
        <header
          className="flex-shrink-0 h-14 flex items-center justify-between px-4 lg:px-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)', borderRadius: '6px' }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1
              className="text-base font-medium"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
              }}
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 flex items-center justify-center relative transition-colors"
              style={{ color: 'var(--text-muted)', borderRadius: '6px' }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--text-secondary)' }}
              />
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p
                  className="text-xs font-medium leading-none"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                >
                  {session?.user?.name ?? 'Utilisateur'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className="text-2xs px-1.5 py-0.5"
                    style={{
                      color: badge.color,
                      backgroundColor: badge.bg,
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardInner>{children}</DashboardInner>;
}
