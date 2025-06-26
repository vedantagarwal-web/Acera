// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './apps/web/**/*.{ts,tsx,js,jsx}',
    './packages/ui/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: { 500: '#6366F1' },
        emerald: { 500: '#22C55E' },
        rose: { 500: '#FB7185' },
        amber: { 400: '#FBBF24' },
        background: '#0B1120',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Sora', ...fontFamily.sans],
      },
      borderRadius: {
        '2xl': '20px',
      },
      boxShadow: {
        glass: '0 4px 32px 0 rgba(0,0,0,0.30)',
      },
      spacing: {
        4: '16px',
        6: '24px',
        5: '20px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        tick: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#6366F1' },
        },
      },
      animation: {
        tick: 'tick 150ms',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-radix'),
  ],
} 