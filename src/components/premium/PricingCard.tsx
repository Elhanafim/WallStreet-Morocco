import Link from 'next/link';
import { Check, X, Zap } from 'lucide-react';
import { PricingTier } from '@/types';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  tier: PricingTier;
}

export default function PricingCard({ tier }: PricingCardProps) {
  const isHighlighted = tier.highlighted;
  const isFree = tier.billing === 'gratuit';

  return (
    <div
      className={cn(
        'relative rounded-3xl overflow-hidden transition-all duration-300',
        isHighlighted
          ? 'bg-primary text-white shadow-2xl scale-105 border-2 border-accent/50'
          : 'bg-white border border-surface-200 shadow-card hover:shadow-card-hover hover:-translate-y-1'
      )}
    >
      {/* Popular badge */}
      {tier.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
          <div className="bg-accent text-primary text-xs font-black px-4 py-1.5 rounded-b-xl">
            {tier.badge}
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {isHighlighted && (
              <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <h3
              className={cn(
                'text-xl font-black',
                isHighlighted ? 'text-white' : 'text-primary'
              )}
            >
              {tier.name}
            </h3>
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed',
              isHighlighted ? 'text-white/70' : 'text-primary/60'
            )}
          >
            {tier.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-8">
          {isFree ? (
            <div>
              <span
                className={cn(
                  'text-5xl font-black',
                  isHighlighted ? 'text-white' : 'text-primary'
                )}
              >
                Gratuit
              </span>
              <p className={cn('text-sm mt-1', isHighlighted ? 'text-white/50' : 'text-primary/40')}>
                Pour toujours
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-2">
                <span
                  className={cn(
                    'text-5xl font-black',
                    isHighlighted ? 'text-white' : 'text-primary'
                  )}
                >
                  {tier.price}
                </span>
                <span
                  className={cn(
                    'text-xl font-semibold mb-1',
                    isHighlighted ? 'text-white/70' : 'text-primary/60'
                  )}
                >
                  {tier.currency}
                </span>
              </div>
              <p className={cn('text-sm', isHighlighted ? 'text-white/50' : 'text-primary/40')}>
                par {tier.billing}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href={isFree ? '/auth/signup' : '/auth/signup?plan=' + tier.id}>
          <button
            className={cn(
              'w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mb-8',
              isHighlighted
                ? 'bg-accent text-primary hover:bg-accent-600 shadow-md hover:shadow-glow-gold'
                : isFree
                ? 'bg-surface-100 text-primary hover:bg-surface-200'
                : 'bg-primary text-white hover:bg-primary-600 shadow-sm'
            )}
          >
            {tier.cta}
          </button>
        </Link>

        {/* Features */}
        <div className="space-y-3.5">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    isHighlighted ? 'bg-success/20' : 'bg-success/10'
                  )}
                >
                  <Check
                    className={cn(
                      'w-3 h-3',
                      isHighlighted ? 'text-success' : 'text-success'
                    )}
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-primary/30" />
                </div>
              )}
              <div>
                <span
                  className={cn(
                    'text-sm',
                    feature.included
                      ? isHighlighted
                        ? 'text-white'
                        : 'text-primary'
                      : isHighlighted
                      ? 'text-white/40'
                      : 'text-primary/40'
                  )}
                >
                  {feature.label}
                </span>
                {feature.detail && (
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      isHighlighted ? 'text-white/50' : 'text-primary/40'
                    )}
                  >
                    {feature.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
