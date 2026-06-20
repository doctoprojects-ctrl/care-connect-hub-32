import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

/** Convenience hook returning just the translator. */
export const useT = () => useLanguage().t;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem('app.lang');
    return stored === 'fr' || stored === 'en' ? stored : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('app.lang', lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);

  const t = (key: TranslationKey, vars?: Record<string, string | number>) => {
    const dict = translations[lang] as Record<string, string>;
    const fallback = translations.en as Record<string, string>;
    let str = dict[key] ?? fallback[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};