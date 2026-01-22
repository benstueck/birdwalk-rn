import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import type { Walk, Sighting } from "../types/database";
import type { WalksStackScreenProps } from "../navigation/types";
import { SightingCard } from "../components/SightingCard";

export function WalkDetailScreen({
  route,
  navigation,
}: WalksStackScreenProps<"WalkDetail">) {
  const { walkId } = route.params;
  const [walk, setWalk] = useState<Walk | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const [walkResult, sightingsResult] = await Promise.all([
      supabase.from("walks").select("*").eq("id", walkId).single(),
      supabase
        .from("sightings")
        .select("*")
        .eq("walk_id", walkId)
        .order("timestamp", { ascending: false }),
    ]);

    if (walkResult.error) {
      console.error("Error fetching walk:", walkResult.error);
    } else {
      setWalk(walkResult.data);
    }

    if (sightingsResult.error) {
      console.error("Error fetching sightings:", sightingsResult.error);
    } else {
      setSightings(sightingsResult.data || []);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [walkId])
  );

  useEffect(() => {
    if (walk) {
      navigation.setOptions({ title: walk.name });
    }
  }, [walk, navigation]);

  const handleDeleteSighting = async (sightingId: string) => {
    Alert.alert(
      "Delete Sighting",
      "Are you sure you want to delete this sighting?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("sightings")
              .delete()
              .eq("id", sightingId);

            if (error) {
              Alert.alert("Error", "Failed to delete sighting");
            } else {
              setSightings((prev) => prev.filter((s) => s.id !== sightingId));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!walk) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Walk not found</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="bg-white p-4 mb-4 border-b border-gray-200">
            <Text className="text-gray-600 mb-1">{formatDate(walk.date)}</Text>
            <Text className="text-gray-500 text-sm">
              Started at {walk.start_time}
            </Text>
            {walk.notes && (
              <Text className="text-gray-600 mt-3">{walk.notes}</Text>
            )}
            <View className="flex-row items-center mt-4">
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-medium">
                  {sightings.length} sighting{sightings.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SightingCard
            sighting={item}
            onDelete={() => handleDeleteSighting(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-4">
            <Text className="text-gray-500 text-lg mb-2 text-center">
              No sightings yet
            </Text>
            <Text className="text-gray-400 text-center">
              Tap the + button to add your first sighting
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
        onPress={() => navigation.navigate("NewSighting", { walkId })}
        className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full justify-center items-center shadow-lg active:bg-green-700"
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>
    </View>
  );
}
