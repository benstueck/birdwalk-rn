import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useOffline } from "../contexts/OfflineContext";
import { LightNavigationTheme, DarkNavigationTheme } from "../theme/navigation";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { ProfileSetupScreen } from "../screens/ProfileSetupScreen";
import { OfflineBanner } from "../components/OfflineBanner";

export function RootNavigator() {
  const { user, profile, loading, profileLoading } = useAuth();
  const { effectiveTheme, colors } = useTheme();
  const { isOfflineMode, enableOfflineMode } = useOffline();
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false);
  const hasShownPrompt = useRef(false);

  const navigationTheme = useMemo(
    () => effectiveTheme === "dark" ? DarkNavigationTheme : LightNavigationTheme,
    [effectiveTheme]
  );

  // Show one-time prompt if app opens with no connection and offline mode is off
  useEffect(() => {
    if (hasShownPrompt.current || isOfflineMode || !user) return;
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected && !hasShownPrompt.current) {
        hasShownPrompt.current = true;
        setShowOfflinePrompt(true);
        unsubscribe();
      }
    });
    return unsubscribe;
  }, [isOfflineMode, user]);

  const handleEnableOffline = async () => {
    setShowOfflinePrompt(false);
    await enableOfflineMode();
  };

  if (loading || profileLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!user ? (
        <AuthNavigator />
      ) : !profile ? (
        <ProfileSetupScreen />
      ) : (
        <View className="flex-1">
          <OfflineBanner />
          <MainNavigator />
        </View>
      )}

      {/* No-connectivity prompt */}
      <Modal
        visible={showOfflinePrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOfflinePrompt(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-8">
          <View className="bg-white dark:bg-[#2f3136] rounded-2xl p-6 w-full">
            <Text className="text-lg font-bold text-gray-900 dark:text-[#dcddde] mb-2">
              No Internet Connection
            </Text>
            <Text className="text-sm text-gray-600 dark:text-[#b9bbbe] mb-6">
              It looks like you're offline. Enable offline mode to continue logging walks and sightings without a connection.
            </Text>
            <Pressable
              onPress={handleEnableOffline}
              className="bg-amber-500 rounded-xl py-3 mb-3 active:bg-amber-600"
            >
              <Text className="text-white text-center font-semibold">
                Enable Offline Mode
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowOfflinePrompt(false)}
              className="py-3 active:opacity-70"
            >
              <Text className="text-gray-500 dark:text-[#72767d] text-center">
                Continue Without Offline Mode
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}
