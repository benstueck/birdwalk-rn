import React from "react";
import { View, Text, Pressable } from "react-native";
import { BirdImage } from "./BirdImage";
import type { Lifer } from "../types/database";

interface LiferCardProps {
  lifer: Lifer;
  onPress?: () => void;
}

export function LiferCard({ lifer, onPress }: LiferCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50"
    >
      <View className="flex-row items-center">
        <BirdImage
          speciesName={lifer.species_name}
          scientificName={lifer.scientific_name}
          size="md"
        />
        <Text className="font-medium text-gray-900 flex-1 ml-4">
          {lifer.species_name}
        </Text>
        <Text className="text-sm text-gray-400">
          {lifer.total_sightings}{" "}
          {lifer.total_sightings === 1 ? "sighting" : "sightings"}
        </Text>
      </View>
    </Pressable>
  );
}
