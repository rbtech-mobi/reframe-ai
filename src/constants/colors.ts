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
  success: '#10B981',
} as const;

/**
 * Calming pastel palette designed for neurodivergent accessibility.
 * Transitioning from soft sky-blue to warm pastel lavender with high-contrast slate text.
 */
export const pastelColors = {
  bgTop: '#DCE6F8',
  bgBottom: '#D8CDF7',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  ribbonStart: '#0EA5E9',
  ribbonEnd: '#2563EB',
  ribbonFold: '#1E40AF',
  primary: '#2563EB',
  accent: '#0EA5E9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  danger: '#EF4444',
  success: '#10B981',
  chipBg: 'rgba(14, 165, 233, 0.10)',
  chipBorder: 'rgba(14, 165, 233, 0.25)',
} as const;

export type AppTheme = 'pastel' | 'dark';
export type ColorToken = keyof typeof colors;

