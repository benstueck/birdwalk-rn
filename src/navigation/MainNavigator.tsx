import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme as useNavigationTheme } from "@react-navigation/native";
import { View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { WalksStackNavigator } from "./WalksStackNavigator";
import { LifersScreen } from "../screens/LifersScreen";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { useInvitationCount } from "../contexts/InvitationCountContext";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  const { colors } = useNavigationTheme();
  const { count: invitationCount } = useInvitationCount();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Walks"
        component={WalksStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="footsteps" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Lifers"
        component={LifersScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bird" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: "relative" }}>
              <Ionicons name="person" size={size} color={color} />
              {invitationCount > 0 && (
                <View style={{
                  position: "absolute",
                  top: -1,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#5865f2",
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
