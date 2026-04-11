import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Article } from '@/types';
import { Badge, getCategoryBadgeVariant } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/learn/${article.slug}`} className="block group">
        <div className="bg-[#112240] rounded-3xl p-8 text-white relative overflow-hidden h-full min-h-[320px] flex flex-col justify-end hover:shadow-2xl border border-[#C9A84C]/12 hover:border-[#C9A84C]/30 transition-all duration-300">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A84C]/3 rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="sm">
                {article.category}
              </Badge>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 group-hover:text-[#C9A84C] transition-colors leading-tight font-display">
              {article.title}
            </h2>
            <p className="text-[#A8B4C8] text-sm leading-relaxed mb-5 line-clamp-2 font-sans">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#A8B4C8]/60 text-xs font-sans">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime} min
                </span>
                <span>{formatDate(article.date, 'short')}</span>
              </div>
              <span className="flex items-center gap-1 text-[#C9A84C] text-sm font-semibold group-hover:gap-2 transition-all font-sans">
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
        <div className="flex items-start gap-4 py-3 border-b border-[#1A3050] last:border-0 hover:bg-[#C9A84C]/4 -mx-2 px-2 rounded-lg transition-colors">
          <div className="flex-shrink-0 w-12 h-12 bg-[#C9A84C]/8 border border-[#C9A84C]/15 rounded-xl flex items-center justify-center">
            <span className="text-xs font-black text-[#C9A84C]/60 font-mono">{article.readTime}m</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                {article.category}
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-[#C9A84C] transition-colors line-clamp-2 leading-snug font-sans">
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
      <div className="bg-[#112240] rounded-2xl border border-[#C9A84C]/12 shadow-card overflow-hidden h-full flex flex-col hover:border-[#C9A84C]/30 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
        {/* Top accent bar */}
        <div className={`h-0.5 w-full ${
          article.category === 'Actions'   ? 'bg-[#2ECC71]'  :
          article.category === 'OPCVM'     ? 'bg-[#C9A84C]'  :
          article.category === 'Stratégie' ? 'bg-[#7C9EBF]'  :
          'bg-[#C9A84C]'
        }`} />

        <div className="p-6 flex flex-col flex-1">
          {/* Tags row */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant={getCategoryBadgeVariant(article.category)} dot>
              {article.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#C9A84C] transition-colors flex-shrink-0 font-display">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[#A8B4C8] text-sm leading-relaxed line-clamp-3 flex-1 mb-4 font-sans">
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A3050]">
            <div className="flex items-center gap-3 text-[#A8B4C8]/40 text-xs font-sans">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} min
              </span>
              <span className="w-1 h-1 rounded-full bg-current" />
              <span>{formatDate(article.date, 'short')}</span>
            </div>
            <span className="text-[#C9A84C] text-xs font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all font-sans">
              Lire
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
