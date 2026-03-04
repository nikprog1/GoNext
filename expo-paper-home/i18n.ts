import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ruCommon from './locales/ru/common.json';
import enCommon from './locales/en/common.json';
import { loadLanguage, saveLanguage, type SupportedLanguage } from './utils/i18n-storage';

const resources = {
  ru: {
    common: ruCommon,
  },
  en: {
    common: enCommon,
  },
};

const DEFAULT_LANG: SupportedLanguage = 'ru';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: ['ru', 'en'],
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

async function initLanguage() {
  const stored = await loadLanguage();
  if (stored) {
    await i18n.changeLanguage(stored);
    return;
  }
  const locales = Localization.getLocales();
  const system = locales[0]?.languageCode as SupportedLanguage | undefined;
  const lang: SupportedLanguage = system === 'en' ? 'en' : 'ru';
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
}

void initLanguage();

export default i18n;

