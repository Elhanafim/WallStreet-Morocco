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
            <h1 key={index} className="text-3xl font-black text-primary mt-8 mb-4">
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-primary mt-8 mb-3 border-b border-surface-200 pb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-bold text-primary mt-6 mb-2">
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
              <span className="flex-shrink-0 w-6 h-6 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-sm font-bold">
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
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-bold">$1</strong>')
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
    <div className="pt-16 min-h-screen bg-white">
      {/* Article Header */}
      <div className="bg-gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux articles
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant={getCategoryBadgeVariant(article.category)}>
              {article.category}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-white/70 text-lg mb-6 leading-relaxed max-w-2xl">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-6 text-white/50 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent">
                EM
              </div>
              {article.author || 'El Hanafi Mohammed'}
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
              <div className="mt-10 pt-6 border-t border-surface-200">
                <p className="text-sm font-semibold text-primary/50 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-surface-100 text-primary/60 px-3 py-1.5 rounded-full hover:bg-surface-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-surface-200">
              <p className="text-sm font-semibold text-primary mb-3">Partager cet article</p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' — https://wallstreetmorocco.com/learn/' + article.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#25D366] rounded-xl text-sm font-semibold hover:bg-[#25D366]/20 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent('https://wallstreetmorocco.com/learn/' + article.slug)}&title=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl text-sm font-semibold hover:bg-[#0A66C2]/20 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-primary/60 rounded-xl text-sm font-semibold hover:bg-surface-200 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Copier le lien
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Card */}
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
              <h3 className="text-sm font-bold text-primary/50 uppercase tracking-wider mb-4">
                Auteur
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-black text-sm">EM</span>
                </div>
                <div>
                  <p className="font-bold text-primary">El Hanafi Mohammed</p>
                  <p className="text-primary/50 text-xs mt-0.5">Fondateur, WallStreet Morocco</p>
                  <p className="text-primary/60 text-xs mt-2 leading-relaxed">
                    Expert en marchés financiers marocains et africains avec 10+ ans d&apos;expérience.
                  </p>
                </div>
              </div>
            </div>

            {/* Article Info */}
            <div className="bg-surface-50 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-primary/50 uppercase tracking-wider mb-4">
                À propos de cet article
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Catégorie</span>
                  <Badge variant={getCategoryBadgeVariant(article.category)} size="xs">
                    {article.category}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Durée de lecture</span>
                  <span className="font-semibold text-primary">{article.readTime} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Publié le</span>
                  <span className="font-semibold text-primary">{formatDate(article.date, 'short')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/50">Accès</span>
                  <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Gratuit
                  </span>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
                <h3 className="text-sm font-bold text-primary/50 uppercase tracking-wider mb-4 flex items-center gap-2">
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
