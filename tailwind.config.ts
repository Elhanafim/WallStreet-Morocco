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
        // Text hierarchy — updated for white bg
        primary: {
          DEFAULT: '#0C1828',
          50:  '#FFFFFF',
          100: '#F5F7FA',
          200: '#DDE3EC',
          300: '#8298B0',
          400: '#445566',   // --text-secondary
          500: '#2A3A52',
          600: '#1A2A3A',   // --text-muted
          700: '#0F2040',
          800: '#0A1830',   // --border
          900: '#060F1E',   // --bg-base
        },
        // Background surfaces — light
        surface: {
          DEFAULT: '#FFFFFF', // --bg-surface
          50:  '#F5F7FA',     // --bg-elevated
          100: '#DDE3EC',     // --border
          200: '#C4CDD8',
          300: '#8298B0',
        },
        // Muted blue (links, secondary actions)
        secondary: {
          DEFAULT: '#5A7A9F',
          50:  '#EEF3F8',
          100: '#D5E3EF',
          200: '#A8C4DC',
          300: '#7AA5C9',
          400: '#5A7A9F',
          500: '#4A6A8F',
          600: '#3A5A7F',
          700: '#2A4A6F',
          800: '#1C3A5F',
          900: '#0E2A4F',
        },
        // Gold accent — use max 3× per page
        accent: {
          DEFAULT: '#B8974A',
          50:  '#F8F2E4',
          100: '#F0E4C3',
          200: '#E4CC8C',
          300: '#D4B460',
          400: '#C4A040',
          500: '#B8974A',
          600: '#9A7A3A',
          700: '#7C5E2C',
          800: '#5E4220',
          900: '#3E2814',
        },
        // Semantic aliases
        success: '#3DAB6E',
        danger:  '#D95B5B',
        warning: '#D4A843',
        gain:    '#3DAB6E',
        loss:    '#D95B5B',
        gold:    '#B8974A',
        // Direct token names
        'bg-base':     '#FFFFFF',
        'bg-surface':  '#FFFFFF',
        'bg-elevated': '#F5F7FA',
        'border-dark': '#DDE3EC',
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':   'linear-gradient(160deg, #0F2D52 0%, #1A4A80 60%, #0F2D52 100%)',
        'gradient-card':   'linear-gradient(135deg, #0F2D52 0%, #1A4A80 100%)',
        'gradient-warm':   'linear-gradient(160deg, #0F2D52 0%, #1A4A80 100%)',
      },
      // No glows — only structural shadows
      boxShadow: {
        'card':       '0 0 0 1px #1C2B40',
        'card-hover': '0 4px 16px -4px rgba(0,0,0,0.5)',
        'card-warm':  '0 0 0 1px #1C2B40',
        'inset-border': 'inset 0 0 0 1px #1C2B40',
      },
      // Cap all corner radii at 10px
      borderRadius: {
        'xl':  '8px',
        '2xl': '10px',
        '3xl': '10px',
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
    },
  },
  plugins: [],
};

export default config;
