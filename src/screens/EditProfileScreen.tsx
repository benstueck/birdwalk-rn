import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { updateProfile, isUsernameAvailable } from "../services/profileService";
import { useDebounce } from "../hooks/useDebounce";
import { AVATAR_OPTIONS as ALL_AVATAR_OPTIONS } from "../utils/avatars";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const initialAvatarId = profile?.avatar_id ?? 1;
  const [avatarId, setAvatarId] = useState(initialAvatarId);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const sortedAvatars = [
    ...ALL_AVATAR_OPTIONS.filter((a) => a.id === initialAvatarId),
    ...ALL_AVATAR_OPTIONS.filter((a) => a.id !== initialAvatarId),
  ];

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={16} style={{ marginLeft: 3 }}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </Pressable>
      ),
    });
  }, [navigation, colors]);

  useEffect(() => {
    const lower = debouncedUsername.toLowerCase();
    if (lower === profile?.username?.toLowerCase()) {
      setUsernameAvailable(true);
      return;
    }
    if (debouncedUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    if (!USERNAME_REGEX.test(debouncedUsername)) {
      setUsernameAvailable(false);
      return;
    }
    let cancelled = false;
    setCheckingUsername(true);
    isUsernameAvailable(debouncedUsername, user?.id)
      .then((available) => { if (!cancelled) setUsernameAvailable(available); })
      .catch(() => { if (!cancelled) setUsernameAvailable(null); })
      .finally(() => { if (!cancelled) setCheckingUsername(false); });
    return () => { cancelled = true; };
  }, [debouncedUsername]);

  const getUsernameFeedback = () => {
    if (!usernameTouched) return null;
    if (username.length === 0) return null;
    if (username.length < 3) return { ok: false, text: "At least 3 characters" };
    if (username.length > 20) return { ok: false, text: "Max 20 characters" };
    if (!USERNAME_REGEX.test(username)) return { ok: false, text: "Letters, numbers, and underscores only" };
    if (checkingUsername || usernameAvailable === null) return null;
    if (usernameAvailable === false) return { ok: false, text: "Username already taken" };
    if (usernameAvailable === true) return { ok: true, text: "Looks good" };
    return null;
  };

  const usernameValid =
    username.length >= 3 &&
    username.length <= 20 &&
    USERNAME_REGEX.test(username) &&
    usernameAvailable === true;

  const canSubmit = usernameValid && !checkingUsername && !saving;

  const feedback = getUsernameFeedback();

  const handleSave = async () => {
    if (!user || !canSubmit) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        username: username.toLowerCase(),
        display_name: username.toLowerCase(),
        bio: bio.trim() || null,
        avatar_id: avatarId,
      });
      await refreshProfile();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.input.text,
    backgroundColor: colors.input.background,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-6 pb-6">
          {/* Avatar selector */}
          <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-3">
            Pick your bird
          </Text>
          <View style={{ height: 64 }} className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {sortedAvatars.map((option) => {
                const selected = avatarId === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setAvatarId(option.id)}
                    className={`items-center justify-center w-16 h-16 rounded-full border-2 ${
                      selected
                        ? "border-blue-500 dark:border-[#5865f2] bg-blue-50 dark:bg-[#3c3f8f]"
                        : "border-gray-200 dark:border-[#202225] bg-white dark:bg-[#2f3136]"
                    }`}
                  >
                    <Text style={{ fontSize: 30 }}>{option.emoji}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Username */}
          <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
            Username
          </Text>
          <View className="mb-1">
            <TextInput
              style={inputStyle}
              value={username}
              onChangeText={(t) => { setUsername(t.trim()); setUsernameTouched(true); setUsernameAvailable(null); }}
              placeholder="e.g. eagleeye42"
              placeholderTextColor={colors.input.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
          <View style={{ height: 20 }} className="justify-center">
            {feedback ? (
              <Text className={`text-sm ${feedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
                {feedback.ok ? "✓ " : "✗ "}{feedback.text}
              </Text>
            ) : null}
          </View>
          <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-5">
            3–20 characters. Letters, numbers, and underscores only.
          </Text>

          {/* Bio */}
          <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
            Bio <Text className="text-gray-400 dark:text-[#72767d]">(optional)</Text>
          </Text>
          <TextInput
            style={[inputStyle, { textAlignVertical: "top", minHeight: 80 }]}
            value={bio}
            onChangeText={setBio}
            placeholder="A few words about you…"
            placeholderTextColor={colors.input.placeholder}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-8 text-right">
            {bio.length}/200
          </Text>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={!canSubmit}
            className={`rounded-xl py-4 items-center ${
              canSubmit
                ? "bg-blue-600 dark:bg-[#5865f2] active:bg-blue-700 dark:active:bg-[#4752c4]"
                : "bg-gray-200 dark:bg-[#4f545c]"
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={`text-base font-semibold ${canSubmit ? "text-white" : "text-gray-400 dark:text-[#72767d]"}`}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
