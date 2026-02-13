import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { WalksStackScreenProps } from "../navigation/types";
import type { Walk, WalkInsert } from "../types/database";

export function NewWalkScreen({
  navigation,
}: WalksStackScreenProps<"NewWalk">) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLoading(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
      setLocationLoading(false);
    })();
  }, []);

  const handleCreateWalk = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name for your walk");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const startTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const walkData: WalkInsert = {
      user_id: user.id,
      name: name.trim(),
      date,
      start_time: startTime,
      notes: notes.trim() || null,
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
    };

    const { data, error } = await supabase
      .from("walks")
      .insert(walkData as any)
      .select()
      .single();

    if (error) {
      Alert.alert("Error", "Failed to create walk");
      console.error("Error creating walk:", error);
    } else if (data) {
      const walk = data as Walk;
      navigation.replace("WalkDetail", { walkId: walk.id });
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white dark:bg-[#2f3136]">
        <View className="p-6">
          <View className="mb-6">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Walk Name *</Text>
            <TextInput
              className="rounded-lg px-4 py-3 text-base"
              style={{
                borderWidth: 1,
                borderColor: colors.input.border,
                backgroundColor: colors.input.background,
                color: colors.input.text,
              }}
              placeholder="e.g., Morning walk at the park"
              placeholderTextColor={colors.input.placeholder}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Notes</Text>
            <TextInput
              className="rounded-lg px-4 py-3 text-base"
              style={{
                borderWidth: 1,
                borderColor: colors.input.border,
                backgroundColor: colors.input.background,
                color: colors.input.text,
                minHeight: 100,
              }}
              placeholder="Any notes about this walk..."
              placeholderTextColor={colors.input.placeholder}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6 p-4 bg-gray-50 dark:bg-[#202225] rounded-lg">
            <Text className="text-gray-700 dark:text-[#b9bbbe] font-medium mb-2">Location</Text>
            {locationLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={colors.accent} />
                <Text className="text-gray-500 dark:text-[#72767d] ml-2">Getting location...</Text>
              </View>
            ) : location ? (
              <Text className="text-gray-600 dark:text-[#b9bbbe]">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </Text>
            ) : (
              <Text className="text-gray-500 dark:text-[#72767d]">
                Location not available. Check permissions.
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleCreateWalk}
            disabled={loading}
            className={`rounded-lg py-4 ${
              loading ? "bg-gray-800 dark:bg-[#4752c4]" : "bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Start Walk
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
