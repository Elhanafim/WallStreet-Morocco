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
          DEFAULT: '#0A2540',
          50: '#E6EDF5',
          100: '#C2D2E8',
          200: '#9AB5D8',
          300: '#7298C8',
          400: '#4A7BB8',
          500: '#0A2540',
          600: '#091F36',
          700: '#07182B',
          800: '#051220',
          900: '#030B15',
        },
        secondary: {
          DEFAULT: '#3A86FF',
          50: '#EBF2FF',
          100: '#C7DEFF',
          200: '#A3CAFF',
          300: '#7FB6FF',
          400: '#5BA2FF',
          500: '#3A86FF',
          600: '#0D6EFD',
          700: '#0057D4',
          800: '#0040AB',
          900: '#002982',
        },
        accent: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E3',
          100: '#F5E9B8',
          200: '#EDDA88',
          300: '#E5CB57',
          400: '#DCBC26',
          500: '#D4AF37',
          600: '#AA8C2C',
          700: '#806921',
          800: '#554616',
          900: '#2B230B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(to bottom right, #0f172a, #172554, #0f172a)',
        'gradient-card': 'linear-gradient(135deg, #0A2540 0%, #1e3f6e 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F5D166 50%, #D4AF37 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(10, 37, 64, 0.1), 0 2px 4px -1px rgba(10, 37, 64, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(10, 37, 64, 0.15), 0 10px 10px -5px rgba(10, 37, 64, 0.08)',
        'glow-blue': '0 0 20px rgba(58, 134, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
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
