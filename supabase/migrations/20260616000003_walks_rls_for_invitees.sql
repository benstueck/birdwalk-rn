-- Allow invitees to read walk details for their pending invitations
CREATE POLICY "Invitees can view invited walks"
  ON public.walks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.walk_invitations wi
      WHERE wi.walk_id = walks.id
        AND wi.invitee_id = auth.uid()
        AND wi.status = 'pending'
        AND wi.expires_at > now()
    )
  );
