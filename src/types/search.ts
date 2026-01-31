export interface WalkSearchResult {
  type: 'walk';
  id: string;
  name: string;
  date: string;
  sightingCount: number;
}

export interface SpeciesSearchResult {
  type: 'species';
  speciesCode: string;
  speciesName: string;
  walks: Array<{ id: string; name: string }>;
}

export type SearchResult = WalkSearchResult | SpeciesSearchResult;
