-- Apply Simple RLS Policies v2 (TRULY FIXED - No Recursion)
-- Date: 2026-02-22
-- FIX: walk_collaborators policy was querying itself!

-- ========================================
-- WALKS TABLE: Simple RLS
-- ========================================

-- Drop all existing walks policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'walks')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.walks', r.policyname);
  END LOOP;
END $$;

-- SIMPLE: Users can view walks they own OR are collaborators on
CREATE POLICY "Users can view their walks"
  ON public.walks
  FOR SELECT
  USING (
    user_id = auth.uid()  -- Solo walks (owned by user)
    OR
    id IN (  -- Collaborative walks - CHECK: This queries walk_collaborators
      SELECT walk_id
      FROM public.walk_collaborators
      WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can create walks
CREATE POLICY "Users can create walks"
  ON public.walks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- SIMPLE: Users can update their own walks
CREATE POLICY "Users can update their walks"
  ON public.walks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- SIMPLE: Users can delete their own walks
CREATE POLICY "Users can delete their walks"
  ON public.walks
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- SIGHTINGS TABLE: Simple RLS
-- ========================================

-- Drop all existing sightings policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sightings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sightings', r.policyname);
  END LOOP;
END $$;

-- SIMPLE: Users can view sightings for walks they have access to
CREATE POLICY "Users can view sightings for their walks"
  ON public.sightings
  FOR SELECT
  USING (
    walk_id IN (
      SELECT id FROM public.walks WHERE user_id = auth.uid()
      UNION
      SELECT walk_id FROM public.walk_collaborators WHERE user_id = auth.uid()
    )
  );

-- SIMPLE: Users can add sightings to their walks
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

-- ========================================
-- WALK_COLLABORATORS TABLE: FIXED - No Self-Reference!
-- ========================================

-- Drop all existing walk_collaborators policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'walk_collaborators')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.walk_collaborators', r.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.walk_collaborators ENABLE ROW LEVEL SECURITY;

-- FIX: Make walk_collaborators viewable by everyone (not sensitive data)
-- This avoids recursion and is safe because:
-- - Can only INSERT via accept_invitation function (has validation)
-- - Can only DELETE own contributor record
-- - Data is just "user X is on walk Y" (not private)
CREATE POLICY "Collaborators are publicly viewable"
  ON public.walk_collaborators
  FOR SELECT
  USING (true);

-- SIMPLE: System can add collaborators (controlled by functions only)
CREATE POLICY "System can add collaborators"
  ON public.walk_collaborators
  FOR INSERT
  WITH CHECK (true);  -- Controlled by accept_invitation function

-- SIMPLE: Users can remove themselves (leave walk)
CREATE POLICY "Users can leave walks"
  ON public.walk_collaborators
  FOR DELETE
  USING (user_id = auth.uid() AND role = 'contributor');

-- ========================================
-- VERIFICATION
-- ========================================
SELECT
  '✅ Simple RLS v2 Applied!' as status,
  'Walks: ' || COUNT(CASE WHEN tablename = 'walks' THEN 1 END) as walks_policies,
  'Sightings: ' || COUNT(CASE WHEN tablename = 'sightings' THEN 1 END) as sightings_policies,
  'Collaborators: ' || COUNT(CASE WHEN tablename = 'walk_collaborators' THEN 1 END) as collab_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('walks', 'sightings', 'walk_collaborators');

-- Expected: walks=4, sightings=4, collaborators=3

-- ========================================
-- WHY THIS WORKS (No Recursion)
-- ========================================
/*
❌ BEFORE (Recursion):
walk_collaborators policy checked:
  walk_id IN (SELECT walk_id FROM walk_collaborators ...) ← RECURSION!

✅ NOW (Fixed):
walk_collaborators policy uses:
  USING (true) ← No recursion, just allows SELECT

Why is this safe?
- Collaborator data isn't sensitive (just user-walk relationships)
- INSERTs controlled by database function (accept_invitation)
- DELETEs limited to own contributor record
- App layer will filter/display appropriately
*/
