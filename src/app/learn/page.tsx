'use client';

import { useState } from 'react';
import { Search, BookOpen, TrendingUp, BarChart2, Lightbulb, Gamepad2, GraduationCap } from 'lucide-react';
import ArticleCard from '@/components/learn/ArticleCard';
import GamesHub from '@/components/games/GamesHub';
import { articles } from '@/lib/data/articles';
import { Article } from '@/types';
import ChatHint from '@/components/chat/ChatHint';
import FinancialDisclaimer from '@/components/legal/FinancialDisclaimer';
import EduBannerInline from '@/components/legal/EduBannerInline';
import { useDebounce } from '@/hooks/useDebounce';
import dynamic from 'next/dynamic';

const FinanceStudentsHub = dynamic(
  () => import('@/components/games/finance-students/FinanceStudentsHub'),
  { ssr: false }
);

type Category = 'Tous' | Article['category'] | 'Jeux' | 'Jeux Étudiants';

const categories: { id: Category; label: string; icon: React.ComponentType<{className?: string}>; count: number | null }[] = [
  { id: 'Tous', label: 'Tous les articles', icon: BookOpen, count: articles.length },
  { id: 'Bases', label: 'Les Bases', icon: BookOpen, count: articles.filter((a) => a.category === 'Bases').length },
  { id: 'Actions', label: 'Actions', icon: TrendingUp, count: articles.filter((a) => a.category === 'Actions').length },
  { id: 'OPCVM', label: 'OPCVM', icon: BarChart2, count: articles.filter((a) => a.category === 'OPCVM').length },
  { id: 'Stratégie', label: 'Stratégie', icon: Lightbulb, count: articles.filter((a) => a.category === 'Stratégie').length },
  { id: 'Jeux', label: 'Mini-jeux', icon: Gamepad2, count: 3 },
  { id: 'Jeux Étudiants', label: 'Jeux Étudiants', icon: GraduationCap, count: 5 },
];

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = activeCategory === 'Tous' || article.category === activeCategory;
    const matchesSearch =
      !debouncedSearch ||
      article.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles[0];

  return (
    <div className="pt-16 min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Legal disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <FinancialDisclaimer variant="short" />
      </div>

      {/* ── Hero — white background with background image overlay ── */}
      <div
        className="page-hero-bg py-20 px-4"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          '--hero-image': 'url(/images/jeffrey-blum-7-gaPkhIgqs-unsplash.jpg)',
        } as React.CSSProperties}
      >
        <div className="max-w-7xl mx-auto text-center">
          <span
            className="inline-block font-body text-[11px] font-semibold uppercase tracking-[0.12em] px-4 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: 'rgba(184,151,74,0.15)', color: 'var(--gold)', border: '1px solid rgba(184,151,74,0.4)' }}
          >
            Investment Academy
          </span>
          <h1 className="font-display font-medium mb-4" style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1, color: 'var(--navy)' }}>
            Centre d&apos;apprentissage
          </h1>
          <p className="font-body text-[16px] max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Maîtrisez l&apos;investissement marocain avec nos guides complets,
            analyses et stratégies rédigés en français
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Rechercher un article, une stratégie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[10px] pl-12 pr-4 py-4 font-body text-[14px] outline-none transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-xs)',
              }}
            />
          </div>
        </div>
      </div>

      <EduBannerInline />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <ChatHint
          storageKey="wsma_hint_learn"
          icon="💡"
          message="Des questions pendant votre lecture ? L'assistant IA est là pour vous aider."
          ctaLabel="Poser une question"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] font-body font-medium text-[13px] whitespace-nowrap transition-all duration-200"
              style={{
                backgroundColor: activeCategory === cat.id ? 'var(--navy)' : 'var(--bg-elevated)',
                color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                border: activeCategory === cat.id ? '1px solid var(--navy)' : '1px solid var(--border)',
                boxShadow: activeCategory === cat.id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-body"
                style={{
                  backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                  color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
                }}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Games Hub */}
        {activeCategory === 'Jeux' ? (
          <GamesHub />
        ) : activeCategory === 'Jeux Étudiants' ? (
          <FinanceStudentsHub />
        ) : (
          <>
            {/* Featured Article Hero */}
            {activeCategory === 'Tous' && !searchQuery && featuredArticle && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: 'var(--gold)' }} />
                  <h2 className="font-display font-medium text-[18px]" style={{ color: 'var(--text-primary)' }}>
                    Article à la une
                  </h2>
                </div>
                <ArticleCard article={featuredArticle} variant="featured" />
              </div>
            )}

            {/* Results count */}
            {debouncedSearch && (
              <div className="mb-6">
                <p className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''} pour &ldquo;{debouncedSearch}&rdquo;
                </p>
              </div>
            )}

            <EduBannerInline />

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="font-display font-medium text-[18px] mb-2" style={{ color: 'var(--text-primary)' }}>
                  Aucun article trouvé
                </h3>
                <p className="font-body text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Essayez une autre recherche ou sélectionnez une autre catégorie
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
