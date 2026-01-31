jest.mock('../../lib/supabase');
jest.mock('../../lib/searchService');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSearch } from '../../hooks/useSearch';
import * as searchService from '../../lib/searchService';

const mockSearchWalks = searchService.searchWalks as jest.MockedFunction<typeof searchService.searchWalks>;
const mockSearchSpecies = searchService.searchSpecies as jest.MockedFunction<typeof searchService.searchSpecies>;

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchWalks.mockResolvedValue([]);
    mockSearchSpecies.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces search by 300ms', async () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('te');
    });

    expect(mockSearchWalks).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockSearchWalks).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockSearchWalks).toHaveBeenCalledWith('te', 'user-123');
    });
  });

  it('clears results when query is less than 2 chars', async () => {
    mockSearchWalks.mockResolvedValue([
      { type: 'walk', id: '1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
    ]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('park');
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setQuery('p');
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
    });
  });

  it('combines walk and species results', async () => {
    const mockWalks = [
      { type: 'walk' as const, id: '1', name: 'Robin Trail', date: '2024-01-15', sightingCount: 5 },
    ];
    const mockSpecies = [
      { type: 'species' as const, speciesCode: 'amerob', speciesName: 'American Robin', walks: [{ id: '1', name: 'Robin Trail' }] },
    ];

    mockSearchWalks.mockResolvedValue(mockWalks);
    mockSearchSpecies.mockResolvedValue(mockSpecies);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('robin');
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.results).toEqual([...mockWalks, ...mockSpecies]);
    });
  });
});
