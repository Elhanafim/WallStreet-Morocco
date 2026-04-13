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
        <div className="relative premium-card min-h-[300px] p-8 flex flex-col justify-end transition-all">
          <div className="relative">
            <div className="mb-4">
              <Badge variant={getCategoryBadgeVariant(article.category)} dot>
                {article.category}
              </Badge>
            </div>
            <h2 className="font-display text-[26px] font-medium leading-[1.2] text-[var(--text-primary)] mb-3">
              {article.title}
            </h2>
            <p className="font-body text-[14px] leading-relaxed text-[var(--text-secondary)] mb-6 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)] font-body">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {article.readTime} min
                </span>
                <span>{formatDate(article.date, 'short')}</span>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--gold)]">
                Lire l&apos;article <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/learn/${article.slug}`} className="block group border-b border-[var(--border)] py-4 last:border-0">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-body text-[14px] font-medium text-[var(--text-primary)] leading-snug group-hover:text-[var(--gold)] transition-colors mb-2">
              {article.title}
            </h4>
            <div className="flex items-center gap-3">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                {article.category}
              </Badge>
              <span className="text-[11px] text-[var(--text-muted)]">{article.readTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/learn/${article.slug}`} className="block group h-full">
      <div className="premium-card h-full flex flex-col p-6 transition-all hover:translate-y-[-4px]">
        <div className="mb-4">
          <Badge variant={getCategoryBadgeVariant(article.category)} dot>
            {article.category}
          </Badge>
        </div>

        <h3 className="font-display text-[20px] font-medium leading-[1.3] text-[var(--text-primary)] mb-3 flex-1">
          {article.title}
        </h3>

        <p className="font-body text-[14px] leading-relaxed text-[var(--text-secondary)] line-clamp-3 mb-6">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-body">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.readTime} min
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span>{formatDate(article.date, 'short')}</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--gold)] flex items-center gap-1">
            Lire <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
