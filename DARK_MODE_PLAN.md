# Dark Mode Implementation Plan

## Overview
Add dark mode support to the BirdWalk app with a toggle on the ProfileScreen. Uses NativeWind's `dark:` variants and follows TDD approach (tests first).

## Dependencies to Install
```bash
npm install @react-native-async-storage/async-storage
```

## Files to Create

### 1. Theme Types
**`src/types/theme.ts`**
- `ColorScheme`: 'light' | 'dark' | 'system'
- `ResolvedTheme`: 'light' | 'dark'
- `ThemeContextType` interface

### 2. Color Constants
**`src/constants/colors.ts`**
- Light/dark color palettes following Material Design 3 guidelines:
  - **Dark backgrounds**: `#0F0F0F` (main), `#1C1C1E` (surface), `#2C2C2E` (elevated)
  - **Dark text**: `#F9FAFB` (primary), `#9CA3AF` (secondary)
  - **Dark borders**: `#374151`

### 3. ThemeContext
**`src/contexts/ThemeContext.tsx`**
- Follow AuthContext.tsx pattern (lines 1-75)
- Persist preference to AsyncStorage
- Export `ThemeProvider` and `useTheme` hook
- Support system theme detection via `useColorScheme` from react-native

### 4. Theme Color Hook
**`src/hooks/useThemeColor.ts`**
- Helper for inline styles that need theme-aware colors

## Files to Modify

### App.tsx
- Wrap with `ThemeProvider` (after AuthProvider)
- Update StatusBar: `style={isDark ? 'light' : 'dark'}`

### tailwind.config.js
- Add `darkMode: 'class'` for NativeWind class-based dark mode

### ProfileScreen.tsx
- Add "Appearance" section with 3-way segmented control: Light | Dark | System
- Place between stats and Sign Out button

### All Screens (8 total)
Add `dark:` class variants to existing Tailwind classes:
- `LoginScreen.tsx` - inputs, text, backgrounds
- `SignupScreen.tsx` - same pattern
- `WalksListScreen.tsx` - backgrounds, cards, FAB
- `WalkDetailScreen.tsx` - headers, lists
- `LifersScreen.tsx` - cards, text
- `ProfileScreen.tsx` - stats cards, toggle
- `SearchScreen.tsx` - search results
- `NewWalkScreen.tsx` - form inputs

### All Components (15+)
- `WalkCard.tsx`, `SightingCard.tsx`, `LiferCard.tsx`
- `SearchBar.tsx`, `BirdImage.tsx`, `SkeletonBar.tsx`
- `SortButton.tsx`, `WalkOptionsButton.tsx`

### All Modals (7)
- `NewWalkModal.tsx`, `EditWalkModal.tsx`
- `NewSightingModal.tsx`, `SightingModal.tsx`, `EditSightingModal.tsx`
- `LiferModal.tsx`, `SortBottomSheet.tsx`
- Update `backgroundStyle` and `handleIndicatorStyle` for bottom sheets

### Navigation
- `MainNavigator.tsx` - tab bar colors
- `WalksStackNavigator.tsx` - header colors

## Color Mapping Reference
| Light | Dark |
|-------|------|
| `bg-gray-50` | `dark:bg-neutral-900` |
| `bg-white` | `dark:bg-neutral-800` |
| `bg-gray-900` | `dark:bg-gray-50` |
| `text-gray-900` | `dark:text-gray-50` |
| `text-gray-600` | `dark:text-gray-300` |
| `border-gray-200` | `dark:border-gray-700` |

## Test Files to Create (TDD - Write Before Implementation)

### Phase 1: Core Tests
1. **`src/__tests__/contexts/ThemeContext.test.tsx`**
   - ThemeProvider default behavior
   - AsyncStorage persistence
   - System theme resolution
   - setColorScheme and toggleTheme functions

2. **`src/__tests__/hooks/useThemeColor.test.ts`**
   - Returns correct color for light/dark modes

### Phase 2: Screen Tests
3. **`src/__tests__/screens/ProfileScreen.test.tsx`**
   - Renders theme toggle section
   - Toggle updates theme state
   - Shows current selection

4. **`src/__tests__/screens/LoginScreen.test.tsx`**
   - Renders correctly in light mode
   - Renders correctly in dark mode

5. **`src/__tests__/screens/WalksListScreen.test.tsx`**
   - Dark mode background/text colors

### Phase 3: Component Tests
6. **`src/__tests__/components/WalkCard.test.tsx`**
7. **`src/__tests__/components/SightingCard.test.tsx`**
8. **`src/__tests__/components/LiferCard.test.tsx`**

## Implementation Order

### Step 1: Foundation (TDD)
1. Install AsyncStorage dependency
2. Create `src/types/theme.ts`
3. Create `src/constants/colors.ts`
4. Write `ThemeContext.test.tsx` tests
5. Implement `ThemeContext.tsx`
6. Update `tailwind.config.js`
7. Integrate ThemeProvider in `App.tsx`

### Step 2: ProfileScreen Toggle (TDD)
1. Write `ProfileScreen.test.tsx` tests for toggle
2. Implement toggle UI in `ProfileScreen.tsx`

### Step 3: Screens (TDD for each)
1. Write screen test
2. Add `dark:` variants to screen
3. Update inline styles using `useTheme`

### Step 4: Components & Modals
1. Write component tests
2. Add `dark:` variants
3. Update bottom sheet background styles

### Step 5: Navigation
1. Update header/tab bar theme colors

## Verification
1. Run `npm test` - all tests pass
2. Run app on device/simulator
3. Toggle dark mode from ProfileScreen
4. Verify all screens update immediately
5. Kill and restart app - preference persists
6. Test "System" option follows device setting
