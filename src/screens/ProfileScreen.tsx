import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  totalWalks: number;
  totalSightings: number;
  uniqueSpecies: number;
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalWalks: 0,
    totalSightings: 0,
    uniqueSpecies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user) return;

    const [walksResult, sightingsResult] = await Promise.all([
      supabase
        .from("walks")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),
      supabase
        .from("sightings")
        .select(
          `
          id,
          species_code,
          walks!inner (user_id)
        `
        )
        .eq("walks.user_id", user.id),
    ]);

    const totalWalks = walksResult.count || 0;
    const sightings = (sightingsResult.data || []) as Array<{
      id: string;
      species_code: string;
    }>;
    const totalSightings = sightings.length;
    const uniqueSpecies = new Set(sightings.map((s) => s.species_code)).size;

    setStats({ totalWalks, totalSightings, uniqueSpecies });
  };

  const loadStats = async () => {
    setLoading(true);
    await fetchStats();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [user])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#111827"
        />
      }
    >
      <View className="bg-white p-6 border-b border-gray-200">
        <View className="w-20 h-20 bg-gray-200 rounded-full justify-center items-center mx-auto mb-4">
          <Text className="text-3xl text-gray-600">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-center text-gray-800">
          {user?.email}
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          Your Stats
        </Text>

        <View className="flex-row">
          <View className="flex-1 bg-white p-4 rounded-lg mr-2">
            <Text className="text-3xl font-bold text-gray-900 text-center">
              {stats.totalWalks}
            </Text>
            <Text className="text-gray-500 text-center mt-1">Walks</Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-lg mx-1">
            <Text className="text-3xl font-bold text-gray-900 text-center">
              {stats.totalSightings}
            </Text>
            <Text className="text-gray-500 text-center mt-1">Sightings</Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-lg ml-2">
            <Text className="text-3xl font-bold text-gray-900 text-center">
              {stats.uniqueSpecies}
            </Text>
            <Text className="text-gray-500 text-center mt-1">Species</Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Pressable
          onPress={handleSignOut}
          className="bg-white border border-red-200 rounded-lg py-4 active:bg-red-50"
        >
          <Text className="text-red-600 text-center font-semibold">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
