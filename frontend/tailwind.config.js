/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          100: 'rgba(161,183,203,255)',
          200: 'rgba(138,171,203,255)',
          300: 'rgba(122,152,181,255)',
          400: 'rgba(118,154,190,255)',
          500: 'rgba(113,160,198,255)',
          600: 'rgba(91,122,150,255)',
          700: 'rgba(94,127,150,255)',
          800: 'rgba(98,129,152,255)',
          900: 'rgba(91,99,140,255)',
        },
        grey: {
          100: 'rgba(211,189,178,255)',
          200: 'rgba(178,188,195,255)',
          300: 'rgba(142,152,168,255)',
          400: 'rgba(133,143,158,255)',
          500: 'rgba(126,148,168,255)',
          600: 'rgba(122,144,161,255)',
          700: 'rgba(113,135,154,255)',
          800: 'rgba(135,138,140,255)',
          900: '#16171c', // keeping the darkest shade for backgrounds
        },
        orange: {
          100: 'rgba(211,189,178,255)',
          300: 'rgba(185,140,123,255)',
          400: 'rgba(205,141,108,255)',
          500: 'rgba(228,142,94,255)',
          600: 'rgba(239,164,131,255)',
          700: 'rgba(247,144,81,255)',
        },
        dark: {
          100: 'rgba(178,188,195,255)',
          200: 'rgba(142,152,168,255)',
          300: 'rgba(133,143,158,255)',
          400: 'rgba(126,148,168,255)',
          500: 'rgba(122,144,161,255)',
          600: 'rgba(113,135,154,255)',
          700: 'rgba(98,129,152,255)',
          800: '#121218',
          900: '#0a0a0f',
        },
        // Gradient utilities will be used via CSS variables
        ui: {
          background: {
            primary: 'var(--color-bg-primary)',
            secondary: 'var(--color-bg-secondary)',
            card: 'var(--color-bg-card)',
            cardHover: 'var(--color-bg-card-hover)',
          },
          border: {
            light: 'var(--color-border-light)',
            medium: 'var(--color-border-medium)',
            focus: 'var(--color-border-focus)',
          },
          text: {
            primary: 'var(--color-text-primary)',
            secondary: 'var(--color-text-secondary)',
            tertiary: 'var(--color-text-tertiary)',
            highlight: 'var(--color-text-highlight)',
          }
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      gradientColorStops: {
        'blue-grey': ['rgba(113,160,198,255)', 'rgba(122,144,161,255)'],
        'grey-orange': ['rgba(142,152,168,255)', 'rgba(239,164,131,255)'],
        'blue-orange': ['rgba(118,154,190,255)', 'rgba(247,144,81,255)'],
      },
    },
  },
  plugins: [],
} 