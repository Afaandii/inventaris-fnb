import { id } from './id';
import { en } from './en';

export const translations = {
  id,
  en,
} as const;

export type SupportedLanguage = keyof typeof translations;
export type { TranslationType } from './id';
