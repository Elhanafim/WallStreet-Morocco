'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import DonateToast from '@/components/donate/DonateToast';

// Cookie banner is only rendered client-side (reads localStorage)
const CookieBanner = dynamic(() => import('@/components/legal/CookieBanner'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <LanguageSwitcher floating />
      {pathname !== '/donate' && <DonateToast />}
      {/* Cookie consent banner — shown on first visit until consent given */}
      <CookieBanner />
    </>
  );
}
