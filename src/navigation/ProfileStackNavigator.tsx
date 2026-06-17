import React, { useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme as useNavigationTheme, useFocusEffect } from "@react-navigation/native";
import { useInvitationCount } from "../contexts/InvitationCountContext";
import { ProfileScreen } from "../screens/ProfileScreen";
import { InboxScreen } from "../screens/InboxScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { AccountSettingsScreen } from "../screens/AccountSettingsScreen";
import type { ProfileStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  const { colors } = useNavigationTheme();
  const { refresh } = useInvitationCount();

  useFocusEffect(useCallback(() => { refresh(); }, []));

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
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: true, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ headerShown: true, title: "Account Settings" }}
      />
    </Stack.Navigator>
  );
}
