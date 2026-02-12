import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LightNavigationTheme, DarkNavigationTheme } from "../theme/navigation";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export function RootNavigator() {
  const { user, loading } = useAuth();
  const { effectiveTheme, colors } = useTheme();

  const navigationTheme = useMemo(
    () => effectiveTheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme,
    [effectiveTheme]
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
