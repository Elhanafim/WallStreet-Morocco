import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Deep navy — primary backgrounds ───────────────────────────
        primary: {
          DEFAULT: '#0A1628',
          50:  '#E2EAF4',
          100: '#C5D5E9',
          200: '#A8B4C8',   // secondary text / muted labels
          300: '#7890B0',
          400: '#4A6890',
          500: '#2A4870',
          600: '#1A3050',
          700: '#122040',
          800: '#0E1A34',
          900: '#0A1628',   // deepest navy
        },
        // ── Gold — accent / CTA / highlights ──────────────────────────
        secondary: {
          DEFAULT: '#C9A84C',
          50:  '#FDF8ED',
          100: '#F9EDCC',
          200: '#F2D88A',
          300: '#E8C45A',
          400: '#D9B24E',
          500: '#C9A84C',
          600: '#A88A3A',
          700: '#876C2A',
          800: '#664E1A',
          900: '#45300A',
        },
        // ── Gold accent (alias) ────────────────────────────────────────
        accent: {
          DEFAULT: '#C9A84C',
          50:  '#FDF8ED',
          100: '#F9EDCC',
          200: '#F2D88A',
          300: '#E8C45A',
          400: '#D9B24E',
          500: '#C9A84C',
          600: '#A88A3A',
          700: '#876C2A',
          800: '#664E1A',
          900: '#45300A',
        },
        // ── Dark panels / surfaces ─────────────────────────────────────
        surface: {
          DEFAULT: '#112240',
          50:  '#0A1628',   // page background (deep navy)
          100: '#112240',   // card / panel background
          200: '#1A3050',   // border / divider
          300: '#2A4070',   // lighter border
        },
        // ── Semantic ───────────────────────────────────────────────────
        success: '#2ECC71',
        danger:  '#E74C3C',
        warning: '#F0A500',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':   'linear-gradient(135deg, #0A1628 0%, #112240 50%, #0A1628 100%)',
        'gradient-card':   'linear-gradient(135deg, #112240 0%, #1A3050 100%)',
        'gradient-gold':   'linear-gradient(135deg, #C9A84C 0%, #E8C45A 50%, #C9A84C 100%)',
        'gradient-warm':   'linear-gradient(135deg, #112240 0%, #0A1628 100%)',
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.3)',
        'card-hover': '0 10px 40px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.15)',
        'card-warm':  '0 2px 8px 0 rgba(0,0,0,0.3), 0 0 0 1px rgba(201,168,76,0.1)',
        'glow-gold':  '0 0 24px rgba(201,168,76,0.25)',
        'glow-blue':  '0 0 24px rgba(201,168,76,0.15)',
        'inset-border':'inset 0 0 0 1px rgba(201,168,76,0.12)',
      },
      animation: {
        'ticker':     'ticker 40s linear infinite',
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
