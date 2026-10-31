import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTheme, syncSystemTheme, applyThemeToDocument, type ThemeMode } from '@/redux/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode, resolvedTheme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Initial document setup
    applyThemeToDocument(mode);

    // Watch OS system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        dispatch(syncSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, dispatch]);

  const changeTheme = (newMode: ThemeMode) => {
    dispatch(setTheme(newMode));
  };

  return {
    mode,
    resolvedTheme,
    changeTheme,
  };
};
