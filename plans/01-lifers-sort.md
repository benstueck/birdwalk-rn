# Plan: Add Sort to Lifers Tab

**Priority**: P0 (High)
**Status**: Planning
**Created**: 2026-02-09
**Aligned with**: Walks tab sort implementation (WalksListScreen.tsx:33-34, 96, 164-169)

## Overview
Implement sorting functionality for the Lifers tab to allow users to organize their life list by species name, recent sighting date, or total sighting count. Follows the same UI/UX pattern as the Walks tab for consistency.

## Goals
- Enable users to sort their lifer list by 3 different criteria
- Match the Walks tab UI pattern (SortButton + SortBottomSheet)
- Persist sort preferences across sessions using AsyncStorage
- Maintain current default behavior (newest sightings first)

## Sort Options

### 1. Species Name (Alphabetical)
- **A-Z**: "American Robin" → "Yellow Warbler"
- **Z-A**: "Yellow Warbler" → "American Robin"
- Sort by `species_name` field

### 2. Recent Sighting (Date)
- **Newest first** (DEFAULT): Most recently seen species at top
- **Oldest first**: Longest time since seeing species at top
- Sort by `most_recent_sighting` field
- Current hardcoded behavior (LifersScreen.tsx:126-130)

### 3. Total Sightings (Count)
- **Most sightings**: Species seen most often at top
- **Fewest sightings**: Rarest sightings at top
- Sort by `total_sightings` field

## Technical Approach

### Type Updates (`src/types/sort.ts`)
Extend existing sort types to support lifers:
```typescript
// Add new sort options for lifers
export type LiferSortOption =
  | "recent-desc" | "recent-asc"     // Recent sighting
  | "name-asc" | "name-desc"         // Species name
  | "count-desc" | "count-asc";      // Total sightings

export const DEFAULT_LIFER_SORT: LiferSortOption = "recent-desc";

export const liferSortOptions = {
  recent: [
    { value: "recent-desc" as const, label: "Most recent" },
    { value: "recent-asc" as const, label: "Least recent" },
  ],
  name: [
    { value: "name-asc" as const, label: "A → Z" },
    { value: "name-desc" as const, label: "Z → A" },
  ],
  count: [
    { value: "count-desc" as const, label: "Most sightings" },
    { value: "count-asc" as const, label: "Fewest sightings" },
  ],
};
```

### Component Updates

#### `LifersScreen.tsx` Changes
1. **Add state and imports** (similar to WalksListScreen.tsx:18-20, 33-34):
   ```typescript
   import { SortButton } from "../components/SortButton";
   import { SortBottomSheet } from "../components/SortBottomSheet";
   import { LiferSortOption, DEFAULT_LIFER_SORT } from "../types/sort";

   const [sortBy, setSortBy] = useState<LiferSortOption>(DEFAULT_LIFER_SORT);
   const [showSortModal, setShowSortModal] = useState(false);
   ```

2. **Update header** (line 164-167):
   - Add SortButton next to species count
   - Match WalksListScreen.tsx:94-97 pattern

3. **Update fetchLifers** (lines 126-130):
   - Remove hardcoded sort
   - Apply dynamic sorting based on `sortBy` state
   - Client-side sorting (data already fetched)

4. **Add SortBottomSheet** (after LiferModal):
   - Pass liferSortOptions instead of sortOptions
   - Similar to WalksListScreen.tsx:164-169

5. **Add sort dependency to useFocusEffect** (line 148):
   - Include `sortBy` in dependency array
   - Match WalksListScreen.tsx:76-80

#### `SortBottomSheet.tsx` Updates
Make component generic to handle both walk and lifer sorts:
- Accept `sortOptions` as a prop (either `sortOptions` or `liferSortOptions`)
- Update TypeScript types to accept union of SortOption | LiferSortOption
- Update section labels based on options passed

**Alternative**: Create separate `LiferSortBottomSheet.tsx` component (simpler, more explicit)

### Persistence Strategy
Use AsyncStorage to persist sort preference:
- Storage key: `@lifers_sort_preference`
- Load preference on component mount
- Save preference when sort changes
- Follow same pattern as theme persistence (DARK_MODE_PLAN.md:28-29)

```typescript
// Load saved preference
useEffect(() => {
  const loadSortPreference = async () => {
    const saved = await AsyncStorage.getItem('@lifers_sort_preference');
    if (saved) setSortBy(saved as LiferSortOption);
  };
  loadSortPreference();
}, []);

// Save on change
const handleSortChange = async (newSort: LiferSortOption) => {
  setSortBy(newSort);
  await AsyncStorage.setItem('@lifers_sort_preference', newSort);
};
```

## UI/UX Considerations

### Visual Consistency
- Match Walks tab exactly:
  - SortButton styling and placement (WalksListScreen.tsx:96)
  - SortBottomSheet layout and groups (SortBottomSheet.tsx:99-109)
  - Header layout with title + button (WalksListScreen.tsx:94-97)

### User Experience
- Default to current behavior (newest first) to avoid disrupting existing users
- Immediate visual feedback when sort changes (no loading state needed - client-side sort)
- Persist preference so users don't re-select every time
- Group sort options by type (Recent / Name / Count) for easy scanning

### Performance
- Client-side sorting (data already loaded)
- No additional API calls needed
- Sort happens in memory - instant update

## Implementation Steps

### 1. Type Definitions
- [ ] Update `src/types/sort.ts` with LiferSortOption types and liferSortOptions

### 2. Component Updates
- [ ] Update `SortBottomSheet.tsx` to accept dynamic sort options OR create `LiferSortBottomSheet.tsx`
- [ ] Update `LifersScreen.tsx`:
  - [ ] Add sort state and modal state
  - [ ] Add SortButton to header
  - [ ] Update fetchLifers sorting logic
  - [ ] Add SortBottomSheet component
  - [ ] Add AsyncStorage persistence

### 3. Testing
- [ ] Manual testing of all 6 sort combinations
- [ ] Test persistence (close/reopen app)
- [ ] Test with empty list
- [ ] Test with single species
- [ ] Verify consistency with Walks tab UI

### 4. Edge Cases
- [ ] Handle species with same name (shouldn't happen, but defensive)
- [ ] Handle species with null scientific_name
- [ ] Handle ties in sort order (secondary sort)

## Files to Modify
1. `src/types/sort.ts` - Add lifer sort types
2. `src/screens/LifersScreen.tsx` - Add sort functionality (lines 20, 33-34, 125-130, 164-167, 195+)
3. `src/components/SortBottomSheet.tsx` - Make generic OR create new component

## Files Created (if separate component approach)
- `src/components/LiferSortBottomSheet.tsx` (optional alternative)

## Testing Plan

### Unit Tests
- Sort logic for all 6 combinations
- Persistence save/load
- Default behavior

### Integration Tests
- UI renders correctly
- Sort button opens modal
- Selection updates list
- Preference persists across app restarts

### Manual Testing Checklist
- [ ] All 6 sort options work correctly
- [ ] Default is "Most recent" for new users
- [ ] Selection persists after closing app
- [ ] UI matches Walks tab styling
- [ ] Empty state still works
- [ ] Modal opens/closes smoothly
- [ ] Sort button shows current selection

## Notes
- **Reuse over rebuild**: Leverage existing SortButton and SortBottomSheet components
- **Consistency**: Match Walks tab patterns exactly for familiarity
- **No breaking changes**: Default behavior stays the same
- **Performance**: Client-side sorting is instant (data already loaded)
- **Future enhancement**: Could add scientific name sort later if needed (not in scope)
