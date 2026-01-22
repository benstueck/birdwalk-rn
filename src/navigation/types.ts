import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Walks Stack (nested in Main Tab)
export type WalksStackParamList = {
  WalksList: undefined;
  WalkDetail: { walkId: string };
  NewWalk: undefined;
  NewSighting: { walkId: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Walks: undefined;
  Lifers: undefined;
  Profile: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Screen props types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type WalksStackScreenProps<T extends keyof WalksStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<WalksStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
