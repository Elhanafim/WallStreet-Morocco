import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'Fondateur & Mon Parcours | WallStreet Morocco',
  description:
    'WallStreet Morocco — fondateur et investisseur actif à la BVC depuis 2024. Découvrez le parcours, la stratégie DCA et les résultats réels.',
};

export default function AboutPage() {
  if (process.env.NEXT_PUBLIC_SHOW_FOUNDER_PAGE !== 'true') {
    notFound();
  }
  return <AboutContent />;
}
