// Modern theme utility for the application
// This replaces the previous colorScheme.ts with CSS variables approach

export const theme = {
  // Blue shades
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

  // Grey shades
  grey: {
    100: 'rgba(211,189,178,255)',
    200: 'rgba(178,188,195,255)',
    300: 'rgba(142,152,168,255)',
    400: 'rgba(133,143,158,255)',
    500: 'rgba(126,148,168,255)',
    600: 'rgba(122,144,161,255)',
    700: 'rgba(113,135,154,255)',
    800: 'rgba(135,138,140,255)',
    900: '#16171c',
  },

  // Orange shades
  orange: {
    100: 'rgba(211,189,178,255)',
    300: 'rgba(185,140,123,255)',
    400: 'rgba(205,141,108,255)',
    500: 'rgba(228,142,94,255)',
    600: 'rgba(239,164,131,255)',
    700: 'rgba(247,144,81,255)',
  },

  // Green for effort indicators
  green: {
    400: 'rgba(52,199,142,1)',
    500: 'rgba(38,188,126,1)',
    600: 'rgba(22,163,94,1)',
  },

  // UI elements (using CSS variables)
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

  // Element specific colors
  elements: {
    progress: {
      track: 'rgba(30, 30, 40, 0.3)',
      indicator: 'var(--gradient-blue-grey)',
      accentIndicator: 'var(--gradient-blue-orange)',
      secondaryIndicator: 'var(--gradient-grey-orange)'
    },
    highlights: {
      success: 'rgba(113,160,198,255)',
      warning: 'rgba(247,144,81,255)',
      error: 'rgba(239,164,131,255)',
      info: 'rgba(118,154,190,255)'
    }
  },
  
  // Gradient utilities
  gradients: {
    blueGrey: 'var(--gradient-blue-grey)',
    greyOrange: 'var(--gradient-grey-orange)',
    blueOrange: 'var(--gradient-blue-orange)',
  }
};

export default theme; 