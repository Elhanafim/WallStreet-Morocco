import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'Fondateur & Mon Parcours | WallStreet Morocco',
  description:
    'El Hanafi Mohammed — fondateur de WallStreet Morocco, investisseur actif à la BVC depuis 2024. Découvrez son parcours, sa stratégie et ses résultats réels.',
};

export default function AboutPage() {
  return <AboutContent />;
}
