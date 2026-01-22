import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Walk } from "../types/database";
import type { WalksStackScreenProps } from "../navigation/types";
import { WalkCard } from "../components/WalkCard";
import { NewWalkModal } from "../components/NewWalkModal";

type WalkWithCount = Walk & { sightings: { count: number }[] };

export function WalksListScreen({
  navigation,
}: WalksStackScreenProps<"WalksList">) {
  const [walks, setWalks] = useState<WalkWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewWalkModal, setShowNewWalkModal] = useState(false);
  const { user } = useAuth();

  const fetchWalks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("walks")
      .select("*, sightings(count)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching walks:", error);
    } else {
      setWalks((data as WalkWithCount[]) || []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalks();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalks();
    }, [user])
  );

  // Only show full-screen spinner on initial load
  if (loading && walks.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WalkCard
            walk={item}
            sightingsCount={item.sightings?.[0]?.count ?? 0}
            onPress={() =>
              navigation.navigate("WalkDetail", { walkId: item.id })
            }
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-lg mb-2">No walks yet</Text>
            <Text className="text-gray-400">
              Start your first walk to begin tracking sightings
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#16a34a"
          />
        }
      />

      <Pressable
        onPress={() => setShowNewWalkModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-gray-900 rounded-full justify-center items-center shadow-lg active:bg-gray-800"
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>

      <NewWalkModal
        visible={showNewWalkModal}
        onClose={() => setShowNewWalkModal(false)}
        onWalkCreated={(walkId) => {
          fetchWalks();
          navigation.navigate("WalkDetail", { walkId });
        }}
      />
    </View>
  );
}
