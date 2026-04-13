import { Metadata } from 'next';
import TrackLayout from '@/components/games/finance-students/shared/TrackLayout';

export const metadata: Metadata = {
  title: 'Risk Manager — Jeux étudiants | Walltreet Morocco',
  description: 'Identifiez et mitigez les risques bancaires. Gérez vos expositions et décidez quand couvrir.',
};

import dynamic from 'next/dynamic';

const RiskRadarGame = dynamic(
  () => import('@/components/games/finance-students/risk-manager/RiskRadarGame'),
  { ssr: false }
);

const HedgeOrHoldGame = dynamic(
  () => import('@/components/games/finance-students/risk-manager/HedgeOrHoldGame'),
  { ssr: false }
);

export default function RiskManagerPage() {
  return (
    <TrackLayout
      title="Risk Manager"
      emoji="🛡️"
      description="Identifiez, classifiez et mitigez les risques bancaires. Gérez un portefeuille d'expositions et décidez quand couvrir vos positions."
      difficulty="Avancé"
      difficultyVariant="danger"
      learningGoals={[
        'Classifier les risques bancaires : crédit, marché, liquidité, opérationnel, juridique, stratégique.',
        'Allouer un budget de mitigation sous contrainte et mesurer son efficacité.',
        'Comprendre la couverture (hedging) de positions FX, taux et matières premières.',
        'Évaluer l\'efficacité d\'une stratégie de couverture via le P&L couvert vs. non couvert.',
      ]}
    >
      {/* Game A */}
      <div id="risk-radar-game" className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">A</span>
          <h2 className="text-xl font-medium text-primary">Risk Radar: Bank Edition</h2>
        </div>
        <RiskRadarGame />
      </div>

      <hr className="border-surface-100 mb-14" />

      {/* Game B */}
      <div id="hedge-or-hold-game">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-medium text-xs">B</span>
          <h2 className="text-xl font-medium text-primary">Hedge or Hold?</h2>
        </div>
        <HedgeOrHoldGame />
      </div>
    </TrackLayout>
  );
}
