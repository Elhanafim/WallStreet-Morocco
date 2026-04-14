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
        <h3 className="font-medium text-xl sm:text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          Pourquoi la concentration bat la diversification
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Simulation DCA 100$/mois · 17 mois · $1 700 investis
        </p>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="relative rounded-[10px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {/* Right-fade indicator on mobile */}
        <div
          className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 sm:hidden"
          style={{ background: 'linear-gradient(to left, var(--bg-surface), transparent)' }}
          aria-hidden="true"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm" role="table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                <th scope="col" className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Scénario
                </th>
                <th scope="col" className="text-center py-3 px-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Valeurs
                </th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Capital
                </th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Valeur finale
                </th>
                <th scope="col" className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr
                  key={i}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: s.highlight
                      ? 'rgba(13,122,78,0.05)'
                      : 'transparent',
                    opacity: s.muted ? 0.55 : 1,
                  }}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {s.icon && <span className="mr-1.5">{s.icon}</span>}
                      {s.label}
                    </span>
                    {s.highlight && (
                      <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(13,122,78,0.1)', color: 'var(--gain)' }}>
                        Choix retenu
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center" style={{ color: 'var(--text-secondary)' }}>{s.stocks}</td>
                  <td className="py-3.5 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>${fmt(s.capital)}</td>
                  <td className="py-3.5 px-4 text-right font-medium" style={{ color: s.highlight ? 'var(--gain)' : 'var(--text-primary)' }}>
                    ${fmt(s.value)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className="font-medium text-base"
                      style={{ color: s.highlight ? 'var(--gain)' : s.muted ? 'var(--text-muted)' : 'var(--text-secondary)' }}
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
