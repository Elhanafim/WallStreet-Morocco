'use client';

import Link from 'next/link';
import { ChevronRight, Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { getAllHighScores, GameScore, ClassicGameId } from '@/lib/gameScores';

const GAMES = [
  {
    id: 'souk-day',
    title: 'Souk Day',
    emoji: '🏪',
    description:
      'Gérez votre étal au souk de Marrakech et terminez la journée avec le meilleur bénéfice possible. Apprenez les bases du commerce : prix de revient, marge et relation client.',
    difficulty: 'Débutant',
    difficultyVariant: 'success' as const,
    concepts: ["Chiffre d'affaires", 'Marge brute', 'Pricing'],
    duration: '5–10 min',
    color: 'from-emerald-50 to-white border-emerald-100',
    accentColor: 'text-emerald-700',
  },
  {
    id: 'riads-and-rials',
    title: 'Riads & Rials',
    emoji: '🏡',
    description:
      'Gérez un riad à Marrakech sur 12 mois. Fixez vos tarifs, choisissez votre niveau de maintenance et votre stratégie marketing pour maximiser votre rentabilité.',
    difficulty: 'Intermédiaire',
    difficultyVariant: 'warning' as const,
    concepts: ['RevPAR', 'Charges fixes', 'Saisonnalité'],
    duration: '10–15 min',
    color: 'from-amber-50 to-white border-amber-100',
    accentColor: 'text-amber-700',
  },
  {
    id: 'casablanca-capital',
    title: 'Casablanca Capital',
    emoji: '📈',
    description:
      'Gérez un fonds actions sur 3 ans avec des titres inspirés de la Bourse de Casablanca. Maîtrisez la diversification, le risque et le rendement ajusté.',
    difficulty: 'Avancé',
    difficultyVariant: 'danger' as const,
    concepts: ['Diversification', 'Rendement / Risque', 'Indice MASI'],
    duration: '15–20 min',
    color: 'from-blue-50 to-white border-blue-100',
    accentColor: 'text-blue-700',
  },
] as const;

export default function GamesHub() {
  const [scores, setScores] = useState<Record<ClassicGameId, GameScore | null>>(
    { 'souk-day': null, 'riads-and-rials': null, 'casablanca-capital': null }
  );

  useEffect(() => {
    setScores(getAllHighScores());
  }, []);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-6 bg-accent rounded-full" />
        <h2 className="text-lg font-bold text-primary">Apprendre en jouant</h2>
      </div>
      <p className="text-primary/55 text-sm mb-8 ml-5">
        Trois simulations inspirées du contexte marocain pour comprendre la finance par la pratique.
      </p>

      {/* Trophy bar */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 rounded-xl px-4 py-3 mb-8">
        <Trophy className="w-4 h-4 text-accent flex-shrink-0" />
        <p className="text-sm text-primary/70">
          Vos meilleurs scores sont sauvegardés localement dans votre navigateur.
        </p>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`relative rounded-2xl bg-gradient-to-b ${game.color} border p-6 flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300`}
          >
            {/* Emoji + difficulty */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl">{game.emoji}</span>
              <Badge variant={game.difficultyVariant} size="sm">
                {game.difficulty}
              </Badge>
            </div>

            {/* Title + description */}
            <h3 className="text-xl font-bold text-primary font-display mb-2">{game.title}</h3>
            <p className="text-primary/60 text-sm leading-relaxed mb-4 flex-1">
              {game.description}
            </p>

            {/* Concept tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {game.concepts.map((c) => (
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
              <span className="flex items-center gap-1 text-xs text-primary/40">
                <Clock className="w-3 h-3" />
                {game.duration}
              </span>
              <Link
                href={`/learn/games/${game.id}`}
                className={`flex items-center gap-1 text-sm font-semibold ${game.accentColor} hover:opacity-75 transition-opacity`}
              >
                Jouer <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* High score */}
            {scores[game.id as ClassicGameId] && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-100/60">
                <Trophy className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-primary/50">Meilleur score :</span>
                <span className="text-xs font-bold text-accent">{scores[game.id as ClassicGameId]!.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
