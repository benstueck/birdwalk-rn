import React, { useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "../contexts/ThemeContext";
import { SortOption, LiferSortOption } from "../types/sort";

interface SortBottomSheetProps {
  visible: boolean;
  sortBy: SortOption | LiferSortOption;
  onClose: () => void;
  onSortChange: (sort: any) => void;
  sortOptions?: Record<string, Array<{ value: any; label: string }>>;
}

export function SortBottomSheet({
  visible,
  sortBy,
  onClose,
  onSortChange,
  sortOptions: customSortOptions,
}: SortBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { colors } = useTheme();

  // Use default sortOptions if none provided (for backward compatibility)
  const sortOptionsToUse = customSortOptions || require("../types/sort").sortOptions;

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

  const handleOptionPress = (option: any) => {
    onSortChange(option);
    onClose();
  };

  const renderOption = (option: { value: any; label: string }) => {
    const isSelected = sortBy === option.value;

    return (
      <Pressable
        key={option.value}
        onPress={() => handleOptionPress(option.value)}
        className={`px-4 py-3 rounded-lg mb-2 ${
          isSelected ? "bg-gray-900 dark:bg-[#5865f2]" : "bg-gray-100 dark:bg-[#2f3136] active:bg-gray-200 dark:active:bg-[#202225]"
        }`}
      >
        <Text
          className={`text-base ${
            isSelected ? "text-white font-medium" : "text-gray-900 dark:text-[#dcddde]"
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
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.text.tertiary }}
    >
      <BottomSheetView className="px-6 pb-10">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde]">Sort by</Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 dark:text-[#72767d] text-2xl">×</Text>
          </Pressable>
        </View>

        {/* Dynamic Groups */}
        {Object.entries(sortOptionsToUse).map(([key, options], index) => {
          const groupLabels: Record<string, string> = {
            date: "Date",
            count: "Bird Count",
            recent: "Recent Sighting",
            name: "Species Name",
          };

          return (
            <View key={key}>
              {index > 0 && <View className="mt-4" />}
              <Text className="text-sm font-medium text-gray-500 dark:text-[#72767d] mb-2 uppercase tracking-wide">
                {groupLabels[key] || key}
              </Text>
              {options.map(renderOption)}
            </View>
          );
        })}
      </BottomSheetView>
    </BottomSheet>
  );
}
