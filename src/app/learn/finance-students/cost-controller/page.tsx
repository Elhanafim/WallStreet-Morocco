import { Metadata } from 'next';
import TrackLayout from '@/components/games/finance-students/shared/TrackLayout';
import { FactoryBreakEvenGame } from '@/components/games/finance-students/ClientGames';

export const metadata: Metadata = {
  title: 'Cost Controller — Jeux étudiants | Walltreet Morocco',
  description: 'Maîtrisez la structure de coûts, le seuil de rentabilité et la marge de contribution.',
};

export default function CostControllerPage() {
  return (
    <TrackLayout
      title="Cost Controller"
      emoji="🏭"
      description="Maîtrisez la structure de coûts d'une usine marocaine. Optimisez volume, prix et investissements pour atteindre le seuil de rentabilité."
      difficulty="Intermédiaire"
      difficultyVariant="warning"
      learningGoals={[
        'Distinguer coûts fixes et coûts variables dans une structure industrielle.',
        'Calculer le seuil de rentabilité (Break-Even Point) et la marge de contribution.',
        'Comprendre l\'impact du levier opérationnel sur le résultat.',
        'Prendre des décisions de pricing et capacité sous incertitude de la demande.',
      ]}
    >
      <div id="factory-break-even-game">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">J</span>
          <h2 className="text-xl font-medium text-primary">Le Défi du Seuil de Rentabilité</h2>
        </div>
        <FactoryBreakEvenGame />
      </div>
    </TrackLayout>
  );
}
