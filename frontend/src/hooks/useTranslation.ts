import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLanguage } from '@/redux/slices/languageSlice';
import { translations, type SupportedLanguage, type TranslationType } from '@/locales';

export const useTranslation = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.currentLanguage);
  const t: TranslationType = translations[currentLanguage] ?? translations.id;

  const changeLanguage = (lang: SupportedLanguage) => {
    dispatch(setLanguage(lang));
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
};
