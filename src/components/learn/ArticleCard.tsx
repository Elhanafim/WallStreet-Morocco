import Link from 'next/link';
import { Clock, ArrowRight, Lock } from 'lucide-react';
import { Article } from '@/types';
import { Badge, getCategoryBadgeVariant, PremiumBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/learn/${article.slug}`} className="block group">
        <div className="bg-gradient-card rounded-3xl p-8 text-white relative overflow-hidden h-full min-h-[320px] flex flex-col justify-end hover:shadow-2xl transition-all duration-300">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="sm">
                {article.category}
              </Badge>
              {article.premium && <PremiumBadge />}
            </div>
            <h2 className="text-2xl font-black text-white mb-3 group-hover:text-accent transition-colors leading-tight">
              {article.title}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/50 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime} min
                </span>
                <span>{formatDate(article.date, 'short')}</span>
              </div>
              <span className="flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">
                Lire
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/learn/${article.slug}`} className="block group">
        <div className="flex items-start gap-4 py-3 border-b border-surface-100 last:border-0 hover:bg-surface-50 -mx-2 px-2 rounded-lg transition-colors">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
            {article.premium ? (
              <Lock className="w-4 h-4 text-accent" />
            ) : (
              <span className="text-xs font-black text-primary/30">{article.readTime}m</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                {article.category}
              </Badge>
              {article.premium && <PremiumBadge size="xs" />}
            </div>
            <h4 className="text-sm font-semibold text-primary group-hover:text-secondary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h4>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/learn/${article.slug}`} className="block group h-full">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden h-full flex flex-col hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${
          article.category === 'Actions' ? 'bg-success' :
          article.category === 'OPCVM' ? 'bg-accent' :
          article.category === 'Stratégie' ? 'bg-primary' :
          'bg-secondary'
        }`} />

        <div className="p-6 flex flex-col flex-1">
          {/* Tags row */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant={getCategoryBadgeVariant(article.category)} dot>
              {article.category}
            </Badge>
            {article.premium && (
              <div className="flex items-center gap-1 text-accent text-xs font-semibold">
                <Lock className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-primary mb-2 line-clamp-2 leading-snug group-hover:text-secondary transition-colors flex-shrink-0">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-primary/60 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-100">
            <div className="flex items-center gap-3 text-primary/40 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} min
              </span>
              <span className="w-1 h-1 rounded-full bg-current" />
              <span>{formatDate(article.date, 'short')}</span>
            </div>
            <span className="text-secondary text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              Lire
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
