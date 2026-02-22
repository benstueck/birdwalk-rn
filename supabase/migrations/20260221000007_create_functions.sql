-- Migration: Create Database Functions
-- Description: Helper functions for collaborative walks
-- Date: 2026-02-21

-- Function: Get all walks a user can access (owns or collaborates on)
CREATE OR REPLACE FUNCTION get_accessible_walks(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  date TEXT,
  start_time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  role TEXT,
  sighting_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.user_id,
    w.name,
    w.location_lat,
    w.location_lng,
    w.date,
    w.start_time,
    w.notes,
    w.created_at,
    wc.role,
    COUNT(s.id) as sighting_count
  FROM public.walks w
  INNER JOIN public.walk_collaborators wc ON w.id = wc.walk_id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE wc.user_id = user_uuid
  GROUP BY w.id, w.user_id, w.name, w.location_lat, w.location_lng,
           w.date, w.start_time, w.notes, w.created_at, wc.role
  ORDER BY w.date DESC, w.start_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Accept walk invitation and add user as collaborator
CREATE OR REPLACE FUNCTION accept_walk_invitation(invitation_uuid UUID)
RETURNS void AS $$
DECLARE
  v_walk_id UUID;
  v_invitee_id UUID;
BEGIN
  -- Get invitation details and validate
  SELECT walk_id, invitee_id INTO v_walk_id, v_invitee_id
  FROM public.walk_invitations
  WHERE id = invitation_uuid
    AND invitee_id = auth.uid()
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Add user as collaborator (using ON CONFLICT to handle duplicates)
  INSERT INTO public.walk_collaborators (walk_id, user_id, role)
  VALUES (v_walk_id, v_invitee_id, 'contributor')
  ON CONFLICT (walk_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.walk_invitations
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has permission for a walk
CREATE OR REPLACE FUNCTION has_walk_permission(
  p_walk_id UUID,
  p_user_id UUID,
  p_required_role TEXT DEFAULT 'contributor'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.walk_collaborators
  WHERE walk_id = p_walk_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_required_role = 'owner' THEN
    RETURN v_role = 'owner';
  ELSE
    RETURN v_role IN ('owner', 'contributor');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search users with stats
CREATE OR REPLACE FUNCTION search_users_with_stats(
  search_query TEXT,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
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
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT wc.walk_id) as total_walks,
    COUNT(DISTINCT s.species_code) as total_species
  FROM public.profiles p
  LEFT JOIN public.walk_collaborators wc ON p.id = wc.user_id
  LEFT JOIN public.walks w ON wc.walk_id = w.id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE p.username ILIKE '%' || search_query || '%'
    AND p.id != auth.uid() -- Exclude current user
  GROUP BY p.id, p.username, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at
  ORDER BY p.username
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get profile with stats for a specific user
CREATE OR REPLACE FUNCTION get_profile_with_stats(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
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
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT wc.walk_id) as total_walks,
    COUNT(DISTINCT s.species_code) as total_species
  FROM public.profiles p
  LEFT JOIN public.walk_collaborators wc ON p.id = wc.user_id
  LEFT JOIN public.walks w ON wc.walk_id = w.id
  LEFT JOIN public.sightings s ON w.id = s.walk_id
  WHERE p.id = user_uuid
  GROUP BY p.id, p.username, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search user by exact email (for privacy)
CREATE OR REPLACE FUNCTION search_user_by_email(email_query TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url
  FROM public.profiles p
  INNER JOIN auth.users u ON p.id = u.id
  WHERE u.email = email_query
    AND p.id != auth.uid(); -- Exclude current user
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION get_accessible_walks IS 'Returns all walks a user can access with role and sighting count';
COMMENT ON FUNCTION accept_walk_invitation IS 'Accepts an invitation and adds user as collaborator';
COMMENT ON FUNCTION has_walk_permission IS 'Checks if user has required permission level for a walk';
COMMENT ON FUNCTION search_users_with_stats IS 'Searches users by username with walk and species stats';
COMMENT ON FUNCTION get_profile_with_stats IS 'Gets a single user profile with stats';
COMMENT ON FUNCTION search_user_by_email IS 'Searches for user by exact email match (privacy-preserving)';
