// theme.js

export const lightTheme = {
  // Backgrounds
  background: '#F8FAFC',
  card: '#FFFFFF',
  accentBg1: '#F0F9FF',
  accentBg2: '#F9FAFB',
  accentBg3: '#f3f4f6',

  // Primary
  primary: '#2E5BFF',

  // Text
  text: '#1E293B',         // Main
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textDim: '#4B5563',
  textDisabled: '#6B7280',
  textButton: '#ffffff',   // Button text
  destructive: '#DC2626',

  // Borders
  border: '#E2E8F0',
  borderMuted: '#e5e7eb',

  // Shadows
  shadowColor: '#000',
  modalOverlay: 'rgba(0, 0, 0, 0.6)',

  // Misc
  iconBg: 'rgba(255, 255, 255, 0.2)',
  subtitle: 'rgba(255, 255, 255, 0.9)',
};

export const darkTheme = {
  // Backgrounds
  background: '#181925',      // Main app bg (midnight navy, not pure black)
  background2: '#F8FAFC',
  card: '#23253A',            // Card/form bg (elevated, readable)
  accentBg1: '#14202B',       // Accent backgrounds (soft, slightly blue/grey)
  accentBg2: '#222232',       // Slight discernible difference for accents
  accentBg3: '#232945',       // For profile images, etc.

  // Primary
  primary: '#3772FF',         // Slightly lighter blue for contrast on dark bg

  // Text
  text: '#E5EAF3',            // Main text (high contrast, off-white)
  textSecondary: '#A5B0BE',   // Secondary labels (muted)
  textTertiary: '#788AA3',    // Tertiary/dim
  textDim: '#62738A',         // For placeholder/desc
  textDisabled: '#475569',    // For disabled or low importance
  textButton: '#181925',      // Button text (on primary, for accessibility)
  destructive: '#FF5A5F',     // Red for destructive, slightly lighter for visibility

  // Borders
  border: '#23253A',          // Cards/inputs
  borderMuted: '#374151',     // For overlays, etc.

  // Shadows
  shadowColor: '#000',        // Can be reduced opacity for subtlety
  modalOverlay: 'rgba(0, 0, 0, 0.7)',

  // Misc
  iconBg: 'rgba(255, 255, 255, 0.07)', // much subtler for icons
  subtitle: 'rgba(229, 234, 243, 0.8)', // off-white subtitle on dark
};
