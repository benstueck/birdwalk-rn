-- Create walks table
CREATE TABLE walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own walks
CREATE POLICY "Users can view own walks"
  ON walks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own walks
CREATE POLICY "Users can insert own walks"
  ON walks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own walks
CREATE POLICY "Users can update own walks"
  ON walks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own walks
CREATE POLICY "Users can delete own walks"
  ON walks FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX walks_user_id_idx ON walks(user_id);

-- Index for sorting by date
CREATE INDEX walks_date_idx ON walks(date DESC);
