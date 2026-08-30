/**
 * Color palette for the design system.
 * Uses HEX and RGBA formats. Values chosen for WCAG AA compliance
 * against the dark gradient background.
 */

export const colors = {
  bgTop: '#0F172A',
  bgBottom: '#1E293B',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.15)',
  primary: '#3B82F6',
  accent: '#60A5FA',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  danger: '#EF4444',
} as const;

export type ColorToken = keyof typeof colors;
