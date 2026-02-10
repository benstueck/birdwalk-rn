# Claude Code Project Context

## Project Overview
BirdWalk - React Native/Expo app for tracking bird sightings on walks. Users can create walks, log bird sightings, and maintain a life list of species they've seen.

## Tech Stack
- React Native + Expo
- TypeScript
- NativeWind (TailwindCSS for React Native)
- Supabase (backend/database)
- React Navigation
- AsyncStorage (local persistence)

## Code Patterns & Conventions

### Adding Features Similar to Existing Ones

**CRITICAL: Always read the existing implementation first before writing any code.**

When implementing a feature that's similar to an existing feature (e.g., adding sort to a new screen):

1. **Identify the reference implementation** in the codebase
2. **Read the reference code thoroughly** - understand the exact patterns used
3. **Match the patterns exactly** unless there's a specific reason to deviate
4. **Note key patterns** like:
   - State management (useState patterns)
   - Effect dependencies (useFocusEffect, useEffect)
   - Loading states (when to show spinners vs keep content visible)
   - Component props and patterns
5. **Ask before deviating** if you're unsure about a different approach

### Sort Implementation Pattern

Reference: `src/screens/WalksListScreen.tsx`

When adding sort to a list screen:

```typescript
// 1. State management
const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
const [showSortModal, setShowSortModal] = useState(false);

// 2. useFocusEffect with sortBy in dependency
useFocusEffect(
  useCallback(() => {
    fetchData();
  }, [user, sortBy])  // ← Include sortBy for refetch on sort change
);

// 3. Loading check - only show spinner on initial load
if (loading && data.length === 0) {  // ← Not just "if (loading)"
  return <ActivityIndicator />;
}

// 4. Header with SortButton
<SortButton
  sortBy={sortBy}
  defaultSort={DEFAULT_SORT}  // ← For blue indicator
  onPress={() => setShowSortModal(true)}
/>

// 5. SortBottomSheet
<SortBottomSheet
  visible={showSortModal}
  sortBy={sortBy}
  onClose={() => setShowSortModal(false)}
  onSortChange={handleSortChange}
  sortOptions={customSortOptions}  // ← Pass custom options if needed
/>
```

**Why these patterns:**
- `sortBy` in dependency: Refetches data with new sort (pagination-safe)
- `loading && data.length === 0`: Prevents spinner flash during re-sorts
- Keep list visible during re-fetch for smooth UX

### List Screen Patterns

**Loading states:**
- Initial load: Show full-screen spinner
- Subsequent loads (refresh, sort): Keep content visible, no spinner flash
- Pattern: `if (loading && data.length === 0)`

**Pull-to-refresh:**
- Always include RefreshControl on FlatLists
- Use `refreshing` state separate from `loading`

### Modal Patterns

Reference: `src/components/NewWalkModal.tsx`, `src/components/SortBottomSheet.tsx`

- Use `@gorhom/bottom-sheet` for modals
- Include backdrop that closes on tap
- Handle keyboard behavior with `keyboardBehavior="interactive"`

### Component Reusability

When making a component work for multiple use cases:
- Accept configuration as props (e.g., `sortOptions` prop in SortBottomSheet)
- Provide sensible defaults for backward compatibility
- Use TypeScript union types for flexibility (e.g., `SortOption | LiferSortOption`)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Third-party library configs (Supabase)
├── navigation/     # React Navigation setup
├── screens/        # Full-screen components
├── types/          # TypeScript type definitions
└── constants/      # App constants (colors, etc.)
```

## Key Files

- `src/screens/WalksListScreen.tsx` - Reference for list screens with sort
- `src/screens/LifersScreen.tsx` - Life list implementation
- `src/components/SortBottomSheet.tsx` - Generic sort modal
- `src/types/sort.ts` - Sort type definitions

## Git Workflow

- Commit frequently with descriptive messages
- Include "Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" in commits
- Push to main branch regularly

## Plans & Documentation

- Plans live in `plans/` directory
- When creating plans for features similar to existing ones, include a "Reference Implementation" section at the top
- Plans should call out specific line numbers and patterns to follow

## Testing Philosophy

- Manual testing preferred for now
- Test all sort combinations when implementing sort
- Test empty states and edge cases

## Future Considerations

- Dark mode: See `plans/dark-mode.md` for lessons learned and approach
- Offline mode: Planned (P1 priority)
- Map visualization: Planned (P2 priority)
