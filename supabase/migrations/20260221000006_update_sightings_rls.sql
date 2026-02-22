-- Migration: Update Sightings RLS Policies
-- Description: Update sightings table policies to support collaborative access
-- Date: 2026-02-21

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can insert sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can update sightings for their walks" ON public.sightings;
DROP POLICY IF EXISTS "Users can delete sightings for their walks" ON public.sightings;

-- Enable RLS (in case not already enabled)
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view sightings for accessible walks
CREATE POLICY "Users can view sightings for accessible walks"
  ON public.sightings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = sightings.walk_id
        AND wc.user_id = auth.uid()
    )
  );

-- RLS Policy: Collaborators can add sightings
CREATE POLICY "Collaborators can add sightings"
  ON public.sightings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_id
        AND wc.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update sightings they created OR owners can update any
CREATE POLICY "Users can update sightings they created or own"
  ON public.sightings
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = sightings.walk_id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = sightings.walk_id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- RLS Policy: Users can delete sightings they created OR owners can delete any
CREATE POLICY "Users can delete sightings they created or own"
  ON public.sightings
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = sightings.walk_id
        AND wc.user_id = auth.uid()
        AND wc.role = 'owner'
    )
  );

-- Trigger function to auto-set created_by on insert
CREATE OR REPLACE FUNCTION set_sighting_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by to current user if not already set
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before sighting insertion
DROP TRIGGER IF EXISTS set_sighting_creator_trigger ON public.sightings;
CREATE TRIGGER set_sighting_creator_trigger
  BEFORE INSERT ON public.sightings
  FOR EACH ROW
  EXECUTE FUNCTION set_sighting_creator();

-- Grant permissions
GRANT SELECT, INSERT ON public.sightings TO authenticated;
GRANT UPDATE, DELETE ON public.sightings TO authenticated;

-- Add comment
COMMENT ON TRIGGER set_sighting_creator_trigger ON public.sightings IS 'Automatically sets created_by to current user when sighting is created';
