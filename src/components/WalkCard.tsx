import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Walk } from "../types/database";
import { CollaboratorAvatars } from "./CollaboratorAvatars";

interface Collaborator {
  user_id: string;
  avatar_id: number;
  display_name: string;
}

interface WalkCardProps {
  walk: Walk;
  sightingsCount: number;
  collaborators?: Collaborator[];
  onPress: () => void;
}

export function WalkCard({ walk, sightingsCount, collaborators = [], onPress }: WalkCardProps) {
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
      className="bg-white dark:bg-[#2f3136] rounded-lg p-4 shadow-sm border border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde]">
            {walk.name}
          </Text>
          <Text className="text-gray-500 dark:text-[#72767d] mt-1">
            {formatDate(walk.date, walk.start_time)}
          </Text>
        </View>
        <Text className="text-gray-600 dark:text-[#b9bbbe] font-medium">
          {sightingsCount} {sightingsCount === 1 ? "Bird" : "Birds"}
        </Text>
      </View>
      {collaborators.length > 1 && (
        <View className="flex-row items-center mt-2 gap-2">
          <CollaboratorAvatars collaborators={collaborators} size="sm" />
        </View>
      )}
    </Pressable>
  );
}
