# Collaborative Walks — Implementation TODO

**Status:** Phase 1 Complete — Starting Phase 2
**Plan:** `/plans/collaborative-walks-plan.md` (v2.0)
**Estimated Duration:** ~3 weeks

---

## Phase 1: Database ✅ COMPLETE

- [x] `profiles` table created
- [x] `walk_collaborators` table created
- [x] `walk_invitations` table created
- [x] `created_by` column added to sightings
- [x] RLS policies applied (hybrid approach, no recursion)
- [x] DB functions created (`get_accessible_walks`, `accept_walk_invitation`, `has_walk_permission`, `search_users_with_stats`)
- [x] Triggers created (auto-owner on walk create, auto-creator on sighting insert)
- [x] Realtime enabled on sightings, walk_collaborators, walk_invitations
- [x] All tests passing, app stable

---

## Phase 2: User Profiles + NUX

**Goal:** Every user has a profile. Profile setup required before using the app.

### TypeScript types

- [x] Update `src/types/database.ts` — added profiles, walk_collaborators, walk_invitations types with FK Relationships
- [x] Create `src/types/collaborative.ts` — Profile, ProfileWithStats, WalkCollaborator, WalkInvitation, CollaboratorWithProfile, InvitationListItem

### Debounce hook

- [x] Create `src/hooks/useDebounce.ts`

### Profile service (`src/services/profileService.ts`)

- [x] `createProfile`, `getProfile`, `updateProfile`, `isUsernameAvailable`, `searchUsers`

### Bird avatar utility

- [x] Create `src/utils/avatars.ts` — 10 bird emoji mapped to IDs 1–10 (Eagle, Owl, Duck, Swan, Flamingo, Peacock, Parrot, Penguin, Dodo, Feather)

### ProfileSetupScreen (`src/screens/ProfileSetupScreen.tsx`)

- [x] Username input with debounced availability check and format validation
- [x] Display name input
- [x] Avatar selector — horizontal scrollable row of 10 bird emoji
- [x] Bio input with character counter
- [x] "Get Started" button disabled until valid
- [x] Dark mode support

### Auth flow update

- [x] `AuthContext` loads profile after login, exposes `profile` + `refreshProfile`
- [x] `RootNavigator` shows `ProfileSetupScreen` when user exists but has no profile

### ProfileScreen updates (`src/screens/ProfileScreen.tsx`)

- [x] Shows avatar emoji, display name, @username, bio from profile
- [x] Stats query updated to use `walk_collaborators` instead of `walks.user_id`
- [ ] "Edit Profile" button (not yet built)
- [ ] "Inbox" button (Phase 3)

**Phase 2 acceptance:**
- New users see profile setup before anything else
- Cannot proceed without valid username + display name
- Profile data visible and editable from Profile tab
- Avatar selection works and persists

---

## Phase 3: Inbox

**Goal:** Walk invitations land in an inbox. Recipients accept or decline.

### Invitation service (`src/services/invitationService.ts`)

- [ ] `sendWalkInvitation(walkId, inviteeId, message?)` — insert invitation, handle duplicate (23505)
- [ ] `getPendingInvitations()` — fetch pending for current user, join walk + inviter profile
- [ ] `acceptInvitation(invitationId)` — calls `accept_walk_invitation` RPC
- [ ] `declineInvitation(invitationId)` — updates status to 'declined', sets responded_at
- [ ] `cancelInvitation(invitationId)` — inviter cancels sent invitation
- [ ] `getPendingInvitationCount()` — integer, used for badge

### InboxScreen (`src/screens/InboxScreen.tsx`)

- [ ] List of pending walk invitations for current user
- [ ] Each item shows:
  - [ ] Inviter avatar + display name + @username
  - [ ] Walk name and date
  - [ ] Optional message
  - [ ] Expiry date ("Expires in X days")
  - [ ] Accept button (green)
  - [ ] Decline button (destructive)
- [ ] Pull to refresh
- [ ] Empty state: "No pending invitations" with icon
- [ ] Real-time subscription to `walk_invitations` for current user — new invitations appear live
- [ ] On Accept:
  - [ ] Call `acceptInvitation`
  - [ ] Remove from inbox list
  - [ ] Show confirmation: "You've joined [Walk Name]!"
- [ ] On Decline:
  - [ ] Confirm with alert
  - [ ] Call `declineInvitation`
  - [ ] Remove from list
- [ ] Dark mode support

### Badge count

- [ ] Add badge to Profile tab icon in MainTabNavigator
- [ ] Fetch count via `getPendingInvitationCount` on app focus
- [ ] Subscribe to `walk_invitations` inserts for current user to update badge in real-time
- [ ] Badge disappears when count reaches 0

### Navigation

- [ ] Add "Inbox" button to ProfileScreen (with badge count inline)
- [ ] Add InboxScreen to Profile stack navigator
- [ ] Profile tab icon in tab bar shows badge

**Phase 3 acceptance:**
- Sending an invitation creates an inbox item for the recipient in real-time
- Recipient can accept (walk appears in their list) or decline
- Badge count accurate and real-time
- Inviter can cancel from walk detail screen (Phase 4)

---

## Phase 4: Collaborative Walks (App Layer)

**Goal:** Walks shared between participants, lifers/stats count for all, real-time sync.

### Update walk list query (`src/screens/WalksListScreen.tsx`)

- [ ] Change query to join through `walk_collaborators` instead of filtering by `user_id`
- [ ] Include collaborators data for each walk (for avatar display)
- [ ] Show collaborative walk indicator on walk cards (people icon + count, or avatar stack)
- [ ] Verify both owned and accepted-collaborative walks appear

### Update lifers query (`src/screens/LifersScreen.tsx`)

- [ ] Change `.eq("walks.user_id", user.id)` → join via `walk_collaborators`
- [ ] Query: sightings on any walk where current user is in `walk_collaborators`
- [ ] This makes all sightings on shared walks count for your lifers, regardless of who logged them
- [ ] Verify: partner's sighting on shared walk appears in your lifers list

### Update any other stats queries

- [ ] ProfileScreen stats (total walks, total species) — same join change
- [ ] Any other places that query walks by `user_id` — audit and update

### UserSearchModal (`src/components/UserSearchModal.tsx`)

- [ ] Search input with debounce (500ms, min 2 chars)
- [ ] Results list: avatar + display name + @username
- [ ] Ranking: users you've collaborated with before appear first, then alphabetical
- [ ] Filter out users already on the walk or with pending invitation
- [ ] Loading state, empty state
- [ ] `onSelectUser` callback prop, `excludeUserIds` prop

### Collaborator avatars component (`src/components/CollaboratorAvatars.tsx`)

- [ ] Props: `collaborators[]`, `maxDisplay` (default 3), `size` (default 32)
- [ ] Stacked circles, each overlapping the previous by ~30%
- [ ] White/dark border between avatars
- [ ] Show "+N" circle when count exceeds maxDisplay
- [ ] Uses bird sprite avatars
- [ ] Works in both light and dark mode

### Walk card updates (`src/components/WalkCard.tsx`)

- [ ] Import and render CollaboratorAvatars for collaborative walks (2+ collaborators)
- [ ] Solo walks: no change
- [ ] Collaborative walks: show avatar stack below date

### Invite from NewWalkModal (`src/components/NewWalkModal.tsx`)

- [ ] After walk saved successfully, show "Invite a collaborator?" prompt
- [ ] Two options: "Invite Someone" and "Skip"
- [ ] "Invite Someone" opens UserSearchModal
- [ ] On user selected: show optional message input + "Send Invite" button
- [ ] Call `sendWalkInvitation` on send
- [ ] Skip or success both close the modal

### Walk detail — collaborators panel (`src/screens/WalkDetailScreen.tsx`)

- [ ] "People" button/icon in walk header showing collaborator count
- [ ] Tapping opens collaborators sheet/modal:
  - [ ] List of current collaborators with avatars
  - [ ] "Invite" button → opens UserSearchModal
  - [ ] Each collaborator row: avatar + display name + @username
  - [ ] Option to cancel pending invitations
- [ ] Fetch collaborators via `walk_collaborators` joined with `profiles`

### Real-time sighting sync (`src/screens/WalkDetailScreen.tsx`)

- [ ] Subscribe to sightings for current walk on mount
- [ ] INSERT handler: prepend new sighting to list
- [ ] UPDATE handler: replace matching sighting in list
- [ ] DELETE handler: filter out deleted sighting
- [ ] Unsubscribe on unmount
- [ ] Test with two devices: sighting added on one appears on the other within ~2s

### Sighting attribution (`src/components/SightingCard.tsx`)

- [ ] Update sighting query in WalkDetailScreen to join `profiles` on `created_by`
- [ ] Show "Added by @username" with their avatar on each sighting card
- [ ] Only show attribution on collaborative walks (skip for solo)
- [ ] Handle null `created_by` gracefully (legacy sightings)

**Phase 4 acceptance:**
- Accepted walk appears in both users' walks lists
- Both users see the same sightings in real-time
- Sightings count toward lifers for all collaborators
- Can invite from both walk creation and walk detail
- Attribution shows on each sighting
- Walk card shows collaborator avatars

---

## Testing Checklist

- [ ] New user signup → profile setup → can't skip → sets username/avatar → enters app
- [ ] Existing user login → bypasses profile setup → enters app
- [ ] User A creates walk → invites User B → User B sees badge + inbox item
- [ ] User B accepts → walk appears in User B's walks list
- [ ] User B adds sighting → appears on User A's screen within 2s
- [ ] That sighting appears in User A's lifers (even though User B logged it)
- [ ] User A adds sighting → appears in User B's lifers
- [ ] Walk appears in both users' walks list with collaborator indicator
- [ ] User B declines invitation → walk not added, no badge
- [ ] Dark mode on all new screens
