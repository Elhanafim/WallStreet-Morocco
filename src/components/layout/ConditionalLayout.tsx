'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import MoroccanDivider from './MoroccanDivider';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// Cookie banner is only rendered client-side (reads localStorage)
const CookieBanner = dynamic(() => import('@/components/legal/CookieBanner'), { ssr: false });

// Chatbot bubble — client-side only, never on legal/admin pages
const ChatBubble = dynamic(() => import('@/components/chat/ChatBubble'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isTerminal  = pathname?.startsWith('/terminal');

  if (isDashboard || isTerminal) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      {/* Zone 2: 56px photo strip directly below the fixed navbar */}
      <div className="mt-16 relative overflow-hidden" style={{ height: '56px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1920&q=85&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(8,15,30,0.88)' }}
        />
      </div>

      {/* Single Moroccan geometric divider */}
      <MoroccanDivider />

      <main className="min-h-screen animate-fadeIn">{children}</main>
      <Footer />
      <LanguageSwitcher floating />
      {/* Cookie consent banner — shown on first visit until consent given */}
      <CookieBanner />
      {/* AI chatbot bubble — hidden on legal pages */}
      {pathname !== '/confidentialite' && pathname !== '/terms' && <ChatBubble />}
    </>
  );
}
