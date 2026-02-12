# Third-Party Component Dark Mode Integration

**Specific guidance for React Navigation, gorhom/bottom-sheet, and other third-party components**

Generated: February 12, 2026

---

## Table of Contents

1. [React Navigation](#1-react-navigation)
2. [gorhom/bottom-sheet](#2-gorhombottom-sheet)
3. [StatusBar & System UI](#3-statusbar--system-ui)
4. [General Third-Party Strategy](#4-general-third-party-strategy)

---

## 1. React Navigation

### 1.1 Overview

React Navigation has excellent built-in dark mode support with predefined theme objects and full customization options.

**Key Concepts**:
- NavigationContainer accepts a `theme` prop
- Themes are TypeScript objects with specific structure
- Two built-in themes: `DefaultTheme` and `DarkTheme`
- Fully customizable for brand requirements

---

### 1.2 Basic Implementation

**Import themes**:
```typescript
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { useColorScheme } from 'react-native';
```

**Apply theme**:
```typescript
function App() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Your navigation structure */}
    </NavigationContainer>
  );
}
```

**That's it!** React Navigation will automatically apply appropriate colors to:
- Tab bars
- Headers
- Drawer navigation
- Card backgrounds
- Text colors
- Border colors

---

### 1.3 Theme Object Structure

**Complete Theme Interface**:
```typescript
type Theme = {
  dark: boolean;           // Whether this is a dark theme
  colors: {
    primary: string;       // Primary accent color (active tabs, buttons)
    background: string;    // Background color for screens
    card: string;          // Background for card-like elements (headers, tab bars)
    text: string;          // Primary text color
    border: string;        // Border color
    notification: string;  // Badge/notification color
  };
};
```

**DefaultTheme Colors**:
```typescript
{
  dark: false,
  colors: {
    primary: 'rgb(0, 122, 255)',
    background: 'rgb(242, 242, 242)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
}
```

**DarkTheme Colors**:
```typescript
{
  dark: true,
  colors: {
    primary: 'rgb(10, 132, 255)',
    background: 'rgb(1, 1, 1)',
    card: 'rgb(18, 18, 18)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
}
```

---

### 1.4 Custom Themes (Recommended for BirdWalk)

**Create custom theme objects matching your app's design**:

```typescript
// theme.ts
import { Theme } from '@react-navigation/native';

export const CustomLightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#111827',       // Gray-900 for active elements
    background: '#f9fafb',    // Gray-50 for screen backgrounds
    card: '#ffffff',          // White for headers/tab bar
    text: '#111827',          // Gray-900 for primary text
    border: '#e5e7eb',        // Gray-200 for borders
    notification: '#ef4444',  // Red for notifications
  },
};

export const CustomDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#f9fafb',       // Light text for active elements
    background: '#111827',    // Gray-900 for screen backgrounds
    card: '#1f2937',          // Gray-800 for headers/tab bar
    text: '#f9fafb',          // Light gray for primary text
    border: '#374151',        // Gray-700 for borders
    notification: '#ef4444',  // Red for notifications (same in both)
  },
};
```

**Usage**:
```typescript
import { CustomLightTheme, CustomDarkTheme } from './theme';

function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  return (
    <NavigationContainer theme={theme}>
      {/* Navigation */}
    </NavigationContainer>
  );
}
```

---

### 1.5 Extending Default Themes

**If you only want to change a few colors**:

```typescript
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#111827',      // Override just primary
    card: '#ffffff',         // Override just card
    // Rest stay as DefaultTheme
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#f9fafb',
    card: '#1f2937',
  },
};
```

---

### 1.6 Custom Theme Properties

**You can add custom color properties beyond the standard ones**:

```typescript
type CustomTheme = Theme & {
  colors: Theme['colors'] & {
    success: string;
    warning: string;
    error: string;
    surface: string;
  };
};

const CustomLightTheme: CustomTheme = {
  dark: false,
  colors: {
    primary: '#111827',
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    notification: '#ef4444',
    // Custom properties
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#f3f4f6',
  },
};
```

**Access in components using useTheme**:
```typescript
import { useTheme } from '@react-navigation/native';

function MyComponent() {
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.card }}>
      <Text style={{ color: colors.text }}>Hello</Text>
      <View style={{ backgroundColor: colors.success }}>
        <Text>Success!</Text>
      </View>
    </View>
  );
}
```

---

### 1.7 Tab Navigator Styling

**Basic tab bar theming** (already handled by NavigationContainer theme):
```typescript
<Tab.Navigator>
  {/* Tabs automatically use theme colors */}
</Tab.Navigator>
```

**Advanced tab bar customization**:
```typescript
<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: '#111827',      // Override active color
    tabBarInactiveTintColor: '#9ca3af',    // Override inactive color
    tabBarStyle: {
      backgroundColor: '#ffffff',           // Override background
      borderTopColor: '#e5e7eb',           // Override border
      borderTopWidth: 1,
    },
    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: '#111827',
    headerShadowVisible: false,
  }}
>
```

**Dynamic tab bar styling based on theme**:
```typescript
function MainNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#f9fafb' : '#111827',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
        },
        headerTintColor: isDark ? '#f9fafb' : '#111827',
        headerShadowVisible: false,
      }}
    >
      {/* Tabs */}
    </Tab.Navigator>
  );
}
```

---

### 1.8 Stack Navigator Styling

**Stack headers automatically use theme**, but you can override:

```typescript
<Stack.Navigator
  screenOptions={({ navigation }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return {
      headerStyle: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      },
      headerTintColor: isDark ? '#f9fafb' : '#111827',
      headerTitleStyle: {
        fontWeight: '600',
      },
      headerShadowVisible: false,
      // Custom back button
      headerBackTitleVisible: false,
    };
  }}
>
```

---

### 1.9 Per-Screen Header Customization

**Override header for specific screens**:

```typescript
<Stack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    headerStyle: {
      backgroundColor: '#ef4444', // Custom red header
    },
    headerTintColor: '#ffffff',
  }}
/>
```

---

### 1.10 Accessing Theme in Screens

**Use the useTheme hook**:

```typescript
import { useTheme } from '@react-navigation/native';

function MyScreen() {
  const { colors, dark } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {dark ? 'Dark' : 'Light'}
      </Text>
    </View>
  );
}
```

---

### 1.11 Performance Optimization

**Memoize theme selection**:

```typescript
import { useMemo } from 'react';

function App() {
  const colorScheme = useColorScheme();

  const theme = useMemo(
    () => colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme,
    [colorScheme]
  );

  return <NavigationContainer theme={theme}>{/* ... */}</NavigationContainer>;
}
```

This prevents creating new theme objects on every render.

---

## 2. gorhom/bottom-sheet

### 2.1 Overview

The `@gorhom/bottom-sheet` library requires explicit dark mode configuration. It doesn't automatically detect or adapt to system appearance.

**Key Challenge**: Background colors and handle indicators need manual theming.

---

### 2.2 Basic Dark Mode Setup

**Configure background and handle**:

```typescript
import BottomSheet from '@gorhom/bottom-sheet';
import { useColorScheme } from 'react-native';

function MyComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BottomSheet
      snapPoints={['25%', '50%', '90%']}
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

### 2.3 Custom Backdrop

**The backdrop (dim overlay) also needs theming**:

```typescript
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';

function MyComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDark ? 0.8 : 0.5}  // Darker backdrop in dark mode
      />
    ),
    [isDark]
  );

  return (
    <BottomSheet
      snapPoints={['25%', '50%', '90%']}
      backgroundStyle={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#9ca3af' : '#d1d5db',
      }}
      backdropComponent={renderBackdrop}
    >
      {/* Content */}
    </BottomSheet>
  );
}
```

---

### 2.4 Custom Background Component

**For advanced styling (gradients, borders, etc.)**:

```typescript
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';

function CustomBackground({ style }: BottomSheetBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        style,
        {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
        },
      ]}
    />
  );
}

// Usage
<BottomSheet
  backgroundComponent={CustomBackground}
  // ...
>
```

---

### 2.5 BottomSheetModal

**For modal variant, same theming applies**:

```typescript
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

function MyComponent() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={['25%', '50%', '90%']}
      backgroundStyle={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#9ca3af' : '#d1d5db',
      }}
    >
      {/* Modal content */}
    </BottomSheetModal>
  );
}
```

---

### 2.6 Content Styling

**Remember to style the content inside the bottom sheet**:

```typescript
<BottomSheet {...props}>
  <View className="flex-1 bg-white dark:bg-gray-800 p-4">
    <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Title
    </Text>
    <Text className="text-gray-600 dark:text-gray-400">
      Description text
    </Text>
  </View>
</BottomSheet>
```

---

### 2.7 BirdWalk Usage Example

**SortBottomSheet.tsx should use**:

```typescript
import BottomSheet from '@gorhom/bottom-sheet';
import { useColorScheme } from 'react-native';

export function SortBottomSheet({ isVisible, onClose, options, selected, onSelect }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['40%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#9ca3af' : '#d1d5db',
      }}
    >
      <View className="p-4">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={selected === option.value
              ? 'bg-gray-900 dark:bg-gray-100'
              : 'bg-gray-100 dark:bg-gray-800'
            }
          >
            <Text className={selected === option.value
              ? 'text-white dark:text-gray-900'
              : 'text-gray-900 dark:text-gray-100'
            }>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}
```

---

## 3. StatusBar & System UI

### 3.1 StatusBar Component

**Basic dynamic StatusBar**:

```typescript
import { StatusBar } from 'react-native';
import { useColorScheme } from 'react-native';

function App() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {/* Rest of app */}
    </>
  );
}
```

**barStyle values**:
- `'default'` - Platform default (often light-content)
- `'light-content'` - White text/icons (for dark backgrounds)
- `'dark-content'` - Dark text/icons (for light backgrounds)

---

### 3.2 Expo StatusBar (Recommended for BirdWalk)

**If using Expo, use expo-status-bar**:

```typescript
import { StatusBar } from 'expo-status-bar';

function App() {
  return (
    <>
      <StatusBar style="auto" />
      {/* auto automatically picks light/dark based on color scheme */}
    </>
  );
}
```

**style values**:
- `'auto'` - Automatically adapts (recommended)
- `'light'` - White text
- `'dark'` - Dark text
- `'inverted'` - Opposite of current scheme

---

### 3.3 Per-Screen StatusBar

**Change StatusBar for specific screens**:

```typescript
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'react-native';

function MyScreen() {
  const colorScheme = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        colorScheme === 'dark' ? 'light-content' : 'dark-content'
      );

      // Cleanup
      return () => {
        // Reset to default if needed
      };
    }, [colorScheme])
  );

  return (/* Screen content */);
}
```

---

### 3.4 iOS Configuration

**Info.plist setting** (for imperative StatusBar.setBarStyle):

```xml
<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

**Or use declarative approach** (no config needed):
```typescript
<StatusBar barStyle="light-content" />
```

---

### 3.5 Android Navigation Bar (API 26+)

**Match navigation bar to theme** (requires react-native-bars or similar):

```typescript
import { NavigationBar } from 'react-native-bars';
import { Platform } from 'react-native';

function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(isDark ? '#111827' : '#ffffff');
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [isDark]);
}
```

**Note**: BirdWalk may not have react-native-bars installed. Consider adding it or using Expo's built-in solution.

---

### 3.6 Safe Area Handling

**SafeAreaView should adapt background**:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

function MyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Content */}
    </SafeAreaView>
  );
}
```

---

## 4. General Third-Party Strategy

### 4.1 Component Audit Process

**When encountering a third-party component**:

1. **Check Documentation**: Look for "dark mode", "theme", "appearance" in docs
2. **Look for Style Props**: `style`, `contentStyle`, `backgroundColor` props
3. **Check for Theme Props**: Some libraries accept theme objects
4. **Test Both Modes**: Always test in both light and dark mode
5. **Consider Alternatives**: If component doesn't support dark mode, find alternative

---

### 4.2 Common Theming Patterns

**Most libraries use one of these patterns**:

1. **Style Props** (most common):
   ```typescript
   <ThirdPartyComponent
     style={{ backgroundColor: isDark ? '#1f2937' : '#fff' }}
   />
   ```

2. **Theme Prop**:
   ```typescript
   <ThirdPartyComponent theme={isDark ? 'dark' : 'light'} />
   ```

3. **Theme Object**:
   ```typescript
   <ThirdPartyComponent
     theme={{
       colors: {
         background: isDark ? '#1f2937' : '#fff',
       },
     }}
   />
   ```

4. **Context Provider**:
   ```typescript
   <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
     <ThirdPartyComponent />
   </ThemeProvider>
   ```

---

### 4.3 When Components Don't Support Dark Mode

**Strategies**:

1. **Wrapper Component**:
   ```typescript
   function ThemedThirdParty(props) {
     const isDark = useColorScheme() === 'dark';

     return (
       <View style={{ backgroundColor: isDark ? '#1f2937' : '#fff' }}>
         <ThirdPartyComponent {...props} />
       </View>
     );
   }
   ```

2. **Fork and Modify**: If critical component, consider forking
3. **Find Alternative**: Look for better-maintained alternatives
4. **File Issue/PR**: Contribute dark mode support upstream

---

### 4.4 Testing Third-Party Components

**Checklist for each third-party component**:

- [ ] Component renders in light mode
- [ ] Component renders in dark mode
- [ ] Colors have sufficient contrast
- [ ] Borders/shadows are visible
- [ ] Interactive states (hover, press, focus) work
- [ ] Modals/overlays have appropriate backdrop
- [ ] Loading states are visible
- [ ] Error states are visible
- [ ] Animations don't reveal theme inconsistencies

---

### 4.5 BirdWalk Third-Party Inventory

**Components requiring dark mode configuration**:

1. ✅ **React Navigation** - Built-in support, needs theme object
2. ✅ **@gorhom/bottom-sheet** - Requires backgroundStyle and handleIndicatorStyle
3. ⚠️ **StatusBar** - Needs dynamic barStyle
4. ❓ **Any image libraries** - Check placeholder/loading state colors
5. ❓ **Form libraries** - Check input styling
6. ❓ **Icon libraries** - Ensure icons adapt or use proper colors

---

## Sources

- [React Navigation: Themes Documentation](https://reactnavigation.org/docs/themes/)
- [Medium: Supporting Dark Mode with React Navigation](https://medium.com/@r.mataityte/supporting-dark-mode-in-react-native-with-a-little-help-from-react-navigation-d47160cdb086)
- [gorhom/bottom-sheet: Theming Discussion](https://github.com/gorhom/react-native-bottom-sheet/issues/660)
- [gorhom/bottom-sheet: Background Color Discussions](https://github.com/gorhom/react-native-bottom-sheet/discussions/386)
- [gorhom/bottom-sheet: Custom Background Documentation](https://gorhom.dev/react-native-bottom-sheet/custom-background)
- [React Native StatusBar Documentation](https://reactnative.dev/docs/statusbar)
- [Expo StatusBar Documentation](https://docs.expo.dev/versions/latest/sdk/status-bar/)
- [LogRocket: Customizing React Native Status Bar](https://blog.logrocket.com/customizing-react-native-status-bar-route/)

---

**Document version**: 1.0
**Last updated**: February 12, 2026
**Components covered**: React Navigation, gorhom/bottom-sheet, StatusBar
