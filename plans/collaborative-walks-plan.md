# Collaborative Walks Implementation Plan

**Version:** 1.1 (Updated with Hybrid Security Approach)
**Date:** 2026-02-22
**Status:** In Progress - Phase 1
**Last Updated:** 2026-02-22 - Revised RLS approach after recursion issues

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature Requirements](#feature-requirements)
3. [Database Schema Changes](#database-schema-changes)
4. [Backend Changes](#backend-changes)
5. [Type Definitions](#type-definitions)
6. [API & Query Changes](#api--query-changes)
7. [UI Components](#ui-components)
8. [Implementation Phases](#implementation-phases)
9. [Code Examples](#code-examples)
10. [Testing Strategy](#testing-strategy)
11. [Edge Cases & Error Handling](#edge-cases--error-handling)
12. [Security Considerations](#security-considerations)

---

## Executive Summary

### Goal
Enable users to invite other users to their walks. When an invitation is accepted, the invited user can view the walk in their app and add bird sightings as if they created the walk themselves.

### Scope
**In Scope:**
- User profile system (username, display name, avatar URLs)
- User discovery (search by username/email)
- Walk invitation system (send, accept, decline)
- Multi-user access to walks
- Attribution of sightings to contributors
- Permission management (owner vs. contributor)
- Real-time updates when collaborators add sightings
- Visual collaborative indicators (stacked profile avatars on walk cards)

**Out of Scope:**
- Real-time location sharing
- Live presence indicators
- Group chat/messaging
- Photo sharing
- Advanced privacy zones

### Key Deliverables
1. 4 new database tables
2. Simple RLS policies (access control only - no recursion)
3. App-layer permission system (business logic)
4. 9+ new UI components/modals (including CollaboratorAvatars)
5. 15+ new TypeScript types
6. Real-time subscription setup
7. Visual collaborative indicators (stacked profile avatars)

### Estimated Timeline
- **Phase 1:** Database & Backend (1 week)
- **Phase 2:** User Profiles & Discovery (1 week)
- **Phase 3:** Invitation System (1.5 weeks)
- **Phase 4:** Collaborative Walk Access (1.5 weeks)
- **Phase 5:** Real-time Updates & Polish (1 week)
- **Total:** ~6 weeks

---

## Security Architecture: Hybrid Approach

**⚠️ Important: Revised After Initial Implementation Issues**

### What Happened
Initial implementation used complex RLS policies that caused **infinite recursion** errors:
- Walk policies checked walk_collaborators table
- Walk_collaborators policies checked walk_collaborators table recursively
- Result: Database stuck in infinite loop, app broke

### Solution: Hybrid Security Model

**Simple RLS (Database Layer) - Access Control Only:**
- ✅ Basic "can user see this data?" checks
- ✅ Prevents unauthorized database access
- ✅ Works with Supabase realtime/auth
- ❌ NO complex business logic
- ❌ NO recursive checks

**App Layer (TypeScript) - Business Logic:**
- ✅ Complex permission checks (can edit? can delete?)
- ✅ Role-based logic (owner vs contributor)
- ✅ Easy to debug and test
- ✅ User-friendly error messages

### RLS Policy Design Rules

**DO:**
- ✅ Simple checks: `user_id = auth.uid()`
- ✅ Direct lookups: `id IN (SELECT walk_id FROM walk_collaborators WHERE user_id = auth.uid())`
- ✅ Public data: `USING (true)` for profiles
- ✅ Single table checks only

**DON'T:**
- ❌ Recursive queries (table checking itself)
- ❌ Complex JOINs in policies
- ❌ EXISTS with multiple subqueries
- ❌ Business logic in RLS

### Example: Walk Permissions

**RLS Policy (Simple):**
```sql
-- Just checks: "Can user ACCESS this walk?"
CREATE POLICY "Users can view accessible walks"
  ON walks FOR SELECT
  USING (
    user_id = auth.uid()  -- Solo walks
    OR
    id IN (SELECT walk_id FROM walk_collaborators WHERE user_id = auth.uid())  -- Collaborative
  );
```

**App Layer (Complex):**
```typescript
// Checks: "Can user EDIT this walk?"
function useWalkPermissions(walkId: string) {
  const role = await getUserRole(walkId);

  return {
    canView: true,  // RLS already filtered this
    canEdit: role === 'owner',  // App logic
    canDelete: role === 'owner',  // App logic
    canAddSighting: role === 'owner' || role === 'contributor',  // App logic
  };
}
```

### Benefits of Hybrid Approach

1. **Security**: RLS prevents unauthorized access at DB level
2. **Simplicity**: No recursion, easy to understand policies
3. **Flexibility**: Complex logic in app code (debuggable)
4. **Performance**: Simple policies = fast queries
5. **Maintainability**: Business rules in one place (app)

---

## Feature Requirements

### 1. User Profiles
**As a user, I need a public profile so others can find and connect with me.**

**Requirements:**
- [x] Unique username (alphanumeric + underscores, 3-20 chars)
- [x] Display name (friendly name, 1-50 chars)
- [x] Optional bio (max 200 chars)
- [x] Optional avatar URL (future: upload support)
- [x] Profile creation during/after signup
- [x] Profile editing from settings

**Acceptance Criteria:**
- Users cannot proceed without setting a username
- Usernames are case-insensitive but preserve case for display
- Username availability check during input
- Profile updates reflect immediately across app

### 2. User Discovery
**As a user, I want to find other birders by username or email.**

**Requirements:**
- [x] Search users by username (partial match, case-insensitive)
- [x] Search users by email (exact match only, privacy)
- [x] View user profile (username, display name, bio, stats)
- [x] Cannot search for yourself
- [x] Empty states for no results

**Acceptance Criteria:**
- Search returns results within 500ms
- Maximum 50 results per search
- Privacy: email searches only return exact matches
- User stats show total walks, species count

### 3. Walk Invitations
**As a walk owner, I want to invite other users to collaborate on my walk.**

**Requirements:**
- [x] Invite users from walk detail screen
- [x] Search and select user to invite
- [x] Send invitation with optional message
- [x] One invitation per user per walk (no duplicates)
- [x] View pending invitations on walk
- [x] Cancel sent invitations
- [x] Notification when invitation sent

**Acceptance Criteria:**
- Cannot invite users already on the walk
- Cannot invite yourself
- Invitation expires after 30 days
- Walk owner can cancel invitations anytime
- Clear UI showing invited vs. active participants

### 4. Invitation Acceptance
**As an invited user, I want to accept or decline walk invitations.**

**Requirements:**
- [x] View pending invitations in dedicated section
- [x] Accept invitation to join walk
- [x] Decline invitation (with optional reason)
- [x] Invitation notification (push/in-app)
- [x] Invitation badge count on tab bar
- [x] Auto-add accepted walk to "My Walks"

**Acceptance Criteria:**
- Accepting adds user as contributor immediately
- Declining removes invitation permanently
- Owner receives notification on acceptance
- Accepted walk appears in walks list
- Clear distinction between owned vs. collaborative walks

### 5. Collaborative Walk Access
**As a contributor, I want full access to add sightings to shared walks.**

**Requirements:**
- [x] View collaborative walks in walks list
- [x] Add sightings to any collaborative walk
- [x] Edit own sightings on collaborative walks
- [x] Delete own sightings on collaborative walks
- [x] View all sightings (regardless of who added)
- [x] See who added each sighting
- [x] Visual indicator for collaborative walks (stacked profile avatars)
- [x] Display collaborator count on walk cards

**Acceptance Criteria:**
- Contributors can add unlimited sightings
- Contributors cannot edit walk details (name, date, notes)
- Contributors cannot delete the walk
- Contributors cannot edit/delete others' sightings
- Sightings show "Added by @username"
- Walk cards show stacked avatars for up to 3 collaborators
- "+X more" indicator shown when more than 3 collaborators
- Solo walks (1 person) show no avatars
- Collaborative walks (2+ people) show overlapping circular avatars

### 6. Permission Management
**As a walk owner, I have full control over the walk and its collaborators.**

**Requirements:**
- [x] View all participants on walk
- [x] Remove collaborators at any time
- [x] Edit walk details (name, date, notes)
- [x] Delete walk (cascades to all sightings & participants)
- [x] Edit/delete any sighting on walk
- [x] Transfer ownership (future)

**Acceptance Criteria:**
- Removing collaborator removes walk from their list
- Owner always has elevated permissions
- Clear permission denied messages
- Collaborators notified when removed

### 7. Real-time Updates
**As a collaborator, I want to see new sightings as they're added.**

**Requirements:**
- [x] Real-time subscription to walk sightings
- [x] Auto-refresh when new sighting added
- [x] Notification when collaborator adds sighting
- [x] Optimistic UI updates
- [x] Graceful handling of offline mode

**Acceptance Criteria:**
- New sightings appear within 2 seconds
- No page refresh needed
- Works on slow connections
- Clear "Syncing..." indicator

---

## Database Schema Changes

### 1. Profiles Table
**Purpose:** Store public user profile information for discovery and attribution.

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 200)
);

-- Index for username searches (case-insensitive)
CREATE INDEX idx_profiles_username_lower ON public.profiles (LOWER(username));

-- Index for lookups by user ID
CREATE INDEX idx_profiles_id ON public.profiles (id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles (for search)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile (cascade from auth.users)
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
```

**Columns:**
- `id` - UUID matching auth.users.id
- `username` - Unique, 3-20 chars, alphanumeric + underscores
- `display_name` - Friendly name, 1-50 chars
- `bio` - Optional, max 200 chars
- `avatar_url` - Optional, future use
- `created_at` - Profile creation timestamp
- `updated_at` - Last update timestamp

### 2. Walk Collaborators Table
**Purpose:** Track which users have access to which walks and their roles.

```sql
-- Create walk_collaborators table
CREATE TABLE public.walk_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('owner', 'contributor')),
  CONSTRAINT unique_walk_user UNIQUE (walk_id, user_id)
);

-- Indexes
CREATE INDEX idx_walk_collaborators_walk_id ON public.walk_collaborators (walk_id);
CREATE INDEX idx_walk_collaborators_user_id ON public.walk_collaborators (user_id);
CREATE INDEX idx_walk_collaborators_role ON public.walk_collaborators (role);

-- RLS Policies
ALTER TABLE public.walk_collaborators ENABLE ROW LEVEL SECURITY;

-- Users can view collaborators for walks they have access to
CREATE POLICY "View collaborators for accessible walks"
  ON public.walk_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_collaborators.walk_id
        AND wc.user_id = auth.uid()
    )
  );

-- Walk owners can insert collaborators
CREATE POLICY "Walk owners can add collaborators"
  ON public.walk_collaborators
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- Walk owners can remove collaborators
CREATE POLICY "Walk owners can remove collaborators"
  ON public.walk_collaborators
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_collaborators.walk_id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- Contributors can leave walks
CREATE POLICY "Contributors can leave walks"
  ON public.walk_collaborators
  FOR DELETE
  USING (user_id = auth.uid() AND role = 'contributor');
```

**Columns:**
- `id` - UUID primary key
- `walk_id` - Reference to walks table
- `user_id` - Reference to auth.users
- `role` - 'owner' or 'contributor'
- `joined_at` - When user joined the walk

**Important:** The walk owner should be added to this table when creating a walk.

### 3. Walk Invitations Table
**Purpose:** Manage pending invitations to walks.

```sql
-- Create walk_invitations table
CREATE TABLE public.walk_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  responded_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  CONSTRAINT unique_walk_invitee UNIQUE (walk_id, invitee_id),
  CONSTRAINT message_length CHECK (char_length(message) <= 200),
  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

-- Indexes
CREATE INDEX idx_walk_invitations_walk_id ON public.walk_invitations (walk_id);
CREATE INDEX idx_walk_invitations_invitee_id ON public.walk_invitations (invitee_id);
CREATE INDEX idx_walk_invitations_status ON public.walk_invitations (status);
CREATE INDEX idx_walk_invitations_expires_at ON public.walk_invitations (expires_at);

-- RLS Policies
ALTER TABLE public.walk_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent or received
CREATE POLICY "View own invitations"
  ON public.walk_invitations
  FOR SELECT
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

-- Walk collaborators can send invitations
CREATE POLICY "Walk collaborators can send invitations"
  ON public.walk_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_id
        AND wc.user_id = auth.uid()
    )
  );

-- Inviters can cancel invitations
CREATE POLICY "Inviters can cancel invitations"
  ON public.walk_invitations
  FOR UPDATE
  USING (inviter_id = auth.uid() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Invitees can accept/decline invitations
CREATE POLICY "Invitees can respond to invitations"
  ON public.walk_invitations
  FOR UPDATE
  USING (invitee_id = auth.uid() AND status = 'pending')
  WITH CHECK (status IN ('accepted', 'declined'));

-- Auto-delete expired invitations (run via cron or trigger)
CREATE OR REPLACE FUNCTION delete_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.walk_invitations
  SET status = 'cancelled'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Columns:**
- `id` - UUID primary key
- `walk_id` - Reference to walk
- `inviter_id` - User who sent invitation
- `invitee_id` - User receiving invitation
- `message` - Optional invitation message (max 200 chars)
- `status` - 'pending', 'accepted', 'declined', 'cancelled'
- `created_at` - When invitation was sent
- `expires_at` - When invitation expires (30 days default)
- `responded_at` - When invitee responded

### 4. Sightings Table Update
**Purpose:** Track who added each sighting for attribution.

```sql
-- Add created_by column to sightings table
ALTER TABLE public.sightings
ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill existing sightings (optional: match walk owner)
UPDATE public.sightings s
SET created_by = w.user_id
FROM public.walks w
WHERE s.walk_id = w.id
  AND s.created_by IS NULL;

-- Create index for lookups
CREATE INDEX idx_sightings_created_by ON public.sightings (created_by);
```

**New Column:**
- `created_by` - UUID of user who added the sighting (NULL for legacy data)

### 5. Database Functions

#### Get User's Accessible Walks
```sql
-- Function to get all walks a user can access (owns or collaborates on)
CREATE OR REPLACE FUNCTION get_accessible_walks(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  date TEXT,
  start_time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  role TEXT,
  sighting_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.user_id,
    w.name,
    w.location_lat,
    w.location_lng,
    w.date,
    w.start_time,
    w.notes,
    w.created_at,
    wc.role,
    COUNT(s.id) as sighting_count
  FROM public.walks w
  INNER JOIN public.walk_collaborators wc ON w.id = wc.walk_id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE wc.user_id = user_uuid
  GROUP BY w.id, w.user_id, w.name, w.location_lat, w.location_lng,
           w.date, w.start_time, w.notes, w.created_at, wc.role
  ORDER BY w.date DESC, w.start_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Accept Walk Invitation
```sql
-- Function to accept invitation and add user as collaborator
CREATE OR REPLACE FUNCTION accept_walk_invitation(invitation_uuid UUID)
RETURNS void AS $$
DECLARE
  v_walk_id UUID;
  v_invitee_id UUID;
BEGIN
  -- Get invitation details and validate
  SELECT walk_id, invitee_id INTO v_walk_id, v_invitee_id
  FROM public.walk_invitations
  WHERE id = invitation_uuid
    AND invitee_id = auth.uid()
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Add user as collaborator
  INSERT INTO public.walk_collaborators (walk_id, user_id, role)
  VALUES (v_walk_id, v_invitee_id, 'contributor')
  ON CONFLICT (walk_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.walk_invitations
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Check Walk Permission
```sql
-- Function to check if user has permission for a walk
CREATE OR REPLACE FUNCTION has_walk_permission(
  p_walk_id UUID,
  p_user_id UUID,
  p_required_role TEXT DEFAULT 'contributor'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.walk_collaborators
  WHERE walk_id = p_walk_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_required_role = 'owner' THEN
    RETURN v_role = 'owner';
  ELSE
    RETURN v_role IN ('owner', 'contributor');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6. Updated RLS Policies for Existing Tables

**⚠️ REVISED: Simple policies only - no recursion**

#### Walks Table (Simple RLS - Access Control Only)
```sql
-- Replace existing walks RLS policies with SIMPLE versions

-- SIMPLE: Users can view walks they own OR are collaborators on
DROP POLICY IF EXISTS "Users can view their own walks" ON public.walks;
DROP POLICY IF EXISTS "Users can view accessible walks" ON public.walks;

CREATE POLICY "Users can view their walks"
  ON public.walks
  FOR SELECT
  USING (
    user_id = auth.uid()  -- Solo walks (own)
    OR
    id IN (  -- Collaborative walks (no recursion!)
      SELECT walk_id
      FROM public.walk_collaborators
      WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can create walks (auto-owner via trigger)
DROP POLICY IF EXISTS "Users can create walks" ON public.walks;

CREATE POLICY "Users can create walks"
  ON public.walks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- SIMPLE: Users can update their own walks
-- NOTE: Owner-only check moved to APP LAYER (useWalkPermissions hook)
DROP POLICY IF EXISTS "Users can update their own walks" ON public.walks;
DROP POLICY IF EXISTS "Walk owners can update walks" ON public.walks;

CREATE POLICY "Users can update their walks"
  ON public.walks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- SIMPLE: Users can delete their own walks
-- NOTE: Owner-only check moved to APP LAYER
DROP POLICY IF EXISTS "Users can delete their own walks" ON public.walks;
DROP POLICY IF EXISTS "Walk owners can delete walks" ON public.walks;

CREATE POLICY "Users can delete their walks"
  ON public.walks
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to auto-add creator as owner
CREATE OR REPLACE FUNCTION add_walk_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.walk_collaborators (walk_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_walk_owner_trigger
  AFTER INSERT ON public.walks
  FOR EACH ROW
  EXECUTE FUNCTION add_walk_owner();
```

#### Sightings Table (Simple RLS - Access Control Only)
```sql
-- Replace existing sightings RLS policies with SIMPLE versions

-- SIMPLE: Users can view sightings for walks they have access to
DROP POLICY IF EXISTS "Users can view sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can view sightings for accessible walks" ON public.sightings;

CREATE POLICY "Users can view sightings for their walks"
  ON public.sightings
  FOR SELECT
  USING (
    walk_id IN (  -- Simple subquery, no recursion
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can add sightings to their walks
-- NOTE: Collaborator check handled by walks access (above)
DROP POLICY IF EXISTS "Collaborators can add sightings" ON public.sightings;
DROP POLICY IF EXISTS "Users can insert sightings for their walks" ON public.sightings;

CREATE POLICY "Users can add sightings to their walks"
  ON public.sightings
  FOR INSERT
  WITH CHECK (
    walk_id IN (
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can update sightings on their walks
-- NOTE: "Only own sightings" and "owner can edit any" checks moved to APP LAYER
DROP POLICY IF EXISTS "Users can update sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can update sightings they created or own" ON public.sightings;

CREATE POLICY "Users can update sightings on their walks"
  ON public.sightings
  FOR UPDATE
  USING (
    walk_id IN (
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    walk_id IN (
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can delete sightings on their walks
-- NOTE: "Only own sightings" check moved to APP LAYER
DROP POLICY IF EXISTS "Users can delete sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can delete sightings they created or own" ON public.sightings;

CREATE POLICY "Users can delete sightings on their walks"
  ON public.sightings
  FOR DELETE
  USING (
    walk_id IN (
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  );

-- Trigger to auto-set created_by on insert
CREATE OR REPLACE FUNCTION set_sighting_creator()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_sighting_creator_trigger
  BEFORE INSERT ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION set_sighting_creator();
```

---

## Backend Changes

### Migration Files Structure

Create numbered migration files in `supabase/migrations/` (or apply via Supabase Dashboard):

1. `20260221000001_create_profiles.sql` - Profiles table
2. `20260221000002_create_walk_collaborators.sql` - Walk collaborators table
3. `20260221000003_create_walk_invitations.sql` - Invitations table
4. `20260221000004_add_sighting_creator.sql` - Add created_by to sightings
5. `20260221000005_update_walks_rls.sql` - Update walks RLS policies
6. `20260221000006_update_sightings_rls.sql` - Update sightings RLS policies
7. `20260221000007_create_functions.sql` - Database functions

### Supabase Realtime Subscriptions

Enable realtime for collaborative updates:

```sql
-- Enable realtime for sightings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.sightings;

-- Enable realtime for walk_collaborators
ALTER PUBLICATION supabase_realtime ADD TABLE public.walk_collaborators;

-- Enable realtime for walk_invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.walk_invitations;
```

---

## Type Definitions

### Database Types Update

Update `/Users/ben/Projects/birdwalk-rn/src/types/database.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...

      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      walk_collaborators: {
        Row: {
          id: string;
          walk_id: string;
          user_id: string;
          role: 'owner' | 'contributor';
          joined_at: string;
        };
        Insert: {
          id?: string;
          walk_id: string;
          user_id: string;
          role?: 'owner' | 'contributor';
          joined_at?: string;
        };
        Update: {
          id?: string;
          walk_id?: string;
          user_id?: string;
          role?: 'owner' | 'contributor';
          joined_at?: string;
        };
      };

      walk_invitations: {
        Row: {
          id: string;
          walk_id: string;
          inviter_id: string;
          invitee_id: string;
          message: string | null;
          status: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at: string;
          expires_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          walk_id: string;
          inviter_id: string;
          invitee_id: string;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at?: string;
          expires_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          walk_id?: string;
          inviter_id?: string;
          invitee_id?: string;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at?: string;
          expires_at?: string;
          responded_at?: string | null;
        };
      };

      sightings: {
        Row: {
          // ... existing fields ...
          created_by: string | null;
        };
        Insert: {
          // ... existing fields ...
          created_by?: string | null;
        };
        Update: {
          // ... existing fields ...
          created_by?: string | null;
        };
      };
    };

    Functions: {
      get_accessible_walks: {
        Args: { user_uuid: string };
        Returns: Array<{
          id: string;
          user_id: string;
          name: string;
          location_lat: number | null;
          location_lng: number | null;
          date: string;
          start_time: string;
          notes: string | null;
          created_at: string;
          role: 'owner' | 'contributor';
          sighting_count: number;
        }>;
      };
      accept_walk_invitation: {
        Args: { invitation_uuid: string };
        Returns: void;
      };
      has_walk_permission: {
        Args: {
          p_walk_id: string;
          p_user_id: string;
          p_required_role?: 'owner' | 'contributor';
        };
        Returns: boolean;
      };
    };
  };
}
```

### Application Types

Create `/Users/ben/Projects/birdwalk-rn/src/types/collaborative.ts`:

```typescript
import { Database } from './database';

// Type aliases for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type WalkCollaborator = Database['public']['Tables']['walk_collaborators']['Row'];
export type WalkCollaboratorInsert = Database['public']['Tables']['walk_collaborators']['Insert'];
export type WalkCollaboratorUpdate = Database['public']['Tables']['walk_collaborators']['Update'];

export type WalkInvitation = Database['public']['Tables']['walk_invitations']['Row'];
export type WalkInvitationInsert = Database['public']['Tables']['walk_invitations']['Insert'];
export type WalkInvitationUpdate = Database['public']['Tables']['walk_invitations']['Update'];

// Extended types with joined data
export interface ProfileWithStats extends Profile {
  total_walks: number;
  total_species: number;
}

export interface WalkWithRole extends Walk {
  role: 'owner' | 'contributor';
  collaborator_count: number;
}

export interface WalkCollaboratorWithProfile extends WalkCollaborator {
  profile: Profile;
}

export interface WalkInvitationWithProfiles extends WalkInvitation {
  inviter_profile: Profile;
  walk: {
    id: string;
    name: string;
    date: string;
  };
}

export interface SightingWithCreator extends Sighting {
  creator_profile: Profile | null;
}

// UI-specific types
export interface CollaboratorListItem {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: 'owner' | 'contributor';
  joined_at: string;
}

export interface InvitationListItem {
  id: string;
  walk_id: string;
  walk_name: string;
  walk_date: string;
  inviter_username: string;
  inviter_display_name: string;
  message: string | null;
  created_at: string;
  expires_at: string;
}

// Permission helpers
export type WalkPermission = 'view' | 'add_sighting' | 'edit_sighting' | 'delete_sighting' | 'edit_walk' | 'delete_walk' | 'manage_collaborators';

export interface PermissionCheck {
  canView: boolean;
  canAddSighting: boolean;
  canEditOwnSighting: boolean;
  canDeleteOwnSighting: boolean;
  canEditAnySighting: boolean;
  canDeleteAnySighting: boolean;
  canEditWalk: boolean;
  canDeleteWalk: boolean;
  canManageCollaborators: boolean;
  role: 'owner' | 'contributor' | null;
}
```

---

## API & Query Changes

### 1. Profile Queries

Create `/Users/ben/Projects/birdwalk-rn/src/services/profileService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import type { Profile, ProfileInsert, ProfileUpdate, ProfileWithStats } from '../types/collaborative';

/**
 * Create a new user profile
 */
export async function createProfile(profile: ProfileInsert) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('id')
    .ilike('username', username);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data, error } = await query.single();

  if (error && error.code === 'PGRST116') return true; // Not found = available
  if (error) throw error;

  return !data;
}

/**
 * Search users by username (partial match)
 */
export async function searchUsersByUsername(query: string, limit: number = 50): Promise<ProfileWithStats[]> {
  const { data, error } = await supabase
    .rpc('search_users_with_stats', {
      search_query: query,
      limit_count: limit
    });

  if (error) throw error;
  return data || [];
}

/**
 * Search user by exact email
 */
export async function searchUserByEmail(email: string): Promise<Profile | null> {
  // Note: This requires a database function for security
  const { data, error } = await supabase
    .rpc('search_user_by_email', { email_query: email });

  if (error) throw error;
  return data;
}

/**
 * Get profile with stats (total walks, species count)
 */
export async function getProfileWithStats(userId: string): Promise<ProfileWithStats | null> {
  const { data, error } = await supabase
    .rpc('get_profile_with_stats', { user_uuid: userId });

  if (error) throw error;
  return data;
}
```

**Required Database Functions:**

```sql
-- Search users with stats
CREATE OR REPLACE FUNCTION search_users_with_stats(
  search_query TEXT,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_walks BIGINT,
  total_species BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT wc.walk_id) as total_walks,
    COUNT(DISTINCT s.species_code) as total_species
  FROM public.profiles p
  LEFT JOIN public.walk_collaborators wc ON p.id = wc.user_id
  LEFT JOIN public.walks w ON wc.walk_id = w.id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE p.username ILIKE '%' || search_query || '%'
    AND p.id != auth.uid() -- Exclude current user
  GROUP BY p.id, p.username, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at
  ORDER BY p.username
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get profile with stats
CREATE OR REPLACE FUNCTION get_profile_with_stats(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_walks BIGINT,
  total_species BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT wc.walk_id) as total_walks,
    COUNT(DISTINCT s.species_code) as total_species
  FROM public.profiles p
  LEFT JOIN public.walk_collaborators wc ON p.id = wc.user_id
  LEFT JOIN public.walks w ON wc.walk_id = w.id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE p.id = user_uuid
  GROUP BY p.id, p.username, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Collaborator Queries

Create `/Users/ben/Projects/birdwalk-rn/src/services/collaboratorService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import type { WalkCollaborator, WalkCollaboratorWithProfile, CollaboratorListItem } from '../types/collaborative';

/**
 * Get all collaborators for a walk
 */
export async function getWalkCollaborators(walkId: string): Promise<CollaboratorListItem[]> {
  const { data, error } = await supabase
    .from('walk_collaborators')
    .select(`
      *,
      profile:profiles(username, display_name, avatar_url)
    `)
    .eq('walk_id', walkId)
    .order('role', { ascending: false }) // Owners first
    .order('joined_at', { ascending: true });

  if (error) throw error;

  // Transform to UI-friendly format
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    username: item.profile.username,
    display_name: item.profile.display_name,
    avatar_url: item.profile.avatar_url,
    role: item.role,
    joined_at: item.joined_at,
  }));
}

/**
 * Add collaborator to walk (used internally by invitation acceptance)
 */
export async function addCollaborator(walkId: string, userId: string, role: 'owner' | 'contributor' = 'contributor') {
  const { data, error } = await supabase
    .from('walk_collaborators')
    .insert({ walk_id: walkId, user_id: userId, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove collaborator from walk
 */
export async function removeCollaborator(walkId: string, userId: string) {
  const { error } = await supabase
    .from('walk_collaborators')
    .delete()
    .eq('walk_id', walkId)
    .eq('user_id', userId)
    .neq('role', 'owner'); // Cannot remove owner

  if (error) throw error;
}

/**
 * Leave a walk (as contributor)
 */
export async function leaveWalk(walkId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('walk_collaborators')
    .delete()
    .eq('walk_id', walkId)
    .eq('user_id', user.id)
    .eq('role', 'contributor'); // Contributors can leave, owners cannot

  if (error) throw error;
}

/**
 * Get user's role for a walk
 */
export async function getWalkRole(walkId: string): Promise<'owner' | 'contributor' | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('walk_collaborators')
    .select('role')
    .eq('walk_id', walkId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data.role;
}

/**
 * Check if user is collaborator on walk
 */
export async function isWalkCollaborator(walkId: string): Promise<boolean> {
  const role = await getWalkRole(walkId);
  return role !== null;
}
```

### 3. Invitation Queries

Create `/Users/ben/Projects/birdwalk-rn/src/services/invitationService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import type { WalkInvitation, WalkInvitationInsert, InvitationListItem } from '../types/collaborative';

/**
 * Send a walk invitation
 */
export async function sendWalkInvitation(walkId: string, inviteeId: string, message?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const invitation: WalkInvitationInsert = {
    walk_id: walkId,
    inviter_id: user.id,
    invitee_id: inviteeId,
    message: message || null,
  };

  const { data, error } = await supabase
    .from('walk_invitations')
    .insert(invitation)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('User has already been invited to this walk');
    }
    throw error;
  }

  return data;
}

/**
 * Get pending invitations for current user
 */
export async function getPendingInvitations(): Promise<InvitationListItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('walk_invitations')
    .select(`
      *,
      inviter:profiles!inviter_id(username, display_name),
      walk:walks(id, name, date)
    `)
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(item => ({
    id: item.id,
    walk_id: item.walk.id,
    walk_name: item.walk.name,
    walk_date: item.walk.date,
    inviter_username: item.inviter.username,
    inviter_display_name: item.inviter.display_name,
    message: item.message,
    created_at: item.created_at,
    expires_at: item.expires_at,
  }));
}

/**
 * Get sent invitations for a walk
 */
export async function getWalkInvitations(walkId: string): Promise<WalkInvitation[]> {
  const { data, error } = await supabase
    .from('walk_invitations')
    .select(`
      *,
      invitee:profiles!invitee_id(username, display_name, avatar_url)
    `)
    .eq('walk_id', walkId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Accept a walk invitation
 */
export async function acceptInvitation(invitationId: string) {
  const { error } = await supabase
    .rpc('accept_walk_invitation', { invitation_uuid: invitationId });

  if (error) throw error;
}

/**
 * Decline a walk invitation
 */
export async function declineInvitation(invitationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('walk_invitations')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('invitee_id', user.id)
    .eq('status', 'pending');

  if (error) throw error;
}

/**
 * Cancel a sent invitation
 */
export async function cancelInvitation(invitationId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('walk_invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId)
    .eq('inviter_id', user.id)
    .eq('status', 'pending');

  if (error) throw error;
}

/**
 * Get count of pending invitations for current user
 */
export async function getPendingInvitationCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('walk_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;
  return count || 0;
}
```

### 4. Updated Walk Queries

Update `/Users/ben/Projects/birdwalk-rn/src/screens/WalksListScreen.tsx` query:

```typescript
// OLD: Only fetch user's own walks
const { data, error } = await supabase
  .from("walks")
  .select("*, sightings(count)")
  .eq("user_id", user.id)
  .order("date", { ascending: false });

// NEW: Fetch all accessible walks (owned + collaborative)
const { data, error } = await supabase
  .from("walks")
  .select(`
    *,
    sightings(count),
    walk_collaborators!inner(role)
  `)
  .eq("walk_collaborators.user_id", user.id)
  .order("date", { ascending: false });

// Transform data to include role
const walksWithRole = data?.map(walk => ({
  ...walk,
  role: walk.walk_collaborators[0]?.role,
  isCollaborative: walk.walk_collaborators[0]?.role === 'contributor',
}));
```

### 5. Real-time Subscriptions

Create `/Users/ben/Projects/birdwalk-rn/src/hooks/useRealtimeSightings.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Sighting } from '../types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSightings(walkId: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to sighting changes for this walk
    const subscription = supabase
      .channel(`walk:${walkId}:sightings`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'sightings',
          filter: `walk_id=eq.${walkId}`,
        },
        (payload) => {
          console.log('Sighting change:', payload);
          // Payload will be handled by parent component
        }
      )
      .subscribe();

    setChannel(subscription);

    return () => {
      subscription.unsubscribe();
    };
  }, [walkId]);

  return channel;
}

// Usage in WalkDetailScreen:
/*
const channel = useRealtimeSightings(walkId);

useEffect(() => {
  if (!channel) return;

  channel.on('postgres_changes', { event: 'INSERT' }, (payload) => {
    // Add new sighting to list
    setSightings(prev => [payload.new as Sighting, ...prev]);
  });

  channel.on('postgres_changes', { event: 'UPDATE' }, (payload) => {
    // Update existing sighting
    setSightings(prev => prev.map(s =>
      s.id === payload.new.id ? payload.new as Sighting : s
    ));
  });

  channel.on('postgres_changes', { event: 'DELETE' }, (payload) => {
    // Remove deleted sighting
    setSightings(prev => prev.filter(s => s.id !== payload.old.id));
  });
}, [channel]);
*/
```

---

## UI Components

### 1. Profile Setup Screen

Create `/Users/ben/Projects/birdwalk-rn/src/screens/ProfileSetupScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { createProfile, isUsernameAvailable } from '../services/profileService';
import { useDebounce } from '../hooks/useDebounce';

export function ProfileSetupScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const debouncedUsername = useDebounce(username, 500);

  // Check username availability
  useEffect(() => {
    async function checkUsername() {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      // Validate format
      if (!/^[a-zA-Z0-9_]+$/.test(debouncedUsername)) {
        setUsernameAvailable(false);
        return;
      }

      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(debouncedUsername);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    }

    checkUsername();
  }, [debouncedUsername]);

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (username.length < 3 || username.length > 20) {
      Alert.alert('Invalid Username', 'Username must be 3-20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!usernameAvailable) {
      Alert.alert('Username Taken', 'This username is already taken. Please choose another.');
      return;
    }

    if (displayName.length < 1 || displayName.length > 50) {
      Alert.alert('Invalid Display Name', 'Display name must be 1-50 characters');
      return;
    }

    setLoading(true);

    try {
      await createProfile({
        id: user.id,
        username: username.toLowerCase(), // Store lowercase
        display_name: displayName,
        bio: bio || null,
      });

      // Navigate to main app
      navigation.replace('Main');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.length >= 3 &&
                      displayName.length >= 1 &&
                      usernameAvailable === true &&
                      !checkingUsername;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] mb-2">
            Create Your Profile
          </Text>
          <Text className="text-gray-600 dark:text-[#b9bbbe] mb-8">
            Choose a username so other birders can find you
          </Text>

          {/* Username Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
              Username *
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="birdwatcher123"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde]"
            />
            <View className="flex-row items-center mt-1">
              {checkingUsername && (
                <ActivityIndicator size="small" color={colors.accent} />
              )}
              {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                <Text className="text-green-600 dark:text-green-400 text-sm">
                  ✓ Username available
                </Text>
              )}
              {!checkingUsername && usernameAvailable === false && username.length >= 3 && (
                <Text className="text-red-600 dark:text-[#ed4245] text-sm">
                  ✗ Username taken or invalid
                </Text>
              )}
            </View>
            <Text className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
              3-20 characters, letters, numbers, and underscores only
            </Text>
          </View>

          {/* Display Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
              Display Name *
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Bird Watcher"
              placeholderTextColor={colors.input.placeholder}
              maxLength={50}
              className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde]"
            />
            <Text className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
              Your friendly name (1-50 characters)
            </Text>
          </View>

          {/* Bio Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
              Bio (Optional)
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="I love spotting birds!"
              placeholderTextColor={colors.input.placeholder}
              multiline
              numberOfLines={3}
              maxLength={200}
              className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde]"
              style={{ textAlignVertical: 'top' }}
            />
            <Text className="text-xs text-gray-500 dark:text-[#72767d] mt-1">
              {bio.length}/200 characters
            </Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={!isFormValid || loading}
            className={`rounded-lg py-4 ${
              isFormValid && !loading
                ? 'bg-blue-600 dark:bg-[#5865f2]'
                : 'bg-gray-300 dark:bg-[#4f545c]'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

### 2. User Search Modal

Create `/Users/ben/Projects/birdwalk-rn/src/components/UserSearchModal.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { searchUsersByUsername } from '../services/profileService';
import { useDebounce } from '../hooks/useDebounce';
import type { ProfileWithStats } from '../types/collaborative';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: ProfileWithStats) => void;
  excludeUserIds?: string[];
  title?: string;
  emptyMessage?: string;
}

export function UserSearchModal({
  visible,
  onClose,
  onSelectUser,
  excludeUserIds = [],
  title = 'Search Users',
  emptyMessage = 'No users found',
}: UserSearchModalProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Search users
  useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const users = await searchUsersByUsername(debouncedQuery);
        // Filter out excluded users
        const filtered = users.filter(u => !excludeUserIds.includes(u.id));
        setResults(filtered);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [debouncedQuery, excludeUserIds]);

  const renderUser = useCallback(({ item }: { item: ProfileWithStats }) => (
    <Pressable
      onPress={() => {
        onSelectUser(item);
        setQuery('');
        setResults([]);
      }}
      className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
    >
      {/* Avatar */}
      <View className="w-12 h-12 bg-gray-200 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
        <Text className="text-xl text-gray-600 dark:text-[#72767d]">
          {item.display_name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
          {item.display_name}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-[#72767d]">
          @{item.username}
        </Text>
        {item.bio && (
          <Text className="text-sm text-gray-600 dark:text-[#b9bbbe] mt-1" numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        <Text className="text-xs text-gray-400 dark:text-[#72767d] mt-1">
          {item.total_walks} walks • {item.total_species} species
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </Pressable>
  ), [onSelectUser, colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-[#36393f]">
        {/* Header */}
        <View className="bg-white dark:bg-[#2f3136] border-b border-gray-200 dark:border-[#202225] px-4 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-gray-900 dark:text-[#dcddde]">
              {title}
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-gray-100 dark:bg-[#202225] rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color={colors.text.tertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by username..."
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 ml-2 text-gray-900 dark:text-[#dcddde]"
            />
            {loading && <ActivityIndicator size="small" color={colors.accent} />}
          </View>
        </View>

        {/* Results List */}
        {query.length >= 2 ? (
          <FlatList
            data={results}
            renderItem={renderUser}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              !loading ? (
                <View className="items-center justify-center py-12">
                  <Ionicons name="person-outline" size={48} color={colors.text.tertiary} />
                  <Text className="text-gray-500 dark:text-[#72767d] mt-4">
                    {emptyMessage}
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="search-outline" size={48} color={colors.text.tertiary} />
            <Text className="text-gray-500 dark:text-[#72767d] mt-4">
              Type to search for users
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
```

### 3. Invite User Modal

Create `/Users/ben/Projects/birdwalk-rn/src/components/InviteUserModal.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { sendWalkInvitation } from '../services/invitationService';
import { UserSearchModal } from './UserSearchModal';
import type { ProfileWithStats } from '../types/collaborative';

interface InviteUserModalProps {
  visible: boolean;
  onClose: () => void;
  walkId: string;
  walkName: string;
  excludeUserIds: string[]; // Already collaborators + pending invites
}

export function InviteUserModal({
  visible,
  onClose,
  walkId,
  walkName,
  excludeUserIds,
}: InviteUserModalProps) {
  const { colors } = useTheme();
  const [selectedUser, setSelectedUser] = useState<ProfileWithStats | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const handleSendInvite = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await sendWalkInvitation(walkId, selectedUser.id, message || undefined);
      Alert.alert('Invitation Sent', `Invitation sent to @${selectedUser.username}`);
      onClose();
      setSelectedUser(null);
      setMessage('');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <View className="flex-1 bg-gray-50 dark:bg-[#36393f] p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-[#dcddde] mb-2">
          Invite to Walk
        </Text>
        <Text className="text-gray-600 dark:text-[#b9bbbe] mb-6">
          {walkName}
        </Text>

        {/* Selected User */}
        {selectedUser ? (
          <View className="bg-white dark:bg-[#2f3136] rounded-lg p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-gray-200 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
                <Text className="text-xl text-gray-600 dark:text-[#72767d]">
                  {selectedUser.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                  {selectedUser.display_name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-[#72767d]">
                  @{selectedUser.username}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedUser(null)}>
                <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setSearchVisible(true)}
            className="bg-white dark:bg-[#2f3136] border-2 border-dashed border-gray-300 dark:border-[#4f545c] rounded-lg p-6 items-center mb-4"
          >
            <Ionicons name="person-add-outline" size={32} color={colors.text.tertiary} />
            <Text className="text-gray-600 dark:text-[#b9bbbe] mt-2">
              Select a user to invite
            </Text>
          </Pressable>
        )}

        {/* Optional Message */}
        {selectedUser && (
          <>
            <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
              Add a message (optional)
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Join me for a bird walk!"
              placeholderTextColor={colors.input.placeholder}
              multiline
              numberOfLines={3}
              maxLength={200}
              className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde] mb-4"
              style={{ textAlignVertical: 'top' }}
            />

            {/* Send Button */}
            <Pressable
              onPress={handleSendInvite}
              disabled={loading}
              className="bg-blue-600 dark:bg-[#5865f2] rounded-lg py-4 mb-3"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Send Invitation
                </Text>
              )}
            </Pressable>
          </>
        )}

        {/* Cancel Button */}
        <Pressable onPress={onClose} className="py-3">
          <Text className="text-gray-600 dark:text-[#b9bbbe] text-center font-medium">
            Cancel
          </Text>
        </Pressable>
      </View>

      {/* User Search Modal */}
      <UserSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelectUser={(user) => {
          setSelectedUser(user);
          setSearchVisible(false);
        }}
        excludeUserIds={excludeUserIds}
        title="Select User"
        emptyMessage="No users found. Try a different search."
      />
    </>
  );
}
```

### 4. Walk Collaborators List

Create `/Users/ben/Projects/birdwalk-rn/src/components/WalkCollaboratorsModal.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getWalkCollaborators, removeCollaborator } from '../services/collaboratorService';
import type { CollaboratorListItem } from '../types/collaborative';

interface WalkCollaboratorsModalProps {
  visible: boolean;
  onClose: () => void;
  walkId: string;
  walkRole: 'owner' | 'contributor';
  onInvitePress: () => void;
}

export function WalkCollaboratorsModal({
  visible,
  onClose,
  walkId,
  walkRole,
  onInvitePress,
}: WalkCollaboratorsModalProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [collaborators, setCollaborators] = useState<CollaboratorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCollaborators();
    }
  }, [visible, walkId]);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const data = await getWalkCollaborators(walkId);
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = (collaborator: CollaboratorListItem) => {
    Alert.alert(
      'Remove Collaborator',
      `Remove @${collaborator.username} from this walk?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCollaborator(walkId, collaborator.user_id);
              setCollaborators(prev => prev.filter(c => c.id !== collaborator.id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove collaborator');
            }
          },
        },
      ]
    );
  };

  const renderCollaborator = ({ item }: { item: CollaboratorListItem }) => {
    const isCurrentUser = item.user_id === user?.id;
    const canRemove = walkRole === 'owner' && item.role !== 'owner' && !isCurrentUser;

    return (
      <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225]">
        {/* Avatar */}
        <View className="w-12 h-12 bg-gray-200 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
          <Text className="text-xl text-gray-600 dark:text-[#72767d]">
            {item.display_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
              {item.display_name}
            </Text>
            {isCurrentUser && (
              <Text className="text-xs text-gray-500 dark:text-[#72767d] ml-2">
                (You)
              </Text>
            )}
          </View>
          <Text className="text-sm text-gray-500 dark:text-[#72767d]">
            @{item.username}
          </Text>
          <View className="flex-row items-center mt-1">
            {item.role === 'owner' ? (
              <View className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded">
                <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Owner
                </Text>
              </View>
            ) : (
              <View className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                <Text className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Contributor
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Remove Button */}
        {canRemove && (
          <Pressable
            onPress={() => handleRemoveCollaborator(item)}
            className="p-2"
          >
            <Ionicons name="close-circle-outline" size={24} color={colors.destructive} />
          </Pressable>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#36393f]">
      {/* Header */}
      <View className="bg-white dark:bg-[#2f3136] border-b border-gray-200 dark:border-[#202225] px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900 dark:text-[#dcddde]">
            Collaborators ({collaborators.length})
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Collaborators List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={collaborators}
          renderItem={renderCollaborator}
          keyExtractor={item => item.id}
          ListFooterComponent={
            walkRole === 'owner' ? (
              <Pressable
                onPress={onInvitePress}
                className="flex-row items-center justify-center p-4 m-4 bg-white dark:bg-[#2f3136] rounded-lg border-2 border-dashed border-gray-300 dark:border-[#4f545c]"
              >
                <Ionicons name="person-add-outline" size={24} color={colors.accent} />
                <Text className="text-blue-600 dark:text-[#5865f2] font-medium ml-2">
                  Invite More People
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );
}
```

### 5. Invitations Screen

Create `/Users/ben/Projects/birdwalk-rn/src/screens/InvitationsScreen.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import {
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
} from '../services/invitationService';
import type { InvitationListItem } from '../types/collaborative';

export function InvitationsScreen({ navigation }) {
  const { colors } = useTheme();
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadInvitations();
    }, [])
  );

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  };

  const handleAccept = async (invitation: InvitationListItem) => {
    setProcessingId(invitation.id);
    try {
      await acceptInvitation(invitation.id);
      Alert.alert('Invitation Accepted', `You've joined "${invitation.walk_name}"!`);
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      // Navigate to walk
      navigation.navigate('WalkDetail', { walkId: invitation.walk_id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitation: InvitationListItem) => {
    Alert.alert(
      'Decline Invitation',
      `Decline invitation to "${invitation.walk_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(invitation.id);
            try {
              await declineInvitation(invitation.id);
              setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to decline invitation');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderInvitation = ({ item }: { item: InvitationListItem }) => {
    const isProcessing = processingId === item.id;

    return (
      <View className="bg-white dark:bg-[#2f3136] rounded-lg p-4 mb-3 mx-4">
        {/* Walk Info */}
        <Text className="text-lg font-semibold text-gray-900 dark:text-[#dcddde] mb-1">
          {item.walk_name}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-[#72767d] mb-3">
          {new Date(item.walk_date).toLocaleDateString()}
        </Text>

        {/* Inviter */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="person-circle-outline" size={20} color={colors.text.tertiary} />
          <Text className="text-sm text-gray-600 dark:text-[#b9bbbe] ml-2">
            Invited by {item.inviter_display_name} (@{item.inviter_username})
          </Text>
        </View>

        {/* Message */}
        {item.message && (
          <View className="bg-gray-50 dark:bg-[#202225] rounded p-3 mb-3">
            <Text className="text-sm text-gray-700 dark:text-[#dcddde] italic">
              "{item.message}"
            </Text>
          </View>
        )}

        {/* Expiry */}
        <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-3">
          Expires {new Date(item.expires_at).toLocaleDateString()}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => handleAccept(item)}
            disabled={isProcessing}
            className="flex-1 bg-blue-600 dark:bg-[#5865f2] rounded-lg py-3"
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Accept
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => handleDecline(item)}
            disabled={isProcessing}
            className="flex-1 bg-gray-200 dark:bg-[#4f545c] rounded-lg py-3"
          >
            <Text className="text-gray-700 dark:text-[#dcddde] text-center font-semibold">
              Decline
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#36393f]">
      <FlatList
        data={invitations}
        renderItem={renderInvitation}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="mail-open-outline" size={64} color={colors.text.tertiary} />
            <Text className="text-gray-500 dark:text-[#72767d] text-lg mt-4">
              No pending invitations
            </Text>
            <Text className="text-gray-400 dark:text-[#72767d] text-sm mt-2 text-center px-8">
              When someone invites you to a walk, it will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

### 6. CollaboratorAvatars Component

Create `/Users/ben/Projects/birdwalk-rn/src/components/CollaboratorAvatars.tsx`:

**Purpose:** Display stacked circular avatars for walk collaborators as a visual indicator of collaborative walks.

**Features:**
- Stacked circular design with 30% overlap
- Displays up to N avatars (default: 3)
- "+X more" indicator for additional collaborators
- Fallback to initials when no avatar image
- Responsive sizing via props
- Dark mode support

```typescript
import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CollaboratorAvatar {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface CollaboratorAvatarsProps {
  collaborators: CollaboratorAvatar[];
  maxDisplay?: number; // Max avatars to show before "+X"
  size?: number; // Avatar size in pixels
}

export function CollaboratorAvatars({
  collaborators,
  maxDisplay = 3,
  size = 32,
}: CollaboratorAvatarsProps) {
  const { colors } = useTheme();

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  const displayCollaborators = collaborators.slice(0, maxDisplay);
  const remaining = collaborators.length - maxDisplay;

  return (
    <View className="flex-row items-center">
      {/* Stacked Avatars */}
      {displayCollaborators.map((collaborator, index) => (
        <View
          key={collaborator.id}
          style={{
            width: size,
            height: size,
            marginLeft: index > 0 ? -size * 0.3 : 0, // Overlap by 30%
            zIndex: displayCollaborators.length - index, // Stack order (first on top)
          }}
          className="rounded-full bg-gray-200 dark:bg-[#202225] border-2 border-white dark:border-[#2f3136] items-center justify-center"
        >
          {collaborator.avatar_url ? (
            <Image
              source={{ uri: collaborator.avatar_url }}
              style={{
                width: size - 4,
                height: size - 4,
                borderRadius: (size - 4) / 2,
              }}
              resizeMode="cover"
            />
          ) : (
            // Fallback: Display initial letter
            <Text
              style={{ fontSize: size * 0.4 }}
              className="font-semibold text-gray-600 dark:text-[#72767d]"
            >
              {collaborator.display_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      ))}

      {/* "+X more" indicator */}
      {remaining > 0 && (
        <View
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.3,
            zIndex: 0,
          }}
          className="rounded-full bg-gray-300 dark:bg-[#4f545c] border-2 border-white dark:border-[#2f3136] items-center justify-center"
        >
          <Text
            style={{ fontSize: size * 0.35 }}
            className="font-semibold text-gray-700 dark:text-[#dcddde]"
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
```

**Usage in WalkCard:**

```typescript
import { CollaboratorAvatars } from './CollaboratorAvatars';

// Inside WalkCard component
{walk.collaborators && walk.collaborators.length > 1 && (
  <View className="flex-row items-center mt-3">
    <CollaboratorAvatars
      collaborators={walk.collaborators}
      maxDisplay={3}
      size={28}
    />
    <View className="flex-row items-center ml-2">
      <Ionicons name="people" size={14} color={colors.text.tertiary} />
      <Text className="text-xs text-gray-600 dark:text-[#b9bbbe] ml-1">
        {walk.collaborators.length} {walk.collaborators.length === 1 ? 'person' : 'people'}
      </Text>
    </View>
  </View>
)}
```

**Visual Design Examples:**

```
SOLO WALK (1 person) - No avatars shown:
┌────────────────────────────────────┐
│ ┌────────────────────────┬─────┐  │
│ │ Morning Walk           │ 12  │  │
│ │ Feb 21, 2026           │     │  │
│ │                        └─────┘  │
│ └────────────────────────────────┘  │
└────────────────────────────────────┘

COLLABORATIVE WALK (2 people):
┌────────────────────────────────────┐
│ ┌────────────────────────┬─────┐  │
│ │ Morning Walk           │ 12  │  │
│ │ Feb 21, 2026           │     │  │
│ │                        └─────┘  │
│ │ ⚫⚫ 👥 2 people                │  │
│ │  AB                            │  │
│ └────────────────────────────────┘  │
└────────────────────────────────────┘
    ││
    └┴─── Overlapping avatars (30%)

COLLABORATIVE WALK (5 people):
┌────────────────────────────────────┐
│ ┌────────────────────────┬─────┐  │
│ │ Afternoon Birding      │ 24  │  │
│ │ Feb 21, 2026           │     │  │
│ │                        └─────┘  │
│ │ ⚫⚫⚫⚪ 👥 5 people             │  │
│ │  ABC+2                         │  │
│ └────────────────────────────────┘  │
└────────────────────────────────────┘
    │││ │
    │││ └─── "+2" indicator (gray)
    ││└──── 3rd avatar (letter C)
    │└───── 2nd avatar (letter B)
    └────── 1st avatar (letter A)

AVATAR STACKING DETAIL:
    ⚫ ⚫ ⚫
    ││ ││ │
    ││ │└─┴── 30% overlap
    ││ └──── 2px white border
    │└────── Z-index: decreasing
    └─────── First collaborator on top

DARK MODE:
- Borders: dark:border-[#2f3136]
- Background: dark:bg-[#202225]
- Text: dark:text-[#dcddde]
- "+X" circle: dark:bg-[#4f545c]
```

**Color Scheme:**
- **Light mode:** White borders, gray-200 backgrounds
- **Dark mode:** #2f3136 borders, #202225 backgrounds
- **"+X" indicator:** gray-300 (light) / #4f545c (dark)

**Props:**
- `collaborators`: Array of collaborator objects with id, username, display_name, avatar_url
- `maxDisplay`: Number of avatars to show before "+X" (default: 3)
- `size`: Avatar diameter in pixels (default: 32, recommended: 24-40)

**Behavior:**
- **1 collaborator (solo walk):** No avatars shown
- **2 collaborators:** Shows 2 overlapping avatars
- **3 collaborators:** Shows 3 overlapping avatars
- **4+ collaborators:** Shows first 3 + "+X more" circle

**Accessibility:**
- Could add `accessibilityLabel` with collaborator names
- Could make avatars pressable to show collaborator list

---

## Implementation Phases

### Phase 1: Database & Backend (Week 1)

**Goal:** Set up all database tables, RLS policies, and functions.

**Tasks:**
1. ✅ Create `profiles` table with RLS policies
2. ✅ Create `walk_collaborators` table with RLS policies
3. ✅ Create `walk_invitations` table with RLS policies
4. ✅ Add `created_by` column to `sightings` table
5. ✅ Update `walks` RLS policies for collaborative access
6. ✅ Update `sightings` RLS policies for collaborative access
7. ✅ Create database functions (get_accessible_walks, accept_invitation, etc.)
8. ✅ Create triggers (add_walk_owner, set_sighting_creator, update_updated_at)
9. ✅ Enable realtime subscriptions for sightings, collaborators, invitations
10. ✅ Test all policies manually via SQL queries

**Deliverables:**
- 7 migration SQL files
- Complete RLS policy coverage
- 4+ database functions
- Realtime subscriptions enabled

**Testing:**
- Manually test all CRUD operations via Supabase dashboard
- Verify RLS policies block unauthorized access
- Test database functions with sample data

---

### Phase 2: User Profiles & Discovery (Week 2)

**Goal:** Enable users to create profiles and search for other users.

**Tasks:**
1. ✅ Update TypeScript database types
2. ✅ Create `profileService.ts` with all profile queries
3. ✅ Create `ProfileSetupScreen` for first-time users
4. ✅ Update signup flow to redirect to profile setup
5. ✅ Create `UserSearchModal` component
6. ✅ Create `useDebounce` hook for search optimization
7. ✅ Add username validation (format, availability check)
8. ✅ Create database function for user search with stats
9. ✅ Update `ProfileScreen` to show/edit username, display name, bio
10. ✅ Add profile completion check in AuthContext

**Deliverables:**
- Profile setup UI
- User search functionality
- Profile editing
- Username validation

**Testing:**
- Create multiple test accounts
- Search for users by username
- Verify profile updates sync correctly
- Test username availability checks

---

### Phase 3: Invitation System (Week 3-4)

**Goal:** Implement walk invitations with send/accept/decline flows.

**Tasks:**
1. ✅ Create `invitationService.ts` with all invitation queries
2. ✅ Create `collaboratorService.ts` with collaborator management
3. ✅ Create `InviteUserModal` component
4. ✅ Add "Invite" button to `WalkDetailScreen` (owners only)
5. ✅ Create `InvitationsScreen` to view pending invitations
6. ✅ Add invitations tab/section to navigation
7. ✅ Implement accept/decline invitation logic
8. ✅ Create `WalkCollaboratorsModal` to view/manage collaborators
9. ✅ Add invitation badge count to tab bar
10. ✅ Add real-time updates for new invitations
11. ✅ Implement invitation expiry handling
12. ✅ Add cancel invitation functionality (for inviters)

**Deliverables:**
- Complete invitation flow (send → accept/decline)
- Invitations screen with badge count
- Collaborators management UI
- Invitation notifications

**Testing:**
- Send invitations between test accounts
- Accept and decline invitations
- Verify collaborator appears in walk
- Test invitation expiry
- Test duplicate invitation prevention

---

### Phase 4: Collaborative Walk Access (Week 4-5)

**Goal:** Enable multiple users to access and contribute to shared walks.

**Tasks:**
1. ✅ Update `WalksListScreen` to fetch collaborative walks with collaborator profiles
2. ✅ Add visual indicator for collaborative walks in `WalkCard` (stacked avatars)
3. ✅ Create `CollaboratorAvatars` component for avatar stacking
4. ✅ Update `WalkDetailScreen` to show collaborators
4. ✅ Add permission checks before edit/delete actions
5. ✅ Update `NewSightingModal` to set `created_by` field
6. ✅ Add "Added by @username" attribution to `SightingCard`
7. ✅ Implement permission-based UI (hide/disable buttons based on role)
8. ✅ Create `useWalkPermissions` hook for permission checks
9. ✅ Update `EditWalkModal` to only allow owners
10. ✅ Update `EditSightingModal` to check permissions
11. ✅ Add "Leave Walk" option for contributors
12. ✅ Test all permission scenarios (owner vs. contributor)

**Deliverables:**
- Collaborative walks appear in walks list
- Full CRUD operations respect permissions
- Sighting attribution displayed
- Permission-based UI

**Testing:**
- Create walk as User A, invite User B
- User B adds sightings
- Verify User B cannot edit walk details
- Verify User B can edit their own sightings
- Verify User A (owner) can edit any sighting
- Test leave walk functionality

---

### Phase 5: Real-time Updates & Polish (Week 6)

**Goal:** Add real-time updates and polish the entire feature.

**Tasks:**
1. ✅ Create `useRealtimeSightings` hook
2. ✅ Implement real-time sighting updates in `WalkDetailScreen`
3. ✅ Add optimistic UI updates for sighting creation
4. ✅ Implement real-time collaborator updates
5. ✅ Add real-time invitation notifications
6. ✅ Create notification system for walk activity
7. ✅ Add loading states and error handling
8. ✅ Implement offline support (queue actions)
9. ✅ Add analytics tracking for collaborative features
10. ✅ Polish all UI animations and transitions
11. ✅ Comprehensive testing across all flows
12. ✅ Update documentation and README

**Deliverables:**
- Real-time updates for sightings
- Push notifications for invitations/activity
- Polished UX with proper loading states
- Offline support
- Complete documentation

**Testing:**
- Two devices side-by-side: User A adds sighting, verify appears on User B's screen
- Test offline mode: add sighting offline, verify syncs when online
- Test all edge cases and error scenarios
- Performance testing with many collaborators

---

## Code Examples

### Example 1: Creating a Walk with Auto-Owner

```typescript
// In NewWalkScreen.tsx
const handleCreateWalk = async () => {
  if (!user) return;

  const walkData: WalkInsert = {
    user_id: user.id,
    name: name.trim(),
    date,
    start_time: startTime,
    notes: notes.trim() || null,
    location_lat: location?.lat ?? null,
    location_lng: location?.lng ?? null,
  };

  const { data, error } = await supabase
    .from("walks")
    .insert(walkData)
    .select()
    .single();

  if (error) {
    Alert.alert('Error', 'Failed to create walk');
    return;
  }

  // Database trigger automatically adds user as owner to walk_collaborators

  navigation.navigate('WalkDetail', { walkId: data.id });
};
```

### Example 2: Checking Permissions

```typescript
// Create useWalkPermissions hook
// File: src/hooks/useWalkPermissions.ts

import { useEffect, useState } from 'react';
import { getWalkRole } from '../services/collaboratorService';
import type { PermissionCheck } from '../types/collaborative';

export function useWalkPermissions(walkId: string, sightingCreatedBy?: string | null): PermissionCheck {
  const { user } = useAuth();
  const [role, setRole] = useState<'owner' | 'contributor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const userRole = await getWalkRole(walkId);
        setRole(userRole);
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [walkId]);

  const isOwner = role === 'owner';
  const isContributor = role === 'contributor';
  const hasAccess = isOwner || isContributor;
  const isSightingCreator = sightingCreatedBy === user?.id;

  return {
    canView: hasAccess,
    canAddSighting: hasAccess,
    canEditOwnSighting: hasAccess && isSightingCreator,
    canDeleteOwnSighting: hasAccess && isSightingCreator,
    canEditAnySighting: isOwner,
    canDeleteAnySighting: isOwner,
    canEditWalk: isOwner,
    canDeleteWalk: isOwner,
    canManageCollaborators: isOwner,
    role,
    loading,
  };
}

// Usage in WalkDetailScreen:
const permissions = useWalkPermissions(walkId);

// Conditionally render edit button
{permissions.canEditWalk && (
  <Pressable onPress={handleEditWalk}>
    <Ionicons name="create-outline" size={24} />
  </Pressable>
)}
```

### Example 3: Real-time Sighting Updates

```typescript
// In WalkDetailScreen.tsx

const [sightings, setSightings] = useState<SightingWithCreator[]>([]);
const channel = useRealtimeSightings(walkId);

useEffect(() => {
  if (!channel) return;

  // Handle new sightings
  channel.on('postgres_changes', { event: 'INSERT' }, async (payload) => {
    const newSighting = payload.new as Sighting;

    // Fetch creator profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', newSighting.created_by)
      .single();

    setSightings(prev => [{
      ...newSighting,
      creator_profile: profile,
    }, ...prev]);

    // Show toast notification
    Toast.show({
      type: 'success',
      text1: 'New sighting',
      text2: `${profile?.display_name} added ${newSighting.species_name}`,
    });
  });

  // Handle updates
  channel.on('postgres_changes', { event: 'UPDATE' }, (payload) => {
    setSightings(prev => prev.map(s =>
      s.id === payload.new.id ? { ...s, ...payload.new } : s
    ));
  });

  // Handle deletes
  channel.on('postgres_changes', { event: 'DELETE' }, (payload) => {
    setSightings(prev => prev.filter(s => s.id !== payload.old.id));
  });
}, [channel]);
```

### Example 4: Displaying Sighting Attribution

```typescript
// In SightingCard.tsx

interface SightingCardProps {
  sighting: SightingWithCreator;
  onPress: () => void;
}

export function SightingCard({ sighting, onPress }: SightingCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} className="bg-white dark:bg-[#2f3136] p-4 rounded-lg mb-3">
      {/* Species Info */}
      <Text className="text-lg font-semibold text-gray-900 dark:text-[#dcddde]">
        {sighting.species_name}
      </Text>
      {sighting.scientific_name && (
        <Text className="text-sm text-gray-500 dark:text-[#72767d] italic">
          {sighting.scientific_name}
        </Text>
      )}

      {/* Attribution - NEW */}
      {sighting.creator_profile && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="person-circle-outline" size={16} color={colors.text.tertiary} />
          <Text className="text-xs text-gray-500 dark:text-[#72767d] ml-1">
            Added by @{sighting.creator_profile.username}
          </Text>
        </View>
      )}

      {/* Timestamp */}
      <Text className="text-xs text-gray-400 dark:text-[#72767d] mt-1">
        {new Date(sighting.timestamp).toLocaleString()}
      </Text>
    </Pressable>
  );
}
```

### Example 5: Collaborative Walk Visual Indicators with Avatars

#### A. CollaboratorAvatars Component

```typescript
// File: src/components/CollaboratorAvatars.tsx
// Displays stacked circular avatars for walk collaborators

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CollaboratorAvatar {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface CollaboratorAvatarsProps {
  collaborators: CollaboratorAvatar[];
  maxDisplay?: number; // Max avatars to show before "+X"
  size?: number; // Avatar size in pixels
}

export function CollaboratorAvatars({
  collaborators,
  maxDisplay = 3,
  size = 32,
}: CollaboratorAvatarsProps) {
  const { colors } = useTheme();
  const displayCollaborators = collaborators.slice(0, maxDisplay);
  const remaining = collaborators.length - maxDisplay;

  return (
    <View className="flex-row items-center">
      {/* Stacked Avatars */}
      {displayCollaborators.map((collaborator, index) => (
        <View
          key={collaborator.id}
          style={{
            width: size,
            height: size,
            marginLeft: index > 0 ? -size * 0.3 : 0, // Overlap by 30%
            zIndex: displayCollaborators.length - index, // Stack order
          }}
          className="rounded-full bg-gray-200 dark:bg-[#202225] border-2 border-white dark:border-[#2f3136] items-center justify-center"
        >
          {collaborator.avatar_url ? (
            // Future: Display actual avatar image
            <Image
              source={{ uri: collaborator.avatar_url }}
              style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
            />
          ) : (
            // Fallback: Display initial
            <Text
              style={{ fontSize: size * 0.4 }}
              className="font-semibold text-gray-600 dark:text-[#72767d]"
            >
              {collaborator.display_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      ))}

      {/* "+X more" indicator */}
      {remaining > 0 && (
        <View
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.3,
          }}
          className="rounded-full bg-gray-300 dark:bg-[#4f545c] border-2 border-white dark:border-[#2f3136] items-center justify-center"
        >
          <Text
            style={{ fontSize: size * 0.35 }}
            className="font-semibold text-gray-700 dark:text-[#dcddde]"
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}
```

#### B. Updated WalkCard with Avatar Display

```typescript
// In WalkCard.tsx

import { CollaboratorAvatars } from './CollaboratorAvatars';

interface WalkCardProps {
  walk: WalkWithCollaborators; // Updated type
  onPress: () => void;
}

export function WalkCard({ walk, onPress }: WalkCardProps) {
  const { colors } = useTheme();
  const isCollaborative = walk.collaborators && walk.collaborators.length > 1;

  return (
    <Pressable onPress={onPress} className="bg-white dark:bg-[#2f3136] p-4 rounded-lg mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Walk Name */}
          <Text className="text-lg font-semibold text-gray-900 dark:text-[#dcddde] mb-1">
            {walk.name}
          </Text>

          {/* Date */}
          <Text className="text-sm text-gray-500 dark:text-[#72767d]">
            {new Date(walk.date).toLocaleDateString()}
          </Text>

          {/* Collaborative Indicator with Avatars - NEW */}
          {isCollaborative && (
            <View className="flex-row items-center mt-3">
              <CollaboratorAvatars
                collaborators={walk.collaborators}
                maxDisplay={3}
                size={28}
              />
              <View className="flex-row items-center ml-2">
                <Ionicons name="people" size={14} color={colors.text.tertiary} />
                <Text className="text-xs text-gray-600 dark:text-[#b9bbbe] ml-1">
                  {walk.collaborators.length} {walk.collaborators.length === 1 ? 'person' : 'people'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Sighting Count Badge */}
        <View className="bg-blue-100 dark:bg-[#5865f2] rounded-full px-3 py-1">
          <Text className="text-blue-900 dark:text-white font-semibold">
            {walk.sightings?.[0]?.count || 0}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
```

#### C. Updated Walk Query with Collaborators

```typescript
// In WalksListScreen.tsx

const fetchWalks = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("walks")
    .select(`
      *,
      sightings(count),
      walk_collaborators!inner(
        role,
        profile:profiles(
          id,
          username,
          display_name,
          avatar_url
        )
      )
    `)
    .eq("walk_collaborators.user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error('Error fetching walks:', error);
    return;
  }

  // Transform data to include collaborators array
  const walksWithCollaborators = data?.map(walk => ({
    ...walk,
    role: walk.walk_collaborators[0]?.role,
    collaborators: walk.walk_collaborators.map(wc => wc.profile),
  }));

  setWalks(walksWithCollaborators);
};
```

#### D. Updated Type Definition

```typescript
// In src/types/collaborative.ts

export interface WalkWithCollaborators extends Walk {
  role: 'owner' | 'contributor';
  collaborators: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  }>;
  sighting_count?: number;
}
```

**Visual Description:**

The walk card now displays:
1. **Solo walks:** No avatars, standard layout
2. **Collaborative walks (2 people):** Two overlapping circular avatars
3. **Collaborative walks (3+ people):** Up to 3 overlapping avatars + "+X more" circle
4. **Companion text:** Small "people" icon with count (e.g., "3 people")

**Avatar stacking design:**
- Circular avatars overlap by 30% (right edge over left edge)
- Each avatar has white border for separation
- Z-index ensures proper stacking order (first on top)
- Fallback to initials if no avatar image
- "+X" indicator in gray circle for overflow

**Dark mode support:**
- Borders use theme-aware colors
- Background colors adapt to dark theme
- Text colors use semantic theme tokens

---

## Testing Strategy

### Unit Tests

**Profile Service:**
```typescript
describe('profileService', () => {
  test('creates profile with valid data', async () => {
    const profile = await createProfile({
      id: testUserId,
      username: 'testuser',
      display_name: 'Test User',
    });
    expect(profile.username).toBe('testuser');
  });

  test('rejects duplicate username', async () => {
    await expect(createProfile({
      id: testUserId2,
      username: 'testuser', // Already exists
      display_name: 'Test User 2',
    })).rejects.toThrow();
  });

  test('validates username format', async () => {
    const available = await isUsernameAvailable('invalid username!');
    expect(available).toBe(false);
  });
});
```

**Invitation Service:**
```typescript
describe('invitationService', () => {
  test('sends invitation successfully', async () => {
    const invitation = await sendWalkInvitation(walkId, inviteeId, 'Join me!');
    expect(invitation.status).toBe('pending');
  });

  test('prevents duplicate invitations', async () => {
    await sendWalkInvitation(walkId, inviteeId);
    await expect(sendWalkInvitation(walkId, inviteeId)).rejects.toThrow();
  });

  test('accepts invitation and adds collaborator', async () => {
    const invitation = await sendWalkInvitation(walkId, inviteeId);
    await acceptInvitation(invitation.id);

    const role = await getWalkRole(walkId);
    expect(role).toBe('contributor');
  });
});
```

### Integration Tests

**Collaborative Walk Flow:**
```typescript
describe('Collaborative Walk Flow', () => {
  test('complete flow: create walk → invite → accept → add sighting', async () => {
    // User A creates walk
    const walk = await createWalk(userA, 'Test Walk');
    expect(walk).toBeDefined();

    // User A invites User B
    const invitation = await sendWalkInvitation(walk.id, userB.id);
    expect(invitation.status).toBe('pending');

    // User B accepts invitation
    await acceptInvitation(invitation.id);
    const roleB = await getWalkRole(walk.id, userB.id);
    expect(roleB).toBe('contributor');

    // User B adds sighting
    const sighting = await addSighting(walk.id, userB.id, {
      species_code: 'amecro',
      species_name: 'American Crow',
    });
    expect(sighting.created_by).toBe(userB.id);

    // User A sees sighting
    const sightings = await getSightings(walk.id, userA.id);
    expect(sightings).toContainEqual(expect.objectContaining({
      id: sighting.id,
    }));
  });
});
```

### E2E Tests (Manual Checklist)

**Profile Setup:**
- [ ] New user completes profile setup
- [ ] Username validation works (format, availability)
- [ ] Profile edits save correctly
- [ ] Profile displays on user search

**User Discovery:**
- [ ] Search users by username (partial match)
- [ ] Search users by email (exact match)
- [ ] View user profile with stats
- [ ] Cannot find yourself in search

**Invitations:**
- [ ] Send invitation to user
- [ ] Receive invitation notification
- [ ] Accept invitation adds to walks list
- [ ] Decline invitation removes it
- [ ] Cancel sent invitation
- [ ] Expired invitations hidden
- [ ] Cannot invite same user twice

**Collaborative Access:**
- [ ] Contributor sees walk in list
- [ ] Contributor can add sightings
- [ ] Contributor can edit own sightings
- [ ] Contributor cannot edit walk details
- [ ] Contributor cannot delete walk
- [ ] Owner can edit any sighting
- [ ] Owner can remove collaborators
- [ ] Sightings show "Added by" attribution

**Real-time Updates:**
- [ ] New sighting appears without refresh
- [ ] Edited sighting updates in real-time
- [ ] Deleted sighting removes in real-time
- [ ] Notification when collaborator adds sighting

**Permissions:**
- [ ] Edit walk button hidden for contributors
- [ ] Delete walk button hidden for contributors
- [ ] Edit sighting button hidden for others' sightings
- [ ] Permission denied errors handled gracefully

---

## Edge Cases & Error Handling

### 1. Race Conditions

**Problem:** User A invites User B while User B is offline. User B comes online and has already joined via different path.

**Solution:**
```sql
-- Use UPSERT in accept_invitation function
INSERT INTO public.walk_collaborators (walk_id, user_id, role)
VALUES (v_walk_id, v_invitee_id, 'contributor')
ON CONFLICT (walk_id, user_id) DO NOTHING;
```

### 2. Orphaned Data

**Problem:** Walk owner deletes their account. What happens to collaborative walks?

**Solution:**
- Option 1: Cascade delete walks (current behavior via `ON DELETE CASCADE`)
- Option 2: Transfer ownership to oldest collaborator (future enhancement)
- Option 3: Convert to "orphaned" state, all contributors become co-owners

**Recommendation:** Use Option 1 initially, add Option 2 in future.

### 3. Invitation Spam

**Problem:** User sends 100 invitations to same person across different walks.

**Solution:**
- Add rate limiting via database function:
```sql
CREATE OR REPLACE FUNCTION check_invitation_rate_limit(
  p_inviter_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.walk_invitations
  WHERE inviter_id = p_inviter_id
    AND created_at > NOW() - INTERVAL '1 hour'
    AND status = 'pending';

  RETURN v_count < 10; -- Max 10 invitations per hour
END;
$$ LANGUAGE plpgsql;
```

### 4. Offline Sighting Creation

**Problem:** User adds sighting while offline. When they come online, the walk has been deleted.

**Solution:**
```typescript
// In NewSightingModal.tsx
try {
  const { data, error } = await supabase
    .from('sightings')
    .insert(sightingData)
    .select()
    .single();

  if (error) {
    if (error.code === '23503') { // Foreign key violation
      Alert.alert(
        'Walk Not Found',
        'This walk no longer exists. Your sighting was not saved.'
      );
    } else {
      throw error;
    }
  }
} catch (error) {
  // Handle error
}
```

### 5. Duplicate Usernames (Case Sensitivity)

**Problem:** User tries to create username "BirdWatcher" when "birdwatcher" exists.

**Solution:**
- Store usernames lowercase: `username.toLowerCase()`
- Use case-insensitive index: `CREATE INDEX idx_profiles_username_lower ON public.profiles (LOWER(username));`
- Check availability: `SELECT * FROM profiles WHERE LOWER(username) = LOWER($1)`

### 6. Stale Data After Removal

**Problem:** User B is viewing walk. Owner removes User B as collaborator. User B still sees walk.

**Solution:**
- Implement real-time subscription to `walk_collaborators`:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel(`walk:${walkId}:collaborators`)
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'walk_collaborators',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        // User was removed
        Alert.alert(
          'Access Removed',
          'You have been removed from this walk',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [walkId, user]);
```

### 7. Expired Invitations Cleanup

**Problem:** Expired invitations clutter the database.

**Solution:**
- Run periodic cleanup via Supabase cron (if available) or Edge Function:
```sql
-- Schedule daily cleanup
SELECT cron.schedule(
  'delete-expired-invitations',
  '0 0 * * *', -- Daily at midnight
  $$ UPDATE walk_invitations SET status = 'cancelled' WHERE status = 'pending' AND expires_at < NOW() $$
);
```

---

## Security Considerations

### 1. Row-Level Security (RLS)

**Critical:** ALL tables MUST have RLS enabled and comprehensive policies.

**Checklist:**
- [x] `profiles`: Users can only edit their own profile
- [x] `walks`: Users can only access walks they're collaborators on
- [x] `walk_collaborators`: Users can only view collaborators for accessible walks
- [x] `walk_invitations`: Users can only view invitations they sent or received
- [x] `sightings`: Users can only view/edit sightings for accessible walks

### 2. Injection Prevention

**SQL Injection:**
- ✅ Use parameterized queries via Supabase client (auto-escapes)
- ✅ Never concatenate user input into SQL strings
- ✅ Use prepared statements in database functions

**XSS Prevention:**
- ✅ React Native Text components auto-escape
- ✅ Validate user input (username format, bio length)
- ✅ Sanitize before display (though RN handles this)

### 3. Authorization Checks

**Never trust the client.** Always validate permissions server-side via RLS.

**Example - Deleting Sighting:**
```typescript
// ❌ BAD: Client-side check only
if (role === 'owner') {
  await supabase.from('sightings').delete().eq('id', sightingId);
}

// ✅ GOOD: RLS policy enforces server-side
await supabase.from('sightings').delete().eq('id', sightingId);
// RLS policy will only allow delete if user is owner or creator
```

### 4. Rate Limiting

**Prevent abuse:**
- Limit invitation sends (10/hour per user)
- Limit profile searches (100/hour per user)
- Limit walk creation (20/day per user)

**Implementation:**
- Use Supabase Edge Functions with rate limiting middleware
- Or implement via database trigger counting recent actions

### 5. Data Privacy

**Email Search:**
- Only return exact matches (not partial)
- Never expose email addresses in API responses
- Use database function to hide email from client

**User Discovery:**
- Users must opt-in to be discoverable (future: add `is_public` flag to profiles)
- Bio and stats are public by default (consider making configurable)

### 6. Audit Logging

**Track sensitive actions:**
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Log invitation actions
CREATE OR REPLACE FUNCTION log_invitation_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    'walk_invitation',
    NEW.id,
    jsonb_build_object('walk_id', NEW.walk_id, 'invitee_id', NEW.invitee_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_invitation_insert
  AFTER INSERT ON public.walk_invitations
  FOR EACH ROW EXECUTE FUNCTION log_invitation_action();
```

---

## Appendix: Database Migration Checklist

Before deploying to production, ensure all migrations are applied in order:

1. `20260221000001_create_profiles.sql`
2. `20260221000002_create_walk_collaborators.sql`
3. `20260221000003_create_walk_invitations.sql`
4. `20260221000004_add_sighting_creator.sql`
5. `20260221000005_update_walks_rls.sql`
6. `20260221000006_update_sightings_rls.sql`
7. `20260221000007_create_functions.sql`

**Rollback Plan:**
- Keep copies of all original policies before update
- Test migrations on staging environment first
- Have rollback scripts ready for each migration

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up staging environment** with test data
3. **Begin Phase 1** (Database & Backend)
4. **Test each phase** before moving to next
5. **Document any deviations** from plan
6. **Update ROADMAP.md** with progress

---

## Questions for Product Review

1. **Username Requirements:** Should usernames be immutable after creation, or allow one-time changes?
2. **Invitation Limits:** Is 30-day expiry appropriate? Should we allow custom expiry?
3. **Ownership Transfer:** Should walk owners be able to transfer ownership to another collaborator?
4. **Contributor Limits:** Should there be a max number of collaborators per walk?
5. **Notification Preferences:** Should users be able to disable notifications for certain walk activities?
6. **Discovery Privacy:** Should profiles have a "private" mode that hides from search?

---

**End of Plan**
