import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2, Linkedin, BookOpen } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, articles } from '@/lib/data/articles';
import { Badge, getCategoryBadgeVariant } from '@/components/ui/Badge';
import ArticleCard from '@/components/learn/ArticleCard';
import { formatDate } from '@/lib/utils';
import DonateLearnBanner from '@/components/donate/DonateLearnBanner';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

function ArticleContent({ content }: { content: string }) {
  const lines = content.trim().split('\n');

  return (
    <div className="prose prose-lg max-w-none">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="my-3" />;

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-medium text-primary mt-8 mb-4">
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-medium text-primary mt-8 mb-3 border-b border-surface-200 pb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-medium text-primary mt-6 mb-2">
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-accent bg-accent/5 pl-5 py-3 my-4 rounded-r-xl">
              <p className="text-primary/80 italic">{trimmed.slice(2)}</p>
            </blockquote>
          );
        }
        if (trimmed.match(/^\d+\./)) {
          const [num, ...rest] = trimmed.split('. ');
          return (
            <div key={index} className="flex gap-3 my-2">
              <span className="flex-shrink-0 w-6 h-6 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-medium">
                {num}
              </span>
              <p className="text-primary/80">{rest.join('. ')}</p>
            </div>
          );
        }
        if (trimmed.startsWith('- ')) {
          const text = trimmed.slice(2);
          const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return (
            <div key={index} className="flex gap-3 my-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-secondary rounded-full mt-2.5" />
              <p
                className="text-primary/80"
                dangerouslySetInnerHTML={{ __html: formattedText }}
              />
            </div>
          );
        }

        const formattedLine = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-medium">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');

        return (
          <p
            key={index}
            className="text-primary/80 leading-relaxed my-3"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      })}
    </div>
  );
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(params.slug, 3);

  return (
    <div className="pt-16 min-h-screen bg-[var(--bg-base)]">
      {/* Article Header */}
      <div
        className="page-hero-bg py-14 px-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/jeffrey-blum-7-gaPkhIgqs-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux articles
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <Badge variant={getCategoryBadgeVariant(article.category)}>
              {article.category}
            </Badge>
          </div>

          <h1
            className="font-display font-medium mb-5 leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--navy)' }}
          >
            {article.title}
          </h1>

          <p className="text-[15px] mb-6 leading-relaxed max-w-2xl font-body" style={{ color: 'var(--text-secondary)' }}>
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }}
              >
                <img src="/logo-icon.svg" alt="WallStreet Morocco" className="w-5 h-5 object-contain" />
              </div>
              WallStreet Morocco
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(article.date, 'medium')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime} min de lecture
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <ArticleContent content={article.content} />

            {/* Donate banner — Placement 4 */}
            <DonateLearnBanner />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="font-body text-[12px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--text-muted)' }}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-body text-[12px] px-3 py-1 rounded-full cursor-pointer transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="font-body text-[13px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Partager cet article</p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('https://wallstreetmorocco.com/learn/' + article.slug)}&title=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-colors"
                  style={{ backgroundColor: 'rgba(10,102,194,0.08)', color: '#0A66C2' }}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-body text-[13px] font-medium transition-colors"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  <Share2 className="w-4 h-4" />
                  Copier le lien
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Card */}
            <div
              className="rounded-[10px] p-5"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: 'var(--gold-subtle)', border: '1px solid rgba(184,151,74,0.3)' }}
                >
                  <img src="/logo-icon.svg" alt="WallStreet Morocco" className="w-7 h-7 object-contain" />
                </div>
                <p className="font-semibold font-body text-[13px]" style={{ color: 'var(--text-primary)' }}>WallStreet Morocco</p>
              </div>
            </div>

            {/* Article Info */}
            <div
              className="rounded-[10px] p-5"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <h3
                className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                À propos de cet article
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Catégorie</span>
                  <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                    {article.category}
                  </Badge>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Durée de lecture</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{article.readTime} min</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Publié le</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(article.date, 'short')}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Accès</span>
                  <span
                    className="font-medium text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--gain-bg)', color: 'var(--gain)' }}
                  >
                    Gratuit
                  </span>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div
                className="rounded-[10px] p-5"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <h3
                  className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 flex items-center gap-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BookOpen className="w-4 h-4" />
                  Articles similaires
                </h3>
                <div className="space-y-1">
                  {relatedArticles.map((related) => (
                    <ArticleCard key={related.id} article={related} variant="compact" />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
