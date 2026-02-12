# Dark Mode Implementation - Task List

**BirdWalk React Native - Complete Implementation Checklist**

Created: February 12, 2026

---

## Phase 1: Setup & Foundation

### Dependencies
- [ ] Install @react-native-async-storage/async-storage (if not already installed)
- [ ] Verify NativeWind is properly configured
- [ ] Verify expo-status-bar is installed
- [ ] Test that app builds successfully before starting

### Theme Context Setup
- [ ] Create `/src/contexts/ThemeContext.tsx` file
- [ ] Implement ThemeContext with state management
- [ ] Add light colors palette constant
- [ ] Add dark colors palette (Discord-inspired)
- [ ] Implement AsyncStorage persistence logic
- [ ] Add loadThemePreference function
- [ ] Add setThemeMode function
- [ ] Implement effectiveTheme calculation (system/light/dark)
- [ ] Add NativeWind integration (useColorScheme hook)
- [ ] Export useTheme hook
- [ ] Test ThemeContext in isolation

### Navigation Themes
- [ ] Create `/src/theme/` directory
- [ ] Create `/src/theme/navigation.ts` file
- [ ] Define LightNavigationTheme object
- [ ] Define DarkNavigationTheme object
- [ ] Export both themes

### App Root Integration
- [ ] Update App.tsx to import ThemeProvider
- [ ] Wrap app with ThemeProvider (above AuthProvider)
- [ ] Verify StatusBar uses "auto" style
- [ ] Test app still runs

### Tailwind Configuration
- [ ] Update tailwind.config.js with darkMode: 'class'
- [ ] Add Discord colors to theme.extend.colors
- [ ] Test NativeWind dark: classes work

### Root Navigator Integration
- [ ] Update RootNavigator to import useTheme
- [ ] Import navigation themes
- [ ] Apply theme to NavigationContainer based on effectiveTheme
- [ ] Test navigation theme switches correctly

---

## Phase 2: Profile Screen Toggle UI

### Profile Screen Updates
- [ ] Import useTheme hook in ProfileScreen
- [ ] Import Ionicons for icons
- [ ] Update loading screen background with dark: variant
- [ ] Update ScrollView background with dark: variant
- [ ] Update RefreshControl tintColor to use colors.accent
- [ ] Update profile header background with dark: variant
- [ ] Update avatar background with dark: variant
- [ ] Update avatar text color with dark: variant
- [ ] Update email text color with dark: variant
- [ ] Update "Your Stats" text color with dark: variant
- [ ] Update all stat card backgrounds with dark: variants
- [ ] Update stat number text colors with dark: variants
- [ ] Update stat label text colors with dark: variants

### Theme Toggle Section
- [ ] Add "Appearance" section header
- [ ] Create theme toggle container with dark: background
- [ ] Add Light mode option button
- [ ] Add Light mode icon (sunny)
- [ ] Add Light mode text and description
- [ ] Add checkmark icon for Light mode when selected
- [ ] Add Dark mode option button
- [ ] Add Dark mode icon (moon)
- [ ] Add Dark mode text and description
- [ ] Add checkmark icon for Dark mode when selected
- [ ] Add System mode option button
- [ ] Add System mode icon (phone-portrait)
- [ ] Add System mode text and description
- [ ] Add checkmark icon for System mode when selected
- [ ] Add handleThemeChange function
- [ ] Wire up all three option buttons to handleThemeChange
- [ ] Add proper border colors between options
- [ ] Add active press states with dark: variants

### Sign Out Button
- [ ] Update sign out button background with dark: variant
- [ ] Update sign out button border color with dark: variant
- [ ] Update sign out button text color with dark: variant
- [ ] Update active press state with dark: variant

### Testing Profile Screen
- [ ] Test Light mode selection works
- [ ] Test Dark mode selection works
- [ ] Test System mode selection works
- [ ] Test theme persists after app restart
- [ ] Test all stats display correctly in both themes
- [ ] Test checkmarks show on correct option
- [ ] Test icons have correct colors
- [ ] Verify smooth theme transitions

---

## Phase 3: Navigation Updates

### Main Navigator (Tab Bar)
- [ ] Import useTheme in MainNavigator
- [ ] Update tabBarActiveTintColor to use colors.accent
- [ ] Update tabBarInactiveTintColor to use colors.text.tertiary
- [ ] Update tabBarStyle backgroundColor to use colors.surface
- [ ] Update tabBarStyle borderTopColor to use colors.border
- [ ] Update headerStyle backgroundColor to use colors.surface
- [ ] Update headerTintColor to use colors.text.primary
- [ ] Test tab bar in light mode
- [ ] Test tab bar in dark mode
- [ ] Test tab icons are visible in both themes

### Walks Stack Navigator
- [ ] Import useTheme in WalksStackNavigator
- [ ] Update screenOptions with dynamic theme colors
- [ ] Update header background color
- [ ] Update header tint color
- [ ] Test all stack headers in both themes

### Auth Navigator
- [ ] Verify auth screens work with dark mode (no headers shown)
- [ ] Test login screen navigation
- [ ] Test signup screen navigation

### Root Navigator
- [ ] Test loading screen in both themes
- [ ] Verify smooth transitions between auth and main stacks

---

## Phase 4: Component Updates

### BirdImage Component
- [ ] Import useTheme hook
- [ ] Update main container background: `bg-slate-300 dark:bg-[#202225]`
- [ ] Update loading state background with dark: variant
- [ ] Update loading ActivityIndicator color to colors.text.tertiary
- [ ] Update error state background with dark: variant
- [ ] Update error text color with dark: variant
- [ ] Test image loading in both themes
- [ ] Test error state in both themes
- [ ] Test letterboxing looks good in both themes

### SearchBar Component
- [ ] Import useTheme hook
- [ ] Update container background with dark: variant
- [ ] Update TextInput backgroundColor to colors.background.secondary
- [ ] Update TextInput borderColor to colors.border
- [ ] Update TextInput color to colors.text.primary
- [ ] Update placeholderTextColor to colors.text.tertiary
- [ ] Update selectionColor to colors.accent
- [ ] Update cursorColor to colors.accent
- [ ] Update icon colors if any
- [ ] Test search input in both themes
- [ ] Test placeholder visibility
- [ ] Test text entry and cursor

### WalkCard Component
- [ ] Update card background: `bg-white dark:bg-[#2f3136]`
- [ ] Update border: `border-gray-100 dark:border-[#202225]`
- [ ] Update title text: `text-gray-800 dark:text-[#dcddde]`
- [ ] Update date text: `text-gray-500 dark:text-[#72767d]`
- [ ] Update count text: `text-gray-600 dark:text-[#b9bbbe]`
- [ ] Import useTheme for icon colors
- [ ] Update icon color to colors.text.secondary
- [ ] Test card in both themes
- [ ] Test press states

### SightingCard Component
- [ ] Update card background: `bg-white dark:bg-[#2f3136]`
- [ ] Update border: `border-gray-200 dark:border-[#202225]`
- [ ] Update text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Import useTheme for icon color
- [ ] Update icon color to colors.text.tertiary
- [ ] Test card in both themes

### LiferCard Component
- [ ] Update card background: `bg-white dark:bg-[#2f3136]`
- [ ] Update border: `border-gray-200 dark:border-[#202225]`
- [ ] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update count text: `text-gray-400 dark:text-[#72767d]`
- [ ] Test card in both themes

### NewSightingModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update modal title text color with dark: variant
- [ ] Update close button color with dark: variant
- [ ] Update all TextInput backgroundColor to colors.background.secondary
- [ ] Update all TextInput borderColor to colors.border
- [ ] Update all TextInput color to colors.text.primary
- [ ] Update all placeholderTextColor to colors.text.tertiary
- [ ] Update all selectionColor to colors.accent
- [ ] Update all cursorColor to colors.accent
- [ ] Update label text colors with dark: variants
- [ ] Update search result item backgrounds with dark: variants
- [ ] Update search result borders with dark: variants
- [ ] Update species name text: `text-gray-800 dark:text-[#dcddde]`
- [ ] Update scientific name text: `text-gray-500 dark:text-[#72767d]`
- [ ] Update toggle button selected state: `bg-gray-900 dark:bg-[#5865f2]`
- [ ] Update toggle button unselected state: `bg-white dark:bg-[#2f3136]`
- [ ] Update toggle button borders with dark: variants
- [ ] Test modal in both themes
- [ ] Test all inputs work correctly
- [ ] Test search results are readable

### EditSightingModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update all form elements (same as NewSightingModal)
- [ ] Update all text colors with dark: variants
- [ ] Update all input styling with theme colors
- [ ] Update delete button color with dark: variant
- [ ] Test modal in both themes
- [ ] Test all form interactions

### SightingModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update hero image letterbox: `bg-slate-300 dark:bg-[#202225]`
- [ ] Update loading placeholder: `bg-gray-200 dark:bg-[#202225]`
- [ ] Update section borders: `border-gray-100 dark:border-[#202225]`
- [ ] Update label text: `text-gray-500 dark:text-[#72767d]`
- [ ] Update detail text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update icon colors to colors.text.secondary
- [ ] Update delete icon color to colors.destructive
- [ ] Test modal in both themes
- [ ] Test hero image looks good
- [ ] Test all detail sections are readable

### LiferModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update hero image letterbox: `bg-slate-300 dark:bg-[#202225]`
- [ ] Update stats bar: `bg-gray-50 dark:bg-[#2f3136]`
- [ ] Update section headers: `text-gray-400 dark:text-[#72767d]`
- [ ] Update sighting history items: `bg-gray-50 dark:bg-[#2f3136]`
- [ ] Update all text colors with dark: variants
- [ ] Test modal in both themes
- [ ] Test stats are readable
- [ ] Test sighting history displays correctly

### NewWalkModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update title: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update close button color to colors.text.tertiary
- [ ] Update all TextInput styling with theme colors
- [ ] Update submit button: `bg-gray-900 dark:bg-[#5865f2]`
- [ ] Update cancel button with dark: variants
- [ ] Test modal in both themes
- [ ] Test all inputs work

### EditWalkModal Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update all form elements (same as NewWalkModal)
- [ ] Update delete button colors
- [ ] Test modal in both themes

### SortBottomSheet Component
- [ ] Import useTheme hook
- [ ] Update BottomSheet backgroundStyle to colors.surface
- [ ] Update BottomSheet handleIndicatorStyle to colors.text.tertiary
- [ ] Update selected option: `bg-gray-900 dark:bg-[#5865f2]`
- [ ] Update selected text: `text-white dark:text-white`
- [ ] Update unselected option: `bg-gray-100 dark:bg-[#2f3136]`
- [ ] Update unselected text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update section labels: `text-gray-500 dark:text-[#72767d]`
- [ ] Update close button color to colors.text.tertiary
- [ ] Test bottom sheet in both themes
- [ ] Test selected state is clear

### SortButton Component
- [ ] Import useTheme hook
- [ ] Update icon color to colors.text.secondary
- [ ] Update indicator dot color (keep #0088CA or use colors.accent)
- [ ] Test button in both themes

### WalkOptionsButton Component
- [ ] Import useTheme hook
- [ ] Update FAB background: `bg-white dark:bg-[#2f3136]`
- [ ] Update delete icon color to colors.destructive
- [ ] Update edit icon color to colors.text.secondary
- [ ] Update main icon color to colors.text.primary
- [ ] Test FAB in both themes
- [ ] Test all actions are visible

### SkeletonBar Component
- [ ] Update background color: `bg-gray-300 dark:bg-[#202225]`
- [ ] Test skeleton in both themes
- [ ] Verify it's visible but subtle

---

## Phase 5: Screen Updates

### WalksListScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [ ] Update loading ActivityIndicator color to colors.accent
- [ ] Update header background with dark: variant
- [ ] Update RefreshControl tintColor to colors.accent
- [ ] Update empty state text colors with dark: variants
- [ ] Update all text colors with dark: variants
- [ ] Test screen in both themes
- [ ] Test loading state
- [ ] Test empty state
- [ ] Test list of walks

### WalkDetailScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [ ] Update header section: `bg-white dark:bg-[#2f3136]`
- [ ] Update header borders with dark: variants
- [ ] Update badge backgrounds: `bg-gray-100 dark:bg-[#202225]`
- [ ] Update back button icon color to colors.text.primary
- [ ] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update metadata text: `text-gray-500 dark:text-[#72767d]`
- [ ] Update sightings section background
- [ ] Update all text colors with dark: variants
- [ ] Test screen in both themes
- [ ] Test all sections are readable

### LifersScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [ ] Update header: `bg-white dark:bg-[#2f3136]`
- [ ] Update header text colors with dark: variants
- [ ] Update species count text colors
- [ ] Update sort controls with dark: variants
- [ ] Update empty state with dark: variants
- [ ] Test screen in both themes
- [ ] Test sorting works
- [ ] Test card list displays correctly

### SearchScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-gray-50 dark:bg-[#36393f]`
- [ ] Update input section: `bg-white dark:bg-[#2f3136]`
- [ ] Update section headers: `bg-gray-100 dark:bg-[#202225]`
- [ ] Update section header text with dark: variants
- [ ] Update walk badges: `bg-gray-200 dark:bg-[#202225]`
- [ ] Update all result text colors with dark: variants
- [ ] Update empty state with dark: variants
- [ ] Test screen in both themes
- [ ] Test search functionality
- [ ] Test results display correctly

### NewWalkScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-white dark:bg-[#2f3136]`
- [ ] Update location info box: `bg-gray-50 dark:bg-[#202225]`
- [ ] Update all TextInput styling with theme colors
- [ ] Update all labels with dark: variants
- [ ] Update submit button colors
- [ ] Update cancel button colors
- [ ] Test screen in both themes
- [ ] Test all inputs work
- [ ] Test form submission

### LoginScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-white dark:bg-[#36393f]`
- [ ] Update all TextInput styling with theme colors
- [ ] Update title text: `text-gray-900 dark:text-[#dcddde]`
- [ ] Update label text with dark: variants
- [ ] Update error messages: `bg-red-100 dark:bg-[#202225]`
- [ ] Update error text: `text-red-600 dark:text-[#ed4245]`
- [ ] Update primary button: `bg-gray-900 dark:bg-[#5865f2]`
- [ ] Update link text colors with dark: variants
- [ ] Test screen in both themes
- [ ] Test all inputs work
- [ ] Test error states display correctly

### SignupScreen
- [ ] Import useTheme hook
- [ ] Update screen background: `bg-white dark:bg-[#36393f]`
- [ ] Update all TextInput styling with theme colors
- [ ] Update all text colors (same pattern as LoginScreen)
- [ ] Update success message: `bg-gray-100 dark:bg-[#202225]`
- [ ] Update success text with dark: variants
- [ ] Update error handling colors
- [ ] Update primary button colors
- [ ] Test screen in both themes
- [ ] Test signup flow
- [ ] Test error and success states

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

- [ ] **Phase 1 Complete**: Setup & Foundation (2-3 hours)
- [ ] **Phase 2 Complete**: Profile Screen Toggle (1-2 hours)
- [ ] **Phase 3 Complete**: Navigation Updates (2 hours)
- [ ] **Phase 4 Complete**: Component Updates (6-8 hours)
- [ ] **Phase 5 Complete**: Screen Updates (4-6 hours)
- [ ] **Phase 6 Complete**: Testing & Polish (3-4 hours)

### Success Criteria

- [ ] All 300+ tasks completed
- [ ] User can toggle between Light/Dark/System modes
- [ ] Theme preference persists across app restarts
- [ ] All screens fully functional in both themes
- [ ] All text meets WCAG 2.1 AA contrast standards
- [ ] No visual glitches or flashing during theme switches
- [ ] Professional Discord-inspired dark mode aesthetic
- [ ] Smooth performance with no lag

---

**Ready to start implementation!** 🚀

Begin with Phase 1 and check off tasks as you complete them.
