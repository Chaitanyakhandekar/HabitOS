import { create } from 'zustand';

const applyTheme = (theme) => {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initialTheme = localStorage.getItem('habitos_theme') || 'dark';
applyTheme(initialTheme);

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  setTheme: (newTheme) => {
    localStorage.setItem('habitos_theme', newTheme);
    applyTheme(newTheme);
    set({ theme: newTheme });
  },
}));

export default useThemeStore;
