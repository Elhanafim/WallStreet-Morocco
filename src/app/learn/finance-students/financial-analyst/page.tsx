import { Metadata } from 'next';
import TrackLayout from '@/components/games/finance-students/shared/TrackLayout';

export const metadata: Metadata = {
  title: 'Financial Analyst — Jeux étudiants | Walltreet Morocco',
  description: 'Analysez des états financiers simplifiés, calculez les ratios clés et identifiez les signaux d\'alerte.',
};

import dynamic from 'next/dynamic';

const RatioRaceGame = dynamic(
  () => import('@/components/games/finance-students/financial-analyst/RatioRaceGame'),
  { ssr: false }
);

export default function FinancialAnalystPage() {
  return (
    <TrackLayout
      title="Financial Analyst"
      emoji="📊"
      description="Analysez des états financiers simplifiés d'entreprises marocaines. Sélectionnez les bons ratios et identifiez les signaux d'alerte."
      difficulty="Intermédiaire"
      difficultyVariant="warning"
      learningGoals={[
        'Lire et interpréter un bilan et un compte de résultat simplifié.',
        'Calculer et interpréter les ratios de liquidité, levier, rentabilité et efficience.',
        'Identifier les tendances et signaux d\'alerte dans une série financière sur 3 ans.',
        'Rédiger une recommandation de crédit argumentée.',
      ]}
    >
      <div id="ratio-race-game">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">J</span>
          <h2 className="text-xl font-bold text-primary">Ratio Race : Le Score de Crédit</h2>
        </div>
        <RatioRaceGame />
      </div>
    </TrackLayout>
  );
}
