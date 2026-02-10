// Mock AsyncStorage for Jest
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock ThemeContext for Jest
jest.mock('./src/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: jest.fn(() => ({
    colorScheme: 'light',
    resolvedTheme: 'light',
    isDark: false,
    setColorScheme: jest.fn(),
    toggleTheme: jest.fn(),
  })),
}));
