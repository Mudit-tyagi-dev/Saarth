/**
 * Theme Store for SAARTH
 * Manages light / dark / system theme preference and updates DOM root classes
 */
import { create } from 'zustand';

const THEME_KEY = 'saarth_theme';

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (newTheme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    set({ theme: newTheme });
    applyThemeToDOM(newTheme);
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  initTheme: () => {
    const theme = get().theme;
    applyThemeToDOM(theme);

    // Watch system changes if not explicitly overridden or to keep synced
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          get().setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  },
}));

function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
