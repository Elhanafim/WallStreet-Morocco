import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RiadsGame from '@/components/games/riads-and-rials/RiadsGame';

export const metadata: Metadata = {
  title: 'Riads & Rials — Mini-jeux | Walltreet Morocco',
  description: 'Gérez un riad à Marrakech sur 12 mois. Apprenez la saisonnalité, les charges fixes et la tarification hôtelière.',
};

export default function RiadsAndRialsPage() {
  return (
    <div className="pt-16 min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <Link
          href="/learn?tab=jeux"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux jeux
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <RiadsGame />
      </div>
    </div>
  );
}
