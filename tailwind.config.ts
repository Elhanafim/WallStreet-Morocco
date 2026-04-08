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
        primary: {
          DEFAULT: '#111827',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        secondary: {
          DEFAULT: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#C8962E',
          50: '#FDF8EE',
          100: '#FAEFD3',
          200: '#F4DCA0',
          300: '#EEC86E',
          400: '#E6B445',
          500: '#C8962E',
          600: '#A67825',
          700: '#845B1C',
          800: '#623E13',
          900: '#40220A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#F5F3EE',
          100: '#EDE9E0',
          200: '#DDD8CC',
          300: '#C9C2B3',
        },
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f1c2e 100%)',
        'gradient-card': 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C8962E 0%, #E8B84B 50%, #C8962E 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FAFAF7 0%, #F5F3EE 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(17, 24, 39, 0.06), 0 1px 2px -1px rgba(17, 24, 39, 0.04)',
        'card-hover': '0 10px 40px -8px rgba(17, 24, 39, 0.12), 0 4px 16px -4px rgba(17, 24, 39, 0.08)',
        'card-warm': '0 2px 8px 0 rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(200, 150, 46, 0.08)',
        'glow-blue': '0 0 24px rgba(29, 78, 216, 0.25)',
        'glow-gold': '0 0 24px rgba(200, 150, 46, 0.3)',
        'inset-border': 'inset 0 0 0 1px rgba(17, 24, 39, 0.08)',
      },
      animation: {
        'ticker': 'ticker 40s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
