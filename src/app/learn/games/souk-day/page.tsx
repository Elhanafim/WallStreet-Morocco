import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SoukDayGame from '@/components/games/souk-day/SoukDayGame';

export const metadata: Metadata = {
  title: 'Souk Day — Mini-jeux | Walltreet Morocco',
  description: 'Gérez votre étal au souk et apprenez les bases du commerce : prix de revient, marge brute et relation client.',
};

export default function SoukDayPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <Link
          href="/learn?tab=jeux"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux jeux
        </Link>
      </div>

      {/* Game */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <SoukDayGame />
      </div>
    </div>
  );
}
