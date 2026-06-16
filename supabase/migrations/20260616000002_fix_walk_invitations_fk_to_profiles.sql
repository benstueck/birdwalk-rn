-- walk_invitations.inviter_id/invitee_id currently reference auth.users.
-- Add additional FK constraints to profiles so PostgREST can join them.
ALTER TABLE public.walk_invitations
  ADD CONSTRAINT walk_invitations_inviter_id_fkey2
    FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT walk_invitations_invitee_id_fkey2
    FOREIGN KEY (invitee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
