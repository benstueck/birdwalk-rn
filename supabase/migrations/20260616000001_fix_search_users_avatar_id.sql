-- Fix search_users_with_stats to use avatar_id instead of avatar_url
DROP FUNCTION IF EXISTS search_users_with_stats(TEXT, INT);

CREATE OR REPLACE FUNCTION search_users_with_stats(
  search_query TEXT,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_id INT,
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
    p.avatar_id,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT wc.walk_id) as total_walks,
    COUNT(DISTINCT s.species_code) as total_species
  FROM public.profiles p
  LEFT JOIN public.walk_collaborators wc ON p.id = wc.user_id
  LEFT JOIN public.walks w ON wc.walk_id = w.id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE p.username ILIKE '%' || search_query || '%'
    AND p.id != auth.uid()
  GROUP BY p.id, p.username, p.display_name, p.bio, p.avatar_id, p.created_at, p.updated_at
  ORDER BY p.username
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
