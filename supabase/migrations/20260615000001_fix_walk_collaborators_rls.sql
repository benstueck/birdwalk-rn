-- Fix infinite recursion in walk_collaborators RLS policies
-- The original policies queried walk_collaborators from within walk_collaborators policies,
-- causing infinite recursion. SECURITY DEFINER functions bypass RLS to break the cycle.

DROP POLICY IF EXISTS "View collaborators for accessible walks" ON public.walk_collaborators;
DROP POLICY IF EXISTS "Walk owners can add collaborators" ON public.walk_collaborators;
DROP POLICY IF EXISTS "Walk owners can remove collaborators" ON public.walk_collaborators;

CREATE OR REPLACE FUNCTION public.is_walk_member(p_walk_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.walk_collaborators
    WHERE walk_id = p_walk_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_walk_owner(p_walk_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.walk_collaborators
    WHERE walk_id = p_walk_id AND user_id = auth.uid() AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "View collaborators for accessible walks"
  ON public.walk_collaborators FOR SELECT
  USING (public.is_walk_member(walk_id));

CREATE POLICY "Walk owners can add collaborators"
  ON public.walk_collaborators FOR INSERT
  WITH CHECK (public.is_walk_owner(walk_id));

CREATE POLICY "Walk owners can remove collaborators"
  ON public.walk_collaborators FOR DELETE
  USING (public.is_walk_owner(walk_collaborators.walk_id));
