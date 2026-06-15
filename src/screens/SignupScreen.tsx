import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { AuthStackScreenProps } from "../navigation/types";

export function SignupScreen({ navigation }: AuthStackScreenProps<"Signup">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSel, setPasswordSel] = useState({ start: 0, end: 0 });
  const [confirmSel, setConfirmSel] = useState({ start: 0, end: 0 });
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const { colors } = useTheme();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordLongEnough = password.length >= 6;
  const passwordsMatch = password === confirmPassword;

  const emailFeedback = emailTouched && email.length > 0
    ? emailValid
      ? { ok: true, text: "Looks good" }
      : { ok: false, text: "Enter a valid email address" }
    : null;

  const passwordFeedback = password.length > 0
    ? passwordLongEnough
      ? { ok: true, text: "Looks good" }
      : { ok: false, text: "At least 6 characters" }
    : null;

  const confirmFeedback = confirmPassword.length > 0
    ? passwordsMatch
      ? { ok: true, text: "Passwords match" }
      : { ok: false, text: "Passwords do not match" }
    : null;

  const canSubmit = emailValid && passwordLongEnough && passwordsMatch && !loading;

  const handleSignup = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, AuthContext picks up the new session via onAuthStateChange
    // and RootNavigator routes to ProfileSetupScreen automatically.
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
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 bg-white dark:bg-[#36393f]">
          <Text className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-[#dcddde]">
            Create Account
          </Text>

          {error && (
            <View className="bg-red-100 dark:bg-[#202225] p-3 rounded-lg mb-4">
              <Text className="text-red-600 dark:text-[#ed4245] text-center">{error}</Text>
            </View>
          )}

          <View className="mb-1">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Email</Text>
            <TextInput
              style={inputStyle}
              placeholder="you@example.com"
              placeholderTextColor={colors.input.placeholder}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          {emailFeedback && (
            <Text className={`text-sm mb-3 mt-1 ${emailFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {emailFeedback.ok ? "✓ " : "✗ "}{emailFeedback.text}
            </Text>
          )}
          {!emailFeedback && <View className="mb-4" />}

          <View className="mb-1">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Password</Text>
            <TextInput
              style={inputStyle}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.input.placeholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordSel({ start: password.length, end: password.length })}
              onSelectionChange={(e) => setPasswordSel(e.nativeEvent.selection)}
              selection={passwordSel}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
          {passwordFeedback && (
            <Text className={`text-sm mb-3 mt-1 ${passwordFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {passwordFeedback.ok ? "✓ " : "✗ "}{passwordFeedback.text}
            </Text>
          )}
          {!passwordFeedback && <View className="mb-4" />}

          <View className="mb-1">
            <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">
              Confirm Password
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Confirm your password"
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
          {confirmFeedback && (
            <Text className={`text-sm mb-3 mt-1 ${confirmFeedback.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-[#ed4245]"}`}>
              {confirmFeedback.ok ? "✓ " : "✗ "}{confirmFeedback.text}
            </Text>
          )}
          {!confirmFeedback && <View className="mb-6" />}

          <Pressable
            onPress={handleSignup}
            disabled={!canSubmit}
            className={`rounded-lg py-4 ${
              canSubmit
                ? "bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
                : "bg-gray-300 dark:bg-[#4f545c]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`text-center font-semibold text-base ${canSubmit ? "text-white" : "text-gray-400 dark:text-[#72767d]"}`}>
                Create Account
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            className="mt-4 py-2"
          >
            <Text className="text-center text-gray-600 dark:text-[#b9bbbe]">
              Already have an account?{" "}
              <Text className="text-gray-900 dark:text-[#dcddde] font-semibold">Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
