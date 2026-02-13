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
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import type { Walk } from "../types/database";

interface EditWalkModalProps {
  visible: boolean;
  walk: Walk | null;
  onClose: () => void;
  onWalkUpdated: (walk: Walk) => void;
  topInset?: number;
}

export function EditWalkModal({
  visible,
  walk,
  onClose,
  onWalkUpdated,
  topInset,
}: EditWalkModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

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
    if (visible && walk) {
      setName(walk.name);
      setNotes(walk.notes || "");
      setLoading(false);
      bottomSheetRef.current?.expand();
    } else {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    }
  }, [visible, walk]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSaveWalk = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name for your walk");
      return;
    }

    if (!walk) {
      return;
    }

    setLoading(true);

    const { data, error } = await (supabase
      .from("walks") as any)
      .update({
        name: name.trim(),
        notes: notes.trim() || null,
      })
      .eq("id", walk.id)
      .select()
      .single();

    if (error) {
      Alert.alert("Error", "Failed to update walk");
      console.error("Error updating walk:", error);
      setLoading(false);
    } else if (data) {
      const updatedWalk = data as Walk;
      onClose();
      onWalkUpdated(updatedWalk);
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
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.text.tertiary }}
    >
      <BottomSheetView className="px-6 pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde]">
            Edit Walk
          </Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 dark:text-[#72767d] text-2xl">×</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Walk Name *</Text>
          <BottomSheetTextInput
            style={{
              borderWidth: 1,
              borderColor: colors.input.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.input.text,
              backgroundColor: colors.input.background,
            }}
            placeholder="e.g., Morning walk at the park"
            placeholderTextColor={colors.input.placeholder}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Notes</Text>
          <BottomSheetTextInput
            style={{
              borderWidth: 1,
              borderColor: colors.input.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.input.text,
              backgroundColor: colors.input.background,
              minHeight: 80,
              textAlignVertical: "top",
            }}
            placeholder="Any notes about this walk (optional)"
            placeholderTextColor={colors.input.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <Pressable
          onPress={handleSaveWalk}
          disabled={loading}
          className={`rounded-lg py-4 ${
            loading ? "bg-gray-800 dark:bg-[#4752c4]" : "bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
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
      </BottomSheetView>
    </BottomSheet>
  );
}
