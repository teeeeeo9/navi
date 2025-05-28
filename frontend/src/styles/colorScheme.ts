// Color scheme based on blue-grey-orange gradient
export const colorScheme = {
  // Blue shades (primary)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Grey shades (neutral)
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Orange shades (accent - use sparingly for highlights)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Additional complementary colors
  teal: {
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
  },

  purple: {
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
  },

  pink: {
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
  },

  // UI elements
  ui: {
    background: {
      primary: '#111827',
      secondary: '#0a0f1a',
      card: 'rgba(255, 255, 255, 0.05)',
      cardHover: 'rgba(255, 255, 255, 0.1)',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      focus: 'rgba(59, 130, 246, 0.3)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      tertiary: '#6b7280',
      highlight: '#f97316',
    }
  },

  // Element specific colors
  elements: {
    progress: {
      track: 'rgba(55, 65, 81, 0.3)',
      indicator: 'linear-gradient(to right, #3b82f6, #60a5fa)',
      accentIndicator: 'linear-gradient(to right, #3b82f6, #a78bfa)',
      secondaryIndicator: 'linear-gradient(to right, #3b82f6, #14b8a6)'
    },
    highlights: {
      success: '#10b981',
      warning: '#f97316',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
};

export default colorScheme; 