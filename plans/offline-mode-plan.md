# Offline Mode Plan

## Context
Birding frequently happens in areas with no cellular or Wi-Fi coverage. This feature allows users to continue logging walks and sightings in the field, then sync back to Supabase when connectivity returns. It also requires downloadable regional "bird packs" so species search and info work without internet.

## Decisions & Constraints
- **Bird packs**: Built at download time by calling eBird's `/product/spplist/{regionCode}` to get species codes for the region, then filtering the full taxonomy to those codes. Start with California (`US-CA`) for testing.
- **Pack photos**: Cache Wikipedia image URLs for every species in the pack at download time. Run size tests first, then decide whether to compress or limit scope.
- **Local DB**: WatermelonDB (SQLite-backed, built-in sync protocol, well-maintained for React Native).
- **Sync strategy**: Last-write-wins by timestamp. Collaborative walks are blocked for editing in offline mode (read-only), so conflict risk is eliminated there.
- **Offline toggle**: Manual toggle in Profile tab. On app open with no connectivity while not in offline mode, show a modal prompting the user to enable offline mode. User manually turns it off to go back online and trigger sync.
- **Blocked features offline**: collaborative walk invitations, sending/receiving invites, inbox, profile edits, search (global), anything requiring auth state refresh.
- **Allowed offline**: create/view/edit/delete own solo walks, add/edit/remove sightings on own walks, view lifers (read-only from local DB), species search via bird pack.

---

## Phase 1: Foundation — OfflineContext & UI Toggle

### Goal
Wire up the offline mode state machine before building anything else.

### Steps
1. **Install dependencies**: `@nozbe/watermelondb`, `@nozbe/with-observables`, `expo-file-system` (for image caching), `@react-native-community/netinfo` (for connectivity detection).
2. **Create `OfflineContext`** (`src/contexts/OfflineContext.tsx`)
   - State: `isOfflineMode: boolean`, `pendingSyncCount: number`
   - Persisted to AsyncStorage (`@offline_mode_enabled`)
   - Expose: `enableOfflineMode()`, `disableOfflineMode()` (disableOfflineMode triggers sync)
3. **Add offline toggle** to `ProfileScreen` (`src/screens/ProfileScreen.tsx`) — a simple row with a Switch in the settings area near the theme toggle.
4. **No-connectivity modal**: In `RootNavigator` (`src/navigation/RootNavigator.tsx`), use NetInfo to detect no connection on mount. If `!isOfflineMode && !isConnected`, show a modal offering to enable offline mode. One-time per app open (track with a ref).
5. **Offline banner**: Show a subtle banner/indicator when in offline mode (component: `OfflineBanner`, displayed in `MainNavigator` header area).

---

## Phase 2: WatermelonDB Schema & Local Database

### Goal
Create the local database that mirrors the Supabase tables needed for offline operation.

### Schema (`src/db/schema.ts`)
Tables mirroring Supabase structure, with WatermelonDB conventions:
- **`walks`**: `id` (server id), `name`, `location_lat`, `location_lng`, `date`, `start_time`, `notes`, `created_at`, `is_collaborative` (bool), `synced_at`, `is_dirty` (bool — has unsynced local changes)
- **`sightings`**: `id` (server id), `walk_id`, `species_code`, `species_name`, `scientific_name`, `location_lat`, `location_lng`, `timestamp`, `type`, `notes`, `created_at`, `created_by`, `synced_at`, `is_dirty`
- **`bird_pack_species`**: `pack_id`, `species_code`, `species_name`, `scientific_name`, `image_url` (cached Wikipedia URL), `image_cached` (bool)
- **`bird_packs`**: `region_code`, `region_name`, `species_count`, `downloaded_at`, `is_active`

### Files
- `src/db/schema.ts` — WatermelonDB schema definition
- `src/db/models/Walk.ts`, `Sighting.ts`, `BirdPack.ts`, `BirdPackSpecies.ts` — model classes
- `src/db/index.ts` — database initialization, exported `database` singleton

---

## Phase 3: Bird Pack Download & Management

### Goal
Let users download, view, and delete regional bird packs.

### Pack Download Flow
1. User opens Pack Management screen, sees list of available regions (hardcoded for now: just "California").
2. Tap "Download" → app calls:
   - `GET https://api.ebird.org/v2/product/spplist/US-CA` → array of species codes for CA
   - `GET https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species` → full taxonomy
   - Filter taxonomy to CA species codes → ~700 species
   - Fetch Wikipedia image URL for each species (batched, using existing `fetchBirdImage` logic from `src/utils/birdImages.ts`)
   - Use `expo-file-system` to download and cache each image locally
   - Write all species + image paths to WatermelonDB `bird_pack_species` table
3. Show download progress (species fetched, images cached, MB downloaded).
4. After download, record the pack in `bird_packs` table.

### Pack Management Screen (`src/screens/PackManagementScreen.tsx`)
- List of available packs with download status, species count, disk size
- Download / Delete / "Check for updates" actions
- Progress indicator during download
- Add to Profile stack: `ProfileScreen → PackManagementScreen`

### Species Search in Offline Mode (`src/lib/ebird.ts`)
- Modify `searchSpeciesCached()` to check `isOfflineMode` flag
- If offline: query `bird_pack_species` WatermelonDB table instead of calling eBird API
- Search by `species_name` or `scientific_name` (LIKE query via WatermelonDB)

### Image display in Offline Mode (`src/components/BirdImage.tsx`)
- If offline: look up local cached file path from WatermelonDB instead of fetching Wikipedia
- Display using `expo-image` with local `file://` URI

---

## Phase 4: Offline-Aware Data Layer

### Goal
Route walk/sighting reads and writes through WatermelonDB when offline.

### Strategy
Create a thin **data service layer** that the screens call instead of hitting Supabase directly:
- `src/services/walksService.ts` — `getWalks()`, `createWalk()`, `updateWalk()`, `deleteWalk()`
- `src/services/sightingsService.ts` — `getSightings()`, `createSighting()`, `updateSighting()`, `deleteSighting()`

Each function checks `isOfflineMode`:
- **Online**: existing Supabase query (unchanged)
- **Offline**: WatermelonDB query/write, sets `is_dirty = true` on mutations

### Screen changes
Refactor these screens to use the service layer instead of direct Supabase calls:
- `WalksListScreen` — uses `walksService.getWalks()`
- `WalkDetailScreen` — uses `walksService.getWalk()` + `sightingsService.getSightings()`
- `NewWalkScreen` / `NewSightingModal` / `EditSightingModal` — use service layer for writes
- `LifersScreen` — in offline mode, derive lifers from local sightings DB

### Feature gating
Create a `useOfflineGate` hook that returns `{ blocked: boolean, reason: string }`. Use it to:
- Disable the Invite Collaborator button on `WalkDetailScreen` when offline
- Hide the Inbox tab badge / block navigation to `InboxScreen` when offline
- Disable `EditProfileScreen` navigation when offline
- Make collaborative walks read-only (no add/edit/delete sighting buttons)
- Show a `BlockedFeatureModal` explaining why an action isn't available offline

---

## Phase 5: Sync Engine

### Goal
Push local changes to Supabase when the user turns off offline mode.

### Sync Flow (triggered by `disableOfflineMode()`)
1. Query all `walks` and `sightings` where `is_dirty = true`
2. For each dirty record:
   - **New record** (no server id yet): INSERT into Supabase, update local record with server id + `is_dirty = false`
   - **Updated record**: UPDATE in Supabase using last-write-wins (compare `updated_at` timestamps)
   - **Deleted record**: soft-track deletions with a `deleted_locally` flag, then DELETE from Supabase
3. After push: pull latest from Supabase into local DB (refresh)
4. Show sync summary toast: "Synced 3 walks, 24 sightings"

### Sync Service (`src/services/syncService.ts`)
- `syncToSupabase()` — the main sync function
- Called from `OfflineContext.disableOfflineMode()`
- Show a loading state / progress in the offline toggle area while sync is in progress

### Initial population (first time going offline)
When user first enables offline mode, download their existing walks + sightings from Supabase into WatermelonDB so they're available offline. Show a "Preparing offline data..." loading state.

---

## Phase 6: UX Polish

- **Pack size test**: After image caching is implemented, measure total disk usage for CA pack. If >500MB, consider compressing images at download time or offering "light" (no images) vs "full" packs.
- **Offline mode indicator**: Subtle persistent banner or status indicator throughout the app.
- **Collaborative walk read-only state**: Clear visual indication that a walk is read-only while offline.
- **Sync errors**: If sync fails for a record, keep `is_dirty = true` and show an error in the profile settings area with a "Retry sync" button.

---

## Key Files to Create
| File | Purpose |
|------|---------|
| `src/contexts/OfflineContext.tsx` | Offline state + toggle |
| `src/db/schema.ts` | WatermelonDB schema |
| `src/db/models/*.ts` | WatermelonDB model classes |
| `src/db/index.ts` | DB singleton |
| `src/services/walksService.ts` | Online/offline walk CRUD |
| `src/services/sightingsService.ts` | Online/offline sighting CRUD |
| `src/services/syncService.ts` | Sync dirty records to Supabase |
| `src/screens/PackManagementScreen.tsx` | Pack download/management UI |
| `src/components/OfflineBanner.tsx` | Offline status indicator |
| `src/hooks/useOfflineGate.ts` | Feature gating hook |

## Key Files to Modify
| File | Change |
|------|--------|
| `src/lib/ebird.ts` | Offline species search via WatermelonDB |
| `src/components/BirdImage.tsx` | Serve local cached images when offline |
| `src/utils/birdImages.ts` | Add local file path lookup |
| `src/navigation/RootNavigator.tsx` | No-connectivity modal on mount |
| `src/navigation/ProfileNavigator.tsx` | Add PackManagement route |
| `src/screens/ProfileScreen.tsx` | Offline toggle, link to Pack Management |
| `src/screens/WalksListScreen.tsx` | Use walksService |
| `src/screens/WalkDetailScreen.tsx` | Use sightingsService, gate collab features |
| `src/screens/LifersScreen.tsx` | Derive lifers from local DB offline |
| `src/components/NewSightingModal.tsx` | Use sightingsService |
| `src/components/EditSightingModal.tsx` | Use sightingsService |
| `App.tsx` | Add OfflineProvider, WatermelonDB provider |

---

## Verification
1. **Pack download**: Download CA pack → confirm ~700 species appear, images cache to disk, pack appears in management screen.
2. **Offline toggle**: Toggle on → banner appears, eBird search works using local pack, Wikipedia not called.
3. **Walk creation offline**: Create walk + sightings → confirm they appear locally → toggle off → confirm they sync to Supabase.
4. **Feature gating**: While offline, verify Inbox nav is blocked, collaborative walk sighting buttons are hidden, profile edit is blocked.
5. **No-connectivity modal**: Kill network, reopen app (not in offline mode) → confirm modal appears.
6. **Image offline**: With pack downloaded + offline mode on, add a sighting → confirm bird image loads from local cache.

---

## Build Order (suggested)
1. Phase 1 (OfflineContext + toggle) — needed by everything else
2. Phase 2 (WatermelonDB schema) — foundation for data
3. Phase 4 (offline data layer + feature gating) — makes the app usable offline
4. Phase 3 (bird packs) — species search + images offline
5. Phase 5 (sync) — close the loop back to Supabase
6. Phase 6 (polish + size tests)
