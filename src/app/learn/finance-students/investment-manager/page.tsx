import { Metadata } from 'next';
import TrackLayout from '@/components/games/finance-students/shared/TrackLayout';

export const metadata: Metadata = {
  title: 'Investment Manager — Jeux étudiants | Walltreet Morocco',
  description: 'Évaluez des projets d\'investissement avec VAN, TRI, payback et indice de profitabilité.',
};

import dynamic from 'next/dynamic';

const CapitalBudgetingGame = dynamic(
  () => import('@/components/games/finance-students/investment-manager/CapitalBudgetingGame'),
  { ssr: false }
);

export default function InvestmentManagerPage() {
  return (
    <TrackLayout
      title="Investment Manager"
      emoji="💼"
      description="Évaluez des projets d'investissement sous contrainte budgétaire. Calculez VAN, TRI, délai de récupération et indice de profitabilité."
      difficulty="Avancé"
      difficultyVariant="danger"
      learningGoals={[
        'Calculer la Valeur Actuelle Nette (VAN) d\'un projet à partir de ses flux de trésorerie.',
        'Déterminer le Taux de Rendement Interne (TRI) et comprendre ses limites.',
        'Utiliser le délai de récupération (payback) et l\'indice de profitabilité (PI).',
        'Gérer les conflits entre critères (TRI élevé mais VAN faible) et les contraintes budgétaires.',
      ]}
    >
      <div id="capital-budgeting-game">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">J</span>
          <h2 className="text-xl font-medium text-primary">Le Défi du Budget d&apos;Investissement</h2>
        </div>
        <CapitalBudgetingGame />
      </div>
    </TrackLayout>
  );
}
