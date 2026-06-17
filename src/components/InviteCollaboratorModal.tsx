import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getAvatarEmoji } from "../utils/avatars";
import { searchUsers } from "../services/profileService";
import {
  sendWalkInvitation,
  cancelInvitation,
  getSentInvitationsForWalk,
  SentInvitation,
} from "../services/invitationService";
import type { ProfileWithStats } from "../types/collaborative";

interface Props {
  visible: boolean;
  walkId: string;
  walkName: string;
  topInset?: number;
  onClose: () => void;
}

export function InviteCollaboratorModal({ visible, walkId, walkName, topInset, onClose }: Props) {
  const { colors } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const visibleRef = useRef(visible);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileWithStats[]>([]);
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
  const [inviting, setInviting] = useState<string | null>(null);
  const [uninviting, setUninviting] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { visibleRef.current = visible; }, [visible]);

  useEffect(() => {
    if (visible) {
      setQuery("");
      setResults([]);
      loadSentInvitations();
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const loadSentInvitations = async () => {
    try {
      const data = await getSentInvitationsForWalk(walkId);
      setSentInvitations(data);
    } catch {}
  };

  const sentInviteeIds = new Set(sentInvitations.map((i) => i.invitee_id));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(query.trim());
        setResults(data);
      } catch {}
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleInvite = async (user: ProfileWithStats) => {
    setInviting(user.id);
    try {
      await sendWalkInvitation(walkId, user.id);
      await loadSentInvitations();
      setQuery("");
      setResults([]);
      Keyboard.dismiss();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not send invitation.");
    } finally {
      setInviting(null);
    }
  };

  const handleUninvite = (inv: SentInvitation) => {
    Alert.alert(
      "Cancel Invitation",
      `Cancel invitation for ${inv.invitee_display_name}?`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel Invite",
          style: "destructive",
          onPress: async () => {
            setUninviting(inv.id);
            try {
              await cancelInvitation(inv.id);
              setSentInvitations((prev) => prev.filter((i) => i.id !== inv.id));
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Could not cancel invitation.");
            } finally {
              setUninviting(null);
            }
          },
        },
      ]
    );
  };

  const renderBackdrop = useCallback(
    (props: any) => {
      if (!visible) return null;
      return (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} pressBehavior="close" />
      );
    },
    [visible]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && visibleRef.current) onClose();
    },
    [onClose]
  );

  const filteredResults = results.filter((u) => !sentInviteeIds.has(u.id));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      topInset={topInset}
      snapPoints={["92%"]}
      enablePanDownToClose={false}
      enableHandlePanningGesture={false}
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.text.tertiary }}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xl font-semibold text-gray-900 dark:text-[#dcddde]">Invite to Walk</Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Text className="text-gray-400 dark:text-[#72767d] text-2xl">×</Text>
          </Pressable>
        </View>
        <Text className="text-sm text-gray-500 dark:text-[#72767d] mb-4">{walkName}</Text>

        {/* Search input */}
        <View className="flex-row items-center mb-4" style={{
          borderWidth: 1,
          borderColor: colors.input.border,
          borderRadius: 8,
          backgroundColor: colors.input.background,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}>
          <Ionicons name="search" size={16} color={colors.text.tertiary} style={{ marginRight: 8 }} />
          <BottomSheetTextInput
            style={{ flex: 1, fontSize: 16, color: colors.input.text }}
            placeholder="Search by username or name…"
            placeholderTextColor={colors.input.placeholder}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setResults([]); }} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>

        {/* Search results */}
        {filteredResults.length === 0 ? (
          <View style={{ height: 80 }} className="items-center justify-center">
            <Text className="text-gray-500 dark:text-[#72767d] text-center">
              {query.trim().length < 2 ? "Search for a birder to invite" : "No users found"}
            </Text>
          </View>
        ) : (
          <View className="mb-2 border border-gray-200 dark:border-[#202225] rounded-lg overflow-hidden">
            {filteredResults.map((item, idx) => {
              const busy = inviting === item.id;
              return (
                <View
                  key={item.id}
                  className={`flex-row items-center px-3 py-3 ${idx < filteredResults.length - 1 ? "border-b border-gray-100 dark:border-[#202225]" : ""}`}
                >
                  <View className="w-9 h-9 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
                    <Text style={{ fontSize: 18 }}>{getAvatarEmoji(item.avatar_id)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900 dark:text-[#dcddde]">{item.display_name}</Text>
                    <Text className="text-sm text-gray-500 dark:text-[#72767d]">@{item.username}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleInvite(item)}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-sm font-medium text-white">Invite</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Pending invitations */}
        {sentInvitations.length > 0 && (
          <View className="mt-4">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Pending Invitations</Text>
            <View className="border border-gray-200 dark:border-[#202225] rounded-lg overflow-hidden">
              {sentInvitations.map((inv, idx) => {
                const busy = uninviting === inv.id;
                return (
                  <View
                    key={inv.id}
                    className={`flex-row items-center px-3 py-3 ${idx < sentInvitations.length - 1 ? "border-b border-gray-100 dark:border-[#202225]" : ""}`}
                  >
                    <View className="w-9 h-9 bg-gray-100 dark:bg-[#202225] rounded-full items-center justify-center mr-3">
                      <Text style={{ fontSize: 18 }}>{getAvatarEmoji(inv.invitee_avatar_id)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-[#dcddde]">{inv.invitee_display_name}</Text>
                      <Text className="text-sm text-gray-500 dark:text-[#72767d]">@{inv.invitee_username}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleUninvite(inv)}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-[#4f545c]"
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color={colors.text.secondary} />
                      ) : (
                        <Text className="text-sm font-medium text-gray-600 dark:text-[#b9bbbe]">Uninvite</Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
