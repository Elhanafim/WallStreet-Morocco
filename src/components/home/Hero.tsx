'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, BookOpen, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const stats = [
  { label: 'Investisseurs actifs', value: '12 400+', icon: TrendingUp },
  { label: 'Articles publiés', value: '250+', icon: BookOpen },
  { label: 'OPCVM suivis', value: '180+', icon: BarChart2 },
  { label: 'Données sécurisées', value: '100%', icon: Shield },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-hero pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#3A86FF 1px, transparent 1px), linear-gradient(90deg, #3A86FF 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-secondary text-sm font-medium">
                Bourse de Casablanca • Live
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              Investissez{' '}
              <span className="gradient-text-gold">intelligemment</span>
              <br />
              au Maroc
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              La plateforme tout-en-un pour maîtriser la Bourse de Casablanca.
              Analyses, simulations, actualités et OPCVM — tout ce dont vous avez
              besoin pour investir avec confiance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/learn">
                <Button size="lg" variant="primary" iconPosition="right" icon={<ArrowRight className="w-5 h-5" />}>
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/simulator">
                <Button size="lg" variant="gold">
                  Simuler mon portefeuille
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-white/50 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-success" />
                Aucune carte requise
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span>Accès gratuit immédiat</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span>Annulable à tout moment</span>
            </div>
          </div>

          {/* Right: Market Dashboard Preview */}
          <div className="hidden lg:block animate-slide-up">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Indice de référence</p>
                    <h3 className="text-white font-bold text-lg">MASI</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-3xl">13 428.56</p>
                    <p className="text-success text-sm font-semibold flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +0.65% aujourd&apos;hui
                    </p>
                  </div>
                </div>

                {/* Mini chart simulation */}
                <div className="h-24 flex items-end gap-1 mb-4">
                  {[65, 58, 72, 68, 75, 70, 80, 75, 85, 78, 90, 85, 92, 88, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        background: i >= 12
                          ? 'linear-gradient(to top, #3A86FF, #7AB8FF)'
                          : 'rgba(58, 134, 255, 0.3)',
                      }}
                    />
                  ))}
                </div>

                {/* Top movers */}
                <div className="space-y-2.5">
                  {[
                    { symbol: 'ATW', name: 'Attijariwafa', price: '535.40', change: '+1.59%', up: true },
                    { symbol: 'IAM', name: 'Maroc Telecom', price: '142.80', change: '+0.56%', up: true },
                    { symbol: 'BCP', name: 'Banque Pop.', price: '291.75', change: '-0.77%', up: false },
                  ].map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="text-white/80 text-xs font-bold">{stock.symbol[0]}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{stock.symbol}</p>
                          <p className="text-white/50 text-xs">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">{stock.price} MAD</p>
                        <p className={`text-xs font-medium ${stock.up ? 'text-success' : 'text-danger'}`}>
                          {stock.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -right-6 bg-accent rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-primary text-xs font-semibold">Rendement annuel</p>
                <p className="text-primary font-black text-2xl">+12.4%</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-primary border border-secondary/30 rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-white/60 text-xs">OPCVM Meilleur</p>
                <p className="text-white font-bold">Wafa Actions</p>
                <p className="text-success text-xs">+15.2% sur 3 ans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors duration-200"
            >
              <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-white font-black text-2xl lg:text-3xl mb-1">{stat.value}</p>
              <p className="text-white/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
        </div>
        <span className="text-white/30 text-xs">Défiler</span>
      </div>
    </section>
  );
}
