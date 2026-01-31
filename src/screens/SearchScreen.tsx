import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '../hooks/useSearch';
import type { WalksStackScreenProps } from '../navigation/types';
import type { SearchResult, WalkSearchResult, SpeciesSearchResult } from '../types/search';

export function SearchScreen({
  navigation,
  route,
}: WalksStackScreenProps<'Search'>) {
  const insets = useSafeAreaInsets();
  const initialQuery = route.params?.initialQuery || '';
  const { query, setQuery, results, loading } = useSearch(initialQuery);

  const walkResults = results.filter((r): r is WalkSearchResult => r.type === 'walk');
  const speciesResults = results.filter((r): r is SpeciesSearchResult => r.type === 'species');

  const handleWalkPress = (walkId: string) => {
    navigation.push('WalkDetail', { walkId });
  };

  const showNoResults = query.length >= 2 && !loading && results.length === 0;
  const showHint = query.length < 2;

  const renderWalkItem = (item: WalkSearchResult) => (
    <Pressable
      onPress={() => handleWalkPress(item.id)}
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 active:bg-gray-50"
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Ionicons name="footsteps" size={18} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-800 font-semibold">{item.name}</Text>
        <Text className="text-gray-500 text-sm mt-0.5">
          {item.sightingCount} {item.sightingCount === 1 ? 'bird' : 'birds'}
        </Text>
      </View>
    </Pressable>
  );

  const renderSpeciesItem = (item: SpeciesSearchResult) => (
    <View className="px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
          <MaterialCommunityIcons name="bird" size={18} color="#6b7280" />
        </View>
        <Text className="text-gray-800 font-semibold flex-1">{item.speciesName}</Text>
      </View>
      <View className="flex-row flex-wrap gap-2 mt-2 ml-13">
        {item.walks.map((walk) => (
          <Pressable
            key={walk.id}
            onPress={() => handleWalkPress(walk.id)}
            className="bg-gray-200 px-3 py-1.5 rounded-full active:bg-gray-300"
          >
            <Text className="text-gray-700 text-sm">{walk.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View className="px-4 py-2 bg-gray-100">
      <Text className="text-gray-600 font-semibold text-sm uppercase">
        {title}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()} className="pr-3">
          <Text className="text-gray-600 text-lg">←</Text>
        </Pressable>
        <TextInput
          testID="search-input"
          value={query}
          onChangeText={setQuery}
          placeholder="Search walks & birds..."
          placeholderTextColor="#9CA3AF"
          style={{
            flex: 1,
            fontSize: 16,
            color: '#111827',
          }}
          autoFocus
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator size="small" color="#111827" />
        )}
      </View>

      {showHint && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Enter at least 2 characters</Text>
        </View>
      )}

      {showNoResults && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No results found</Text>
        </View>
      )}

      {results.length > 0 && (
        <FlatList
          data={[
            ...(walkResults.length > 0 ? [{ type: 'header' as const, title: 'Walks' }] : []),
            ...walkResults,
            ...(speciesResults.length > 0 ? [{ type: 'header' as const, title: 'Birds' }] : []),
            ...speciesResults,
          ] as (SearchResult | { type: 'header'; title: string })[]}
          keyExtractor={(item) => {
            if (item.type === 'header') return `header-${item.title}`;
            if (item.type === 'walk') return item.id;
            return item.speciesCode;
          }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return renderSectionHeader(item.title);
            }
            if (item.type === 'walk') {
              return renderWalkItem(item);
            }
            return renderSpeciesItem(item);
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}
