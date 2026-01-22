import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WalksListScreen } from "../screens/WalksListScreen";
import { WalkDetailScreen } from "../screens/WalkDetailScreen";
import { NewWalkScreen } from "../screens/NewWalkScreen";
import { NewSightingScreen } from "../screens/NewSightingScreen";
import type { WalksStackParamList } from "./types";

const Stack = createNativeStackNavigator<WalksStackParamList>();

export function WalksStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#16a34a",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="WalksList"
        component={WalksListScreen}
        options={{ title: "Bird Walks" }}
      />
      <Stack.Screen
        name="WalkDetail"
        component={WalkDetailScreen}
        options={{ title: "Walk" }}
      />
      <Stack.Screen
        name="NewWalk"
        component={NewWalkScreen}
        options={{ title: "New Walk" }}
      />
      <Stack.Screen
        name="NewSighting"
        component={NewSightingScreen}
        options={{ title: "Add Sighting" }}
      />
    </Stack.Navigator>
  );
}
