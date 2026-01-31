jest.mock('../../lib/supabase');

import { searchWalks, searchSpecies } from '../../lib/searchService';
import { supabase } from '../../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('searchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchWalks', () => {
    it('returns empty array for query less than 2 chars', async () => {
      const result = await searchWalks('a', 'user-123');
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('calls Supabase with correct ilike query', async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockIlike = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await searchWalks('park', 'user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('walks');
      expect(mockSelect).toHaveBeenCalledWith('id, name, date, sightings(count)');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockIlike).toHaveBeenCalledWith('name', '%park%');
    });

    it('returns walks with sighting counts', async () => {
      const mockWalks = [
        { id: '1', name: 'Central Park', date: '2024-01-15', sightings: [{ count: 5 }] },
        { id: '2', name: 'Prospect Park', date: '2024-01-10', sightings: [{ count: 3 }] },
      ];
      const mockOrder = jest.fn().mockResolvedValue({ data: mockWalks, error: null });
      const mockIlike = jest.fn().mockReturnValue({ order: mockOrder });
      const mockEq = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await searchWalks('park', 'user-123');

      expect(result).toEqual([
        { type: 'walk', id: '1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
        { type: 'walk', id: '2', name: 'Prospect Park', date: '2024-01-10', sightingCount: 3 },
      ]);
    });
  });

  describe('searchSpecies', () => {
    it('returns empty array for query less than 2 chars', async () => {
      const result = await searchSpecies('a', 'user-123');
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('calls Supabase with correct ilike query for species', async () => {
      const mockIlike = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await searchSpecies('robin', 'user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('sightings');
      expect(mockSelect).toHaveBeenCalledWith('species_name, species_code, walks!inner(id, name, user_id)');
      expect(mockEq).toHaveBeenCalledWith('walks.user_id', 'user-123');
      expect(mockIlike).toHaveBeenCalledWith('species_name', '%robin%');
    });

    it('returns species grouped by species_code with walks list', async () => {
      const mockSightings = [
        { species_name: 'American Robin', species_code: 'amerob', walks: { id: 'w1', name: 'Central Park', user_id: 'user-123' } },
        { species_name: 'American Robin', species_code: 'amerob', walks: { id: 'w2', name: 'Prospect Park', user_id: 'user-123' } },
        { species_name: 'European Robin', species_code: 'eurobi', walks: { id: 'w1', name: 'Central Park', user_id: 'user-123' } },
      ];
      const mockIlike = jest.fn().mockResolvedValue({ data: mockSightings, error: null });
      const mockEq = jest.fn().mockReturnValue({ ilike: mockIlike });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await searchSpecies('robin', 'user-123');

      expect(result).toEqual([
        {
          type: 'species',
          speciesCode: 'amerob',
          speciesName: 'American Robin',
          walks: [
            { id: 'w1', name: 'Central Park' },
            { id: 'w2', name: 'Prospect Park' },
          ],
        },
        {
          type: 'species',
          speciesCode: 'eurobi',
          speciesName: 'European Robin',
          walks: [{ id: 'w1', name: 'Central Park' }],
        },
      ]);
    });
  });
});
