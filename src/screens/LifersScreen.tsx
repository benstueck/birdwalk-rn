import React, { useCallback, useState } from "react";
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
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Lifer } from "../types/database";
import type { WalksStackParamList } from "../navigation/types";
import { LiferCard } from "../components/LiferCard";
import { LiferModal } from "../components/LiferModal";

export function LifersScreen() {
  const [lifers, setLifers] = useState<Lifer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLifer, setSelectedLifer] = useState<Lifer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
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

    // Sort by most recent sighting
    const lifersList = Array.from(speciesMap.values()).sort(
      (a, b) =>
        new Date(b.most_recent_sighting).getTime() -
        new Date(a.most_recent_sighting).getTime()
    );

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
    }, [user])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-900">Life List</Text>
          <Text className="text-gray-500">{lifers.length} species</Text>
        </View>
      </SafeAreaView>

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
            <Text className="text-gray-500 text-lg mb-2">No species yet</Text>
            <Text className="text-gray-400 text-center px-8">
              Add sightings to your walks to build your life list
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#111827"
          />
        }
      />

      <LiferModal
        visible={showModal}
        lifer={selectedLifer}
        onClose={handleCloseModal}
        onNavigateToWalk={handleNavigateToWalk}
      />
    </View>
  );
}
