import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Walk } from "../types/database";

interface WalkCardProps {
  walk: Walk;
  sightingsCount: number;
  onPress: () => void;
}

export function WalkCard({ walk, sightingsCount, onPress }: WalkCardProps) {
  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} @ ${formattedTime}`;
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg p-4 shadow-sm active:bg-gray-50"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {walk.name}
          </Text>
          <Text className="text-gray-500 mt-1">
            {formatDate(walk.date, walk.start_time)}
          </Text>
        </View>
        <Text className="text-gray-600 font-medium">
          {sightingsCount} {sightingsCount === 1 ? "Bird" : "Birds"}
        </Text>
      </View>
    </Pressable>
  );
}
