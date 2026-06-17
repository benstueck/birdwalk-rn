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
import { supabase } from "../lib/supabase";

export function AccountSettingsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Email
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordSel, setNewPasswordSel] = useState({ start: 0, end: 0 });
  const [confirmSel, setConfirmSel] = useState({ start: 0, end: 0 });
  const [savingPassword, setSavingPassword] = useState(false);

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

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailChanged = email !== (user?.email ?? "");
  const emailFeedback = emailTouched && email.length > 0
    ? emailValid
      ? { ok: true, text: "Looks good" }
      : { ok: false, text: "Enter a valid email address" }
    : null;
  const canSaveEmail = emailValid && emailChanged && !savingEmail;

  const passwordLongEnough = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword;
  const passwordFeedback = newPassword.length > 0
    ? passwordLongEnough
      ? { ok: true, text: "Looks good" }
      : { ok: false, text: "At least 6 characters" }
    : null;
  const confirmFeedback = confirmPassword.length > 0
    ? passwordsMatch
      ? { ok: true, text: "Passwords match" }
      : { ok: false, text: "Passwords do not match" }
    : null;
  const canSavePassword = passwordLongEnough && passwordsMatch && newPassword.length > 0 && !savingPassword;

  const handleSaveEmail = async () => {
    if (!canSaveEmail) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Check your inbox",
        "A confirmation link has been sent to your new email address. Your email will update once you confirm."
      );
    }
  };

  const handleSavePassword = async () => {
    if (!canSavePassword) return;
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password updated", "Your password has been changed successfully.");
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

  const saveButtonClass = (canSave: boolean) =>
    `rounded-xl py-4 items-center mt-4 ${
      canSave
        ? "bg-blue-600 dark:bg-[#5865f2] active:bg-blue-700 dark:active:bg-[#4752c4]"
        : "bg-gray-200 dark:bg-[#4f545c]"
    }`;

  const saveButtonTextClass = (canSave: boolean) =>
    `text-base font-semibold ${canSave ? "text-white" : "text-gray-400 dark:text-[#72767d]"}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 dark:bg-[#36393f]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6 pb-10">
          {/* Email section */}
          <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-4">
            Change Email
          </Text>

          <View className="mb-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#b9bbbe] mb-2">
              Email address
            </Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          {emailFeedback ? (
            <Text className={`text-sm mt-1 mb-2 ${emailFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {emailFeedback.ok ? "✓ " : "✗ "}{emailFeedback.text}
            </Text>
          ) : <View className="mb-3" />}

          <Pressable
            onPress={handleSaveEmail}
            disabled={!canSaveEmail}
            className={saveButtonClass(canSaveEmail)}
          >
            {savingEmail ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={saveButtonTextClass(canSaveEmail)}>
                Update Email
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="h-px bg-gray-200 dark:bg-[#202225] my-8" />

          {/* Password section */}
          <Text className="text-lg font-semibold text-gray-800 dark:text-[#dcddde] mb-4">
            Change Password
          </Text>

          <View className="mb-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#b9bbbe] mb-2">
              New password
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.input.placeholder}
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setNewPasswordSel({ start: newPassword.length, end: newPassword.length })}
              onSelectionChange={(e) => setNewPasswordSel(e.nativeEvent.selection)}
              selection={newPasswordSel}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          {passwordFeedback ? (
            <Text className={`text-sm mt-1 mb-2 ${passwordFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {passwordFeedback.ok ? "✓ " : "✗ "}{passwordFeedback.text}
            </Text>
          ) : <View className="mb-3" />}

          <View className="mb-1">
            <Text className="text-sm font-medium text-gray-700 dark:text-[#b9bbbe] mb-2">
              Confirm new password
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Confirm your new password"
              placeholderTextColor={colors.input.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmSel({ start: confirmPassword.length, end: confirmPassword.length })}
              onSelectionChange={(e) => setConfirmSel(e.nativeEvent.selection)}
              selection={confirmSel}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          {confirmFeedback ? (
            <Text className={`text-sm mt-1 mb-2 ${confirmFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {confirmFeedback.ok ? "✓ " : "✗ "}{confirmFeedback.text}
            </Text>
          ) : <View className="mb-3" />}

          <Pressable
            onPress={handleSavePassword}
            disabled={!canSavePassword}
            className={saveButtonClass(canSavePassword)}
          >
            {savingPassword ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className={saveButtonTextClass(canSavePassword)}>
                Update Password
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
