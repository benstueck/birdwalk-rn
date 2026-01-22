import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Walk, WalkInsert } from "../types/database";

interface NewWalkModalProps {
  visible: boolean;
  onClose: () => void;
  onWalkCreated: (walkId: string) => void;
}

export function NewWalkModal({
  visible,
  onClose,
  onWalkCreated,
}: NewWalkModalProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { user } = useAuth();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  useEffect(() => {
    if (visible) {
      setName("");
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

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

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
    const startTime = now.toTimeString().split(" ")[0];

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
      setLoading(false);
    } else if (data) {
      const walk = data as Walk;
      onClose();
      onWalkCreated(walk.id);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="px-6 pt-2 pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-semibold text-gray-900">
            Start a Bird Walk
          </Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 text-2xl">×</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-medium">Walk Name *</Text>
          <BottomSheetTextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="e.g., Morning walk at the park"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-2 font-medium">Notes</Text>
          <BottomSheetTextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Any notes about this walk (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
          />
        </View>

        <Pressable
          onPress={handleCreateWalk}
          disabled={loading}
          className={`rounded-lg py-4 ${
            loading ? "bg-gray-800" : "bg-gray-900 active:bg-gray-800"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              Start
            </Text>
          )}
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
