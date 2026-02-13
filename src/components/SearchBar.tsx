import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import type { SearchResult } from '../types/search';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (query: string) => void;
  onWalkSelect: (walkId: string) => void;
  onSpeciesSelect: (speciesName: string) => void;
  results: SearchResult[];
  loading: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onWalkSelect,
  onSpeciesSelect,
  results,
  loading,
}: SearchBarProps) {
  const { colors } = useTheme();
  const showDropdown = value.length >= 2 && results.length > 0;

  return (
    <View className="flex-1">
      {showDropdown && (
        <View
          testID="search-dropdown"
          className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#2f3136] rounded-2xl shadow-lg max-h-60 border border-gray-200 dark:border-[#202225] overflow-hidden"
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            {results.slice(0, 5).map((result, index) => (
              <Pressable
                key={result.type === 'walk' ? result.id : result.speciesCode}
                onPress={() => {
                  if (result.type === 'walk') {
                    onWalkSelect(result.id);
                  } else {
                    onSpeciesSelect(result.speciesName);
                  }
                }}
                className={`flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-[#202225] ${
                  index < results.slice(0, 5).length - 1 ? 'border-b border-gray-100 dark:border-[#202225]' : ''
                }`}
              >
                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#202225] items-center justify-center mr-3">
                  {result.type === 'walk' ? (
                    <Ionicons name="footsteps" size={16} color={colors.text.secondary} />
                  ) : (
                    <MaterialCommunityIcons name="bird" size={16} color={colors.text.secondary} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 dark:text-[#dcddde] font-medium">
                    {result.type === 'walk' ? result.name : result.speciesName}
                  </Text>
                  <Text className="text-gray-500 dark:text-[#72767d] text-sm mt-0.5">
                    {result.type === 'walk'
                      ? `${result.sightingCount} ${result.sightingCount === 1 ? 'bird' : 'birds'}`
                      : `${result.walks.length} ${result.walks.length === 1 ? 'walk' : 'walks'}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="flex-row items-center bg-white dark:bg-[#2f3136] px-5 h-14 shadow-sm rounded-full">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={() => onSubmit(value)}
          placeholder="Search walks & birds..."
          placeholderTextColor={colors.text.tertiary}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text.primary,
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {loading && (
          <ActivityIndicator
            testID="search-loading"
            size="small"
            color={colors.accent}
          />
        )}
      </View>
    </View>
  );
}
