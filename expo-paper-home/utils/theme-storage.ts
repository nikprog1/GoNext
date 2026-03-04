import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode, ThemePrimaryColor } from '@/types/theme';

const THEME_MODE_KEY = 'gonext-theme-mode';
const THEME_PRIMARY_KEY = 'gonext-theme-primary';

export async function loadThemeMode(): Promise<ThemeMode | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_MODE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

export async function loadPrimaryColor(): Promise<ThemePrimaryColor | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_PRIMARY_KEY);
    return (value as ThemePrimaryColor | null) ?? null;
  } catch {
    return null;
  }
}

export async function savePrimaryColor(color: ThemePrimaryColor): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_PRIMARY_KEY, color);
  } catch {
    // ignore
  }
}

