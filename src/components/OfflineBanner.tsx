import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useOffline } from "../contexts/OfflineContext";

export function OfflineBanner() {
  const { isOfflineMode } = useOffline();
  const { top } = useSafeAreaInsets();

  if (!isOfflineMode) return null;

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.banner, { height: top }]} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "#f59e0b",
  },
});
