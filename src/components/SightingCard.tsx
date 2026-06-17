import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { BirdImage } from "./BirdImage";
import type { Sighting } from "../types/database";

interface SightingCardProps {
  sighting: Sighting;
  creatorName?: string;
  showCreator?: boolean;
  onPress?: () => void;
}

export function SightingCard({ sighting, creatorName, showCreator, onPress }: SightingCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-[#2f3136] rounded-xl border border-gray-200 dark:border-[#202225] p-4 mx-4 active:bg-gray-50 dark:active:bg-[#202225]"
    >
      <View className="flex-row items-center">
        <BirdImage
          speciesName={sighting.species_name}
          scientificName={sighting.scientific_name}
          size="md"
        />
        <View className="flex-1 ml-4">
          <Text className="font-medium text-gray-900 dark:text-[#dcddde]">
            {sighting.species_name}
          </Text>
          {showCreator && creatorName && (
            <Text className="text-xs text-gray-400 dark:text-[#72767d] mt-0.5">
              Added by {creatorName}
            </Text>
          )}
        </View>
        <Ionicons
          name={sighting.type === "seen" ? "eye-outline" : "ear-outline"}
          size={20}
          color={colors.text.tertiary}
        />
      </View>
    </Pressable>
  );
}
