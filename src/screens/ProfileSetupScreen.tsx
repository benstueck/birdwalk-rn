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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { createProfile, isUsernameAvailable } from "../services/profileService";
import { useDebounce } from "../hooks/useDebounce";
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from "../utils/avatars";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const { colors } = useTheme();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [saving, setSaving] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
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
    isUsernameAvailable(debouncedUsername)
      .then((available) => { if (!cancelled) setUsernameAvailable(available); })
      .catch(() => { if (!cancelled) setUsernameAvailable(null); })
      .finally(() => { if (!cancelled) setCheckingUsername(false); });
    return () => { cancelled = true; };
  }, [debouncedUsername]);

  const usernameValid =
    username.length >= 3 &&
    username.length <= 20 &&
    USERNAME_REGEX.test(username) &&
    usernameAvailable === true;

  const canSubmit = usernameValid && !checkingUsername && !saving;

  const handleSave = async () => {
    if (!user || !canSubmit) return;
    setSaving(true);
    try {
      await createProfile({
        id: user.id,
        username: username.toLowerCase(),
        display_name: username.toLowerCase(),
        bio: bio.trim() || null,
        avatar_id: avatarId,
      });
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getUsernameFeedback = () => {
    if (username.length === 0) return null;
    if (username.length < 3) return { ok: false, text: "At least 3 characters" };
    if (username.length > 20) return { ok: false, text: "Max 20 characters" };
    if (!USERNAME_REGEX.test(username)) return { ok: false, text: "Letters, numbers, and underscores only" };
    if (checkingUsername) return null;
    if (usernameAvailable === false) return { ok: false, text: "Username already taken" };
    if (usernameAvailable === true) return { ok: true, text: "Username available" };
    return null;
  };

  const feedback = getUsernameFeedback();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#36393f]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            <Text className="text-3xl font-bold text-gray-900 dark:text-[#dcddde] mb-1">
              Create your profile
            </Text>
            <Text className="text-base text-gray-500 dark:text-[#b9bbbe] mb-8">
              Choose a username so others can find you.
            </Text>

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
                {AVATAR_OPTIONS.map((option) => {
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
            <View className="relative mb-1">
              <TextInput
                value={username}
                onChangeText={(t) => setUsername(t.trim())}
                placeholder="e.g. eagleeye42"
                placeholderTextColor={colors.input?.placeholder ?? "#6b7280"}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde] pr-10"
              />
              {checkingUsername && (
                <View className="absolute right-3 top-3.5">
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              )}
            </View>
            {feedback && (
              <Text className={`text-sm mb-1 ${feedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
                {feedback.ok ? "✓ " : "✗ "}{feedback.text}
              </Text>
            )}
            <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-5">
              3–20 characters. Letters, numbers, and underscores only.
            </Text>

            {/* Bio */}
            <Text className="text-sm font-medium text-gray-700 dark:text-[#dcddde] mb-2">
              Bio <Text className="text-gray-400 dark:text-[#72767d]">(optional)</Text>
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A few words about you…"
              placeholderTextColor={colors.input?.placeholder ?? "#6b7280"}
              multiline
              numberOfLines={3}
              maxLength={200}
              className="bg-white dark:bg-[#2f3136] border border-gray-300 dark:border-[#202225] rounded-lg px-4 py-3 text-gray-900 dark:text-[#dcddde] mb-1"
              style={{ textAlignVertical: "top", minHeight: 80 }}
            />
            <Text className="text-xs text-gray-400 dark:text-[#72767d] mb-8 text-right">
              {bio.length}/200
            </Text>

            {/* Submit */}
            <Pressable
              onPress={handleSave}
              disabled={!canSubmit}
              className={`rounded-xl py-4 items-center ${
                canSubmit
                  ? "bg-blue-600 dark:bg-[#5865f2]"
                  : "bg-gray-200 dark:bg-[#4f545c]"
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    canSubmit ? "text-white" : "text-gray-400 dark:text-[#72767d]"
                  }`}
                >
                  Get Started
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
