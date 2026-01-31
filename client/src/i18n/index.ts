import { createContext, useContext } from 'react';
import { pl } from './pl';
import { en } from './en';

export type Lang = 'pl' | 'en';
export type Translations = typeof pl;

const translations: Record<Lang, Translations> = { pl, en };

export function detectLanguage(): Lang {
  const stored = localStorage.getItem('lang');
  if (stored === 'pl' || stored === 'en') return stored;
  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('pl')) return 'pl';
  return 'en';
}

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}

export interface I18nContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'pl',
  t: pl,
  setLang: () => {},
});

export function useTranslation() {
  return useContext(I18nContext);
}
