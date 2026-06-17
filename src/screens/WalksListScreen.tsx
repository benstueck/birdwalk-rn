import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Keyboard,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { Walk } from "../types/database";
import type { WalksStackScreenProps } from "../navigation/types";
import { WalkCard } from "../components/WalkCard";
import { NewWalkModal } from "../components/NewWalkModal";
import { SortButton } from "../components/SortButton";
import { SortBottomSheet } from "../components/SortBottomSheet";
import { SortOption, DEFAULT_SORT } from "../types/sort";
import { SearchBar } from "../components/SearchBar";
import { FABButton } from "../components/FABButton";
import { useSearch } from "../hooks/useSearch";

type WalkWithCount = Walk & { sightings: { count: number }[] };

export function WalksListScreen({
  navigation,
}: WalksStackScreenProps<"WalksList">) {
  const [walks, setWalks] = useState<WalkWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewWalkModal, setShowNewWalkModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
  const [showSortModal, setShowSortModal] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const { query, setQuery, results, loading: searchLoading } = useSearch();
  const containerRef = useRef<View>(null);
  const bottomAnim = useRef(new Animated.Value(24)).current;

  React.useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      containerRef.current?.measureInWindow((_x, y, _w, height) => {
        const containerBottom = y + height;
        const keyboardTop = e.endCoordinates.screenY;
        const overlap = containerBottom - keyboardTop;
        Animated.timing(bottomAnim, {
          toValue: 24 + overlap,
          duration: e.duration,
          easing: Easing.bezier(0.17, 0.59, 0.4, 0.77),
          useNativeDriver: false,
        }).start();
      });
    });
    const hide = Keyboard.addListener("keyboardWillHide", (e) => {
      Animated.timing(bottomAnim, {
        toValue: 24,
        duration: e.duration,
        easing: Easing.bezier(0.17, 0.59, 0.4, 0.77),
        useNativeDriver: false,
      }).start();
    });
    return () => { show.remove(); hide.remove(); };
  }, []);


  const fetchWalks = async () => {
    if (!user) return;

    const isDateSort = sortBy === "date-desc" || sortBy === "date-asc";
    const ascending = sortBy === "date-asc" || sortBy === "count-asc";

    const { data, error } = await supabase
      .from("walk_collaborators")
      .select("walks!inner(*, sightings(count), walk_collaborators(user_id, role, profiles(avatar_id, display_name)))")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching walks:", error);
    } else {
      let walksData = ((data ?? []).map((row: any) => row.walks) as WalkWithCount[]);

      walksData = [...walksData].sort((a, b) => {
        if (isDateSort) {
          const dtA = new Date(`${a.date}T${a.start_time}`).getTime();
          const dtB = new Date(`${b.date}T${b.start_time}`).getTime();
          return ascending ? dtA - dtB : dtB - dtA;
        } else {
          const countA = a.sightings?.[0]?.count ?? 0;
          const countB = b.sightings?.[0]?.count ?? 0;
          return ascending ? countA - countB : countB - countA;
        }
      });

      setWalks(walksData);
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
    }, [user, sortBy])
  );

  // Only show full-screen spinner on initial load
  if (loading && walks.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View ref={containerRef} className="flex-1 bg-gray-50 dark:bg-[#36393f]">
      <SafeAreaView edges={["top"]} className="bg-white dark:bg-[#2f3136]">
        <View className="px-4 py-4 border-b border-gray-200 dark:border-[#202225] flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde]">BirdWalk</Text>
          <SortButton sortBy={sortBy} onPress={() => setShowSortModal(true)} />
        </View>
      </SafeAreaView>
      <FlatList
        data={walks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WalkCard
            walk={item}
            sightingsCount={item.sightings?.[0]?.count ?? 0}
            collaborators={(item as any).walk_collaborators?.map((c: any) => ({
              user_id: c.user_id,
              avatar_id: c.profiles?.avatar_id ?? 1,
              display_name: c.profiles?.display_name ?? "",
            })) ?? []}

            onPress={() =>
              navigation.navigate("WalkDetail", { walkId: item.id })
            }
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 dark:text-[#b9bbbe] text-lg mb-2">No walks yet</Text>
            <Text className="text-gray-400 dark:text-[#72767d]">
              Start your first walk to begin tracking sightings
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

      <Animated.View style={{ position: 'absolute', bottom: bottomAnim, left: 16, right: 16 }}>
      <View className="flex-row items-center gap-3">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={(q) => navigation.navigate("Search", { initialQuery: q })}
          onWalkSelect={(walkId) => {
            setQuery("");
            navigation.navigate("WalkDetail", { walkId });
          }}
          onSpeciesSelect={(speciesName) => {
            setQuery("");
            navigation.navigate("Search", { initialQuery: speciesName });
          }}
          results={results}
          loading={searchLoading}
        />

        <FABButton onPress={() => setShowNewWalkModal(true)} />
      </View>
      </Animated.View>

      <NewWalkModal
        visible={showNewWalkModal}
        onClose={() => setShowNewWalkModal(false)}
        onWalkCreated={(walkId) => {
          fetchWalks();
          navigation.navigate("WalkDetail", { walkId });
        }}
      />

      <SortBottomSheet
        visible={showSortModal}
        sortBy={sortBy}
        onClose={() => setShowSortModal(false)}
        onSortChange={setSortBy}
      />
    </View>
  );
}
