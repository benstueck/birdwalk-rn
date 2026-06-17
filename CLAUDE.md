# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose platform interactively)
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a single test file
npx jest src/path/to/file.test.ts
```

There is no lint script configured. TypeScript checking is implicit via the editor and `tsc`.

## Architecture

### Stack
- **Expo** (SDK 54) + **React Native** 0.81
- **Supabase** for auth, database (Postgres), and real-time subscriptions
- **NativeWind** (Tailwind CSS for React Native) for styling
- **React Navigation** (native-stack + bottom-tabs)

### Provider hierarchy (`App.tsx`)
```
GestureHandlerRootView
  SafeAreaProvider
    ThemeProvider        ← light/dark/system, persisted to AsyncStorage
      AuthProvider       ← user session + profile, Supabase auth
        InvitationCountProvider  ← real-time pending invite badge count
          RootNavigator
```

### Navigation structure
`RootNavigator` renders one of three trees based on auth state:
- No user → `AuthNavigator` (Login, Signup)
- User but no profile → `ProfileSetupScreen` (required NUX)
- User + profile → `MainNavigator` (bottom tabs: Walks, Lifers, Profile)

The Profile tab is a nested stack: ProfileScreen → InboxScreen / EditProfileScreen / AccountSettingsScreen.

### Data flow
All Supabase queries currently live directly in screen components — there is no centralized data layer yet. The planned offline mode work will introduce `src/services/walksService.ts` and `src/services/sightingsService.ts` as a thin routing layer (Supabase online, WatermelonDB offline).

Key service files that do exist:
- `src/services/profileService.ts` — profile CRUD and user search
- `src/services/invitationService.ts` — walk invitation send/accept/decline
- `src/lib/ebird.ts` — eBird taxonomy API with in-memory cache
- `src/lib/searchService.ts` — cross-entity search (walks + species) via Supabase

### Database schema (Supabase/Postgres)
Core tables: `walks`, `sightings`, `profiles`, `walk_collaborators`, `walk_invitations`.

Key behaviors enforced by DB triggers:
- Creating a walk automatically inserts the creator as `owner` in `walk_collaborators`
- Inserting a sighting automatically sets `created_by` to the current user

Walks are accessed via `walk_collaborators` (not `walks.user_id`) so collaborative walks appear in both users' lists. All queries for walks/sightings/lifers must join through `walk_collaborators`.

Migrations live in `supabase/migrations/` and are applied manually via Supabase dashboard SQL editor (no CLI push in active use). See `supabase/migrations/README.md` for apply instructions.

### Styling
Two parallel systems work together:
1. **NativeWind** — Tailwind classes on RN components (`className="bg-white dark:bg-discord-secondary"`)
2. **ThemeContext colors object** — JS color values used when dynamic/programmatic styling is needed (e.g., gradients, imperative style props)

Dark mode uses Discord-inspired colors (`discord.primary` = `#36393f`, etc.). Always verify new UI in both light and dark mode. The `effectiveTheme` from `useTheme()` reflects the resolved theme when mode is 'system'.

### Bird images
`src/components/BirdImage.tsx` fetches from Wikipedia API using the common or scientific name. Images are cached in-memory per session and to disk via `expo-image`'s `cachePolicy="disk"`. The `src/utils/birdImages.ts` utility provides shared fetch + dimension caching. Offline mode (planned) will serve local `file://` URIs from a downloaded bird pack instead.

### Planned: Offline mode
See `plans/offline-mode-plan.md` and `todo/offline-mode-todo.md`. The approach uses WatermelonDB (SQLite) as a local mirror of walks/sightings, with downloadable regional "bird packs" for offline species search. Sync is last-write-wins, triggered manually when the user disables offline mode.

## Model usage
When spawning sub-agents or delegating work, prefer smaller models to preserve inference budget:
- **Haiku** (`claude-haiku-4-5-20251001`) — file reads, grep/search tasks, simple lookups, formatting
- **Sonnet** (`claude-sonnet-4-6`) — most coding tasks, refactors, screen/component work
- **Opus / Fable** — reserve for architecture decisions, complex debugging, planning, and anything requiring deep multi-file reasoning

## Project conventions
- `plans/` — implementation plan docs per feature
- `todo/` — granular checklist tracking per feature  
- `research/` — exploratory notes
- `ROADMAP.md` — feature backlog with priorities (P0/P1/P2)
