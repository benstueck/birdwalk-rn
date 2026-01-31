import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { searchSpeciesCached, EBirdSpecies } from "../lib/ebird";
import type { SightingInsert, Sighting } from "../types/database";

interface NewSightingModalProps {
  visible: boolean;
  walkId: string;
  onClose: () => void;
  onSightingCreated: (sighting: Sighting) => void;
  topInset?: number;
}

export function NewSightingModal({
  visible,
  walkId,
  onClose,
  onSightingCreated,
  topInset,
}: NewSightingModalProps) {
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const visibleRef = useRef(visible);

  // Keep ref in sync with prop
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => {
      if (!visible) return null;
      return (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      );
    },
    [visible]
  );

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setSelectedSpecies(null);
      setSearchResults([]);
      setType("seen");
      setNotes("");
      setLoading(false);
      bottomSheetRef.current?.expand();

      // Get location
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
    } else {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    }
  }, [visible]);

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

  const handleSheetChanges = useCallback(
    (index: number) => {
      // Only close if user dismissed AND we're supposed to be visible
      // This prevents race conditions when opening a new modal
      if (index === -1 && visibleRef.current) {
        onClose();
      }
    },
    [onClose]
  );

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

    const { data, error } = await supabase
      .from("sightings")
      .insert(sightingData as any)
      .select()
      .single();

    if (error) {
      Alert.alert("Error", "Failed to add sighting");
      console.error("Error creating sighting:", error);
      setLoading(false);
    } else if (data) {
      onClose();
      onSightingCreated(data as Sighting);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      topInset={topInset}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold text-gray-900">
            Add Sighting
          </Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 text-2xl">×</Text>
          </Pressable>
        </View>

        {/* Species Search */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Species *</Text>
          <View className="relative">
            <BottomSheetTextInput
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: "#111827",
                paddingRight: selectedSpecies ? 40 : 16,
              }}
              placeholder="Search for a bird species..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (selectedSpecies) {
                  setSelectedSpecies(null);
                }
              }}
              autoCorrect={false}
              autoCapitalize="none"
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
              <ActivityIndicator size="small" color="#111827" />
              <Text className="text-gray-500 ml-2">Searching...</Text>
            </View>
          )}

          {searchResults.length > 0 && (
            <View className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
              {searchResults.slice(0, 5).map((item) => (
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

        </View>

        {/* Sighting Type */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Sighting Type</Text>
          <View className="flex-row">
            <Pressable
              onPress={() => setType("seen")}
              className={`flex-1 py-3 rounded-l-lg border ${
                type === "seen"
                  ? "bg-gray-900 border-gray-900"
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
                  ? "bg-gray-900 border-gray-900"
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

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Notes</Text>
          <BottomSheetTextInput
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: "#111827",
              minHeight: 80,
              textAlignVertical: "top",
            }}
            placeholder="Any notes about this sighting..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleCreateSighting}
          disabled={loading || !selectedSpecies}
          className={`rounded-lg py-4 ${
            loading || !selectedSpecies
              ? "bg-gray-300"
              : "bg-gray-900 active:bg-gray-800"
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
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
