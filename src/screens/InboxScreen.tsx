import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getAvatarEmoji } from "../utils/avatars";
import {
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
} from "../services/invitationService";
import type { InvitationListItem } from "../types/collaborative";

function daysUntil(isoDate: string): number {
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function InboxScreen() {
  const { colors } = useTheme();
  const [invitations, setInvitations] = useState<InvitationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to load invitations.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAccept = async (item: InvitationListItem) => {
    setActioning(item.id);
    try {
      await acceptInvitation(item.id);
      setInvitations((prev) => prev.filter((i) => i.id !== item.id));
      Alert.alert("Joined!", `You've joined "${item.walk_name}".`);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not accept invitation.");
    } finally {
      setActioning(null);
    }
  };

  const handleDecline = (item: InvitationListItem) => {
    Alert.alert(
      "Decline Invitation",
      `Decline the invitation to "${item.walk_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setActioning(item.id);
            try {
              await declineInvitation(item.id);
              setInvitations((prev) => prev.filter((i) => i.id !== item.id));
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Could not decline invitation.");
            } finally {
              setActioning(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#36393f]">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
      data={invitations}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      contentContainerStyle={invitations.length === 0 ? { flex: 1 } : { padding: 16 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="mail-open-outline" size={56} color="#72767d" />
          <Text className="text-lg font-semibold text-gray-700 dark:text-[#dcddde] mt-4 text-center">
            No pending invitations
          </Text>
          <Text className="text-sm text-gray-500 dark:text-[#72767d] mt-2 text-center">
            When someone invites you to a walk, it'll show up here.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const busy = actioning === item.id;
        const days = daysUntil(item.expires_at);
        return (
          <View className="bg-white dark:bg-[#2f3136] rounded-xl p-4">
            {/* Inviter row */}
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
                <Text style={{ fontSize: 20 }}>{getAvatarEmoji(item.inviter_avatar_id)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-[#dcddde]">
                  {item.inviter_display_name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-[#72767d]">
                  @{item.inviter_username}
                </Text>
              </View>
            </View>

            {/* Walk info */}
            <Text className="text-base font-bold text-gray-900 dark:text-[#dcddde] mb-1">
              {item.walk_name}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-[#72767d] mb-1">
              {new Date(item.walk_date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {/* Optional message */}
            {item.message ? (
              <Text className="text-sm text-gray-600 dark:text-[#b9bbbe] italic mt-1 mb-2">
                "{item.message}"
              </Text>
            ) : null}

            {/* Expiry */}
            <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-3">
              {days === 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`}
            </Text>

            {/* Actions */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => handleDecline(item)}
                disabled={busy}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-[#4f545c] items-center active:bg-gray-50 dark:active:bg-[#202225]"
              >
                <Text className="text-sm font-medium text-gray-600 dark:text-[#b9bbbe]">
                  Decline
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleAccept(item)}
                disabled={busy}
                className="flex-1 py-2.5 rounded-lg bg-green-600 dark:bg-green-700 items-center active:bg-green-700 dark:active:bg-green-800"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-medium text-white">Accept</Text>
                )}
              </Pressable>
            </View>
          </View>
        );
      }}
    />
  );
}
