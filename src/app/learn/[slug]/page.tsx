import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin, Lock, BookOpen } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, articles } from '@/lib/data/articles';
import { Badge, getCategoryBadgeVariant, PremiumBadge } from '@/components/ui/Badge';
import ArticleCard from '@/components/learn/ArticleCard';
import LockedContent from '@/components/premium/LockedContent';
import { formatDate } from '@/lib/utils';

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
  const isLocked = article.premium;

  // Split content for locked articles
  const contentLines = article.content.trim().split('\n');
  const previewLines = contentLines.slice(0, Math.floor(contentLines.length * 0.4));
  const previewContent = previewLines.join('\n');

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
            {isLocked && <PremiumBadge />}
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
            {isLocked ? (
              <div>
                <ArticleContent content={previewContent} />
                <LockedContent
                  variant="article"
                  title="La suite est réservée aux membres Premium"
                  description="Abonnez-vous à WallStreet Morocco Premium pour accéder à l'analyse complète, aux recommandations et aux niveaux d'achat/vente."
                  previewContent={
                    <div className="mt-6">
                      <p className="text-primary/60 text-sm">Suite de l&apos;analyse...</p>
                    </div>
                  }
                />
              </div>
            ) : (
              <ArticleContent content={article.content} />
            )}

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
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent('https://wallstreetmorocco.com/learn/' + article.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-xl text-sm font-semibold hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
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
                  <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${article.premium ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'}`}>
                    {article.premium ? 'Premium' : 'Gratuit'}
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

            {/* Premium CTA in sidebar */}
            {!isLocked && (
              <div className="bg-gradient-card rounded-2xl p-6 text-white">
                <Lock className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-bold text-white mb-2">Analyses Premium</h3>
                <p className="text-white/60 text-xs mb-4 leading-relaxed">
                  Accédez à 50+ analyses exclusives, recommandations et alertes
                </p>
                <Link
                  href="/premium"
                  className="block text-center bg-accent text-primary font-bold text-sm py-2.5 rounded-xl hover:bg-accent-600 transition-colors"
                >
                  Passer Premium
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
