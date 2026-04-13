import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FinanceStudentsHub from '@/components/games/finance-students/FinanceStudentsHub';

export const metadata: Metadata = {
  title: 'Jeux pour étudiants en finance | Walltreet Morocco',
  description: 'Exercices interactifs de niveau universitaire : gestion des risques, analyse financière, coûts et décisions d\'investissement.',
};

export default function FinanceStudentsPage() {
  return (
    <div className="pt-16 min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au centre d&apos;apprentissage
        </Link>
        <FinanceStudentsHub />
      </div>
    </div>
  );
}
