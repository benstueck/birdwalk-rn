import { supabase } from './supabase';
import type { WalkSearchResult, SpeciesSearchResult } from '../types/search';

interface WalkWithSightings {
  id: string;
  name: string;
  date: string;
  sightings: { count: number }[];
}

export async function searchWalks(query: string, userId: string): Promise<WalkSearchResult[]> {
  if (query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('walks')
    .select('id, name, date, sightings(count)')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error searching walks:', error);
    return [];
  }

  return ((data as WalkWithSightings[] | null) || []).map((walk) => ({
    type: 'walk' as const,
    id: walk.id,
    name: walk.name,
    date: walk.date,
    sightingCount: walk.sightings?.[0]?.count ?? 0,
  }));
}

interface SightingWithWalk {
  species_name: string;
  species_code: string;
  walks: { id: string; name: string; user_id: string };
}

export async function searchSpecies(query: string, userId: string): Promise<SpeciesSearchResult[]> {
  if (query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('sightings')
    .select('species_name, species_code, walks!inner(id, name, user_id)')
    .eq('walks.user_id', userId)
    .ilike('species_name', `%${query}%`);

  if (error) {
    console.error('Error searching species:', error);
    return [];
  }

  // Group by species_code
  const speciesMap = new Map<string, SpeciesSearchResult>();

  for (const sighting of (data as SightingWithWalk[] | null) || []) {
    const walk = sighting.walks;
    const existing = speciesMap.get(sighting.species_code);

    if (existing) {
      // Only add walk if not already in the list
      if (!existing.walks.find((w) => w.id === walk.id)) {
        existing.walks.push({ id: walk.id, name: walk.name });
      }
    } else {
      speciesMap.set(sighting.species_code, {
        type: 'species',
        speciesCode: sighting.species_code,
        speciesName: sighting.species_name,
        walks: [{ id: walk.id, name: walk.name }],
      });
    }
  }

  return Array.from(speciesMap.values());
}
