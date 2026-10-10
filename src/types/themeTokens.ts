export interface ThemeTokens {
  id: string;
  name: string;
  accentPrimary: string;
  accentSecondary: string;
  bgPrimary: string;
  bgSecondary: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: number; // in pixels
  spacingDensity: 'compact' | 'normal' | 'spacious';
}

export const CURATED_THEME_PRESETS: ThemeTokens[] = [
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Neon (Default)',
    accentPrimary: '#00f2fe',
    accentSecondary: '#ff0055',
    bgPrimary: '#030508',
    bgSecondary: '#080d17',
    surface: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    borderRadius: 12,
    spacingDensity: 'normal',
  },
  {
    id: 'obsidian_stealth',
    name: 'Obsidian Emerald',
    accentPrimary: '#10b981',
    accentSecondary: '#64748b',
    bgPrimary: '#06090e',
    bgSecondary: '#0c131f',
    surface: 'rgba(255, 255, 255, 0.03)',
    textPrimary: '#f8fafc',
    textSecondary: 'rgba(248, 250, 252, 0.6)',
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    borderRadius: 8,
    spacingDensity: 'normal',
  },
  {
    id: 'titanium_sunset',
    name: 'Titanium Sunset',
    accentPrimary: '#f59e0b',
    accentSecondary: '#f43f5e',
    bgPrimary: '#0c0908',
    bgSecondary: '#181210',
    surface: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#fff7ed',
    textSecondary: 'rgba(255, 247, 237, 0.65)',
    headingFont: "'Syne', sans-serif",
    bodyFont: "'Inter', sans-serif",
    borderRadius: 14,
    spacingDensity: 'spacious',
  },
  {
    id: 'quantum_indigo',
    name: 'Quantum Indigo',
    accentPrimary: '#6366f1',
    accentSecondary: '#38bdf8',
    bgPrimary: '#080816',
    bgSecondary: '#111129',
    surface: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.65)',
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Inter', sans-serif",
    borderRadius: 16,
    spacingDensity: 'normal',
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Matrix',
    accentPrimary: '#00ff88',
    accentSecondary: '#00e5ff',
    bgPrimary: '#020d08',
    bgSecondary: '#051910',
    surface: 'rgba(0, 255, 136, 0.03)',
    textPrimary: '#e6fffa',
    textSecondary: 'rgba(230, 255, 250, 0.6)',
    headingFont: "'JetBrains Mono', monospace",
    bodyFont: "'Space Grotesk', sans-serif",
    borderRadius: 6,
    spacingDensity: 'compact',
  },
  {
    id: 'monochrome_minimal',
    name: 'Monochrome Minimal',
    accentPrimary: '#ffffff',
    accentSecondary: '#94a3b8',
    bgPrimary: '#050505',
    bgSecondary: '#111111',
    surface: 'rgba(255, 255, 255, 0.05)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    borderRadius: 4,
    spacingDensity: 'compact',
  },
];

export const AVAILABLE_HEADING_FONTS = [
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'Syne', value: "'Syne', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
];

export const AVAILABLE_BODY_FONTS = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
];

/**
 * Converts a ThemeTokens object to CSS variables mapping
 */
export function themeTokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const spacingMap = {
    compact: '12px',
    normal: '20px',
    spacious: '32px',
  };

  return {
    '--accent-cyan': tokens.accentPrimary,
    '--accent-magenta': tokens.accentSecondary,
    '--bg-primary': tokens.bgPrimary,
    '--bg-secondary': tokens.bgSecondary,
    '--card-surface': tokens.surface,
    '--text-primary': tokens.textPrimary,
    '--text-secondary': tokens.textSecondary,
    '--font-heading': tokens.headingFont,
    '--font-body': tokens.bodyFont,
    '--border-radius': `${tokens.borderRadius}px`,
    '--theme-spacing': spacingMap[tokens.spacingDensity] || '20px',
  };
}
