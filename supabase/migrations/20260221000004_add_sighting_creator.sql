-- Migration: Add created_by Column to Sightings
-- Description: Track which user created each sighting for attribution
-- Date: 2026-02-21

-- Add created_by column to sightings table
ALTER TABLE public.sightings
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_sightings_created_by ON public.sightings (created_by);

-- Backfill existing sightings with walk owner as creator
-- This sets created_by for all existing sightings (assumes walk owner created them)
UPDATE public.sightings s
SET created_by = w.user_id
FROM public.walks w
WHERE s.walk_id = w.id
  AND s.created_by IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.sightings.created_by IS 'User who created this sighting (for attribution in collaborative walks)';
