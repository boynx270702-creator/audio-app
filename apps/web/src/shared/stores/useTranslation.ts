import { useI18nStore, dictionaries, Language } from './useI18nStore';

export function useTranslation() {
  const { language, setLanguage } = useI18nStore();
  const t = dictionaries[language];

  return { t, language, setLanguage };
}
