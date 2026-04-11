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
        <div
          className="relative overflow-hidden h-full flex flex-col justify-end transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            minHeight: '300px',
            padding: '28px',
          }}
        >
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="sm">
                {article.category}
              </Badge>
            </div>
            <h2
              className="text-xl mb-2 leading-snug"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              {article.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-4 line-clamp-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
            >
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime} min
                </span>
                <span>{formatDate(article.date, 'short')}</span>
              </div>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
              >
                Lire <ArrowRight className="w-3.5 h-3.5" />
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
        <div
          className="flex items-start gap-3 py-3 transition-colors"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          >
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {article.readTime}m
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                {article.category}
              </Badge>
            </div>
            <h4
              className="text-sm leading-snug line-clamp-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 400 }}
            >
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
      <div
        className="overflow-hidden h-full flex flex-col transition-colors"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--text-muted)')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
      >
        {/* 2px category accent bar at top */}
        <div
          style={{
            height: '2px',
            backgroundColor:
              article.category === 'Actions'   ? 'var(--gain)' :
              article.category === 'OPCVM'     ? 'var(--gold)' :
              article.category === 'Stratégie' ? 'var(--text-secondary)' :
              'var(--border)',
          }}
        />

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <Badge variant={getCategoryBadgeVariant(article.category)} dot>
              {article.category}
            </Badge>
          </div>

          <h3
            className="text-base mb-2 line-clamp-2 leading-snug flex-shrink-0"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            {article.title}
          </h3>

          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1 mb-4"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}
          >
            {article.excerpt}
          </p>

          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} min
              </span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
              <span>{formatDate(article.date, 'short')}</span>
            </div>
            <span
              className="text-xs flex items-center gap-0.5"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              Lire <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
