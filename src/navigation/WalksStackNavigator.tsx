import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@react-navigation/native";
import { WalksListScreen } from "../screens/WalksListScreen";
import { WalkDetailScreen } from "../screens/WalkDetailScreen";
import { NewWalkScreen } from "../screens/NewWalkScreen";
import { SearchScreen } from "../screens/SearchScreen";
import type { WalksStackParamList } from "./types";

const Stack = createNativeStackNavigator<WalksStackParamList>();

export function WalksStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="WalksList"
        component={WalksListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WalkDetail"
        component={WalkDetailScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="NewWalk"
        component={NewWalkScreen}
        options={{ title: "New Walk" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
