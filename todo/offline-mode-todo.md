# Offline Mode — Implementation TODO

**Status:** Phase 1 Complete — Starting Phase 2
**Plan:** `/plans/offline-mode-plan.md`

---

## Phase 1: Foundation — OfflineContext & UI

**Goal:** Wire up offline mode state machine and surface it in the UI.

### Dependencies

- [x] Install `expo-sqlite` (via `npx expo install`)
- [x] Install `expo-file-system`
- [x] Install `@react-native-community/netinfo`
- ~~`@nozbe/watermelondb`~~ — dropped in favour of expo-sqlite for Expo Go compatibility

### OfflineContext (`src/contexts/OfflineContext.tsx`)

- [x] `isOfflineMode: boolean` state, persisted to AsyncStorage (`@offline_mode_enabled`)
- [x] `pendingSyncCount: number` state
- [x] `enableOfflineMode()` — sets mode, triggers initial Supabase → local DB population
- [x] `disableOfflineMode()` — triggers sync, then clears mode
- [x] Wrap in `App.tsx` (alongside `AuthProvider`)

### Offline toggle UI

- [x] Add offline mode Switch row to `ProfileScreen` near the theme toggle
- [x] Add `OfflineBanner` component (`src/components/OfflineBanner.tsx`) — subtle top bar shown when offline
- [x] Display `OfflineBanner` in `RootNavigator` wrapping `MainNavigator`

### No-connectivity modal

- [x] In `RootNavigator`, use NetInfo to detect no connection on mount
- [x] If `!isOfflineMode && !isConnected`, show a modal offering to enable offline mode
- [x] One-time per app open (track with a ref, don't re-show if dismissed)

**Phase 1 acceptance:**
- Toggle in Profile tab persists across app restarts
- Banner visible throughout app when offline mode is on
- Modal appears on launch when no connection detected and offline mode is off

---

## Phase 2: expo-sqlite Schema & Local Database

**Goal:** Create the local SQLite database that mirrors Supabase for offline use.

### Schema & DB (`src/db/database.ts`)

- [ ] `walks` table: `id` (local uuid), `server_id`, `name`, `location_lat`, `location_lng`, `date`, `start_time`, `notes`, `created_at`, `is_collaborative`, `synced_at`, `is_dirty`, `deleted_locally`
- [ ] `sightings` table: `id` (local uuid), `server_id`, `walk_id` (local), `walk_server_id`, `species_code`, `species_name`, `scientific_name`, `location_lat`, `location_lng`, `timestamp`, `type`, `notes`, `created_at`, `created_by`, `synced_at`, `is_dirty`, `deleted_locally`
- [ ] `bird_packs` table: `region_code` (PK), `region_name`, `species_count`, `downloaded_at`, `is_active`
- [ ] `bird_pack_species` table: `pack_region_code`, `species_code`, `species_name`, `scientific_name`, `image_url`, `local_image_path`, `image_cached`
- [ ] `BirdPack.ts` — expo-sqlite model class
- [ ] `BirdPackSpecies.ts` — expo-sqlite model class

### DB initialization

- [ ] `src/db/database.ts` — expo-sqlite singleton, `CREATE TABLE IF NOT EXISTS` migrations, typed query helpers

**Phase 2 acceptance:**
- App boots without errors with expo-sqlite configured
- Can write and read records from all four tables in a test

---

## Phase 4: Offline-Aware Data Layer

*(Phase 4 before Phase 3 — gets the app working offline before adding bird packs)*

**Goal:** Route walk/sighting reads and writes through expo-sqlite when offline.

### Walks service (`src/services/walksService.ts`)

- [ ] `getWalks(userId)` — Supabase online / expo-sqlite offline
- [ ] `getWalk(walkId)` — Supabase online / expo-sqlite offline
- [ ] `createWalk(data)` — Supabase online / expo-sqlite with `is_dirty=true` offline
- [ ] `updateWalk(id, data)` — Supabase online / expo-sqlite with `is_dirty=true` offline
- [ ] `deleteWalk(id)` — Supabase online / set `deleted_locally=true` in expo-sqlite offline

### Sightings service (`src/services/sightingsService.ts`)

- [ ] `getSightings(walkId)` — Supabase online / expo-sqlite offline
- [ ] `createSighting(data)` — Supabase online / expo-sqlite with `is_dirty=true` offline
- [ ] `updateSighting(id, data)` — Supabase online / expo-sqlite with `is_dirty=true` offline
- [ ] `deleteSighting(id)` — Supabase online / set `deleted_locally=true` offline

### Screen refactors (use service layer)

- [ ] `WalksListScreen` — use `walksService.getWalks()`
- [ ] `WalkDetailScreen` — use `walksService.getWalk()` + `sightingsService.getSightings()`
- [ ] `NewWalkScreen` — use `walksService.createWalk()`
- [ ] `NewSightingModal` — use `sightingsService.createSighting()`
- [ ] `EditSightingModal` — use `sightingsService.updateSighting()` / `deleteSighting()`
- [ ] `LifersScreen` — derive lifers from local sightings DB when offline

### Feature gating (`src/hooks/useOfflineGate.ts`)

- [ ] `useOfflineGate(feature)` → `{ blocked: boolean, reason: string }`
- [ ] `BlockedFeatureModal` component — explains why action is unavailable offline
- [ ] Gate: Invite Collaborator button on `WalkDetailScreen`
- [ ] Gate: `InboxScreen` navigation (hide badge, block nav)
- [ ] Gate: `EditProfileScreen` navigation
- [ ] Gate: sighting add/edit/delete on collaborative walks (show read-only state)

**Phase 4 acceptance:**
- Create a walk and sighting in offline mode → both appear in the list
- Collaborative walk shows no add/edit buttons in offline mode
- Inbox badge hidden in offline mode
- Edit Profile row disabled in offline mode

---

## Phase 3: Bird Pack Download & Management

**Goal:** Download regional species lists + cached images for offline species search.

### Pack download flow

- [ ] Call `GET https://api.ebird.org/v2/product/spplist/US-CA` → CA species codes
- [ ] Call `GET https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species` → full taxonomy
- [ ] Filter taxonomy to CA species codes (~700 species)
- [ ] Batch-fetch Wikipedia image URLs using existing `fetchBirdImage()` from `src/utils/birdImages.ts`
- [ ] Download each image to local filesystem via `expo-file-system`
- [ ] Write all species + local paths to expo-sqlite `bird_pack_species` table
- [ ] Write pack metadata to `bird_packs` table
- [ ] Show progress UI: species count, images cached, MB downloaded

### PackManagementScreen (`src/screens/PackManagementScreen.tsx`)

- [ ] List available packs (hardcoded: California for now)
- [ ] Show download status, species count, estimated disk size
- [ ] Download button with progress indicator
- [ ] Delete pack (removes DB entries + cached image files)
- [ ] "Check for updates" placeholder (for future)
- [ ] Add route to Profile stack: `ProfileScreen → PackManagementScreen`
- [ ] Add "Bird Packs" row to `ProfileScreen` settings area

### Offline species search

- [ ] Modify `searchSpeciesCached()` in `src/lib/ebird.ts` to check `isOfflineMode`
- [ ] If offline: query `bird_pack_species` expo-sqlite by `species_name` / `scientific_name`
- [ ] Return same `EBirdSpecies` shape so callers need no changes

### Offline image serving

- [ ] Modify `src/components/BirdImage.tsx` — if offline, look up `local_image_path` from expo-sqlite
- [ ] Serve image using `file://` URI via `expo-image`
- [ ] Update `src/utils/birdImages.ts` with `getLocalImagePath(speciesCode)` helper

**Phase 3 acceptance:**
- Download CA pack → ~700 species in DB, images on disk
- In offline mode, species search works and returns results from local pack
- Bird images load from local cache (no network requests)
- Pack can be deleted cleanly

### Pack size test

- [ ] After download, log/display total disk usage
- [ ] If >500MB: evaluate image compression or light/full pack options

---

## Phase 5: Sync Engine

**Goal:** Push local offline changes back to Supabase when returning online.

### Initial offline population (on `enableOfflineMode()`)

- [ ] Fetch user's walks from Supabase → write to local expo-sqlite (mark `is_dirty=false`)
- [ ] Fetch sightings for each walk → write to local expo-sqlite (mark `is_dirty=false`)
- [ ] Show "Preparing offline data..." loading state during population

### Sync service (`src/services/syncService.ts`)

- [ ] `syncToSupabase()` — called by `disableOfflineMode()`
- [ ] Query all dirty walks (`is_dirty=true`)
  - [ ] New records (no `server_id`): INSERT to Supabase, update local `server_id` + clear `is_dirty`
  - [ ] Updated records: UPDATE in Supabase (last-write-wins by `updated_at`)
  - [ ] Deleted records (`deleted_locally=true`): DELETE from Supabase, remove local record
- [ ] Query all dirty sightings — same pattern
- [ ] After push: pull latest from Supabase into local DB (refresh)
- [ ] Return sync summary: `{ walksSynced, sightingsSynced, errors[] }`

### Sync UX

- [ ] Loading state during sync (show in offline toggle area or as modal)
- [ ] Toast on success: "Synced 3 walks, 24 sightings"
- [ ] On error: keep `is_dirty=true`, show error state in Profile with "Retry sync" button
- [ ] `pendingSyncCount` in OfflineContext reflects unsynced record count

**Phase 5 acceptance:**
- Create walk + sightings offline → go online → records appear in Supabase
- Second sync run is a no-op (all records clean)
- Sync errors shown with retry option

---

## Phase 6: UX Polish

- [ ] Collaborative walk read-only visual indicator (lock icon, "Read-only in offline mode" label)
- [ ] Sync error UI in Profile settings with retry button
- [ ] Verify dark mode on all new screens/components
- [ ] End-to-end verification (see plan Verification section)

---

## Testing Checklist

- [ ] Toggle offline mode on → banner appears, toggle persists after restart
- [ ] No connection on app open → modal appears offering offline mode
- [ ] Download CA pack → ~700 species, images on disk, size logged
- [ ] Offline species search returns results from local pack
- [ ] Bird images load from local cache in offline mode
- [ ] Create walk offline → appears in list → go online → syncs to Supabase
- [ ] Add sighting offline → appears in walk detail → syncs correctly
- [ ] Collaborative walk shows no add/edit/delete buttons in offline mode
- [ ] Inbox tab hidden / navigation blocked in offline mode
- [ ] Edit Profile blocked in offline mode
- [ ] Sync errors displayed with retry button
- [ ] All new UI works in light and dark mode
