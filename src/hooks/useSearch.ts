import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { searchWalks, searchSpecies } from '../lib/searchService';
import type { SearchResult } from '../types/search';

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timeoutRef.current = setTimeout(async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [walks, species] = await Promise.all([
          searchWalks(query, user.id),
          searchSpecies(query, user.id),
        ]);

        setResults([...walks, ...species]);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, user]);

  return {
    query,
    setQuery,
    results,
    loading,
  };
}
