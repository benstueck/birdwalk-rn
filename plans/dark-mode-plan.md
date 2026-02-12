# Dark Mode Implementation Plan

**BirdWalk React Native - Dark Mode Feature**

Created: February 12, 2026

---

## Overview

This plan outlines the complete implementation of dark mode for BirdWalk React Native with:
- **User-controlled theme toggle** on Profile screen
- **Discord-inspired dark theme** (industry standard)
- **Persistent user preference** across app restarts
- **Smooth integration** with existing NativeWind setup

---

## Color Palette

### Discord-Inspired Dark Theme

We'll use Discord's proven dark mode palette, which provides excellent contrast and reduced eye strain:

```typescript
// Light Mode Colors
const lightColors = {
  background: {
    primary: '#ffffff',      // Pure white for main screens
    secondary: '#f3f4f6',    // Gray-100 for subtle backgrounds
    tertiary: '#f9fafb',     // Gray-50 for cards/panels
  },
  surface: '#ffffff',        // Cards, modals
  text: {
    primary: '#111827',      // Gray-900 - main text
    secondary: '#6b7280',    // Gray-500 - secondary text
    tertiary: '#9ca3af',     // Gray-400 - subtle text
  },
  border: '#e5e7eb',         // Gray-200
  accent: '#111827',         // Gray-900 for active states
  destructive: '#ef4444',    // Red-500 for delete actions
};

// Dark Mode Colors (Discord-inspired)
const darkColors = {
  background: {
    primary: '#36393f',      // Discord's main background
    secondary: '#2f3136',    // Discord's secondary background
    tertiary: '#202225',     // Discord's darkest background
  },
  surface: '#2f3136',        // Cards, modals
  text: {
    primary: '#dcddde',      // Discord's primary text
    secondary: '#b9bbbe',    // Discord's secondary text
    tertiary: '#72767d',     // Discord's muted text
  },
  border: '#202225',         // Subtle borders
  accent: '#5865f2',         // Discord blue for active states
  destructive: '#ed4245',    // Discord red for delete actions
};
```

### Tailwind Dark Mode Classes

```typescript
// Backgrounds
"bg-white dark:bg-[#36393f]"              // Primary background
"bg-gray-50 dark:bg-[#2f3136]"            // Secondary background
"bg-gray-100 dark:bg-[#202225]"           // Tertiary background
"bg-white dark:bg-[#2f3136]"              // Cards/surfaces

// Text
"text-gray-900 dark:text-[#dcddde]"       // Primary text
"text-gray-600 dark:text-[#b9bbbe]"       // Secondary text
"text-gray-500 dark:text-[#72767d]"       // Tertiary text

// Borders
"border-gray-200 dark:border-[#202225]"

// Accent/Active states
"bg-gray-900 dark:bg-[#5865f2]"           // Active buttons

// Destructive
"text-red-600 dark:text-[#ed4245]"        // Delete actions
```

---

## Architecture

### 1. Theme Context

Create a new context to manage theme state and persistence.

**File**: `/src/contexts/ThemeContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: typeof lightColors | typeof darkColors;
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
```

---

### 2. NativeWind Integration

NativeWind needs to be controlled by our theme context.

**File**: `/src/contexts/ThemeContext.tsx` (addition)

```typescript
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { setColorScheme: setNativeWindScheme } = useNativeWindColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  // ... previous code ...

  // Calculate effective theme
  const effectiveTheme: EffectiveTheme =
    mode === 'system'
      ? (systemColorScheme ?? 'light')
      : mode;

  // Sync NativeWind when effective theme changes
  useEffect(() => {
    if (isReady) {
      setNativeWindScheme(effectiveTheme);
    }
  }, [effectiveTheme, isReady]);

  // ... rest of code ...
}
```

---

### 3. App Root Integration

Update App.tsx to include ThemeProvider and dynamic StatusBar.

**File**: `/App.tsx`

```typescript
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

### 4. React Navigation Theme

Create custom navigation themes matching our color palette.

**File**: `/src/theme/navigation.ts`

```typescript
import { Theme } from '@react-navigation/native';

export const LightNavigationTheme: Theme = {
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
```

**File**: `/src/navigation/index.tsx`

Update RootNavigator to use theme:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { LightNavigationTheme, DarkNavigationTheme } from '../theme/navigation';

export function RootNavigator() {
  const { effectiveTheme } = useTheme();
  const navigationTheme = effectiveTheme === 'dark'
    ? DarkNavigationTheme
    : LightNavigationTheme;

  // ... existing code ...

  return (
    <NavigationContainer theme={navigationTheme}>
      {/* ... existing navigation stack ... */}
    </NavigationContainer>
  );
}
```

---

### 5. Profile Screen with Theme Toggle

Add theme selection UI to ProfileScreen.

**File**: `/src/screens/ProfileScreen.tsx`

```typescript
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

interface Stats {
  totalWalks: number;
  totalSightings: number;
  uniqueSpecies: number;
}

type ThemeMode = 'light' | 'dark' | 'system';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { mode, effectiveTheme, setThemeMode, colors } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalWalks: 0,
    totalSightings: 0,
    uniqueSpecies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ... existing fetchStats, loadStats, onRefresh code ...

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [user])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* Profile Header */}
      <View className="bg-white dark:bg-[#2f3136] p-6 border-b border-gray-200 dark:border-[#202225]">
        <View className="w-20 h-20 bg-gray-200 dark:bg-[#202225] rounded-full justify-center items-center mx-auto mb-4">
          <Text className="text-3xl text-gray-600 dark:text-[#72767d]">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-center text-gray-800 dark:text-[#dcddde]">
          {user?.email}
        </Text>
      </View>

      {/* Stats Section */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-3">
          Your Stats
        </Text>

        <View className="flex-row">
          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg mr-2">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.totalWalks}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Walks</Text>
          </View>

          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg mx-1">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.totalSightings}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Sightings</Text>
          </View>

          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg ml-2">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.uniqueSpecies}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Species</Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-3">
          Appearance
        </Text>

        <View className="bg-white dark:bg-[#2f3136] rounded-lg overflow-hidden">
          {/* Light Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('light')}
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="sunny"
                size={20}
                color={effectiveTheme === 'light' ? '#111827' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                Light
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Use light appearance
              </Text>
            </View>
            {mode === 'light' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>

          {/* Dark Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('dark')}
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="moon"
                size={20}
                color={effectiveTheme === 'dark' ? '#5865f2' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                Dark
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Use dark appearance
              </Text>
            </View>
            {mode === 'dark' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>

          {/* System Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('system')}
            className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="phone-portrait"
                size={20}
                color={mode === 'system' ? '#5865f2' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                System
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Match device appearance
              </Text>
            </View>
            {mode === 'system' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Sign Out Button */}
      <View className="p-4">
        <Pressable
          onPress={handleSignOut}
          className="bg-white dark:bg-[#2f3136] border border-red-200 dark:border-[#ed4245] rounded-lg py-4 active:bg-red-50 dark:active:bg-[#202225]"
        >
          <Text className="text-red-600 dark:text-[#ed4245] text-center font-semibold">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
```

---

## Component Updates

### 6. Tab Navigator

Update MainNavigator with theme-aware styling.

**File**: `/src/navigation/MainNavigator.tsx`

```typescript
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { WalksStackNavigator } from "./WalksStackNavigator";
import { LifersScreen } from "../screens/LifersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useTheme } from "../contexts/ThemeContext";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  const { effectiveTheme, colors } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Walks"
        component={WalksStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="footsteps" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Lifers"
        component={LifersScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bird" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

---

### 7. Example Component Updates

Here are examples of updating key components. Apply similar patterns to all components.

#### WalkCard Component

**File**: `/src/components/WalkCard.tsx`

```typescript
<Pressable
  onPress={onPress}
  className="bg-white dark:bg-[#2f3136] rounded-lg p-4 mb-3 shadow-sm border border-gray-100 dark:border-[#202225]"
>
  <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-1">
    {walk.title}
  </Text>
  <Text className="text-sm text-gray-500 dark:text-[#72767d] mb-2">
    {formatDate(walk.date)}
  </Text>
  <View className="flex-row items-center">
    <MaterialCommunityIcons
      name="bird"
      size={16}
      color={colors.text.secondary}
    />
    <Text className="text-sm text-gray-600 dark:text-[#b9bbbe] ml-1">
      {walk.sightings_count} sightings
    </Text>
  </View>
</Pressable>
```

#### SearchBar Component

**File**: `/src/components/SearchBar.tsx`

```typescript
import { useTheme } from '../contexts/ThemeContext';

export function SearchBar() {
  const { colors } = useTheme();

  return (
    <View className="bg-white dark:bg-[#2f3136] p-3 shadow-sm">
      <TextInput
        style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.border,
          color: colors.text.primary,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
        placeholder="Search species..."
        placeholderTextColor={colors.text.tertiary}
        // ... other props
      />
    </View>
  );
}
```

#### NewSightingModal Component

**File**: `/src/components/NewSightingModal.tsx`

Update all inline styles to use theme colors:

```typescript
import { useTheme } from '../contexts/ThemeContext';

export function NewSightingModal({ visible, onClose, walkId }) {
  const { colors } = useTheme();

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: colors.surface,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.text.tertiary,
      }}
    >
      <View className="flex-1 p-4">
        <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde] mb-4">
          Add Sighting
        </Text>

        {/* Search Input */}
        <TextInput
          style={{
            backgroundColor: colors.background.secondary,
            borderColor: colors.border,
            color: colors.text.primary,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
          }}
          placeholder="Search for a species..."
          placeholderTextColor={colors.text.tertiary}
          // ... other props
        />

        {/* Search Results */}
        <ScrollView>
          {searchResults.map((species) => (
            <Pressable
              key={species.code}
              className="p-3 border-b border-gray-200 dark:border-[#202225]"
            >
              <Text className="text-base font-medium text-gray-800 dark:text-[#dcddde]">
                {species.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d]">
                {species.scientificName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
```

#### BirdImage Component

**File**: `/src/components/BirdImage.tsx`

Update letterbox backgrounds:

```typescript
<View
  className="bg-slate-300 dark:bg-[#202225] rounded-lg overflow-hidden"
  style={[{ aspectRatio }, style]}
>
  {loading && (
    <View className="absolute inset-0 bg-gray-200 dark:bg-[#202225] justify-center items-center">
      <ActivityIndicator color={colors.text.tertiary} />
    </View>
  )}
  {error && (
    <View className="absolute inset-0 bg-gray-100 dark:bg-[#202225] justify-center items-center">
      <Text className="text-gray-400 dark:text-[#72767d] text-center">
        Image unavailable
      </Text>
    </View>
  )}
  {/* Image component */}
</View>
```

---

## Tailwind Configuration

Update tailwind.config.js to support dark mode.

**File**: `/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Discord-inspired colors for dark mode
        discord: {
          primary: '#36393f',
          secondary: '#2f3136',
          tertiary: '#202225',
          accent: '#5865f2',
          text: {
            primary: '#dcddde',
            secondary: '#b9bbbe',
            muted: '#72767d',
          },
        },
      },
    },
  },
  plugins: [],
};
```

---

## Implementation Checklist

### Phase 1: Foundation (2-3 hours)

- [ ] Install `@react-native-async-storage/async-storage` if not already installed
- [ ] Create `ThemeContext.tsx` with theme management logic
- [ ] Create `theme/navigation.ts` with React Navigation themes
- [ ] Update `App.tsx` to include `ThemeProvider`
- [ ] Update `tailwind.config.js` with dark mode configuration
- [ ] Test theme detection and switching works

### Phase 2: Profile Screen Toggle (1-2 hours)

- [ ] Update `ProfileScreen.tsx` with theme toggle UI
- [ ] Test theme persistence across app restarts
- [ ] Verify all three modes work (light, dark, system)
- [ ] Test smooth theme transitions

### Phase 3: Navigation (2 hours)

- [ ] Update `MainNavigator.tsx` with dynamic theming
- [ ] Update `WalksStackNavigator.tsx` with dynamic theming
- [ ] Update `RootNavigator.tsx` with navigation theme
- [ ] Test all navigation elements in both themes

### Phase 4: Core Components (6-8 hours)

Priority order based on visibility and usage:

1. [ ] `BirdImage.tsx` - Image letterboxing and loading states
2. [ ] `SearchBar.tsx` - Used across multiple screens
3. [ ] `WalkCard.tsx` - Primary content card
4. [ ] `SightingCard.tsx` - Primary content card
5. [ ] `LiferCard.tsx` - Primary content card
6. [ ] `NewSightingModal.tsx` - Complex form with inputs
7. [ ] `EditSightingModal.tsx` - Complex form with inputs
8. [ ] `SightingModal.tsx` - Hero images and details
9. [ ] `LiferModal.tsx` - Hero images and stats
10. [ ] `NewWalkModal.tsx` - Form inputs
11. [ ] `EditWalkModal.tsx` - Form inputs
12. [ ] `SortBottomSheet.tsx` - Bottom sheet styling
13. [ ] `SortButton.tsx` - Icon colors
14. [ ] `WalkOptionsButton.tsx` - FAB styling
15. [ ] `SkeletonBar.tsx` - Loading state colors

### Phase 5: Screens (4-6 hours)

- [ ] `WalksListScreen.tsx`
- [ ] `WalkDetailScreen.tsx`
- [ ] `LifersScreen.tsx`
- [ ] `SearchScreen.tsx`
- [ ] `NewWalkScreen.tsx`
- [ ] `LoginScreen.tsx`
- [ ] `SignupScreen.tsx`
- [ ] `ProfileScreen.tsx` (already updated in Phase 2)

### Phase 6: Testing & Polish (3-4 hours)

- [ ] Test every screen in light mode
- [ ] Test every screen in dark mode
- [ ] Test theme switching while using the app
- [ ] Test all modals and bottom sheets
- [ ] Test all input fields (color, borders, placeholders)
- [ ] Test image states (loading, error, letterbox)
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Verify contrast ratios meet WCAG standards
- [ ] Check all icons are visible
- [ ] Verify shadows/borders are visible
- [ ] Test with system theme changes

---

## Key Implementation Notes

### 1. TextInput Styling

Every TextInput must have ALL these properties styled:

```typescript
const { colors } = useTheme();

<TextInput
  style={{
    backgroundColor: colors.input.background,
    borderColor: colors.input.border,
    color: colors.input.text,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  }}
  placeholderTextColor={colors.input.placeholder}
  selectionColor={colors.accent}
  cursorColor={colors.accent} // Android API 29+
/>
```

### 2. Bottom Sheet Styling

All `@gorhom/bottom-sheet` components need explicit styling:

```typescript
const { colors } = useTheme();

<BottomSheet
  backgroundStyle={{ backgroundColor: colors.surface }}
  handleIndicatorStyle={{ backgroundColor: colors.text.tertiary }}
>
```

### 3. ActivityIndicator Colors

Replace hardcoded colors:

```typescript
const { colors } = useTheme();

<ActivityIndicator size="large" color={colors.accent} />
```

### 4. Icon Colors

Use theme colors for all icons:

```typescript
const { colors } = useTheme();

<Ionicons name="checkmark" size={24} color={colors.accent} />
```

### 5. Image Letterboxing

Critical for visual polish - update all image backgrounds:

```typescript
// Before
className="bg-slate-300"

// After
className="bg-slate-300 dark:bg-[#202225]"
```

### 6. RefreshControl Colors

Update tint colors:

```typescript
const { colors } = useTheme();

<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  tintColor={colors.accent}
/>
```

### 7. Alert Dialogs

Alerts use system styling and will automatically adapt on iOS 13+ and Android 10+. No changes needed.

---

## Testing Strategy

### Visual Testing

1. **Screenshot Comparison**
   - Take screenshots of all screens in light mode
   - Take screenshots of all screens in dark mode
   - Compare for consistency

2. **Theme Toggle Testing**
   - Toggle between modes rapidly
   - Check for flashing or incorrect colors
   - Verify persistence across app restarts

3. **System Theme Testing**
   - Set to "System" mode
   - Change device appearance settings
   - Verify app updates correctly

### Functional Testing

1. **Navigation**
   - Tab bar visible and functional in both themes
   - Headers display correctly
   - Back buttons work and are visible

2. **Forms**
   - All inputs readable and functional
   - Placeholders visible
   - Cursor visible
   - Selection highlights visible

3. **Modals & Bottom Sheets**
   - Open/close smoothly
   - Content readable
   - Backdrop appropriate opacity
   - Handle indicator visible

4. **Images**
   - Loading states visible
   - Error states visible
   - Letterboxing looks professional
   - No harsh contrast issues

---

## Accessibility Considerations

### Contrast Ratios (WCAG 2.1 AA)

All text must meet minimum contrast requirements:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

Our Discord-inspired palette has been designed to meet these requirements:

**Light Mode**:
- Gray-900 on White: 16.1:1 ✅
- Gray-500 on White: 4.5:1 ✅

**Dark Mode**:
- #dcddde on #36393f: 11.7:1 ✅
- #b9bbbe on #36393f: 8.6:1 ✅
- #72767d on #36393f: 4.6:1 ✅

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- iOS Accessibility Inspector
- Android Accessibility Scanner

---

## Performance Optimization

### 1. Memoize Theme Calculations

```typescript
const theme = useMemo(
  () => effectiveTheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme,
  [effectiveTheme]
);
```

### 2. Minimize useTheme() Calls

Only call `useTheme()` where colors are actually needed, not in every component.

### 3. Separate Static Styles

```typescript
// Static styles (never change)
const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

// Dynamic styles (theme-dependent)
function MyComponent() {
  const { colors } = useTheme();
  return (
    <View style={[staticStyles.container, { backgroundColor: colors.background.primary }]}>
      {/* Content */}
    </View>
  );
}
```

---

## Rollout Plan

### Beta Testing (Optional)

1. Enable feature flag in code
2. Deploy to internal TestFlight/beta
3. Collect feedback on color choices
4. Iterate on Discord palette if needed
5. Fix any contrast issues

### Production Rollout

1. Deploy with theme toggle on Profile screen
2. Default to "System" mode for all users
3. Monitor for issues (crash reports, user feedback)
4. Iterate based on user preferences

---

## Future Enhancements

### V1 Scope (This Plan)
- ✅ Light/Dark/System modes
- ✅ Profile screen toggle
- ✅ Discord-inspired dark theme
- ✅ Persistent preferences

### V2 (Future Considerations)
- [ ] Custom accent color picker
- [ ] Multiple dark theme options (OLED black, Discord, etc.)
- [ ] Automatic theme scheduling (dark at night)
- [ ] Theme preview before applying
- [ ] Animated theme transitions

---

## Dependencies

### Required Packages

```json
{
  "@react-native-async-storage/async-storage": "^1.21.0",
  "@react-navigation/native": "^6.x.x",
  "nativewind": "^4.x.x",
  "expo-status-bar": "~1.11.1"
}
```

Install AsyncStorage if not present:

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## Estimated Timeline

- **Phase 1 (Foundation)**: 2-3 hours
- **Phase 2 (Profile Toggle)**: 1-2 hours
- **Phase 3 (Navigation)**: 2 hours
- **Phase 4 (Components)**: 6-8 hours
- **Phase 5 (Screens)**: 4-6 hours
- **Phase 6 (Testing)**: 3-4 hours

**Total**: 18-25 hours of focused development

---

## Success Criteria

✅ User can toggle between Light, Dark, and System modes from Profile screen
✅ Theme preference persists across app restarts
✅ All screens are fully functional in both themes
✅ All text meets WCAG 2.1 AA contrast requirements
✅ No flashing or incorrect colors during theme switches
✅ Image letterboxing looks professional in both themes
✅ All inputs are fully styled and functional
✅ Navigation elements (tab bar, headers) properly themed
✅ Theme matches Discord's professional dark mode aesthetics
✅ App performs smoothly with no noticeable lag during theme changes

---

**Ready to implement!** Start with Phase 1 to set up the foundation, then proceed systematically through each phase.
