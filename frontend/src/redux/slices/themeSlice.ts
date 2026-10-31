import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
}

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('theme-preference') as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialMode = getInitialThemeMode();
const initialResolved = initialMode === 'system' ? getSystemTheme() : initialMode;

export const applyThemeToDocument = (mode: ThemeMode): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('theme-preference', mode);
  return resolved;
};

const initialState: ThemeState = {
  mode: initialMode,
  resolvedTheme: initialResolved,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.resolvedTheme = applyThemeToDocument(action.payload);
    },
    syncSystemTheme: (state) => {
      if (state.mode === 'system') {
        state.resolvedTheme = applyThemeToDocument('system');
      }
    },
  },
});

export const { setTheme, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
