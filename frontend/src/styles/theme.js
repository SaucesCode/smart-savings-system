// src/styles/theme.js
// Central color + style tokens — import wherever you need consistent styling

export const colors = {
  // Primary palette
  violet:    '#7C3AED',
  violetLight: '#A78BFA',
  violetDark:  '#5B21B6',

  teal:      '#0D9488',
  tealLight: '#5EEAD4',
  tealDark:  '#0F766E',

  coral:     '#F43F5E',
  coralLight:'#FDA4AF',
  coralDark: '#E11D48',

  amber:     '#F59E0B',
  amberLight:'#FCD34D',
  amberDark: '#D97706',

  // Neutrals
  white:     '#FFFFFF',
  offWhite:  '#F8F7FF',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray400:   '#9CA3AF',
  gray600:   '#4B5563',
  gray800:   '#1F2937',
  black:     '#0F0F0F',
};

// Card gradient presets — use these for visual variety
export const gradients = {
  violet: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
  teal:   'linear-gradient(135deg, #0D9488 0%, #5EEAD4 100%)',
  coral:  'linear-gradient(135deg, #F43F5E 0%, #FDA4AF 100%)',
  amber:  'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
  dark:   'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
  soft:   'linear-gradient(135deg, #F8F7FF 0%, #EDE9FE 100%)',
};

// Status badge colors
export const statusColors = {
  pending:   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  confirmed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  rejected:  { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

// Shared card base style — spread into inline styles or CSS-in-JS
export const cardBase = {
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};