import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GamesHub from '@/components/games/GamesHub';

export const metadata: Metadata = {
  title: 'Mini-jeux | Centre d\'apprentissage — Walltreet Morocco',
  description: 'Apprenez la finance marocaine en jouant : Souk Day, Riads & Rials, et Casablanca Capital.',
};

export default function GamesPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au centre d&apos;apprentissage
        </Link>
        <GamesHub />
      </div>
    </div>
  );
}
