-- Migration: Update Walks RLS Policies
-- Description: Update walks table policies to support collaborative access
-- Date: 2026-02-21

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own walks" ON public.walks;
DROP POLICY IF EXISTS "Users can update their own walks" ON public.walks;
DROP POLICY IF EXISTS "Users can delete their own walks" ON public.walks;
DROP POLICY IF EXISTS "Users can insert walks" ON public.walks;

-- Enable RLS (in case not already enabled)
ALTER TABLE public.walks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view accessible walks (walks they're collaborators on)
CREATE POLICY "Users can view accessible walks"
  ON public.walks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walks.id
        AND wc.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can create walks
CREATE POLICY "Users can create walks"
  ON public.walks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Walk owners can update walks
CREATE POLICY "Walk owners can update walks"
  ON public.walks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walks.id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walks.id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- RLS Policy: Walk owners can delete walks
CREATE POLICY "Walk owners can delete walks"
  ON public.walks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walks.id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- Trigger function to auto-add walk creator as owner
CREATE OR REPLACE FUNCTION add_walk_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the walk creator as owner in walk_collaborators
  INSERT INTO public.walk_collaborators (walk_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after walk insertion
DROP TRIGGER IF EXISTS add_walk_owner_trigger ON public.walks;
CREATE TRIGGER add_walk_owner_trigger
  AFTER INSERT ON public.walks
  FOR EACH ROW
  EXECUTE FUNCTION add_walk_owner();

-- Grant permissions
GRANT SELECT, INSERT ON public.walks TO authenticated;
GRANT UPDATE, DELETE ON public.walks TO authenticated;

-- Add comment
COMMENT ON TRIGGER add_walk_owner_trigger ON public.walks IS 'Automatically adds walk creator as owner to walk_collaborators';
