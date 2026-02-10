// Unmock ThemeContext for this test file
jest.unmock('../../contexts/ThemeContext');

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import type { ColorScheme } from '../../types/theme';

jest.mock('react-native/Libraries/Utilities/useColorScheme');

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;
const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
    mockGetItem.mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });

  it('defaults to system theme when no stored preference', async () => {
    mockUseColorScheme.mockReturnValue('light');
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    expect(mockGetItem).toHaveBeenCalledWith('theme_preference');
  });

  it('loads stored theme preference from AsyncStorage', async () => {
    mockGetItem.mockResolvedValue('dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });
  });

  it('resolves system theme correctly when colorScheme is system', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    mockGetItem.mockResolvedValue('system');

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });
  });

  it('sets color scheme and persists to AsyncStorage', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('system');
    });

    await act(async () => {
      await result.current.setColorScheme('dark');
    });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(mockSetItem).toHaveBeenCalledWith('theme_preference', 'dark');
    });
  });

  it('toggles between light and dark themes', async () => {
    mockGetItem.mockResolvedValue('light');

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('light');
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('dark');
      expect(mockSetItem).toHaveBeenCalledWith('theme_preference', 'dark');
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('light');
      expect(mockSetItem).toHaveBeenCalledWith('theme_preference', 'light');
    });
  });

  it('toggles from system to light theme', async () => {
    mockGetItem.mockResolvedValue('system');
    mockUseColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    act(() => {
      result.current.toggleTheme();
    });

    await waitFor(() => {
      expect(result.current.colorScheme).toBe('light');
      expect(mockSetItem).toHaveBeenCalledWith('theme_preference', 'light');
    });
  });

  it('updates resolved theme when system theme changes', async () => {
    mockGetItem.mockResolvedValue('system');
    mockUseColorScheme.mockReturnValue('light');

    const { result, rerender } = renderHook(() => useTheme(), { wrapper });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('light');
    });

    mockUseColorScheme.mockReturnValue('dark');
    rerender();

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });
  });
});
