import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme as useNavigationTheme } from "@react-navigation/native";
import { ProfileScreen } from "../screens/ProfileScreen";
import { InboxScreen } from "../screens/InboxScreen";
import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  const { colors } = useNavigationTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Inbox"
        component={InboxScreen}
        options={{ headerShown: true, title: "Inbox" }}
      />
    </Stack.Navigator>
  );
}
