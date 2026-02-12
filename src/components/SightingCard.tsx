import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { BirdImage } from "./BirdImage";
import type { Sighting } from "../types/database";

interface SightingCardProps {
  sighting: Sighting;
  onPress?: () => void;
}

export function SightingCard({ sighting, onPress }: SightingCardProps) {
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
        <Text className="font-medium text-gray-900 dark:text-[#dcddde] flex-1 ml-4">
          {sighting.species_name}
        </Text>
        <Ionicons
          name={sighting.type === "seen" ? "eye-outline" : "ear-outline"}
          size={20}
          color={colors.text.tertiary}
        />
      </View>
    </Pressable>
  );
}
