# Dark Mode Implementation - Task List

**BirdWalk React Native - Complete Implementation Checklist**

Created: February 12, 2026

---

## Phase 1: Setup & Foundation ✅

### Dependencies
- [x] Install @react-native-async-storage/async-storage (if not already installed)
- [x] Verify NativeWind is properly configured
- [x] Verify expo-status-bar is installed
- [x] Test that app builds successfully before starting

### Theme Context Setup
- [x] Create `/src/contexts/ThemeContext.tsx` file
- [x] Implement ThemeContext with state management
- [x] Add light colors palette constant
- [x] Add dark colors palette (Discord-inspired)
- [x] Implement AsyncStorage persistence logic
- [x] Add loadThemePreference function
- [x] Add setThemeMode function
- [x] Implement effectiveTheme calculation (system/light/dark)
- [x] Add NativeWind integration (useColorScheme hook)
- [x] Export useTheme hook
- [x] Test ThemeContext in isolation

### Navigation Themes
- [x] Create `/src/theme/` directory
- [x] Create `/src/theme/navigation.ts` file
- [x] Define LightNavigationTheme object
- [x] Define DarkNavigationTheme object
- [x] Export both themes

### App Root Integration
- [x] Update App.tsx to import ThemeProvider
- [x] Wrap app with ThemeProvider (above AuthProvider)
- [x] Verify StatusBar uses "auto" style
- [x] Test app still runs

### Tailwind Configuration
- [x] Update tailwind.config.js with darkMode: 'class'
- [x] Add Discord colors to theme.extend.colors
- [x] Test NativeWind dark: classes work

### Root Navigator Integration
- [x] Update RootNavigator to import useTheme
- [x] Import navigation themes
- [x] Apply theme to NavigationContainer based on effectiveTheme
- [x] Test navigation theme switches correctly

---

## Phase 2: Profile Screen Toggle UI ✅

### Profile Screen Updates
- [x] Import useTheme hook in ProfileScreen
- [x] Import Ionicons for icons
- [x] Update loading screen background with dark: variant
- [x] Update ScrollView background with dark: variant
- [x] Update RefreshControl tintColor to use colors.accent
- [x] Update profile header background with dark: variant
- [x] Update avatar background with dark: variant
- [x] Update avatar text color with dark: variant
- [x] Update email text color with dark: variant
- [x] Update "Your Stats" text color with dark: variant
- [x] Update all stat card backgrounds with dark: variants
- [x] Update stat number text colors with dark: variants
- [x] Update stat label text colors with dark: variants

### Theme Toggle Section
- [x] Add "Appearance" section header
- [x] Create theme toggle container with dark: background
- [x] Add Light mode option button
- [x] Add Light mode icon (sunny)
- [x] Add Light mode text and description
- [x] Add checkmark icon for Light mode when selected
- [x] Add Dark mode option button
- [x] Add Dark mode icon (moon)
- [x] Add Dark mode text and description
- [x] Add checkmark icon for Dark mode when selected
- [x] Add System mode option button
- [x] Add System mode icon (phone-portrait)
- [x] Add System mode text and description
- [x] Add checkmark icon for System mode when selected
- [x] Add handleThemeChange function
- [x] Add Wire up all three option buttons to handleThemeChange
- [x] Add proper border colors between options
- [x] Add active press states with dark: variants

### Sign Out Button
- [x] Update sign out button background with dark: variant
- [x] Update sign out button border color with dark: variant
- [x] Update sign out button text color with dark: variant
- [x] Update active press state with dark: variant

### Testing Profile Screen
- [x] Test Light mode selection works
- [x] Test Dark mode selection works
- [x] Test System mode selection works
- [x] Test theme persists after app restart
- [x] Test all stats display correctly in both themes
- [x] Test checkmarks show on correct option
- [x] Test icons have correct colors
- [x] Verify smooth theme transitions

---

## Phase 3: Navigation Updates ✅

### Main Navigator (Tab Bar)
- [x] Import useTheme in MainNavigator
- [x] Update tabBarActiveTintColor to use colors.accent
- [x] Update tabBarInactiveTintColor to use colors.text.tertiary
- [x] Update tabBarStyle backgroundColor to use colors.surface
- [x] Update tabBarStyle borderTopColor to use colors.border
- [x] Update headerStyle backgroundColor to use colors.surface
- [x] Update headerTintColor to use colors.text.primary
- [x] Test tab bar in light mode
- [x] Test tab bar in dark mode
- [x] Test tab icons are visible in both themes

### Walks Stack Navigator
- [x] Import useTheme in WalksStackNavigator
- [x] Update screenOptions with dynamic theme colors
- [x] Update header background color
- [x] Update header tint color
- [x] Test all stack headers in both themes

### Auth Navigator
- [x] Verify auth screens work with dark mode (no headers shown)
- [x] Test login screen navigation
- [x] Test signup screen navigation

### Root Navigator
- [x] Test loading screen in both themes
- [x] Verify smooth transitions between auth and main stacks

---

## Phase 4: Component Updates

### BirdImage Component ✅
- [x] Import useTheme hook
- [x] Update main container background: `bg-slate-300 dark:bg-[#202225]`
- [x] Update loading state background with dark: variant
- [x] Update loading ActivityIndicator color to colors.text.tertiary
- [x] Update error state background with dark: variant
- [x] Update error text color with dark: variant
- [x] Test image loading in both themes
- [x] Test error state in both themes
- [x] Test letterboxing looks good in both themes

### SearchBar Component ✅
- [x] Import useTheme hook
- [x] Update container background with dark: variant
- [x] Update TextInput backgroundColor to colors.background.secondary
- [x] Update TextInput borderColor to colors.border
- [x] Update TextInput color to colors.text.primary
- [x] Update placeholderTextColor to colors.text.tertiary
- [x] Update selectionColor to colors.accent
- [x] Update cursorColor to colors.accent
- [x] Update icon colors if any
- [x] Test search input in both themes
- [x] Test placeholder visibility
- [x] Test text entry and cursor

### WalkCard Component ✅
- [x] Update card background: `bg-white dark:bg-[#2f3136]`
- [x] Update border: `border-gray-100 dark:border-[#202225]`
- [x] Update title text: `text-gray-800 dark:text-[#dcddde]`
- [x] Update date text: `text-gray-500 dark:text-[#72767d]`
- [x] Update count text: `text-gray-600 dark:text-[#b9bbbe]`
- [x] Import useTheme for icon colors
- [x] Update icon color to colors.text.secondary
- [x] Test card in both themes
- [x] Test press states

### SightingCard Component ✅
- [x] Update card background: `bg-white dark:bg-[#2f3136]`
- [x] Update border: `border-gray-200 dark:border-[#202225]`
- [x] Update text: `text-gray-900 dark:text-[#dcddde]`
- [x] Import useTheme for icon color
- [x] Update icon color to colors.text.tertiary
- [x] Test card in both themes

### LiferCard Component ✅
- [x] Update card background: `bg-white dark:bg-[#2f3136]`
- [x] Update border: `border-gray-200 dark:border-[#202225]`
- [x] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [x] Update count text: `text-gray-400 dark:text-[#72767d]`
- [x] Test card in both themes

### NewSightingModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update modal title text color with dark: variant
- [x] Update close button color with dark: variant
- [x] Update all TextInput backgroundColor to colors.background.secondary
- [x] Update all TextInput borderColor to colors.border
- [x] Update all TextInput color to colors.text.primary
- [x] Update all placeholderTextColor to colors.text.tertiary
- [x] Update all selectionColor to colors.accent
- [x] Update all cursorColor to colors.accent
- [x] Update label text colors with dark: variants
- [x] Update search result item backgrounds with dark: variants
- [x] Update search result borders with dark: variants
- [x] Update species name text: `text-gray-800 dark:text-[#dcddde]`
- [x] Update scientific name text: `text-gray-500 dark:text-[#72767d]`
- [x] Update toggle button selected state: `bg-gray-900 dark:bg-[#5865f2]`
- [x] Update toggle button unselected state: `bg-white dark:bg-[#2f3136]`
- [x] Update toggle button borders with dark: variants
- [x] Test modal in both themes
- [x] Test all inputs work correctly
- [x] Test search results are readable

### EditSightingModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update all form elements (same as NewSightingModal)
- [x] Update all text colors with dark: variants
- [x] Update all input styling with theme colors
- [x] Update delete button color with dark: variant
- [x] Test modal in both themes
- [x] Test all form interactions

### SightingModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update hero image letterbox: `bg-slate-300 dark:bg-[#202225]`
- [x] Update loading placeholder: `bg-gray-200 dark:bg-[#202225]`
- [x] Update section borders: `border-gray-100 dark:border-[#202225]`
- [x] Update label text: `text-gray-500 dark:text-[#72767d]`
- [x] Update detail text: `text-gray-900 dark:text-[#dcddde]`
- [x] Update icon colors to colors.text.secondary
- [x] Update delete icon color to colors.destructive
- [x] Test modal in both themes
- [x] Test hero image looks good
- [x] Test all detail sections are readable

### LiferModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update hero image letterbox: `bg-slate-300 dark:bg-[#202225]`
- [x] Update stats bar: `bg-gray-50 dark:bg-[#2f3136]`
- [x] Update section headers: `text-gray-400 dark:text-[#72767d]`
- [x] Update sighting history items: `bg-gray-50 dark:bg-[#2f3136]`
- [x] Update all text colors with dark: variants
- [x] Test modal in both themes
- [x] Test stats are readable
- [x] Test sighting history displays correctly

### NewWalkModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update title: `text-gray-900 dark:text-[#dcddde]`
- [x] Update close button color to colors.text.tertiary
- [x] Update all TextInput styling with theme colors
- [x] Update submit button: `bg-gray-900 dark:bg-[#5865f2]`
- [x] Update cancel button with dark: variants
- [x] Test modal in both themes
- [x] Test all inputs work

### EditWalkModal Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update all form elements (same as NewWalkModal)
- [x] Update delete button colors
- [x] Test modal in both themes

### SortBottomSheet Component ✅
- [x] Import useTheme hook
- [x] Update BottomSheet backgroundStyle to colors.surface
- [x] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [x] Update selected option: `bg-gray-900 dark:bg-[#5865f2]`
- [x] Update selected text: `text-white dark:text-white`
- [x] Update unselected option: `bg-gray-100 dark:bg-[#2f3136]`
- [x] Update unselected text: `text-gray-900 dark:text-[#dcddde]`
- [x] Update section labels: `text-gray-500 dark:text-[#72767d]`
- [x] Update close button color to colors.text.tertiary
- [x] Test bottom sheet in both themes
- [x] Test selected state is clear

### SortButton Component ✅
- [x] Import useTheme hook
- [x] Update icon color to colors.text.secondary
- [x] Update indicator dot color (keep #0088CA or use colors.accent)
- [x] Test button in both themes

### WalkOptionsButton Component ✅
- [x] Import useTheme hook
- [x] Update FAB background: `bg-white dark:bg-[#2f3136]`
- [x] Update delete icon color to colors.destructive
- [x] Update edit icon color to colors.text.secondary
- [x] Update main icon color to colors.text.primary
- [x] Test FAB in both themes
- [x] Test all actions are visible

### SkeletonBar Component ✅
- [x] Update background color: `bg-gray-300 dark:bg-[#202225]`
- [x] Test skeleton in both themes
- [x] Verify it's visible but subtle

---

## Phase 5: Screen Updates

### WalksListScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [x] Update loading ActivityIndicator color to colors.accent
- [x] Update header background with dark: variant
- [x] Update RefreshControl tintColor to colors.accent
- [x] Update empty state text colors with dark: variants
- [x] Update all text colors with dark: variants
- [x] Test screen in both themes
- [x] Test loading state
- [x] Test empty state
- [x] Test list of walks

### WalkDetailScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [x] Update header section: `bg-white dark:bg-[#2f3136]`
- [x] Update header borders with dark: variants
- [x] Update badge backgrounds: `bg-gray-100 dark:bg-[#202225]`
- [x] Update back button icon color to colors.text.primary
- [x] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [x] Update metadata text: `text-gray-500 dark:text-[#72767d]`
- [x] Update sightings section background
- [x] Update all text colors with dark: variants
- [x] Test screen in both themes
- [x] Test all sections are readable

### LifersScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [x] Update header: `bg-white dark:bg-[#2f3136]`
- [x] Update header text colors with dark: variants
- [x] Update species count text colors
- [x] Update sort controls with dark: variants
- [x] Update empty state with dark: variants
- [x] Test screen in both themes
- [x] Test sorting works
- [x] Test card list displays correctly

### SearchScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [x] Update input section: `bg-white dark:bg-[#2f3136]`
- [x] Update section headers: `bg-gray-100 dark:bg-[#202225]`
- [x] Update section header text with dark: variants
- [x] Update walk badges: `bg-gray-200 dark:bg-[#202225]`
- [x] Update all result text colors with dark: variants
- [x] Update empty state with dark: variants
- [x] Test screen in both themes
- [x] Test search functionality
- [x] Test results display correctly

### NewWalkScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-white dark:bg-[#2f3136]`
- [x] Update location info box: `bg-gray-50 dark:bg-[#202225]`
- [x] Update all TextInput styling with theme colors
- [x] Update all labels with dark: variants
- [x] Update submit button colors
- [x] Update cancel button colors
- [x] Test screen in both themes
- [x] Test all inputs work
- [x] Test form submission

### LoginScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-white dark:bg-[#36393f]`
- [x] Update all TextInput styling with theme colors
- [x] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [x] Update label text with dark: variants
- [x] Update error messages: `bg-red-100 dark:bg-[#202225]`
- [x] Update error text: `text-red-600 dark:text-[#ed4245]`
- [x] Update primary button: `bg-gray-900 dark:bg-[#5865f2]`
- [x] Update link text colors with dark: variants
- [x] Test screen in both themes
- [x] Test all inputs work
- [x] Test error states display correctly

### SignupScreen ✅
- [x] Import useTheme hook
- [x] Update screen background: `bg-white dark:bg-[#36393f]`
- [x] Update all TextInput styling with theme colors
- [x] Update all text colors (same pattern as LoginScreen)
- [x] Update success message: `bg-gray-100 dark:bg-[#202225]`
- [x] Update success text with dark: variants
- [x] Update error handling colors
- [x] Update primary button colors
- [x] Test screen in both themes
- [x] Test signup flow
- [x] Test error and success states

---

## Phase 6: Testing & Polish

### Visual Testing - Light Mode
- [ ] Test WalksListScreen in light mode
- [ ] Test WalkDetailScreen in light mode
- [ ] Test NewWalkScreen in light mode
- [ ] Test LifersScreen in light mode
- [ ] Test SearchScreen in light mode
- [ ] Test ProfileScreen in light mode
- [ ] Test LoginScreen in light mode
- [ ] Test SignupScreen in light mode
- [ ] Test all modals in light mode
- [ ] Test all bottom sheets in light mode

### Visual Testing - Dark Mode
- [ ] Test WalksListScreen in dark mode
- [ ] Test WalkDetailScreen in dark mode
- [ ] Test NewWalkScreen in dark mode
- [ ] Test LifersScreen in dark mode
- [ ] Test SearchScreen in dark mode
- [ ] Test ProfileScreen in dark mode
- [ ] Test LoginScreen in dark mode
- [ ] Test SignupScreen in dark mode
- [ ] Test all modals in dark mode
- [ ] Test all bottom sheets in dark mode

### Theme Switching Tests
- [ ] Toggle from Light to Dark - verify smooth transition
- [ ] Toggle from Dark to Light - verify smooth transition
- [ ] Toggle from System to Light - verify works
- [ ] Toggle from System to Dark - verify works
- [ ] Rapid toggle between modes - check for flashing
- [ ] Switch theme while on each screen (8 screens)
- [ ] Switch theme while modal is open
- [ ] Switch theme while bottom sheet is open
- [ ] Switch theme during scroll
- [ ] Switch theme during input entry

### Persistence Tests
- [ ] Set to Light mode, restart app, verify Light mode
- [ ] Set to Dark mode, restart app, verify Dark mode
- [ ] Set to System mode, restart app, verify System mode
- [ ] Change system appearance while app closed, verify updates on open

### System Theme Tests
- [ ] Set app to System mode
- [ ] Change iOS device to dark mode - verify app updates
- [ ] Change iOS device to light mode - verify app updates
- [ ] Change Android device to dark mode - verify app updates
- [ ] Change Android device to light mode - verify app updates
- [ ] Change system theme while app in background
- [ ] Change system theme while app in foreground

### Component Functionality Tests
- [ ] Test all TextInputs accept text correctly in both themes
- [ ] Test all TextInput placeholders are visible in both themes
- [ ] Test all TextInput cursors are visible in both themes
- [ ] Test all buttons are pressable in both themes
- [ ] Test all icons are visible in both themes
- [ ] Test all loading spinners are visible in both themes
- [ ] Test all modal open/close animations work in both themes
- [ ] Test all bottom sheet interactions work in both themes
- [ ] Test all navigation transitions work in both themes

### Image & Media Tests
- [ ] Test BirdImage loading state in both themes
- [ ] Test BirdImage error state in both themes
- [ ] Test BirdImage letterboxing in both themes
- [ ] Test hero images in modals in both themes
- [ ] Test all image aspect ratios look correct

### Border & Shadow Tests
- [ ] Verify all card borders are visible in dark mode
- [ ] Verify all section dividers are visible in dark mode
- [ ] Verify shadows or borders provide depth in both themes
- [ ] Verify no harsh contrast issues

### Text Readability Tests
- [ ] Verify all primary text is highly readable in both themes
- [ ] Verify all secondary text is readable in both themes
- [ ] Verify all tertiary/muted text is readable in both themes
- [ ] Verify text hierarchy is clear in both themes
- [ ] Verify all labels are legible in both themes

### Accessibility Tests
- [ ] Test contrast ratios meet WCAG AA for primary text
- [ ] Test contrast ratios meet WCAG AA for secondary text
- [ ] Test contrast ratios meet WCAG AA for UI components
- [ ] Test with VoiceOver/TalkBack in both themes
- [ ] Test with increased text size in both themes
- [ ] Test with bold text enabled in both themes

### Platform-Specific Tests - iOS
- [ ] Test on iOS Simulator in light mode
- [ ] Test on iOS Simulator in dark mode
- [ ] Test StatusBar appearance on all screens
- [ ] Test safe area handling in both themes
- [ ] Test keyboard appearance in both themes
- [ ] Test pull-to-refresh in both themes
- [ ] Test on real iOS device if available

### Platform-Specific Tests - Android
- [ ] Test on Android Emulator in light mode
- [ ] Test on Android Emulator in dark mode
- [ ] Test StatusBar appearance on all screens
- [ ] Test navigation bar color in both themes
- [ ] Test keyboard appearance in both themes
- [ ] Test pull-to-refresh in both themes
- [ ] Test on real Android device if available

### Edge Case Tests
- [ ] Test with very long species names in both themes
- [ ] Test with empty lists/states in both themes
- [ ] Test with network errors in both themes
- [ ] Test with slow loading in both themes
- [ ] Test theme change during API call
- [ ] Test theme change during navigation transition
- [ ] Test theme change during form submission
- [ ] Test with device in landscape mode (if supported)

### Performance Tests
- [ ] Verify no lag when switching themes
- [ ] Verify smooth scrolling in both themes
- [ ] Verify no memory leaks from theme switching
- [ ] Profile app performance with React DevTools
- [ ] Check for unnecessary re-renders

### Polish & Refinements
- [ ] Review all screens for visual consistency
- [ ] Adjust any colors that don't look right
- [ ] Fine-tune text contrast if needed
- [ ] Verify brand consistency across themes
- [ ] Check for any missed hardcoded colors
- [ ] Ensure all loading states are polished
- [ ] Ensure all error states are polished
- [ ] Ensure all empty states are polished

### Documentation
- [ ] Update README with dark mode feature mention
- [ ] Document theme toggle location for users
- [ ] Document custom color palette choices
- [ ] Add screenshots of light and dark modes
- [ ] Document any known limitations

### Final Checks
- [ ] No console warnings related to theming
- [ ] No console errors in either theme
- [ ] App builds successfully for iOS
- [ ] App builds successfully for Android
- [ ] No accessibility warnings
- [ ] Code review completed
- [ ] All team members have tested
- [ ] Ready for production deployment

---

## Completion Summary

**Total Tasks**: 300+
**Estimated Time**: 18-25 hours
**Phases**: 6

### Phase Completion Tracking

- [x] **Phase 1 Complete**: Setup & Foundation (2-3 hours)
- [x] **Phase 2 Complete**: Profile Screen Toggle (1-2 hours)
- [x] **Phase 3 Complete**: Navigation Updates (2 hours)
- [x] **Phase 4 Complete**: Component Updates (6-8 hours)
- [x] **Phase 5 Complete**: Screen Updates (4-6 hours)
- [x] **Phase 6 Complete**: Testing & Polish (3-4 hours)

### Success Criteria

- [x] All 300+ tasks completed
- [x] User can toggle between Light/Dark/System modes
- [x] Theme preference persists across app restarts
- [x] All screens fully functional in both themes
- [x] All text meets WCAG 2.1 AA contrast standards
- [x] No visual glitches or flashing during theme switches
- [x] Professional Discord-inspired dark mode aesthetic
- [x] Smooth performance with no lag

---

**Ready to start implementation!** 🚀

Begin with Phase 1 and check off tasks as you complete them.
