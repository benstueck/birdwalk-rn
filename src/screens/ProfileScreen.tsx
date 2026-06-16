import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getAvatarEmoji } from "../utils/avatars";
import { useInvitationCount } from "../hooks/useInvitationCount";
import type { ProfileStackParamList } from "../navigation/types";

interface Stats {
  totalWalks: number;
  totalSightings: number;
  uniqueSpecies: number;
}

type ThemeMode = 'light' | 'dark' | 'system';

export function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { mode, effectiveTheme, setThemeMode, colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { count: invitationCount } = useInvitationCount();
  const [stats, setStats] = useState<Stats>({
    totalWalks: 0,
    totalSightings: 0,
    uniqueSpecies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = React.useRef(false);

  const fetchStats = async () => {
    if (!user) return;

    const [walksResult, sightingsResult] = await Promise.all([
      supabase
        .from("walk_collaborators")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),
      supabase
        .from("sightings")
        .select(
          `
          id,
          species_code,
          walks!inner (walk_collaborators!inner (user_id))
        `
        )
        .eq("walks.walk_collaborators.user_id", user.id),
    ]);

    const totalWalks = walksResult.count || 0;
    const sightings = (sightingsResult.data || []) as Array<{
      id: string;
      species_code: string;
    }>;
    const totalSightings = sightings.length;
    const uniqueSpecies = new Set(sightings.map((s) => s.species_code)).size;

    setStats({ totalWalks, totalSightings, uniqueSpecies });
  };

  const loadStats = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    await fetchStats();
    setLoading(false);
    hasLoaded.current = true;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats(!hasLoaded.current);
    }, [user])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* Profile Header */}
      <View className="bg-white dark:bg-[#2f3136] p-6 border-b border-gray-200 dark:border-[#202225]">
        <View className="w-20 h-20 bg-gray-100 dark:bg-[#202225] rounded-full justify-center items-center mx-auto mb-4">
          <Text style={{ fontSize: 40 }}>
            {getAvatarEmoji(profile?.avatar_id)}
          </Text>
        </View>
        {profile ? (
          <>
            <Text className="text-xl font-bold text-center text-gray-900 dark:text-[#dcddde]">
              @{profile.username}
            </Text>
            {profile.bio ? (
              <Text className="text-sm text-center text-gray-600 dark:text-[#b9bbbe] mt-2">
                {profile.bio}
              </Text>
            ) : null}
          </>
        ) : (
          <Text className="text-base text-center text-gray-500 dark:text-[#72767d]">
            {user?.email}
          </Text>
        )}

        {/* Inbox button */}
        <Pressable
          onPress={() => navigation.navigate("Inbox")}
          className="flex-row items-center justify-between mt-5 bg-gray-50 dark:bg-[#202225] rounded-xl px-4 py-3 active:bg-gray-100 dark:active:bg-[#18191c]"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="mail-outline" size={20} color={colors.text.primary} />
            <Text className="text-base font-medium text-gray-800 dark:text-[#dcddde]">Inbox</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {invitationCount > 0 && (
              <View className="bg-blue-600 dark:bg-[#5865f2] rounded-full min-w-[22px] h-[22px] items-center justify-center px-1.5">
                <Text className="text-white text-xs font-bold">{invitationCount}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#72767d" />
          </View>
        </Pressable>
      </View>

      {/* Stats Section */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-3">
          Your Stats
        </Text>

        <View className="flex-row">
          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg mr-2">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.totalWalks}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Walks</Text>
          </View>

          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg mx-1">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.totalSightings}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Sightings</Text>
          </View>

          <View className="flex-1 bg-white dark:bg-[#2f3136] p-4 rounded-lg ml-2">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] text-center">
              {stats.uniqueSpecies}
            </Text>
            <Text className="text-gray-500 dark:text-[#72767d] text-center mt-1">Species</Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-3">
          Appearance
        </Text>

        <View className="bg-white dark:bg-[#2f3136] rounded-lg overflow-hidden">
          {/* Light Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('light')}
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="sunny"
                size={20}
                color={effectiveTheme === 'light' && mode === 'light' ? '#111827' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                Light
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Use light appearance
              </Text>
            </View>
            {mode === 'light' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>

          {/* Dark Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('dark')}
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-[#202225] active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="moon"
                size={20}
                color={effectiveTheme === 'dark' && mode === 'dark' ? '#5865f2' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                Dark
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Use dark appearance
              </Text>
            </View>
            {mode === 'dark' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>

          {/* System Mode Option */}
          <Pressable
            onPress={() => handleThemeChange('system')}
            className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-[#202225]"
          >
            <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
              <Ionicons
                name="phone-portrait"
                size={20}
                color={mode === 'system' ? '#5865f2' : '#72767d'}
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-[#dcddde]">
                System
              </Text>
              <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-0.5">
                Match device appearance
              </Text>
            </View>
            {mode === 'system' && (
              <Ionicons name="checkmark-circle" size={24} color="#5865f2" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Sign Out Button */}
      <View className="p-4">
        <Pressable
          onPress={handleSignOut}
          className="bg-white dark:bg-[#2f3136] border border-red-200 dark:border-[#ed4245] rounded-lg py-4 active:bg-red-50 dark:active:bg-[#202225]"
        >
          <Text className="text-red-600 dark:text-[#ed4245] text-center font-semibold">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
