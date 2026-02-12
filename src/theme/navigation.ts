import { Theme, DefaultTheme, DarkTheme } from '@react-navigation/native';

export const LightNavigationTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    primary: '#111827',        // Gray-900
    background: '#f9fafb',     // Gray-50
    card: '#ffffff',           // White
    text: '#111827',           // Gray-900
    border: '#e5e7eb',         // Gray-200
    notification: '#ef4444',   // Red-500
  },
};

export const DarkNavigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    primary: '#5865f2',        // Discord blue
    background: '#36393f',     // Discord main background
    card: '#2f3136',           // Discord secondary background
    text: '#dcddde',           // Discord primary text
    border: '#202225',         // Discord border
    notification: '#ed4245',   // Discord red
  },
};
