import React, { createContext, useContext, useEffect, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { Colors, PrimaryColors } from '@/constants/theme';
import type { ThemeMode, ThemePrimaryColor } from '@/types/theme';
import { loadThemeMode, saveThemeMode, loadPrimaryColor, savePrimaryColor } from '@/utils/theme-storage';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  paperTheme: MD3Theme;
  setMode: (mode: ThemeMode) => void;
  primaryColor: ThemePrimaryColor;
  setPrimaryColor: (color: ThemePrimaryColor) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return ctx;
}

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [primaryColor, setPrimaryColorState] = useState<ThemePrimaryColor>(PrimaryColors[0].key);

  useEffect(() => {
    (async () => {
      const storedMode = await loadThemeMode();
      if (storedMode) {
        setModeState(storedMode);
      }
      const storedPrimary = await loadPrimaryColor();
      if (storedPrimary) {
        setPrimaryColorState(storedPrimary);
      }
    })();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    void saveThemeMode(next);
  };

  const setPrimaryColor = (color: ThemePrimaryColor) => {
    setPrimaryColorState(color);
    void savePrimaryColor(color);
  };

  const isDark = mode === 'dark';

  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const primaryHex = PrimaryColors.find((c) => c.key === primaryColor)?.value ?? PrimaryColors[0].value;

  const paperTheme: MD3Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: isDark ? Colors.dark.background : Colors.light.background,
      primary: primaryHex,
    },
  };

  return (
    <ThemeContext.Provider
      value={{ mode, isDark, paperTheme, setMode, primaryColor, setPrimaryColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

