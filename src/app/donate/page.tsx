import type { Metadata } from 'next';
import DonateContent from '@/components/donate/DonateContent';

export const metadata: Metadata = {
  title: 'Soutenir WallStreet Morocco | Donate',
  description: 'Soutenez WallStreet Morocco — un projet indépendant sans publicité pour démocratiser l\'investissement au Maroc.',
};

export default function DonatePage() {
  return <DonateContent />;
}
