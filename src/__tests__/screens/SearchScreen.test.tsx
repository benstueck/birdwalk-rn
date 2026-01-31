jest.mock('../../lib/supabase');
jest.mock('../../lib/searchService');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
}), { virtual: true });

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SearchScreen } from '../../screens/SearchScreen';
import * as searchService from '../../lib/searchService';

const mockSearchWalks = searchService.searchWalks as jest.MockedFunction<typeof searchService.searchWalks>;
const mockSearchSpecies = searchService.searchSpecies as jest.MockedFunction<typeof searchService.searchSpecies>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchWalks.mockResolvedValue([]);
    mockSearchSpecies.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('auto-focuses input on mount', () => {
    const { getByTestId } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: {} } as any}
      />
    );

    const input = getByTestId('search-input');
    expect(input.props.autoFocus).toBe(true);
  });

  it('initializes query from route params', () => {
    const { getByTestId } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'robin' } } as any}
      />
    );

    const input = getByTestId('search-input');
    expect(input.props.value).toBe('robin');
  });

  it('shows hint when query is less than 2 characters', () => {
    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'a' } } as any}
      />
    );

    expect(getByText('Enter at least 2 characters')).toBeTruthy();
  });

  it('shows "No results" when search returns empty', async () => {
    mockSearchWalks.mockResolvedValue([]);
    mockSearchSpecies.mockResolvedValue([]);

    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'xyz' } } as any}
      />
    );

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getByText('No results found')).toBeTruthy();
    });
  });

  it('groups results into Walks and Birds sections', async () => {
    mockSearchWalks.mockResolvedValue([
      { type: 'walk', id: '1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
    ]);
    mockSearchSpecies.mockResolvedValue([
      { type: 'species', speciesCode: 'amerob', speciesName: 'American Robin', walks: [{ id: '1', name: 'Central Park' }] },
    ]);

    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'test' } } as any}
      />
    );

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getByText('Walks')).toBeTruthy();
      expect(getByText('Birds')).toBeTruthy();
    });
  });

  it('navigates to WalkDetail on walk press', async () => {
    mockSearchWalks.mockResolvedValue([
      { type: 'walk', id: 'walk-1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
    ]);

    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'park' } } as any}
      />
    );

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getByText('Central Park')).toBeTruthy();
    });

    fireEvent.press(getByText('Central Park'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('WalkDetail', { walkId: 'walk-1' });
  });

  it('displays species with all walks they are seen in', async () => {
    mockSearchSpecies.mockResolvedValue([
      {
        type: 'species',
        speciesCode: 'amerob',
        speciesName: 'American Robin',
        walks: [
          { id: 'walk-1', name: 'Central Park' },
          { id: 'walk-2', name: 'Prospect Park' },
          { id: 'walk-3', name: 'Battery Park' },
        ],
      },
    ]);

    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'robin' } } as any}
      />
    );

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getByText('American Robin')).toBeTruthy();
      expect(getByText(/Seen in:/)).toBeTruthy();
      expect(getByText('Central Park')).toBeTruthy();
      expect(getByText('Prospect Park')).toBeTruthy();
      expect(getByText('Battery Park')).toBeTruthy();
    });
  });

  it('navigates to WalkDetail when clicking a walk name in species result', async () => {
    mockSearchSpecies.mockResolvedValue([
      {
        type: 'species',
        speciesCode: 'amerob',
        speciesName: 'American Robin',
        walks: [
          { id: 'walk-1', name: 'Central Park' },
          { id: 'walk-2', name: 'Prospect Park' },
        ],
      },
    ]);

    const { getByText } = render(
      <SearchScreen
        navigation={mockNavigation as any}
        route={{ params: { initialQuery: 'robin' } } as any}
      />
    );

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(getByText('Prospect Park')).toBeTruthy();
    });

    fireEvent.press(getByText('Prospect Park'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('WalkDetail', { walkId: 'walk-2' });
  });
});
