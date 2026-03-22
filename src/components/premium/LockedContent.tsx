import Link from 'next/link';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedContentProps {
  title?: string;
  description?: string;
  previewContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'article';
}

export default function LockedContent({
  title = 'Contenu Premium',
  description = 'Abonnez-vous à WallStreet Morocco Premium pour accéder à ce contenu exclusif.',
  previewContent,
  className,
  variant = 'default',
}: LockedContentProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('relative rounded-xl overflow-hidden', className)}>
        {/* Blurred preview */}
        {previewContent && (
          <div className="filter blur-sm pointer-events-none select-none">
            {previewContent}
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-end justify-center pb-6">
          <Link
            href="/premium"
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-secondary transition-colors shadow-lg"
          >
            <Lock className="w-4 h-4" />
            Débloquer avec Premium
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'article') {
    return (
      <div className={cn('relative', className)}>
        {/* Blurred content */}
        {previewContent && (
          <div className="relative">
            <div className="filter blur-sm pointer-events-none select-none max-h-48 overflow-hidden">
              {previewContent}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
          </div>
        )}

        {/* Lock gate */}
        <div className="bg-white border-2 border-accent/30 rounded-2xl p-8 text-center shadow-lg mt-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-black text-primary mb-2">
            La suite est réservée aux membres Premium
          </h3>
          <p className="text-primary/60 text-sm mb-6 max-w-md mx-auto">
            Accédez à l&apos;analyse complète, aux recommandations et aux niveaux
            d&apos;achat/vente recommandés en vous abonnant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 bg-secondary text-white font-semibold px-6 py-3 rounded-xl hover:bg-secondary-600 transition-colors shadow-md"
            >
              <Zap className="w-4 h-4" />
              Passer à Premium — 9€/mois
            </Link>
            <Link
              href="/auth/signup"
              className="text-primary/60 hover:text-primary text-sm font-medium transition-colors"
            >
              Ou créer un compte gratuit
            </Link>
          </div>
          <p className="text-primary/40 text-xs mt-4">
            Annulable à tout moment • Accès immédiat après abonnement
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-primary to-primary-700 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start gap-6">
        {/* Lock icon */}
        <div className="flex-shrink-0 w-16 h-16 bg-accent/20 border border-accent/30 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-accent" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-3 py-1 mb-3">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-wide">
              Contenu Exclusif
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-6">{description}</p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-6 py-3 rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-md hover:shadow-glow-gold"
            >
              Débloquer avec Premium
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Essai gratuit 7 jours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
