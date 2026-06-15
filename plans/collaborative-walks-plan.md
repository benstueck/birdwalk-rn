# Collaborative Walks Implementation Plan

**Version:** 2.0
**Date:** 2026-06-15
**Status:** Phase 1 Complete — Ready for Phase 2

---

## Overview

Enable users to go on bird walks together. A collaborative walk is shared equally between all participants — every sighting counts toward everyone's lifers and stats, the walk appears in everyone's walks list, and sightings sync in real-time. Any collaborator can add, edit, or delete sightings and walk details (equal permissions).

### Primary Use Case
Two people go birding together. One starts a walk and invites the other. Both can log sightings. If either logs a new species, it appears as a lifer for both.

### What We're Deferring
- Followers/following system
- Push notifications
- Permission tiers (owner vs. contributor)
- Avatar image uploads (using preset bird sprites instead)

---

## Phases

### Phase 1: Database ✅ COMPLETE

All database infrastructure already built:
- `profiles` table (username, display_name, bio, avatar_id)
- `walk_collaborators` table (walk_id, user_id, role, joined_at)
- `walk_invitations` table (walk_id, inviter_id, invitee_id, message, status, expires_at)
- `created_by` column on sightings
- RLS policies (hybrid approach — simple access control at DB, business logic in app)
- DB functions: `get_accessible_walks`, `accept_walk_invitation`, `has_walk_permission`, `search_users_with_stats`
- Triggers: auto-add walk creator as owner, auto-set sighting creator
- Realtime enabled on sightings, walk_collaborators, walk_invitations

---

### Phase 2: User Profiles + NUX

**Goal:** Every user has a profile with a username. Profile setup is required before using the app.

#### Database types
- Update `src/types/database.ts` to include profiles table types
- Create `src/types/collaborative.ts` with `Profile`, `WalkWithCollaborators`, `SightingWithCreator` etc.

#### Profile service (`src/services/profileService.ts`)
- `createProfile(profile)` — insert into profiles
- `getProfile(userId)` — fetch by user ID
- `updateProfile(userId, updates)` — update own profile
- `isUsernameAvailable(username)` — case-insensitive check, returns boolean
- `searchUsers(query)` — search by username partial match, returns ProfileWithStats[]

#### Bird avatar system
10 preset bird emoji avatars selectable during profile setup. Each avatar is an ID (1–10) stored on the profile, rendered as a large emoji in a colored circle. Defined in `src/utils/avatars.ts`.

| ID | Emoji | Label |
|----|-------|-------|
| 1 | 🦅 | Eagle |
| 2 | 🦉 | Owl |
| 3 | 🦆 | Duck |
| 4 | 🦢 | Swan |
| 5 | 🦩 | Flamingo |
| 6 | 🦚 | Peacock |
| 7 | 🦜 | Parrot |
| 8 | 🐧 | Penguin |
| 9 | 🦤 | Dodo |
| 10 | 🪶 | Feather |

#### Debounce hook (`src/hooks/useDebounce.ts`)
Simple debounce hook used for username availability checking and user search.

#### ProfileSetupScreen (`src/screens/ProfileSetupScreen.tsx`)
Required screen shown to new users after signup — cannot be skipped.
- Username input with real-time availability check (debounced 500ms)
  - Green checkmark when available, red X when taken or invalid
  - Format: 3–20 chars, alphanumeric + underscores
- Display name input (1–50 chars)
- Bird avatar selector — horizontal scrollable row of 10 options
- Bio input (optional, max 200 chars)
- "Get Started" button — disabled until username valid and display name filled

#### Auth flow update
After login/signup, check if user has a profile. If not, route to ProfileSetupScreen before MainTabs. If yes, proceed normally.

#### ProfileScreen updates (`src/screens/ProfileScreen.tsx`)
- Display username, display name, avatar, bio
- "Edit Profile" option — inline or modal, allows editing display name, bio, avatar
- Link to Inbox (button that navigates there)

---

### Phase 3: Inbox

**Goal:** A simple message inbox where walk invitations are received and acted on. Lives in the Profile tab for now.

The `walk_invitations` table already handles the data model. The inbox is purely a UI layer on top of it.

#### InboxScreen (`src/screens/InboxScreen.tsx`)
- List of pending walk invitations sent to current user
- Each item shows:
  - Inviter's avatar + display name + @username
  - Walk name and date
  - Optional message from inviter
  - Expiry date
  - Accept / Decline buttons
- Pull to refresh
- Empty state: "No pending invitations"
- Real-time subscription: new invitations appear instantly without refresh
- On Accept: calls `accept_walk_invitation` DB function → walk added to walks list, all sightings retroactively count toward lifers
- On Decline: updates invitation status to 'declined', removes from list

#### Badge count
- Profile tab icon shows a badge when there are pending invitations
- Count from `walk_invitations` where `invitee_id = user.id AND status = 'pending'`
- Updates in real-time via Supabase subscription

#### Navigation
- Inbox button at top of ProfileScreen
- Badge on Profile tab icon in MainTabNavigator

#### Invitation service (`src/services/invitationService.ts`)
- `sendWalkInvitation(walkId, inviteeId, message?)` — insert invitation
- `getPendingInvitations()` — fetch pending for current user with walk + inviter profile data
- `acceptInvitation(invitationId)` — calls `accept_walk_invitation` RPC
- `declineInvitation(invitationId)` — updates status to 'declined'
- `cancelInvitation(invitationId)` — inviter cancels a sent invitation
- `getPendingInvitationCount()` — integer for badge count

---

### Phase 4: Collaborative Walks (App Layer)

**Goal:** Walks are shared between all participants. Stats and lifers count for everyone. Real-time sighting sync.

#### Equal permissions
All collaborators have identical permissions. Any collaborator can add, edit, or delete sightings and walk details, and invite others. No permission-checking hooks needed — if you're on the walk, you can do anything.

#### User search (`src/components/UserSearchModal.tsx`)
- Search users by username (partial match, case-insensitive)
- Results ranked: past collaborators first, then everyone else alphabetically
- Shows avatar, display name, @username
- Selecting a user moves to invite flow

#### Invite flow — from Walk Creation screen (`src/components/NewWalkModal.tsx`)
- After walk is saved, prompt: "Invite a collaborator?" with Skip option
- Opens user search → select user → optional message → Send
- Sends invitation via `sendWalkInvitation`

#### Invite flow — from Walk Detail screen (`src/screens/WalkDetailScreen.tsx`)
- "People" icon/button in walk header
- Shows current collaborators list with their avatars
- "Invite" button opens user search modal
- Cannot invite someone already on the walk or with a pending invitation
- Owner can cancel pending invitations from here

#### Walk list query update (`src/screens/WalksListScreen.tsx`)
Change from fetching walks where `user_id = me` to fetching walks where I'm in `walk_collaborators`:

```typescript
// OLD
.eq("walks.user_id", user.id)

// NEW
.from("walks")
.select("*, sightings(count), walk_collaborators!inner(user_id)")
.eq("walk_collaborators.user_id", user.id)
```

Collaborative walks show a collaborator indicator on the walk card (avatar stack or people icon + count).

#### Lifers query update (`src/screens/LifersScreen.tsx`)
Critical change: lifers now come from all walks you're a collaborator on, not just walks you own. This means your partner's sightings on a shared walk count toward your lifers.

```typescript
// OLD — only own walks
.eq("walks.user_id", user.id)

// NEW — all walks you participated in
// Join through walk_collaborators instead of filtering by walk.user_id
.select(`
  id, species_code, species_name, scientific_name, timestamp, walk_id,
  walks!inner (id, name, date, walk_collaborators!inner (user_id))
`)
.eq("walks.walk_collaborators.user_id", user.id)
```

Same change applies to any other stats queries (species counts, walk counts).

#### Sighting attribution (`src/components/SightingCard.tsx`)
- Show "Added by @username" with small avatar below species name
- `created_by` already set by DB trigger — query joins `profiles` on `created_by`
- Only shown on collaborative walks (no attribution needed for solo walks)

#### CollaboratorAvatars component (`src/components/CollaboratorAvatars.tsx`)
- Stacked circular avatars (overlapping, white border)
- Shows up to 3, then "+N" for more
- Used on walk cards in the list and in walk detail header
- Uses the bird sprite avatar system

#### Real-time sighting sync (`src/screens/WalkDetailScreen.tsx`)
Subscribe to sightings for this walk:
- INSERT → add to list
- UPDATE → update in place
- DELETE → remove from list

```typescript
supabase
  .channel(`walk:${walkId}:sightings`)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'sightings',
    filter: `walk_id=eq.${walkId}`
  }, handler)
  .subscribe()
```

---

## Key Files to Create

| File | Phase |
|------|-------|
| `src/types/collaborative.ts` | 2 |
| `src/hooks/useDebounce.ts` | 2 |
| `src/services/profileService.ts` | 2 |
| `src/screens/ProfileSetupScreen.tsx` | 2 |
| `src/assets/avatars/` (10 bird sprites) | 2 |
| `src/services/invitationService.ts` | 3 |
| `src/screens/InboxScreen.tsx` | 3 |
| `src/components/UserSearchModal.tsx` | 4 |
| `src/components/CollaboratorAvatars.tsx` | 4 |

## Key Files to Modify

| File | Change | Phase |
|------|--------|-------|
| `src/types/database.ts` | Add profiles, walk_collaborators, walk_invitations types | 2 |
| `src/contexts/AuthContext.tsx` | Check for profile on login, route to setup if missing | 2 |
| `src/screens/ProfileScreen.tsx` | Show profile data, edit option, inbox link | 2 |
| `src/navigation/` | ProfileSetup in auth flow, Inbox in profile tab, badge | 3 |
| `src/screens/WalksListScreen.tsx` | Fetch collaborative walks, show collaborator indicator | 4 |
| `src/screens/LifersScreen.tsx` | Query via walk_collaborators instead of walk.user_id | 4 |
| `src/components/NewWalkModal.tsx` | Add post-creation invite step | 4 |
| `src/screens/WalkDetailScreen.tsx` | Collaborators panel, invite button, real-time sync, attribution | 4 |
| `src/components/SightingCard.tsx` | Show "Added by @username" on collaborative walks | 4 |
| `src/components/WalkCard.tsx` | Show collaborator avatars/count for shared walks | 4 |

---

## Estimated Timeline

- **Phase 2 (Profiles + NUX):** ~1 week
- **Phase 3 (Inbox):** ~3 days
- **Phase 4 (Collaborative Walks):** ~1.5 weeks
- **Total:** ~3 weeks
