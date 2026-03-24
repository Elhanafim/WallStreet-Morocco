'use client';

import { useState } from 'react';
import { Search, BookOpen, TrendingUp, BarChart2, Lightbulb } from 'lucide-react';
import ArticleCard from '@/components/learn/ArticleCard';
import { articles } from '@/lib/data/articles';
import { Article } from '@/types';

type Category = 'Tous' | Article['category'];

const categories: { id: Category; label: string; icon: React.ComponentType<{className?: string}>; count: number }[] = [
  { id: 'Tous', label: 'Tous les articles', icon: BookOpen, count: articles.length },
  { id: 'Bases', label: 'Les Bases', icon: BookOpen, count: articles.filter((a) => a.category === 'Bases').length },
  { id: 'Actions', label: 'Actions', icon: TrendingUp, count: articles.filter((a) => a.category === 'Actions').length },
  { id: 'OPCVM', label: 'OPCVM', icon: BarChart2, count: articles.filter((a) => a.category === 'OPCVM').length },
  { id: 'Stratégie', label: 'Stratégie', icon: Lightbulb, count: articles.filter((a) => a.category === 'Stratégie').length },
];

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = activeCategory === 'Tous' || article.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles[0];

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-hero py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            Centre d&apos;apprentissage
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-8">
            Maîtrisez l&apos;investissement marocain avec nos guides complets,
            analyses et stratégies rédigés en français
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un article, une stratégie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-secondary focus:bg-white/15 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-100 text-primary/70 hover:bg-surface-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-200 text-primary/50'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Featured Article Hero */}
        {activeCategory === 'Tous' && !searchQuery && featuredArticle && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-lg font-bold text-primary">Article à la une</h2>
            </div>
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>
        )}

        {/* Results count */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-primary/60 text-sm">
              {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''} pour &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            <h3 className="text-primary font-bold text-lg mb-2">Aucun article trouvé</h3>
            <p className="text-primary/50 text-sm">
              Essayez une autre recherche ou sélectionnez une autre catégorie
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
