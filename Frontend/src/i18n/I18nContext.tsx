import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Lang, type TranslationKey } from './translations';

interface I18nContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: (key: TranslationKey) => string;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  formatPrice: (price: number, perMonth?: boolean) => string;
  formatDate: (date: string) => string;
  formatNumber: (n: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'marbou-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Lang) || 'ar';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((p) => (p === 'ar' ? 'en' : 'ar'));

  const t = (key: TranslationKey) => {
    return translations[lang][key] || translations.ar[key] || key;
  };

  const formatPrice = (price: number, perMonth = false) => {
    const formatted = lang === 'ar'
      ? `${price.toLocaleString('ar-EG')} ${t('sdg')}`
      : `${price.toLocaleString('en-US')} ${t('sdg')}`;
    return perMonth ? `${formatted} ${t('perMonth')}` : formatted;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return lang === 'ar'
      ? d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
      : d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatNumber = (n: number) => {
    return lang === 'ar' ? n.toLocaleString('ar-EG') : n.toLocaleString('en-US');
  };

  return (
    <I18nContext.Provider value={{ lang, dir, t, setLang, toggleLang, formatPrice, formatDate, formatNumber }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
