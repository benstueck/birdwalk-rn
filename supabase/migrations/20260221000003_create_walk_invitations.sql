-- Migration: Create Walk Invitations Table
-- Description: Manage pending invitations to walks
-- Date: 2026-02-21

-- Create walk_invitations table
CREATE TABLE IF NOT EXISTS public.walk_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  responded_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  CONSTRAINT unique_walk_invitee UNIQUE (walk_id, invitee_id),
  CONSTRAINT message_length CHECK (message IS NULL OR char_length(message) <= 200),
  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_walk_invitations_walk_id ON public.walk_invitations (walk_id);
CREATE INDEX IF NOT EXISTS idx_walk_invitations_invitee_id ON public.walk_invitations (invitee_id);
CREATE INDEX IF NOT EXISTS idx_walk_invitations_status ON public.walk_invitations (status);
CREATE INDEX IF NOT EXISTS idx_walk_invitations_expires_at ON public.walk_invitations (expires_at);

-- Enable Row Level Security
ALTER TABLE public.walk_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view invitations they sent or received
DROP POLICY IF EXISTS "View own invitations" ON public.walk_invitations;
CREATE POLICY "View own invitations"
  ON public.walk_invitations
  FOR SELECT
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

-- RLS Policy: Walk collaborators can send invitations
DROP POLICY IF EXISTS "Walk collaborators can send invitations" ON public.walk_invitations;
CREATE POLICY "Walk collaborators can send invitations"
  ON public.walk_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.walk_collaborators wc
      WHERE wc.walk_id = walk_id
        AND wc.user_id = auth.uid()
    )
  );

-- RLS Policy: Inviters can cancel invitations
DROP POLICY IF EXISTS "Inviters can cancel invitations" ON public.walk_invitations;
CREATE POLICY "Inviters can cancel invitations"
  ON public.walk_invitations
  FOR UPDATE
  USING (inviter_id = auth.uid() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- RLS Policy: Invitees can accept/decline invitations
DROP POLICY IF EXISTS "Invitees can respond to invitations" ON public.walk_invitations;
CREATE POLICY "Invitees can respond to invitations"
  ON public.walk_invitations
  FOR UPDATE
  USING (invitee_id = auth.uid() AND status = 'pending')
  WITH CHECK (status IN ('accepted', 'declined'));

-- Grant permissions
GRANT SELECT ON public.walk_invitations TO authenticated;
GRANT INSERT, UPDATE ON public.walk_invitations TO authenticated;

-- Function to delete/cancel expired invitations
CREATE OR REPLACE FUNCTION delete_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE public.walk_invitations
  SET status = 'cancelled'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.walk_invitations IS 'Manages walk invitations sent between users';
COMMENT ON COLUMN public.walk_invitations.status IS 'Invitation status: pending, accepted, declined, or cancelled';
COMMENT ON COLUMN public.walk_invitations.expires_at IS 'When invitation expires (default 30 days from creation)';
COMMENT ON COLUMN public.walk_invitations.message IS 'Optional personal message from inviter (max 200 chars)';
