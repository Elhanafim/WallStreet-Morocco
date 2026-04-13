'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';

const CookieBanner = dynamic(() => import('@/components/legal/CookieBanner'), { ssr: false });
const ChatBubble   = dynamic(() => import('@/components/chat/ChatBubble'),     { ssr: false });

const NO_LAYOUT_PATHS = ['/dashboard', '/terminal'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = NO_LAYOUT_PATHS.some((p) => pathname?.startsWith(p));

  if (isFullscreen) {
    return <>{children}</>;
  }

  const isLegalPage = ['/confidentialite', '/terms', '/mentions-legales', '/politique-cookies', '/politique-risques'].includes(pathname ?? '');

  return (
    <>
      <Navbar />
      {/* Push content below fixed 60px navbar */}
      <div style={{ paddingTop: '60px' }}>
        <main className="min-h-screen animate-fadeIn">{children}</main>
        <Footer />
      </div>
      <CookieBanner />
      {!isLegalPage && <ChatBubble />}
    </>
  );
}
