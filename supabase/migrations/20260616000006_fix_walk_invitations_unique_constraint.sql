-- Replace the blanket unique constraint with a partial one so that
-- cancelled/declined invitations don't block re-inviting the same user.
ALTER TABLE public.walk_invitations DROP CONSTRAINT unique_walk_invitee;

CREATE UNIQUE INDEX unique_walk_invitee_pending
  ON public.walk_invitations (walk_id, invitee_id)
  WHERE status = 'pending';
