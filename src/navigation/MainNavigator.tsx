import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { WalksStackNavigator } from "./WalksStackNavigator";
import { LifersScreen } from "../screens/LifersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e7eb",
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#16a34a",
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
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🚶</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Lifers"
        component={LifersScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🐦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
