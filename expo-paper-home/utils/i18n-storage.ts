import AsyncStorage from '@react-native-async-storage/async-storage';

const I18N_LANGUAGE_KEY = 'gonext-language';

export type SupportedLanguage = 'ru' | 'en';

export async function loadLanguage(): Promise<SupportedLanguage | null> {
  try {
    const value = await AsyncStorage.getItem(I18N_LANGUAGE_KEY);
    if (value === 'ru' || value === 'en') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(I18N_LANGUAGE_KEY, lang);
  } catch {
    // ignore
  }
}

