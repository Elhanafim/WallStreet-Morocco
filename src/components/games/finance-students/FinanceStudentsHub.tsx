'use client';

import Link from 'next/link';
import { ChevronRight, Trophy, Clock, GraduationCap, Shield, Calculator, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { getAllStudentHighScores, GameScore, StudentGameId } from '@/lib/gameScores';

const TRACKS = [
  {
    id: 'risk-manager',
    title: 'Risk Manager',
    emoji: '🛡️',
    icon: Shield,
    description:
      'Identifiez, classifiez et mitigez les risques bancaires. Gérez un portefeuille d\'expositions et décidez quand couvrir vos positions.',
    difficulty: 'Avancé',
    difficultyVariant: 'danger' as const,
    concepts: ['Risque de crédit', 'Risque de marché', 'Couverture (hedging)'],
    duration: '15–20 min',
    games: ['risk-radar', 'hedge-or-hold'] as StudentGameId[],
    gameCount: 2,
    color: 'from-red-50 to-white border-red-100',
    accentColor: 'text-red-700',
    iconColor: 'text-red-500',
  },
  {
    id: 'cost-controller',
    title: 'Cost Controller',
    emoji: '🏭',
    icon: Calculator,
    description:
      'Maîtrisez la structure de coûts d\'une usine marocaine. Optimisez volume, prix et investissements pour atteindre (et dépasser) le seuil de rentabilité.',
    difficulty: 'Intermédiaire',
    difficultyVariant: 'warning' as const,
    concepts: ['Seuil de rentabilité', 'Coûts fixes/variables', 'Marge de contribution'],
    duration: '10–15 min',
    games: ['factory-break-even'] as StudentGameId[],
    gameCount: 1,
    color: 'from-amber-50 to-white border-amber-100',
    accentColor: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  {
    id: 'financial-analyst',
    title: 'Financial Analyst',
    emoji: '📊',
    icon: BarChart3,
    description:
      'Analysez des états financiers simplifiés d\'entreprises marocaines. Sélectionnez les bons ratios et identifiez les signaux d\'alerte.',
    difficulty: 'Intermédiaire',
    difficultyVariant: 'warning' as const,
    concepts: ['Ratios financiers', 'Analyse crédit', 'Diagnostic financier'],
    duration: '10–15 min',
    games: ['ratio-race'] as StudentGameId[],
    gameCount: 1,
    color: 'from-indigo-50 to-white border-indigo-100',
    accentColor: 'text-indigo-700',
    iconColor: 'text-indigo-500',
  },
  {
    id: 'investment-manager',
    title: 'Investment Manager',
    emoji: '💼',
    icon: TrendingUp,
    description:
      'Évaluez des projets d\'investissement sous contrainte budgétaire. Calculez VAN, TRI, délai de récupération et indice de profitabilité.',
    difficulty: 'Avancé',
    difficultyVariant: 'danger' as const,
    concepts: ['VAN / TRI', 'Payback', 'Budget d\'investissement'],
    duration: '15–20 min',
    games: ['capital-budgeting'] as StudentGameId[],
    gameCount: 1,
    color: 'from-emerald-50 to-white border-emerald-100',
    accentColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
  },
] as const;

export default function FinanceStudentsHub() {
  const [scores, setScores] = useState<Record<StudentGameId, GameScore | null>>(
    { 'risk-radar': null, 'hedge-or-hold': null, 'factory-break-even': null, 'ratio-race': null, 'capital-budgeting': null }
  );

  useEffect(() => {
    setScores(getAllStudentHighScores());
  }, []);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 bg-secondary rounded-full" />
        <h2 className="text-lg font-bold text-primary">Jeux pour étudiants en finance</h2>
      </div>
      <p className="text-primary/55 text-sm mb-3 ml-5">
        Exercices interactifs de niveau L3/Master — gestion des risques, coûts, analyse financière et décisions d&apos;investissement.
      </p>

      {/* Audience badge */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20 rounded-xl px-4 py-3 mb-8">
        <GraduationCap className="w-4 h-4 text-secondary flex-shrink-0" />
        <p className="text-sm text-primary/70">
          Ces jeux sont conçus pour les <strong>étudiants en finance et gestion</strong> ayant des bases en comptabilité et finance d&apos;entreprise.
        </p>
      </div>

      {/* Track cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TRACKS.map((track) => {
          const trackScores = track.games
            .map((gid) => scores[gid])
            .filter((s): s is GameScore => s !== null);

          return (
            <div
              key={track.id}
              className={`relative rounded-2xl bg-gradient-to-b ${track.color} border p-6 flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300`}
            >
              {/* Emoji + difficulty */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{track.emoji}</span>
                <Badge variant={track.difficultyVariant} size="sm">
                  {track.difficulty}
                </Badge>
              </div>

              {/* Title + description */}
              <h3 className="text-xl font-bold text-primary font-display mb-2">{track.title}</h3>
              <p className="text-primary/60 text-sm leading-relaxed mb-4 flex-1">
                {track.description}
              </p>

              {/* Concept tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {track.concepts.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-white/80 border border-surface-100 text-primary/60 px-2 py-0.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-100/60">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-primary/40">
                    <Clock className="w-3 h-3" />
                    {track.duration}
                  </span>
                  <span className="text-xs text-primary/40">
                    {track.gameCount} jeu{track.gameCount > 1 ? 'x' : ''}
                  </span>
                </div>
                <Link
                  href={`/learn/finance-students/${track.id}`}
                  className={`flex items-center gap-1 text-sm font-semibold ${track.accentColor} hover:opacity-75 transition-opacity`}
                >
                  Entrer <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* High scores */}
              {trackScores.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-100/60">
                  <Trophy className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-primary/50">Meilleur score :</span>
                  <span className="text-xs font-bold text-accent">
                    {trackScores.map((s) => s.label).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
