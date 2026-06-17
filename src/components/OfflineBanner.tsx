import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOffline } from "../contexts/OfflineContext";

export function OfflineBanner() {
  const { isOfflineMode, pendingSyncCount } = useOffline();

  if (!isOfflineMode) return null;

  return (
    <View className="bg-amber-500 dark:bg-amber-600 px-4 py-2 flex-row items-center justify-center gap-2">
      <Ionicons name="cloud-offline-outline" size={14} color="white" />
      <Text className="text-white text-xs font-medium">
        {pendingSyncCount > 0
          ? `Offline mode · ${pendingSyncCount} change${pendingSyncCount !== 1 ? "s" : ""} pending sync`
          : "Offline mode"}
      </Text>
    </View>
  );
}
