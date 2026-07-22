export const themeTokens = {
  colors: {
    background: '#fdfbf7',
    foreground: '#2d241e',
    card: '#faf6f0',
    cardForeground: '#2d241e',
    primary: '#b86a3d',
    primaryForeground: '#fdfbf7',
    muted: '#e8e2d9',
    mutedForeground: '#7b726c',
    border: '#e8e2d9',
  },
} as const;

export type ThemeTokens = typeof themeTokens;
