jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialCommunityIcons: () => null,
}), { virtual: true });

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../../components/SearchBar';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnWalkSelect = jest.fn();
  const mockOnSpeciesSelect = jest.fn();

  const defaultProps = {
    value: '',
    onChangeText: mockOnChangeText,
    onSubmit: mockOnSubmit,
    onWalkSelect: mockOnWalkSelect,
    onSpeciesSelect: mockOnSpeciesSelect,
    results: [],
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input with placeholder', () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
    expect(getByPlaceholderText('Search walks & birds...')).toBeTruthy();
  });

  it('shows loading indicator during search', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} loading={true} />);
    expect(getByTestId('search-loading')).toBeTruthy();
  });

  it('hides dropdown when no results', () => {
    const { queryByTestId } = render(<SearchBar {...defaultProps} results={[]} />);
    expect(queryByTestId('search-dropdown')).toBeNull();
  });

  it('shows dropdown when results exist', () => {
    const results = [
      { type: 'walk' as const, id: '1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
    ];
    const { getByTestId } = render(<SearchBar {...defaultProps} results={results} value="park" />);
    expect(getByTestId('search-dropdown')).toBeTruthy();
  });

  it('calls onWalkSelect when walk result is pressed', () => {
    const results = [
      { type: 'walk' as const, id: '1', name: 'Central Park', date: '2024-01-15', sightingCount: 5 },
    ];
    const { getByText } = render(<SearchBar {...defaultProps} results={results} value="park" />);

    fireEvent.press(getByText('Central Park'));
    expect(mockOnWalkSelect).toHaveBeenCalledWith('1');
  });

  it('calls onSpeciesSelect when species result is pressed', () => {
    const results = [
      { type: 'species' as const, speciesCode: 'amerob', speciesName: 'American Robin', walks: [] },
    ];
    const { getByText } = render(<SearchBar {...defaultProps} results={results} value="robin" />);

    fireEvent.press(getByText('American Robin'));
    expect(mockOnSpeciesSelect).toHaveBeenCalledWith('American Robin');
  });

  it('calls onSubmit when form is submitted', () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} value="park" />);

    fireEvent(getByPlaceholderText('Search walks & birds...'), 'submitEditing');
    expect(mockOnSubmit).toHaveBeenCalledWith('park');
  });
});
