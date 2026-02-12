# Dark Mode Interface Inventory

**Complete audit of all visual interfaces requiring dark mode support in BirdWalk React Native app**

Generated: February 12, 2026

---

## Executive Summary

- **Total Files Requiring Updates**: 28 TypeScript/TSX files
- **Screens**: 8
- **Components**: 15
- **Navigation Files**: 4
- **Root File**: 1 (App.tsx)

**Key Challenge**: App uses a hybrid styling approach with NativeWind/Tailwind classes and inline styles, with 58+ instances of hardcoded hex color values.

---

## 1. SCREENS (8 Total)

### Authentication Screens

#### 1.1 LoginScreen
**File**: `/src/screens/LoginScreen.tsx`

**Colors Used**:
- Background: `bg-white`
- Text: `#111827` (gray-900)
- Input borders: `#d1d5db` (gray-300)
- Placeholder text: `#9ca3af` (gray-400)
- Error message background: `bg-red-100`
- Error message text: `text-red-600`
- Button background: `bg-gray-900`
- Button text: `text-white`

**Dark Mode Requirements**:
- Main background needs dark equivalent
- Input fields need dark backgrounds with lighter borders
- Error messages need dark-compatible red shades
- Primary button needs inverse styling in dark mode

---

#### 1.2 SignupScreen
**File**: `/src/screens/SignupScreen.tsx`

**Colors Used**:
- All colors from LoginScreen
- Success message: `bg-gray-100`

**Dark Mode Requirements**:
- Same as LoginScreen
- Success message box needs dark background

---

### Main Application Screens

#### 1.3 WalksListScreen
**File**: `/src/screens/WalksListScreen.tsx`

**Colors Used**:
- Background: `bg-gray-50`
- Card/Header backgrounds: `bg-white`
- Borders: `border-gray-200`
- Loading spinner: `#111827`

**Dark Mode Requirements**:
- Gray-50 background → dark gray/black
- White cards → dark card background
- Borders need to be visible in dark mode
- Loading spinner needs light color in dark mode

---

#### 1.4 WalkDetailScreen
**File**: `/src/screens/WalkDetailScreen.tsx`

**Colors Used**:
- Background: `bg-gray-50`
- Header section: `bg-white`
- Borders: gray variants
- Badge backgrounds: `bg-gray-100`
- Back button icon: `#111827`
- Text: `text-gray-900`, `text-gray-500`

**Dark Mode Requirements**:
- All background layers need dark equivalents
- Badges need dark styling
- Icons need light colors for visibility
- Text hierarchy must remain clear in dark mode

---

#### 1.5 NewWalkScreen
**File**: `/src/screens/NewWalkScreen.tsx`

**Colors Used**:
- Background: `bg-white`
- Location info box: `bg-gray-50`
- Input borders and text colors (inline styles)

**Dark Mode Requirements**:
- Form backgrounds need dark styling
- Location display box needs dark variant
- Input fields need comprehensive dark mode styling

---

#### 1.6 LifersScreen
**File**: `/src/screens/LifersScreen.tsx`

**Colors Used**:
- Background: `bg-gray-50`
- Cards and header: `bg-white`
- Species count text: gray variants

**Dark Mode Requirements**:
- Card list needs dark backgrounds
- Header needs dark styling
- Sort button and controls need dark variants

---

#### 1.7 ProfileScreen
**File**: `/src/screens/ProfileScreen.tsx`

**Colors Used**:
- Background: `bg-gray-50`
- Sections: `bg-white`
- Avatar placeholder: `bg-gray-200`
- Sign-out button border: `border-red-200`
- Text: various gray shades

**Dark Mode Requirements**:
- Section cards need dark backgrounds
- Avatar placeholder needs dark variant
- Destructive action (sign-out) needs dark-safe red styling
- Stat numbers and labels need proper contrast

---

#### 1.8 SearchScreen
**File**: `/src/screens/SearchScreen.tsx`

**Colors Used**:
- Background: `bg-gray-50`
- Input section: `bg-white`
- Section headers: `bg-gray-100`
- Walk badges: `bg-gray-200`

**Dark Mode Requirements**:
- Search input needs dark styling
- Section headers need dark background
- Badge colors need adjustment for dark mode
- Result cards need dark variant

---

## 2. COMPONENTS (15 Total)

### Card Components

#### 2.1 WalkCard
**File**: `/src/components/WalkCard.tsx`

**Colors Used**:
- Background: `bg-white` with shadow
- Title: `text-gray-800`
- Date: `text-gray-500`
- Count: `text-gray-600`

**Dark Mode Requirements**:
- Dark background for cards
- Shadow replacement (glow or border in dark mode)
- Text colors need lighter variants
- Maintain visual hierarchy

---

#### 2.2 SightingCard
**File**: `/src/components/SightingCard.tsx`

**Colors Used**:
- Background: `bg-white`
- Border: `border-gray-200`
- Text: `text-gray-900`
- Icon: `#d1d5db` (gray-300)

**Dark Mode Requirements**:
- Dark card background
- Visible borders in dark mode
- Light text colors
- Icon color needs to be visible

---

#### 2.3 LiferCard
**File**: `/src/components/LiferCard.tsx`

**Colors Used**:
- Background: `bg-white`
- Border: `border-gray-200`
- Text: `text-gray-900`
- Count: `text-gray-400`

**Dark Mode Requirements**:
- Same as SightingCard
- Secondary text (count) needs lighter gray

---

### Modal Components

#### 2.4 NewWalkModal
**File**: `/src/components/NewWalkModal.tsx`

**Colors Used**:
- Title: `text-gray-900`
- Close button: `text-gray-400`
- Input borders: `#d1d5db`
- Submit button: `bg-gray-900`

**Dark Mode Requirements**:
- Modal background needs dark styling
- Input fields need dark backgrounds
- Close button needs visibility in dark mode
- Submit button needs inverse colors

---

#### 2.5 EditWalkModal
**File**: `/src/components/EditWalkModal.tsx`

**Colors Used**:
- Same as NewWalkModal

**Dark Mode Requirements**:
- Identical to NewWalkModal

---

#### 2.6 NewSightingModal
**File**: `/src/components/NewSightingModal.tsx`

**Colors Used**:
- Labels: `text-gray-700`
- Search result borders: `border-gray-200`
- Search result text: `text-gray-800`
- Scientific name: `text-gray-500`
- Toggle buttons selected: `bg-gray-900`, `text-white`
- Toggle buttons unselected: `bg-white`, `border-gray-300`

**Dark Mode Requirements**:
- Complex form needs comprehensive dark styling
- Search dropdown needs dark background
- Toggle buttons need clear selected/unselected states in dark mode
- All form labels need lighter colors

---

#### 2.7 EditSightingModal
**File**: `/src/components/EditSightingModal.tsx`

**Colors Used**:
- Same as NewSightingModal

**Dark Mode Requirements**:
- Identical to NewSightingModal

---

#### 2.8 SightingModal
**File**: `/src/components/SightingModal.tsx`

**Colors Used**:
- Letterbox background: `bg-slate-300` (`#cbd5e1`)
- Loading placeholder: `bg-gray-200` (`#e5e7eb`)
- Image overlay: `bg-black/50`
- Section borders: `border-gray-100`
- Label text: `text-gray-500`
- Detail text: `text-gray-900`
- Icons: `#6b7280` (gray-500)
- Delete icon: `#ef4444` (red)

**Dark Mode Requirements**:
- **CRITICAL**: Letterbox background for images needs dark variant (dark gray instead of light gray)
- Image loading states need dark backgrounds
- Text overlays on images need to remain readable
- Detail sections need dark backgrounds
- Delete action needs dark-compatible red

---

#### 2.9 LiferModal
**File**: `/src/components/LiferModal.tsx`

**Colors Used**:
- Hero image styling: same as SightingModal
- Stats bar: `bg-gray-50`
- Section headers: `text-gray-400`
- Sighting history items: `bg-gray-50`

**Dark Mode Requirements**:
- Same hero image considerations as SightingModal
- Stats section needs dark background
- History list needs dark item backgrounds
- Maintain hierarchy between sections

---

### Interactive Components

#### 2.10 SearchBar
**File**: `/src/components/SearchBar.tsx`

**Colors Used**:
- Background: `bg-white` with shadow
- Dropdown border: `border-gray-200`
- Icon backgrounds: `bg-gray-100`
- Icons: `#6b7280` (gray-500)
- Placeholder: `#9CA3AF`

**Dark Mode Requirements**:
- Dark background for search bar
- Dark dropdown menu
- Icon visibility in dark mode
- Placeholder text readable in dark mode

---

#### 2.11 SortButton
**File**: `/src/components/SortButton.tsx`

**Colors Used**:
- Icon: `#6b7280` (gray-500)
- Indicator dot: `#0088CA` (blue)

**Dark Mode Requirements**:
- Icon needs lighter color
- Blue indicator can likely stay the same (good contrast)

---

#### 2.12 SortBottomSheet
**File**: `/src/components/SortBottomSheet.tsx`

**Colors Used**:
- Selected option: `bg-gray-900`, `text-white`
- Unselected option: `bg-gray-100`, `text-gray-900`
- Section labels: `text-gray-500`
- Close button: `text-gray-400`

**Dark Mode Requirements**:
- Bottom sheet background needs dark styling
- Selected state needs inverse colors
- Unselected options need dark background
- Clear visual distinction between states

---

#### 2.13 WalkOptionsButton
**File**: `/src/components/WalkOptionsButton.tsx`

**Colors Used**:
- FAB background: `bg-white` with shadow
- Delete icon: `#ef4444` (red)
- Edit icon: `#6b7280` (gray-500)
- Main icon: `#111827`

**Dark Mode Requirements**:
- Dark FAB background
- Icon colors need to be visible
- Shadow/glow adjustment for dark mode

---

#### 2.14 BirdImage
**File**: `/src/components/BirdImage.tsx`

**Colors Used**:
- Loading state: `bg-gray-200`
- Error state: `bg-gray-100`
- Letterbox background: `bg-slate-300`
- Error text: `text-gray-400`

**Dark Mode Requirements**:
- **CRITICAL**: Letterbox backgrounds need dark variants
- Loading skeleton needs dark background
- Error state needs dark styling
- Error text needs lighter color

---

#### 2.15 SkeletonBar
**File**: `/src/components/SkeletonBar.tsx`

**Colors Used**:
- Background: `#d1d5db` (gray-300)

**Dark Mode Requirements**:
- Needs darker gray for visibility on dark backgrounds
- Should remain subtle but visible

---

## 3. NAVIGATION (4 Files)

### 3.1 MainNavigator
**File**: `/src/navigation/MainNavigator.tsx`

**Colors Used**:
- Tab bar active tint: `#111827`
- Tab bar inactive tint: `#9ca3af`
- Tab bar background: `#fff`
- Tab bar border: `#e5e7eb`
- Header background: `#fff`
- Header tint: `#111827`

**Dark Mode Requirements**:
- Entire tab bar needs dark theme
- Active/inactive states need adjustment
- Headers throughout app need dark backgrounds
- Icons need lighter colors

---

### 3.2 RootNavigator
**File**: `/src/navigation/RootNavigator.tsx`

**Colors Used**:
- Loading screen: white background
- Spinner: dark color

**Dark Mode Requirements**:
- Initial loading screen needs dark variant
- Spinner color adjustment

---

### 3.3 AuthNavigator
**File**: `/src/navigation/AuthNavigator.tsx`

**Dark Mode Requirements**:
- Headers hidden, but screens need dark mode support

---

### 3.4 WalksStackNavigator
**File**: `/src/navigation/WalksStackNavigator.tsx`

**Colors Used**:
- Headers: white backgrounds, dark text

**Dark Mode Requirements**:
- All stack headers need dark variants

---

## 4. ROOT APPLICATION

### 4.1 App.tsx
**File**: `/Users/ben/Projects/birdwalk-rn/App.tsx`

**Dark Mode Requirements**:
- StatusBar configuration needs to be dynamic
- NavigationContainer needs theme support
- SafeAreaProvider may need background color

---

## 5. COLOR INVENTORY

### Hardcoded Hex Colors (58+ instances)
```
#111827 - Gray-900 (primary dark text/icons)
#6b7280 - Gray-500 (secondary icons)
#9ca3af - Gray-400 (placeholders)
#d1d5db - Gray-300 (borders)
#e5e7eb - Gray-200 (light borders)
#cbd5e1 - Slate-300 (image letterbox)
#ef4444 - Red (delete actions)
#0088CA - Blue (indicator)
```

### Tailwind Classes Used
**Backgrounds**:
- `bg-white`, `bg-gray-50`, `bg-gray-100`, `bg-gray-200`, `bg-gray-800`, `bg-gray-900`
- `bg-red-50`, `bg-red-100`
- `bg-black/50`, `bg-black/30`
- `bg-slate-300`

**Text**:
- `text-gray-400/500/600/700/800/900`
- `text-white`
- `text-red-600`

**Borders**:
- `border-gray-100/200/300`
- `border-red-200`

---

## 6. STYLING APPROACH

### Current System
- **Primary**: NativeWind/Tailwind CSS (className prop)
- **Secondary**: Inline styles for specific cases
- **No centralized theme** - colors scattered throughout components

### Inline Style Use Cases
1. TextInput styling (borderColor, color, fontSize)
2. Dynamic styles based on state
3. Precise numeric values (padding, margins)
4. Animation transforms

---

## 7. PRIORITY CATEGORIZATION

### Tier 1 - Critical (Must be perfect)
1. **Navigation** - Tab bar and headers (used everywhere)
2. **Modal backgrounds** - BottomSheet and modal components
3. **Input fields** - Form usability critical
4. **Image components** - Letterbox and loading states very visible
5. **Card components** - Primary content display

### Tier 2 - High Priority
1. **Screen backgrounds** - All main screens
2. **Text hierarchy** - Maintain readability and hierarchy
3. **Loading states** - Spinners and skeletons
4. **Icons** - Visibility on dark backgrounds

### Tier 3 - Important
1. **Borders** - Need to be visible but subtle
2. **Badges and labels** - Secondary information
3. **Shadows** - May need glow effects in dark mode

---

## 8. TECHNICAL CHALLENGES

### 1. Hardcoded Colors
- 58+ instances of hex colors in inline styles
- Need to be replaced with theme-aware values
- Cannot use Tailwind classes for some properties

### 2. Third-Party Components
- `@gorhom/bottom-sheet` - Needs background/backdrop configuration
- React Navigation - Requires theme object
- StatusBar - Needs dynamic barStyle

### 3. Image Letterboxing
- Slate-300 backgrounds for aspect ratio preservation
- Must transition to dark equivalent
- Affects visual polish significantly

### 4. Shadow System
- Current shadows won't be visible in dark mode
- May need border-based approach or glow effects
- Affects depth perception

### 5. No Existing Theme System
- Need to build from scratch
- Must integrate with NativeWind
- Need to support dynamic switching

---

## 9. FILES NOT REQUIRING CHANGES

### Logic/Data Files (No Visual Changes)
- `/src/services/*` - API and data services
- `/src/utils/*` - Utility functions
- `/src/types/*` - TypeScript types
- `/src/hooks/*` - Custom hooks (except if theme hook added)

### Configuration
- `tailwind.config.js` - May need dark mode configuration
- `metro.config.js` - No changes needed
- `babel.config.js` - No changes needed

---

## 10. NEXT STEPS

After completing research, implementation should:

1. **Set up dark mode infrastructure**
   - Configure NativeWind dark mode
   - Create theme system/context
   - Add color constants

2. **Update navigation first** (highest visibility)
   - Tab bar theming
   - Header theming
   - StatusBar configuration

3. **Work through components systematically**
   - Start with most frequently used
   - Test each in both modes
   - Ensure seamless transitions

4. **Handle third-party components**
   - Configure bottom sheet
   - Test all interactive states

5. **Polish and testing**
   - Check all screens in both modes
   - Verify image states
   - Test theme switching
   - Validate accessibility

---

**Research completed**: February 12, 2026
**Total interfaces cataloged**: 28 files
**Ready for**: Best practices research and implementation planning
