-- Add FK from sightings.created_by to profiles so PostgREST can join them
ALTER TABLE public.sightings
  ADD CONSTRAINT sightings_created_by_fkey2
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
