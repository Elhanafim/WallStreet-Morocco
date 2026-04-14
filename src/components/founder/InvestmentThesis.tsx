'use client';

import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

const CONVICTIONS = [
  {
    icon: '🏅',
    text: 'Mégatendances commodities (or, argent)',
  },
  {
    icon: '🏅',
    text: 'Infrastructure Mondial 2030 (BTP, acier)',
  },
  {
    icon: '🏅',
    text: 'Digitalisation Maroc (fintech, paiements)',
  },
];

export default function InvestmentThesis() {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className="mb-14"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-medium text-xl sm:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Ma thèse d&apos;investissement
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Novembre 2024 · Analyse fondamentale · Mégatendances</p>
      </div>

      {/* 2-col on desktop, 1-col mobile */}
      <div className="grid lg:grid-cols-5 gap-8 items-start">

        {/* Left: prose — 3 columns */}
        <div className="lg:col-span-3 rounded-[10px] p-6 sm:p-7" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Entre novembre 2024 et mars 2026, j&apos;ai appliqué une stratégie DCA disciplinée
            sur la Bourse de Casablanca, en concentrant mon capital sur quatre convictions
            fortes : deux minières exposées aux records historiques de l&apos;or et de l&apos;argent,
            une fintech sur la vague de la digitalisation des paiements, et un promoteur
            immobilier porté par le programme national de logement social.
          </p>
          <p className="text-sm sm:text-base leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>
            Le résultat —{' '}
            <span className="font-medium" style={{ color: 'var(--gain)' }}>+54,6% en DCA</span>
            {' '}contre{' '}
            <span style={{ color: 'var(--text-muted)' }}>+2,1% pour le MASI</span>
            {' '}— démontre que la sélection active, basée sur l&apos;analyse
            fondamentale des mégatendances, crée une valeur significative dans un marché
            émergent comme le Maroc.
          </p>
        </div>

        {/* Right: conviction pills — 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
            3 convictions fondamentales
          </p>
          {CONVICTIONS.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-[10px] px-4 py-3"
              style={{
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid rgba(184,151,74,0.25)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">{c.icon}</span>
              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
