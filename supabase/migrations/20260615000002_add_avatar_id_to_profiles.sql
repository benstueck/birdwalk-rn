-- Replace avatar_url with avatar_id (integer 1-10 mapping to bird emoji presets)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_id INTEGER NOT NULL DEFAULT 1,
  ADD CONSTRAINT avatar_id_range CHECK (avatar_id >= 1 AND avatar_id <= 10);

-- Drop the old column (was never used in production)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS avatar_url;
