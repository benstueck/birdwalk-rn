import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { SortOption, sortOptions } from "../types/sort";

interface SortBottomSheetProps {
  visible: boolean;
  sortBy: SortOption;
  onClose: () => void;
  onSortChange: (sort: SortOption) => void;
}

export function SortBottomSheet({
  visible,
  sortBy,
  onClose,
  onSortChange,
}: SortBottomSheetProps) {
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
      bottomSheetRef.current?.expand();
    } else {
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

  const handleOptionPress = (option: SortOption) => {
    onSortChange(option);
    onClose();
  };

  const renderOption = (option: { value: SortOption; label: string }) => {
    const isSelected = sortBy === option.value;

    return (
      <Pressable
        key={option.value}
        onPress={() => handleOptionPress(option.value)}
        className={`px-4 py-3 rounded-lg mb-2 ${
          isSelected ? "bg-gray-900" : "bg-gray-100 active:bg-gray-200"
        }`}
      >
        <Text
          className={`text-base ${
            isSelected ? "text-white font-medium" : "text-gray-900"
          }`}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
    >
      <BottomSheetView className="px-6 pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-semibold text-gray-900">Sort by</Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 text-2xl">×</Text>
          </Pressable>
        </View>

        {/* Date Group */}
        <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Date
        </Text>
        {sortOptions.date.map(renderOption)}

        {/* Count Group */}
        <Text className="text-sm font-medium text-gray-500 mb-2 mt-4 uppercase tracking-wide">
          Bird Count
        </Text>
        {sortOptions.count.map(renderOption)}
      </BottomSheetView>
    </BottomSheet>
  );
}
