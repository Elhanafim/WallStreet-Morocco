import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CasablancaGame from '@/components/games/casablanca-capital/CasablancaGame';

export const metadata: Metadata = {
  title: 'Casablanca Capital — Mini-jeux | Walltreet Morocco',
  description: 'Gérez un fonds actions sur 3 ans avec des titres inspirés de la Bourse de Casablanca. Maîtrisez diversification et risque.',
};

export default function CasablancaCapitalPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <Link
          href="/learn?tab=jeux"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux jeux
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <CasablancaGame />
      </div>
    </div>
  );
}
