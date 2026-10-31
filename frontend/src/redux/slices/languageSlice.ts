import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SupportedLanguage } from '@/locales';

interface LanguageState {
  currentLanguage: SupportedLanguage;
}

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'id';
  const saved = localStorage.getItem('language-preference') as SupportedLanguage | null;
  if (saved === 'id' || saved === 'en') {
    return saved;
  }
  return 'id';
};

const initialState: LanguageState = {
  currentLanguage: getInitialLanguage(),
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.currentLanguage = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('language-preference', action.payload);
      }
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
