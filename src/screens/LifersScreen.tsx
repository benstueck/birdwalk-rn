import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { Lifer } from "../types/database";
import type { WalksStackParamList } from "../navigation/types";
import { LiferCard } from "../components/LiferCard";
import { LiferModal } from "../components/LiferModal";
import { SortButton } from "../components/SortButton";
import { SortBottomSheet } from "../components/SortBottomSheet";
import { LiferSortOption, DEFAULT_LIFER_SORT, liferSortOptions } from "../types/sort";

export function LifersScreen() {
  const [lifers, setLifers] = useState<Lifer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLifer, setSelectedLifer] = useState<Lifer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<LiferSortOption>(DEFAULT_LIFER_SORT);
  const [showSortModal, setShowSortModal] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<WalksStackParamList>>();

  const handleLiferPress = (lifer: Lifer) => {
    setSelectedLifer(lifer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLifer(null);
  };

  const handleNavigateToWalk = (walkId: string) => {
    setShowModal(false);
    setSelectedLifer(null);
    navigation.navigate("WalkDetail", { walkId });
  };

  // Load saved sort preference
  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('@lifers_sort_preference');
        if (saved) setSortBy(saved as LiferSortOption);
      } catch (error) {
        console.error('Error loading sort preference:', error);
      }
    };
    loadSortPreference();
  }, []);

  // Save sort preference when it changes
  const handleSortChange = async (newSort: LiferSortOption) => {
    setSortBy(newSort);
    setShowSortModal(false);
    try {
      await AsyncStorage.setItem('@lifers_sort_preference', newSort);
    } catch (error) {
      console.error('Error saving sort preference:', error);
    }
  };

  const fetchLifers = async () => {
    if (!user) return;

    // Get all sightings with walk info grouped by species
    const { data, error } = await supabase
      .from("sightings")
      .select(
        `
        id,
        species_code,
        species_name,
        scientific_name,
        timestamp,
        walk_id,
        walks!inner (
          id,
          name,
          date,
          user_id
        )
      `
      )
      .eq("walks.user_id", user.id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching lifers:", error);
      return;
    }

    // Type assertion for the joined query result
    const sightings = data as unknown as Array<{
      id: string;
      species_code: string;
      species_name: string;
      scientific_name: string | null;
      timestamp: string;
      walk_id: string;
      walks: { id: string; name: string; date: string };
    }>;

    // Group sightings by species
    const speciesMap = new Map<string, Lifer>();

    for (const sighting of sightings || []) {
      const walk = sighting.walks;

      if (!speciesMap.has(sighting.species_code)) {
        speciesMap.set(sighting.species_code, {
          species_code: sighting.species_code,
          species_name: sighting.species_name,
          scientific_name: sighting.scientific_name,
          most_recent_sighting: sighting.timestamp,
          total_sightings: 1,
          sightings: [
            {
              id: sighting.id,
              timestamp: sighting.timestamp,
              walk_id: walk.id,
              walk_name: walk.name,
              walk_date: walk.date,
            },
          ],
        });
      } else {
        const lifer = speciesMap.get(sighting.species_code)!;
        lifer.total_sightings++;
        lifer.sightings.push({
          id: sighting.id,
          timestamp: sighting.timestamp,
          walk_id: walk.id,
          walk_name: walk.name,
          walk_date: walk.date,
        });
        if (sighting.timestamp > lifer.most_recent_sighting) {
          lifer.most_recent_sighting = sighting.timestamp;
        }
      }
    }

    // Apply sorting based on sortBy state
    let lifersList = Array.from(speciesMap.values());

    switch (sortBy) {
      case "recent-desc":
        lifersList.sort((a, b) =>
          new Date(b.most_recent_sighting).getTime() -
          new Date(a.most_recent_sighting).getTime()
        );
        break;
      case "recent-asc":
        lifersList.sort((a, b) =>
          new Date(a.most_recent_sighting).getTime() -
          new Date(b.most_recent_sighting).getTime()
        );
        break;
      case "name-asc":
        lifersList.sort((a, b) =>
          a.species_name.localeCompare(b.species_name)
        );
        break;
      case "name-desc":
        lifersList.sort((a, b) =>
          b.species_name.localeCompare(a.species_name)
        );
        break;
      case "count-desc":
        lifersList.sort((a, b) => b.total_sightings - a.total_sightings);
        break;
      case "count-asc":
        lifersList.sort((a, b) => a.total_sightings - b.total_sightings);
        break;
    }

    setLifers(lifersList);
  };

  const loadLifers = async () => {
    setLoading(true);
    await fetchLifers();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLifers();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLifers();
    }, [user, sortBy])
  );

  // Only show full-screen spinner on initial load
  if (loading && lifers.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#36393f]">
      <SafeAreaView edges={["top"]} className="bg-white dark:bg-[#2f3136]">
        <View className="px-4 py-4 border-b border-gray-200 dark:border-[#202225] flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde]">Life List</Text>
          <SortButton
            sortBy={sortBy}
            defaultSort={DEFAULT_LIFER_SORT}
            onPress={() => setShowSortModal(true)}
          />
        </View>
      </SafeAreaView>

      <View className="px-4 pt-4 pb-2 bg-gray-50 dark:bg-[#36393f]">
        <Text className="text-lg font-semibold text-gray-500 dark:text-[#b9bbbe]">{lifers.length} species</Text>
      </View>

      <FlatList
        data={lifers}
        keyExtractor={(item) => item.species_code}
        renderItem={({ item }) => (
          <LiferCard lifer={item} onPress={() => handleLiferPress(item)} />
        )}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 dark:text-[#b9bbbe] text-lg mb-2">No species yet</Text>
            <Text className="text-gray-400 dark:text-[#72767d] text-center px-8">
              Add sightings to your walks to build your life list
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      />

      <LiferModal
        visible={showModal}
        lifer={selectedLifer}
        onClose={handleCloseModal}
        onNavigateToWalk={handleNavigateToWalk}
      />

      <SortBottomSheet
        visible={showSortModal}
        sortBy={sortBy}
        onClose={() => setShowSortModal(false)}
        onSortChange={handleSortChange}
        sortOptions={liferSortOptions}
      />
    </View>
  );
}
