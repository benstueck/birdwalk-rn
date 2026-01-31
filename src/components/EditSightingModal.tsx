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
import { supabase } from "../lib/supabase";
import { searchSpeciesCached, EBirdSpecies } from "../lib/ebird";
import type { Sighting } from "../types/database";

interface EditSightingModalProps {
  visible: boolean;
  sighting: Sighting | null;
  onClose: () => void;
  onSightingUpdated: (sighting: Sighting) => void;
  topInset?: number;
}

export function EditSightingModal({
  visible,
  sighting,
  onClose,
  onSightingUpdated,
  topInset,
}: EditSightingModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<EBirdSpecies | null>(null);
  const [searchResults, setSearchResults] = useState<EBirdSpecies[]>([]);
  const [searching, setSearching] = useState(false);
  const [type, setType] = useState<"seen" | "heard">("seen");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const visibleRef = useRef(visible);

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
    if (visible && sighting) {
      // Pre-populate form with existing sighting data
      setSelectedSpecies({
        speciesCode: sighting.species_code,
        comName: sighting.species_name,
        sciName: sighting.scientific_name || "",
      });
      setSearchQuery(sighting.species_name);
      setSearchResults([]);
      setType(sighting.type);
      setNotes(sighting.notes || "");
      setLoading(false);
      bottomSheetRef.current?.expand();
    } else {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    }
  }, [visible, sighting]);

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

  const handleUpdateSighting = async () => {
    if (!selectedSpecies) {
      Alert.alert("Error", "Please select a species");
      return;
    }

    if (!sighting) return;

    setLoading(true);

    const { data, error } = await (supabase.from("sightings") as any)
      .update({
        species_code: selectedSpecies.speciesCode,
        species_name: selectedSpecies.comName,
        scientific_name: selectedSpecies.sciName || null,
        type,
        notes: notes.trim() || null,
      })
      .eq("id", sighting.id)
      .select()
      .single();

    if (error) {
      Alert.alert("Error", "Failed to update sighting");
      console.error("Error updating sighting:", error);
      setLoading(false);
    } else if (data) {
      onClose();
      onSightingUpdated(data as Sighting);
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
            Edit Sighting
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
          onPress={handleUpdateSighting}
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
              Save
            </Text>
          )}
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
