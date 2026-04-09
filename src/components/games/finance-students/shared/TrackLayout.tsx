'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface TrackLayoutProps {
  title: string;
  emoji: string;
  description: string;
  difficulty: string;
  difficultyVariant: 'warning' | 'danger';
  learningGoals: string[];
  children: React.ReactNode;
}

/**
 * Shared layout skeleton for Finance Students game track pages.
 * Provides back-nav, track header, learning goals, and game content area.
 */
export default function TrackLayout({
  title,
  emoji,
  description,
  difficulty,
  difficultyVariant,
  learningGoals,
  children,
}: TrackLayoutProps) {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <Link
          href="/learn/finance-students"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux parcours étudiants
        </Link>
      </div>

      {/* Track header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-5xl">{emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-primary font-display">{title}</h1>
              <Badge variant={difficultyVariant} size="sm">{difficulty}</Badge>
            </div>
            <p className="text-primary/60 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Learning goals */}
        <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
              Objectifs pédagogiques
            </span>
          </div>
          <ul className="space-y-1">
            {learningGoals.map((goal, i) => (
              <li key={i} className="text-sm text-primary/70 flex items-start gap-2">
                <span className="text-secondary/60 mt-0.5">•</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Game content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        {children}
      </div>
    </div>
  );
}
