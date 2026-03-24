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
        <h3 className="text-white font-black text-xl sm:text-2xl mb-1">
          Ma thèse d&apos;investissement
        </h3>
        <p className="text-white/40 text-sm">Novembre 2024 · Analyse fondamentale · Mégatendances</p>
      </div>

      {/* 2-col on desktop, 1-col mobile */}
      <div className="grid lg:grid-cols-5 gap-8 items-start">

        {/* Left: prose — 3 columns */}
        <div className="lg:col-span-3 bg-white/5 border border-white/8 rounded-2xl p-6 sm:p-7">
          <p className="text-white/70 text-sm sm:text-base leading-relaxed">
            Entre novembre 2024 et mars 2026, j&apos;ai appliqué une stratégie DCA disciplinée
            sur la Bourse de Casablanca, en concentrant mon capital sur quatre convictions
            fortes : deux minières exposées aux records historiques de l&apos;or et de l&apos;argent,
            une fintech sur la vague de la digitalisation des paiements, et un promoteur
            immobilier porté par le programme national de logement social.
          </p>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-4">
            Le résultat —{' '}
            <span className="text-emerald-400 font-bold">+54,6% en DCA</span>
            {' '}contre{' '}
            <span className="text-white/50">+2,1% pour le MASI</span>
            {' '}— démontre que la sélection active, basée sur l&apos;analyse
            fondamentale des mégatendances, crée une valeur significative dans un marché
            émergent comme le Maroc.
          </p>
        </div>

        {/* Right: conviction pills — 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">
            3 convictions fondamentales
          </p>
          {CONVICTIONS.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3"
              style={{
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">{c.icon}</span>
              <p className="text-white/80 text-sm font-semibold leading-snug">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
