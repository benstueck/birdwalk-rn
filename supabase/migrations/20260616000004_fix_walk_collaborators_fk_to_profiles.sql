-- Add FK from walk_collaborators.user_id to profiles so PostgREST can join them
ALTER TABLE public.walk_collaborators
  ADD CONSTRAINT walk_collaborators_user_id_fkey2
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
