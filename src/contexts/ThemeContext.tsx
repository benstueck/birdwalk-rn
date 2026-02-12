import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: typeof lightColors;
}

const THEME_STORAGE_KEY = '@birdwalk_theme_preference';

const lightColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f3f4f6',
    tertiary: '#f9fafb',
  },
  surface: '#ffffff',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  border: '#e5e7eb',
  input: {
    background: '#ffffff',
    border: '#d1d5db',
    text: '#111827',
    placeholder: '#9ca3af',
  },
  accent: '#111827',
  destructive: '#ef4444',
};

const darkColors = {
  background: {
    primary: '#36393f',
    secondary: '#2f3136',
    tertiary: '#202225',
  },
  surface: '#2f3136',
  text: {
    primary: '#dcddde',
    secondary: '#b9bbbe',
    tertiary: '#72767d',
  },
  border: '#202225',
  input: {
    background: '#2f3136',
    border: '#202225',
    text: '#dcddde',
    placeholder: '#72767d',
  },
  accent: '#5865f2',
  destructive: '#ed4245',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { setColorScheme: setNativeWindScheme } = useNativeWindColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setMode(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Calculate effective theme based on mode and system preference
  const effectiveTheme: EffectiveTheme =
    mode === 'system'
      ? (systemColorScheme ?? 'light')
      : mode;

  // Sync NativeWind when effective theme changes
  useEffect(() => {
    if (isReady) {
      setNativeWindScheme(effectiveTheme);
    }
  }, [effectiveTheme, isReady, setNativeWindScheme]);

  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;

  // Don't render until preference is loaded
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, effectiveTheme, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
