import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { AuthStackScreenProps } from "../navigation/types";

export function SignupScreen({ navigation }: AuthStackScreenProps<"Signup">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { colors } = useTheme();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <View className="flex-1 justify-center px-6 bg-white dark:bg-[#36393f]">
        <View className="bg-gray-100 dark:bg-[#202225] p-6 rounded-lg">
          <Text className="text-gray-800 dark:text-[#dcddde] text-center text-lg font-semibold mb-2">
            Check your email!
          </Text>
          <Text className="text-gray-700 dark:text-[#b9bbbe] text-center">
            We've sent you a confirmation link to {email}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          className="mt-6 py-4 bg-gray-900 dark:bg-[#5865f2] rounded-lg active:bg-gray-800 dark:active:bg-[#4752c4]"
        >
          <Text className="text-white text-center font-semibold text-base">
            Back to Sign In
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
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

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Email</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.input.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.input.text,
              backgroundColor: colors.input.background,
            }}
            placeholder="you@example.com"
            placeholderTextColor={colors.input.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">Password</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.input.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.input.text,
              backgroundColor: colors.input.background,
            }}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.input.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 dark:text-[#b9bbbe] mb-2 font-medium">
            Confirm Password
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.input.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.input.text,
              backgroundColor: colors.input.background,
            }}
            placeholder="Confirm your password"
            placeholderTextColor={colors.input.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <Pressable
          onPress={handleSignup}
          disabled={loading}
          className={`rounded-lg py-4 ${
            loading ? "bg-gray-800 dark:bg-[#4752c4]" : "bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
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
    </KeyboardAvoidingView>
  );
}
