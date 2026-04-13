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
        // Text hierarchy
        primary: {
          DEFAULT: '#E8EAF0',
          50:  '#F4F5F8',
          100: '#E8EAF0',
          200: '#C5CAD5',
          300: '#9FAAB8',
          400: '#7A8BA0',   // --text-secondary
          500: '#5A6B80',
          600: '#3D4F65',   // --text-muted
          700: '#2A3A52',
          800: '#1C2B40',   // --border
          900: '#080F1E',   // --bg-base
        },
        // Background surfaces
        surface: {
          DEFAULT: '#0E1A2E', // --bg-surface
          50:  '#14243D',     // --bg-elevated
          100: '#1C2B40',     // --border
          200: '#243452',
          300: '#2C3D60',
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
        'bg-base':     '#080F1E',
        'bg-surface':  '#0E1A2E',
        'bg-elevated': '#14243D',
        'border-dark': '#1C2B40',
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
        'gradient-hero':   'linear-gradient(180deg, #080F1E 0%, #0E1A2E 100%)',
        'gradient-card':   'linear-gradient(135deg, #0E1A2E 0%, #14243D 100%)',
        'gradient-warm':   'linear-gradient(180deg, #080F1E 0%, #0E1A2E 100%)',
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
