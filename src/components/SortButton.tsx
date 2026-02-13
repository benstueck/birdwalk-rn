import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { DEFAULT_SORT, SortOption, LiferSortOption } from "../types/sort";

interface SortButtonProps {
  sortBy: SortOption | LiferSortOption;
  onPress: () => void;
  defaultSort?: SortOption | LiferSortOption;
}

export function SortButton({ sortBy, onPress, defaultSort }: SortButtonProps) {
  const { colors } = useTheme();
  const isNonDefault = sortBy !== (defaultSort || DEFAULT_SORT);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="p-2"
    >
      <View className="relative">
        <Ionicons name="swap-vertical" size={24} color={colors.text.secondary} />
        {isNonDefault && (
          <View
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors.accent }}
          />
        )}
      </View>
    </Pressable>
  );
}
