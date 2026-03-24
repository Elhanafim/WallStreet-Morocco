'use client';

import { useEffect, useRef, useState } from 'react';
import { Scenario } from '@/data/founderPortfolio';

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

interface ScenariosTableProps {
  scenarios: Scenario[];
}

export default function ScenariosTable({ scenarios }: ScenariosTableProps) {
  const [ref, inView] = useInView();
  const fmt = (v: number) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  const fmtDec = (v: number) =>
    v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div
      ref={ref}
      className="mb-16"
      style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease-out, transform 0.5s ease-out' }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-white font-black text-xl sm:text-2xl mb-1">
          Pourquoi la concentration bat la diversification
        </h3>
        <p className="text-white/40 text-sm">
          Simulation DCA 100 MAD/mois · 17 mois · 1 700 MAD investis
        </p>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="relative">
        {/* Right-fade indicator on mobile */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0d2847] to-transparent pointer-events-none z-10 sm:hidden"
          aria-hidden="true"
        />

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] border-collapse text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="text-left py-3 px-4 text-white/40 text-xs font-bold uppercase tracking-wide">
                  Scénario
                </th>
                <th scope="col" className="text-center py-3 px-4 text-white/40 text-xs font-bold uppercase tracking-wide">
                  Valeurs
                </th>
                <th scope="col" className="text-right py-3 px-4 text-white/40 text-xs font-bold uppercase tracking-wide">
                  Capital
                </th>
                <th scope="col" className="text-right py-3 px-4 text-white/40 text-xs font-bold uppercase tracking-wide">
                  Valeur finale
                </th>
                <th scope="col" className="text-right py-3 px-4 text-white/40 text-xs font-bold uppercase tracking-wide">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr
                  key={i}
                  className={`border-b transition-colors ${
                    s.highlight
                      ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
                      : s.muted
                      ? 'bg-white/0 border-white/5 opacity-50 hover:opacity-70'
                      : 'bg-white/0 border-white/8 hover:bg-white/5'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <span className="text-white font-semibold">
                      {s.icon && <span className="mr-1.5">{s.icon}</span>}
                      {s.label}
                    </span>
                    {s.highlight && (
                      <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        Choix retenu
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center text-white/60">{s.stocks}</td>
                  <td className="py-3.5 px-4 text-right text-white/60">{fmt(s.capital)} MAD</td>
                  <td className={`py-3.5 px-4 text-right font-bold ${s.highlight ? 'text-emerald-400' : 'text-white/70'}`}>
                    {fmt(s.value)} MAD
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-black text-base ${
                        s.highlight
                          ? 'text-emerald-400'
                          : s.muted
                          ? 'text-white/40'
                          : 'text-white/70'
                      }`}
                    >
                      +{fmtDec(s.perf)}%
                    </span>
                    <span className="ml-1.5 text-base">{s.badge}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
