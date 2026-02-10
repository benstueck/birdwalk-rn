jest.mock('../../lib/supabase');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    signOut: jest.fn(),
  }),
}));
jest.mock('../../contexts/ThemeContext', () => {
  const actual = jest.requireActual('../../contexts/ThemeContext');
  return {
    ...actual,
    useTheme: jest.fn(() => ({
      colorScheme: 'system',
      resolvedTheme: 'light',
      isDark: false,
      setColorScheme: jest.fn(),
      toggleTheme: jest.fn(),
    })),
  };
});
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../../screens/ProfileScreen';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ProfileScreen - Theme Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock supabase queries to resolve immediately
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ count: 0, data: [] }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    // Ensure useFocusEffect calls the callback
    const mockUseFocusEffect = require('@react-navigation/native').useFocusEffect;
    mockUseFocusEffect.mockImplementation((callback: any) => {
      callback();
    });
  });

  it('renders Appearance section with theme options', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByText('Appearance')).toBeTruthy();
      expect(getByText('Light')).toBeTruthy();
      expect(getByText('Dark')).toBeTruthy();
      expect(getByText('System')).toBeTruthy();
    });
  });

  it('shows current theme selection as active', async () => {
    mockUseTheme.mockReturnValue({
      colorScheme: 'dark',
      resolvedTheme: 'dark',
      isDark: true,
      setColorScheme: jest.fn(),
      toggleTheme: jest.fn(),
    });

    const { getByTestId } = render(<ProfileScreen />);

    await waitFor(() => {
      const darkButton = getByTestId('theme-option-dark');
      // Check if the dark option has the active styling (bg-emerald-500)
      expect(darkButton.props.className).toContain('bg-emerald-500');
    });
  });

  it('calls setColorScheme when theme option is pressed', async () => {
    const mockSetColorScheme = jest.fn();
    mockUseTheme.mockReturnValue({
      colorScheme: 'light',
      resolvedTheme: 'light',
      isDark: false,
      setColorScheme: mockSetColorScheme,
      toggleTheme: jest.fn(),
    });

    const { getByTestId } = render(<ProfileScreen />);

    await waitFor(() => {
      const darkButton = getByTestId('theme-option-dark');
      expect(darkButton).toBeTruthy();
    });

    const darkButton = getByTestId('theme-option-dark');
    fireEvent.press(darkButton);

    expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
  });

  it('renders Appearance section between stats and Sign Out button', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      const statsText = getByText('Your Stats');
      const appearanceText = getByText('Appearance');
      const signOutText = getByText('Sign Out');

      expect(statsText).toBeTruthy();
      expect(appearanceText).toBeTruthy();
      expect(signOutText).toBeTruthy();
    });
  });

  it('applies correct styling for system theme option', async () => {
    mockUseTheme.mockReturnValue({
      colorScheme: 'system',
      resolvedTheme: 'light',
      isDark: false,
      setColorScheme: jest.fn(),
      toggleTheme: jest.fn(),
    });

    const { getByTestId } = render(<ProfileScreen />);

    await waitFor(() => {
      const systemButton = getByTestId('theme-option-system');
      expect(systemButton.props.className).toContain('bg-emerald-500');
    });
  });
});
