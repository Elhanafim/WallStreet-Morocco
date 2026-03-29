'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function EduBannerInline() {
  const { t } = useTranslation('legal');
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className="bg-[#1e3a5f] rounded-xl px-5 py-3 my-6 flex items-center gap-3 text-white text-sm transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
      >
        <span className="text-base flex-shrink-0">📚</span>
        <span>{t('edu_banner_inline')}</span>
      </div>
    </div>
  );
}
