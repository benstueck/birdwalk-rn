# Dark Mode Implementation Plan

## Lessons Learned from Previous Attempt

**What Went Wrong:**
1. No validation before scaling - converted all files without proving the approach worked on even one
2. Didn't research NativeWind v4 docs thoroughly upfront
3. Poor color hierarchy understanding - cards blended into backgrounds instead of standing out
4. No incremental testing - changed everything at once instead of iterative approach

**Key Insight:** Never convert more than 1-2 files before validating the approach actually works visually.

## Implementation Approach

### Phase 1: Research & Proof of Concept (POC)

**Goal:** Validate that dark mode works before writing any implementation code

1. Read NativeWind v4 documentation completely
   - Understand `dark:` variant requirements
   - Understand `darkMode` config options (`media` vs `class`)
   - Understand how `useColorScheme()` hook works

2. Create minimal POC
   - Create a single test screen with:
     - Background color
     - One card component
     - Text in multiple hierarchy levels (primary, secondary, tertiary)
     - One button with pressed state
   - Add `dark:` variants for all colors
   - Test toggling between light and dark modes
   - **STOP if this doesn't work** - try alternative approach

3. Document findings
   - What configuration is required
   - What works, what doesn't
   - Any gotchas or edge cases

**Exit Criteria:** POC screen looks correct in both light and dark mode

### Phase 2: Design Color System

**Goal:** Document the color hierarchy before touching any production code

1. Define color roles:
   ```
   Background Hierarchy:
   - background.primary: Main screen background (light gray / dark)
   - background.secondary: Card/surface background (white / dark gray)
   - background.elevated: Pressed/hover states (lighter gray / lighter dark)

   Text Hierarchy:
   - text.primary: Main content (dark / light)
   - text.secondary: Supporting text (medium gray)
   - text.tertiary: Disabled/subtle text (light gray)

   Borders:
   - border.default: Standard borders (light gray / dark gray)
   ```

2. Map TailwindCSS classes to dark variants:
   ```
   Screen backgrounds: bg-gray-50 dark:bg-neutral-900
   Card backgrounds: bg-white dark:bg-neutral-800
   Primary text: text-gray-900 dark:text-gray-50
   Secondary text: text-gray-600 dark:text-gray-400
   ```

3. Document component patterns:
   - Cards should use `bg-white dark:bg-neutral-800` to stand out from screen
   - Pressed states should use subtle elevation change
   - Inputs should have visible borders in both modes

**Exit Criteria:** Clear documented mapping of all color uses

### Phase 3: Incremental Implementation

**Goal:** Convert files one at a time with validation at each step

1. Choose 1 simple screen (e.g., LoginScreen)
   - Add `dark:` variants following documented mapping
   - Test in both light and dark modes
   - Get user feedback
   - **STOP if it doesn't look right** - fix before proceeding

2. Choose 1 simple component (e.g., WalkCard)
   - Add `dark:` variants
   - Test in context on WalksListScreen
   - Verify card stands out from background
   - Get user feedback

3. Make a git commit
   - Commit message: "Add dark mode to LoginScreen and WalkCard"
   - Establishes rollback point

4. Repeat for 2-3 more files
   - Test each batch
   - Commit each batch
   - Build confidence in the pattern

**Exit Criteria:** 3-5 files working correctly in both modes with user approval

### Phase 4: Scale Implementation

**Goal:** Apply proven pattern to remaining files

1. Convert in small batches (3-4 files at a time)
   - Screens batch 1: SignupScreen, ProfileScreen
   - Screens batch 2: WalksListScreen, WalkDetailScreen
   - Components batch 1: LiferCard, SightingCard, SearchBar
   - Components batch 2: Modals
   - Etc.

2. Test each batch before moving to next

3. Commit after each batch for easy rollback

**Exit Criteria:** All screens and components support dark mode

### Phase 5: Theme Toggle

**Goal:** Add UI for users to switch themes

1. Add theme toggle to ProfileScreen
   - Three options: Light, Dark, System
   - Use AsyncStorage to persist preference
   - Update NativeWind's colorScheme on change

2. Test theme switching works everywhere

**Exit Criteria:** Users can toggle themes and preference persists

## Alternative Approach (if NativeWind dark: variants fail)

If Phase 1 POC shows that NativeWind `dark:` variants don't work properly:

1. Consider using inline styles with a theme context
2. BUT: Do the same incremental approach
   - Design color system first
   - Test 1-2 files
   - Get approval before scaling
3. Pay careful attention to color hierarchy to avoid invisible cards

## Critical Rules

1. **No bulk conversions** - Maximum 2-3 files before testing
2. **Test in both modes** - Every single change must be visually verified
3. **Commit frequently** - After each successful batch
4. **Get user feedback early** - Don't spend more than 10 minutes without showing progress
5. **Stop if blocked** - Don't keep trying the same failing approach
