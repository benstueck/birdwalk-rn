# React Native Dark Mode: Pitfalls and Gotchas

**Common mistakes, edge cases, and solutions when implementing dark mode**

Generated: February 12, 2026

---

## Table of Contents

1. [Critical Issues](#1-critical-issues)
2. [Styling Problems](#2-styling-problems)
3. [Performance Issues](#3-performance-issues)
4. [Platform-Specific Gotchas](#4-platform-specific-gotchas)
5. [Third-Party Component Issues](#5-third-party-component-issues)
6. [User Experience Problems](#6-user-experience-problems)
7. [Testing Challenges](#7-testing-challenges)
8. [Solutions and Workarounds](#8-solutions-and-workarounds)

---

## 1. Critical Issues

### 1.1 ⚠️ Appearance Flash on App Startup

**Problem**: The app flashes the wrong theme for a split second on startup before applying the correct appearance. This is jarring and makes the app feel unpolished.

**Cause**:
- React Native hasn't determined the color scheme yet
- Components render with default/cached styles
- Theme determination is asynchronous

**Solution**:
```typescript
// App.tsx
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

function App() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for color scheme to be determined
    if (colorScheme !== null) {
      setIsReady(true);
    }
  }, [colorScheme]);

  // Show splash screen until theme is ready
  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* App content */}
    </NavigationContainer>
  );
}
```

**Alternative**: Use a neutral loading screen that works in both modes:
```typescript
// Neutral gray that works in both themes
<View style={{ flex: 1, backgroundColor: '#6b7280', justifyContent: 'center' }}>
  <ActivityIndicator />
</View>
```

---

### 1.2 ⚠️ Background Update Crash

**Problem**: App crashes or UI updates incorrectly when system appearance changes while app is in background.

**Cause**: React Native updates the UI based on an outdated trait collection when receiving notifications in the background.

**Solution**:
```typescript
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';

function useAppearanceGuard() {
  const appState = useRef(AppState.currentState);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Only use color scheme if app is active
  return appState.current === 'active' ? colorScheme : null;
}
```

**Key Point**: Only process appearance changes when app is in foreground.

---

### 1.3 ⚠️ Screenshot Color Flickering (iOS)

**Problem**: When taking screenshots, colors flicker between light and dark mode because iOS takes snapshots in both color schemes.

**Cause**:
- iOS captures screenshots in both appearances
- UI updates are asynchronous
- Snapshot timing conflicts with theme updates

**Solution**: Cannot be fully prevented, but can be minimized:

```typescript
// Minimize the number of async updates during theme transitions
// Use immediate style updates instead of state-based updates
const colorScheme = useColorScheme();

// ✅ GOOD - Immediate
<View style={{ backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff' }}>

// ❌ BAD - State-based (causes flicker)
const [bgColor, setBgColor] = useState('#fff');
useEffect(() => {
  setBgColor(colorScheme === 'dark' ? '#111827' : '#fff');
}, [colorScheme]);
<View style={{ backgroundColor: bgColor }}>
```

**Impact**: Low - only affects screenshots, not normal usage. Can be marked as "known iOS limitation."

---

## 2. Styling Problems

### 2.1 ❌ Caching Color Scheme Values

**Problem**: Storing the color scheme in state or memo causes stale values.

```typescript
// ❌ WRONG - Will not update when system preference changes
function MyComponent() {
  const [theme] = useState(useColorScheme());
  // Theme is now locked to initial value!
}

// ❌ ALSO WRONG - Memoized value won't update
function MyComponent() {
  const colorScheme = useMemo(() => useColorScheme(), []);
}
```

**Solution**: Always call `useColorScheme()` on every render or at component level where re-renders are acceptable:

```typescript
// ✅ CORRECT
function MyComponent() {
  const colorScheme = useColorScheme();
  // Updates on every render when scheme changes
}
```

---

### 2.2 ❌ Using StyleSheet.create with Theme Colors

**Problem**: StyleSheets are computed once and cached, so theme-dependent colors never update.

```typescript
// ❌ WRONG - Colors will never change
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // Hardcoded!
    borderColor: '#e5e7eb',     // Never updates!
  },
});

function MyComponent() {
  return <View style={styles.container} />;
}
```

**Solution**: Use dynamic styles for colors, StyleSheet for layout:

```typescript
// ✅ CORRECT
const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
});

function MyComponent() {
  const isDark = useColorScheme() === 'dark';

  const colorStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    borderColor: isDark ? '#374151' : '#e5e7eb',
  };

  return <View style={[layoutStyles.container, colorStyle]} />;
}
```

---

### 2.3 ❌ Forgetting Dark Variants

**Problem**: Using NativeWind classes without `dark:` variants.

```typescript
// ❌ INCOMPLETE - Works in light mode, broken in dark mode
<View className="bg-white">
  <Text className="text-gray-900">Hello</Text>
</View>

// ✅ COMPLETE - Works in both modes
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-gray-100">Hello</Text>
</View>
```

**Prevention**: Code review checklist item - every color class needs a dark variant.

---

### 2.4 ❌ Inconsistent Color Naming

**Problem**: Using lightness/darkness in variable names makes them incorrect in one mode.

```typescript
// ❌ CONFUSING
const colors = {
  lightBackground: '#ffffff', // Is this light mode background or a light-colored background?
  darkText: '#000000',        // Dark-colored text or dark mode text?
  brightAccent: '#00ff00',    // What's this in dark mode?
};

// In dark mode, "lightBackground" would be dark - confusing!
```

**Solution**: Use semantic names:

```typescript
// ✅ CLEAR
const colors = {
  background: {
    primary: isDark ? '#111827' : '#ffffff',
    secondary: isDark ? '#1f2937' : '#f9fafb',
  },
  text: {
    primary: isDark ? '#f9fafb' : '#111827',
    secondary: isDark ? '#d1d5db' : '#6b7280',
  },
  accent: isDark ? '#3b82f6' : '#2563eb',
};
```

---

### 2.5 ❌ Shadows in Dark Mode

**Problem**: Shadows are invisible or look wrong in dark mode.

```typescript
// ❌ LOOKS BAD - Shadow not visible in dark mode
<View style={{
  backgroundColor: '#1f2937',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}}>
```

**Solutions**:

**Option 1**: Use borders instead of shadows in dark mode:
```typescript
const isDark = useColorScheme() === 'dark';

<View style={{
  backgroundColor: isDark ? '#1f2937' : '#ffffff',
  ...(isDark ? {
    borderWidth: 1,
    borderColor: '#374151',
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
}}>
```

**Option 2**: Use lighter shadow in dark mode:
```typescript
<View style={{
  backgroundColor: isDark ? '#1f2937' : '#ffffff',
  shadowColor: isDark ? '#fff' : '#000',
  shadowOpacity: isDark ? 0.1 : 0.2,
  shadowRadius: 4,
  elevation: 3,
}}>
```

**Option 3**: Use NativeWind shadow classes with dark variants:
```typescript
<View className="bg-white dark:bg-gray-800 shadow-md dark:shadow-none dark:border dark:border-gray-700">
```

---

## 3. Performance Issues

### 3.1 ⚠️ Excessive Re-renders

**Problem**: Every component using `useColorScheme()` re-renders when theme changes, even if they don't need to.

**Impact**: Stuttering when switching themes, poor performance.

**Solution**: Minimize the number of components calling `useColorScheme()`:

```typescript
// ❌ BAD - Every component subscribes to theme changes
function Parent() {
  const colorScheme = useColorScheme();
  return <Child />;
}

function Child() {
  const colorScheme = useColorScheme(); // Redundant subscription
  return <GrandChild />;
}

function GrandChild() {
  const colorScheme = useColorScheme(); // Another redundant subscription
}

// ✅ BETTER - Call once at root and pass via props or use NativeWind classes
function Parent() {
  const colorScheme = useColorScheme();
  return (
    <View className="bg-white dark:bg-gray-900">
      <Child />
    </View>
  );
}

function Child() {
  // No useColorScheme call - uses parent's styling
  return (
    <View className="bg-gray-50 dark:bg-gray-800">
      <GrandChild />
    </View>
  );
}
```

---

### 3.2 ⚠️ Recreating Styles on Every Render

**Problem**: Creating new style objects on every render causes unnecessary work.

```typescript
// ❌ EXPENSIVE
function MyComponent() {
  const isDark = useColorScheme() === 'dark';

  // New objects created on EVERY render
  return (
    <View style={{
      flex: 1,
      padding: 16,
      backgroundColor: isDark ? '#111827' : '#fff',
      borderRadius: 8,
    }}>
```

**Solution**: Separate static and dynamic styles:

```typescript
// ✅ OPTIMIZED
const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
});

function MyComponent() {
  const isDark = useColorScheme() === 'dark';

  // Only backgroundColor changes
  return (
    <View style={[
      staticStyles.container,
      { backgroundColor: isDark ? '#111827' : '#fff' },
    ]}>
```

---

### 3.3 ⚠️ Not Memoizing Theme Objects

**Problem**: Creating new navigation theme objects on every render.

```typescript
// ❌ CAUSES UNNECESSARY RE-RENDERS
function App() {
  const colorScheme = useColorScheme();

  // New theme object every render!
  const theme = colorScheme === 'dark' ? {
    dark: true,
    colors: { /* ... */ },
  } : {
    dark: false,
    colors: { /* ... */ },
  };

  return <NavigationContainer theme={theme}>{/* ... */}</NavigationContainer>;
}
```

**Solution**: Use `useMemo`:

```typescript
// ✅ MEMOIZED
function App() {
  const colorScheme = useColorScheme();

  const theme = useMemo(
    () => colorScheme === 'dark' ? DarkTheme : LightTheme,
    [colorScheme]
  );

  return <NavigationContainer theme={theme}>{/* ... */}</NavigationContainer>;
}
```

---

## 4. Platform-Specific Gotchas

### 4.1 iOS: Status Bar Style Requires View Controller

**Problem**: `StatusBar.setBarStyle()` doesn't work on iOS without proper configuration.

**Solution**: Add to Info.plist:
```xml
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

Or use the StatusBar component declaratively:
```typescript
<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
```

---

### 4.2 Android: System UI Inconsistencies

**Problem**: Android navigation bar doesn't automatically adapt to dark mode.

**Solution**: Set navigation bar color:
```typescript
import { StatusBar, Platform } from 'react-native';
import { NavigationBar } from 'react-native-bars';

function App() {
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(isDark ? '#111827' : '#ffffff');
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [isDark]);
}
```

---

### 4.3 Android: Splash Screen Doesn't Respect Theme

**Problem**: Android splash screen always shows in light mode.

**Solution**: Create separate splash screens in `res/values/styles.xml` and `res/values-night/styles.xml`:

```xml
<!-- res/values/styles.xml -->
<style name="AppTheme">
  <item name="android:windowBackground">@color/splash_background_light</item>
</style>

<!-- res/values-night/styles.xml -->
<style name="AppTheme">
  <item name="android:windowBackground">@color/splash_background_dark</item>
</style>
```

---

## 5. Third-Party Component Issues

### 5.1 Bottom Sheet (gorhom)

**Problem**: Bottom sheet background doesn't automatically adapt to dark mode.

**Solution**: Pass dynamic background props:

```typescript
import BottomSheet from '@gorhom/bottom-sheet';

function MyComponent() {
  const isDark = useColorScheme() === 'dark';

  return (
    <BottomSheet
      backgroundStyle={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#9ca3af' : '#d1d5db',
      }}
    >
      {/* Content */}
    </BottomSheet>
  );
}
```

---

### 5.2 Modal Components

**Problem**: React Native's Modal component doesn't inherit parent styles.

**Solution**: Explicitly style modal content:

```typescript
import { Modal } from 'react-native';

function MyModal({ visible, onClose }) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
      }}>
        <View style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          margin: 20,
          borderRadius: 12,
          padding: 16,
        }}>
          {/* Content */}
        </View>
      </View>
    </Modal>
  );
}
```

---

### 5.3 TextInput Quirks

**Problem**: TextInput doesn't automatically adapt colors and requires explicit styling for every color property.

**Must Style**:
- `style.color` - Text color
- `style.backgroundColor` - Background
- `style.borderColor` - Border
- `placeholderTextColor` prop - Placeholder text
- `selectionColor` prop - Selection highlight (iOS)
- `underlineColorAndroid` prop - Underline color (Android)
- `cursorColor` prop - Cursor color (Android API 29+)

**Complete Example**:
```typescript
const isDark = useColorScheme() === 'dark';

<TextInput
  style={{
    color: isDark ? '#f3f4f6' : '#111827',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  }}
  placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
  selectionColor={isDark ? '#3b82f6' : '#2563eb'}
  underlineColorAndroid="transparent"
  cursorColor={isDark ? '#3b82f6' : '#2563eb'}
/>
```

---

## 6. User Experience Problems

### 6.1 ❌ Jarring Theme Transitions

**Problem**: Abrupt color changes when switching themes feel harsh.

**Solution**: Add subtle transitions (optional, use sparingly):

```typescript
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated';

function AnimatedContainer() {
  const colorScheme = useColorScheme();

  const backgroundColor = useDerivedValue(() => {
    return withTiming(colorScheme === 'dark' ? '#111827' : '#ffffff', {
      duration: 200,
    });
  });

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  return <Animated.View style={animatedStyle}>{/* Content */}</Animated.View>;
}
```

**Note**: Use this sparingly - most apps don't need animated transitions.

---

### 6.2 ❌ Missing Theme Toggle UI

**Problem**: If implementing manual theme switching, forgetting to add UI for it makes the feature useless.

**Solution**: Add clear settings option:

```typescript
import { useColorScheme, setColorScheme } from 'nativewind';

function ThemeSettings() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Appearance
      </Text>
      <TouchableOpacity onPress={() => setColorScheme('light')}>
        <Text>☀️ Light</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('dark')}>
        <Text>🌙 Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setColorScheme('system')}>
        <Text>⚙️ System</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 6.3 ❌ Insufficient Contrast

**Problem**: Colors that look good in light mode may have poor contrast in dark mode.

**WCAG Requirements**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Testing**: Use color contrast checkers:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

**Solution**: Test and adjust colors:

```typescript
// ❌ POOR CONTRAST in dark mode
text: {
  primary: isDark ? '#6b7280' : '#111827', // Only 4.1:1 on dark background
}

// ✅ GOOD CONTRAST in both modes
text: {
  primary: isDark ? '#f9fafb' : '#111827', // 15.8:1 in dark, 15.8:1 in light
  secondary: isDark ? '#d1d5db' : '#6b7280', // 8.3:1 in dark, 4.5:1 in light
}
```

---

## 7. Testing Challenges

### 7.1 Switching Themes During Development

**iOS Simulator**:
```bash
# Switch to dark mode
xcrun simctl ui booted appearance dark

# Switch to light mode
xcrun simctl ui booted appearance light
```

**Android Emulator**:
```bash
# Switch to dark mode
adb shell "cmd uimode night yes"

# Switch to light mode
adb shell "cmd uimode night no"
```

---

### 7.2 Automated Testing

**Problem**: Jest tests don't have access to system appearance.

**Solution**: Mock useColorScheme:

```typescript
// __mocks__/react-native.ts
const actualRN = jest.requireActual('react-native');

module.exports = {
  ...actualRN,
  useColorScheme: jest.fn(() => 'light'),
};

// In tests
import { useColorScheme } from 'react-native';

describe('MyComponent', () => {
  it('renders in dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    // Test dark mode rendering
  });

  it('renders in light mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    // Test light mode rendering
  });
});
```

---

### 7.3 Visual Regression Testing

**Challenge**: Need to capture screenshots in both themes.

**Approach**:
```typescript
// e2e/helpers.ts
export async function setAppearance(mode: 'light' | 'dark') {
  if (device.getPlatform() === 'ios') {
    await device.launchArgs({
      '-UIUserInterfaceStyle': mode === 'dark' ? 'Dark' : 'Light',
    });
  } else {
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
  }
}

// e2e/tests/theme.e2e.ts
describe('Theme', () => {
  it('should render correctly in light mode', async () => {
    await setAppearance('light');
    await expect(element(by.id('home-screen'))).toBeVisible();
    // Take screenshot
  });

  it('should render correctly in dark mode', async () => {
    await setAppearance('dark');
    await expect(element(by.id('home-screen'))).toBeVisible();
    // Take screenshot
  });
});
```

---

## 8. Solutions and Workarounds

### 8.1 Quick Reference: Common Fixes

| Problem | Solution |
|---------|----------|
| Flash on startup | Add loading screen until theme determined |
| Background crash | Guard appearance changes with AppState check |
| Cached color scheme | Never cache - call useColorScheme() fresh |
| StyleSheet not updating | Use dynamic styles for colors, StyleSheet for layout |
| Shadows invisible | Use borders in dark mode or lighter shadows |
| Poor contrast | Test with WCAG tools, adjust colors |
| TextInput not adapting | Explicitly style all color props |
| Bottom sheet dark mode | Pass backgroundStyle and handleIndicatorStyle |
| Status bar wrong color | Use dynamic barStyle based on colorScheme |
| Navigation bar (Android) | Manually set navigation bar colors |

---

### 8.2 Pre-Implementation Checklist

**Before you start implementing dark mode**:

- [ ] Audit all hardcoded colors in the app
- [ ] Identify third-party components that need configuration
- [ ] Decide on approach (system preference vs manual toggle)
- [ ] Create color palette for both themes
- [ ] Test color contrast ratios
- [ ] Plan for splash screen handling
- [ ] Consider navigation structure (per-screen StatusBar?)
- [ ] Allocate time for thorough testing

---

### 8.3 Code Review Checklist

**When reviewing dark mode implementation**:

- [ ] Every `className` color has a `dark:` variant
- [ ] No cached `useColorScheme()` values
- [ ] No theme-dependent colors in `StyleSheet.create()`
- [ ] TextInput has all color props set
- [ ] Third-party components configured for dark mode
- [ ] StatusBar adapts correctly
- [ ] Navigation theme applied correctly
- [ ] Shadows handled appropriately
- [ ] Modals and overlays styled correctly
- [ ] Loading states work in both themes
- [ ] Error states work in both themes
- [ ] Tested on both iOS and Android
- [ ] Tested theme switching while app running

---

## Sources

- [Marcus Ellison: How I Fixed Light/Dark Mode in React Native](https://www.markie.dev/blog/react_native)
- [CodeZup: Implementing Dark Mode React Native Best Practices](https://codezup.com/implementing-dark-mode-react-native-best-practices/)
- [LogRocket: Comprehensive Guide to Dark Mode in React Native](https://blog.logrocket.com/comprehensive-guide-dark-mode-react-native/)
- [React Native Appearance Documentation](https://reactnative.dev/docs/appearance)
- [Medium: Adding Dark Theme Support to Existing React Native App](https://medium.com/@litinskii/adding-dark-theme-support-to-an-existing-react-native-app-7cffe753e2a5)
- [NativeWind Dark Mode Documentation](https://www.nativewind.dev/docs/core-concepts/dark-mode)

---

**Document version**: 1.0
**Last updated**: February 12, 2026
**Critical issues identified**: 3
**Common pitfalls documented**: 15+
