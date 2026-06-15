-- Create sightings table
CREATE TABLE sightings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_id UUID REFERENCES walks(id) ON DELETE CASCADE NOT NULL,
  species_code TEXT NOT NULL,
  species_name TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  type TEXT DEFAULT 'seen' CHECK (type IN ('seen', 'heard')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

-- Users can view sightings for their own walks
CREATE POLICY "Users can view sightings for own walks"
  ON sightings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = sightings.walk_id
      AND walks.user_id = auth.uid()
    )
  );

-- Users can insert sightings for their own walks
CREATE POLICY "Users can insert sightings for own walks"
  ON sightings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = sightings.walk_id
      AND walks.user_id = auth.uid()
    )
  );

-- Users can update sightings for their own walks
CREATE POLICY "Users can update sightings for own walks"
  ON sightings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = sightings.walk_id
      AND walks.user_id = auth.uid()
    )
  );

-- Users can delete sightings for their own walks
CREATE POLICY "Users can delete sightings for own walks"
  ON sightings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM walks
      WHERE walks.id = sightings.walk_id
      AND walks.user_id = auth.uid()
    )
  );

-- Index for faster queries by walk
CREATE INDEX sightings_walk_id_idx ON sightings(walk_id);

-- Index for searching by species
CREATE INDEX sightings_species_name_idx ON sightings(species_name);

-- Index for sorting by timestamp
CREATE INDEX sightings_timestamp_idx ON sightings(timestamp DESC);
