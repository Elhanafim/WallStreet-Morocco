'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGS = ['fr', 'en', 'es'] as const;
type Lang = (typeof LANGS)[number];

const LABELS: Record<Lang, string> = { fr: 'FR', en: 'EN', es: 'ES' };

export default function LanguageSwitcher({ className, floating }: { className?: string; floating?: boolean }) {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) ?? 'fr') as Lang;

  function switchLang(lang: Lang) {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }

  if (floating) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-0.5 bg-white/90 backdrop-blur-md border border-surface-200 rounded-xl shadow-lg p-1">
        {LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => switchLang(lang)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150',
              current === lang
                ? 'bg-primary text-white shadow-sm'
                : 'text-primary/50 hover:text-primary hover:bg-surface-100'
            )}
          >
            {LABELS[lang]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-0.5 bg-surface-100 rounded-lg p-0.5', className)}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => switchLang(lang)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150',
            current === lang
              ? 'bg-white text-primary shadow-sm'
              : 'text-primary/50 hover:text-primary'
          )}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
