'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import DonateToast from '@/components/donate/DonateToast';

// Cookie banner is only rendered client-side (reads localStorage)
const CookieBanner = dynamic(() => import('@/components/legal/CookieBanner'), { ssr: false });

// Chatbot bubble — client-side only, never on legal/admin pages
const ChatBubble = dynamic(() => import('@/components/chat/ChatBubble'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen animate-fadeIn">{children}</main>
      <Footer />
      <LanguageSwitcher floating />
      {pathname !== '/donate' && <DonateToast />}
      {/* Cookie consent banner — shown on first visit until consent given */}
      <CookieBanner />
      {/* AI chatbot bubble — hidden on legal pages */}
      {pathname !== '/confidentialite' && pathname !== '/terms' && <ChatBubble />}
    </>
  );
}
