export type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'readarr-theme';
const DARK_CLASS = 'dark';

/**
 * Get the current theme from localStorage or system preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'auto';
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored;
  }
  
  return 'auto';
}

/**
 * Store theme preference
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Get system color scheme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (effectiveTheme === 'dark') {
    root.classList.add(DARK_CLASS);
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove(DARK_CLASS);
    root.setAttribute('data-theme', 'light');
  }
}

/**
 * Initialize theme on app start
 */
export function initializeTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);

  // Listen for system theme changes when in auto mode
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const currentTheme = getStoredTheme();
      if (currentTheme === 'auto') {
        applyTheme('auto');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy support
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): void {
  const current = getStoredTheme();
  const effectiveCurrent = current === 'auto' ? getSystemTheme() : current;
  const newTheme: Theme = effectiveCurrent === 'dark' ? 'light' : 'dark';
  
  setStoredTheme(newTheme);
  applyTheme(newTheme);
}

/**
 * Get current effective theme (resolves 'auto')
 */
export function getCurrentTheme(): 'light' | 'dark' {
  const theme = getStoredTheme();
  return theme === 'auto' ? getSystemTheme() : theme;
}
