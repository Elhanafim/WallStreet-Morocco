'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import DonateToast from '@/components/donate/DonateToast';

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
    </>
  );
}
