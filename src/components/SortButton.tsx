import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_SORT, SortOption } from "../types/sort";

interface SortButtonProps {
  sortBy: SortOption;
  onPress: () => void;
}

export function SortButton({ sortBy, onPress }: SortButtonProps) {
  const isNonDefault = sortBy !== DEFAULT_SORT;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="p-2"
    >
      <View className="relative">
        <Ionicons name="swap-vertical" size={24} color="#6b7280" />
        {isNonDefault && (
          <View
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: "#0088CA" }}
          />
        )}
      </View>
    </Pressable>
  );
}
