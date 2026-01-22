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
import { searchSpeciesCached, EBirdSpecies } from "../lib/ebird";
import type { WalksStackScreenProps } from "../navigation/types";
import type { SightingInsert } from "../types/database";

export function NewSightingScreen({
  route,
  navigation,
}: WalksStackScreenProps<"NewSighting">) {
  const { walkId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<EBirdSpecies | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<EBirdSpecies[]>([]);
  const [searching, setSearching] = useState(false);
  const [type, setType] = useState<"seen" | "heard">("seen");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        } catch (error) {
          console.error("Error getting location:", error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length >= 2 && !selectedSpecies) {
        setSearching(true);
        const results = await searchSpeciesCached(searchQuery);
        setSearchResults(results);
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, selectedSpecies]);

  const handleSelectSpecies = (species: EBirdSpecies) => {
    setSelectedSpecies(species);
    setSearchQuery(species.comName);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedSpecies(null);
    setSearchQuery("");
  };

  const handleCreateSighting = async () => {
    if (!selectedSpecies) {
      Alert.alert("Error", "Please select a species");
      return;
    }

    setLoading(true);

    const sightingData: SightingInsert = {
      walk_id: walkId,
      species_code: selectedSpecies.speciesCode,
      species_name: selectedSpecies.comName,
      scientific_name: selectedSpecies.sciName,
      type,
      notes: notes.trim() || null,
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("sightings")
      .insert(sightingData as any);

    if (error) {
      Alert.alert("Error", "Failed to add sighting");
      console.error("Error creating sighting:", error);
    } else {
      navigation.goBack();
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-6">
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Species *</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Search for a bird species..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (selectedSpecies) {
                    setSelectedSpecies(null);
                  }
                }}
              />
              {selectedSpecies && (
                <Pressable
                  onPress={handleClearSelection}
                  className="absolute right-3 top-3"
                >
                  <Text className="text-gray-400 text-lg">×</Text>
                </Pressable>
              )}
            </View>

            {searching && (
              <View className="mt-2 flex-row items-center">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="text-gray-500 ml-2">Searching...</Text>
              </View>
            )}

            {searchResults.length > 0 && (
              <View className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-hidden">
                {searchResults.map((item) => (
                  <Pressable
                    key={item.speciesCode}
                    onPress={() => handleSelectSpecies(item)}
                    className="p-3 border-b border-gray-100 active:bg-gray-50"
                  >
                    <Text className="font-medium text-gray-800">
                      {item.comName}
                    </Text>
                    <Text className="text-gray-500 text-sm italic">
                      {item.sciName}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {selectedSpecies && (
              <View className="mt-2 bg-green-50 p-3 rounded-lg">
                <Text className="text-green-800 font-medium">
                  {selectedSpecies.comName}
                </Text>
                <Text className="text-green-600 text-sm italic">
                  {selectedSpecies.sciName}
                </Text>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">
              Sighting Type
            </Text>
            <View className="flex-row">
              <Pressable
                onPress={() => setType("seen")}
                className={`flex-1 py-3 rounded-l-lg border ${
                  type === "seen"
                    ? "bg-green-600 border-green-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    type === "seen" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Seen
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType("heard")}
                className={`flex-1 py-3 rounded-r-lg border-t border-b border-r ${
                  type === "heard"
                    ? "bg-green-600 border-green-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    type === "heard" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Heard
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Notes</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholder="Any notes about this sighting..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />
          </View>

          <Pressable
            onPress={handleCreateSighting}
            disabled={loading || !selectedSpecies}
            className={`rounded-lg py-4 ${
              loading || !selectedSpecies
                ? "bg-gray-300"
                : "bg-green-600 active:bg-green-700"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Add Sighting
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
