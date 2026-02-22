-- Migration: Create Walk Collaborators Table
-- Description: Track which users have access to which walks and their roles
-- Date: 2026-02-21

-- Create walk_collaborators table
CREATE TABLE IF NOT EXISTS public.walk_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('owner', 'contributor')),
  CONSTRAINT unique_walk_user UNIQUE (walk_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_walk_collaborators_walk_id ON public.walk_collaborators (walk_id);
CREATE INDEX IF NOT EXISTS idx_walk_collaborators_user_id ON public.walk_collaborators (user_id);
CREATE INDEX IF NOT EXISTS idx_walk_collaborators_role ON public.walk_collaborators (role);

-- Enable Row Level Security
ALTER TABLE public.walk_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view collaborators for walks they have access to
DROP POLICY IF EXISTS "View collaborators for accessible walks" ON public.walk_collaborators;
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

-- RLS Policy: Walk owners can insert collaborators
DROP POLICY IF EXISTS "Walk owners can add collaborators" ON public.walk_collaborators;
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

-- RLS Policy: Walk owners can remove collaborators
DROP POLICY IF EXISTS "Walk owners can remove collaborators" ON public.walk_collaborators;
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

-- RLS Policy: Contributors can leave walks (delete their own record)
DROP POLICY IF EXISTS "Contributors can leave walks" ON public.walk_collaborators;
CREATE POLICY "Contributors can leave walks"
  ON public.walk_collaborators
  FOR DELETE
  USING (user_id = auth.uid() AND role = 'contributor');

-- Grant permissions
GRANT SELECT ON public.walk_collaborators TO authenticated;
GRANT INSERT, DELETE ON public.walk_collaborators TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.walk_collaborators IS 'Tracks which users have access to which walks and their roles';
COMMENT ON COLUMN public.walk_collaborators.role IS 'User role: owner (full control) or contributor (can add sightings)';
COMMENT ON COLUMN public.walk_collaborators.joined_at IS 'When user was added to the walk';
