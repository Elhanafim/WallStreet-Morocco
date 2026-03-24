'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import { useEffect } from 'react';
import i18n from '@/i18n';

function I18nInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem('lang');
    const browserLang = navigator.language?.slice(0, 2);
    const lang = saved ?? (['fr', 'en', 'es'].includes(browserLang) ? browserLang : 'fr');
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <I18nInitializer />
        {children}
      </SessionProvider>
    </I18nextProvider>
  );
}
