import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Sighting } from "../types/database";

interface SightingCardProps {
  sighting: Sighting;
  onDelete?: () => void;
}

export function SightingCard({ sighting, onDelete }: SightingCardProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View className="bg-white rounded-lg p-4 mx-4 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {sighting.species_name}
          </Text>
          {sighting.scientific_name && (
            <Text className="text-gray-500 italic text-sm">
              {sighting.scientific_name}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          <View
            className={`px-2 py-1 rounded ${
              sighting.type === "seen" ? "bg-blue-100" : "bg-purple-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                sighting.type === "seen" ? "text-blue-700" : "text-purple-700"
              }`}
            >
              {sighting.type === "seen" ? "Seen" : "Heard"}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mt-2">
        <Text className="text-gray-400 text-sm">
          {formatTime(sighting.timestamp)}
        </Text>
      </View>

      {sighting.notes && (
        <Text className="text-gray-600 mt-2 text-sm">{sighting.notes}</Text>
      )}

      {onDelete && (
        <Pressable
          onPress={onDelete}
          className="mt-3 py-2 border-t border-gray-100"
        >
          <Text className="text-red-500 text-sm text-center">Delete</Text>
        </Pressable>
      )}
    </View>
  );
}
