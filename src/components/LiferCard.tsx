import React from "react";
import { View, Text } from "react-native";
import type { Lifer } from "../types/database";

interface LiferCardProps {
  lifer: Lifer;
}

export function LiferCard({ lifer }: LiferCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const firstSighting = lifer.sightings[lifer.sightings.length - 1];

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {lifer.species_name}
          </Text>
          {lifer.scientific_name && (
            <Text className="text-gray-500 italic text-sm">
              {lifer.scientific_name}
            </Text>
          )}
        </View>
        <View className="bg-green-100 px-2 py-1 rounded">
          <Text className="text-green-700 font-medium text-sm">
            {lifer.total_sightings}×
          </Text>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-500 text-sm">
          First seen: {formatDate(firstSighting.walk_date)}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {firstSighting.walk_name}
        </Text>
      </View>
    </View>
  );
}
