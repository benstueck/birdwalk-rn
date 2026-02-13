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

export function LoginScreen({ navigation }: AuthStackScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-white dark:bg-[#36393f]">
        <Text className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-[#dcddde]">BirdWalk</Text>

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

        <View className="mb-6">
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
            placeholder="Your password"
            placeholderTextColor={colors.input.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-lg py-4 ${
            loading ? "bg-gray-800 dark:bg-[#4752c4]" : "bg-gray-900 dark:bg-[#5865f2] active:bg-gray-800 dark:active:bg-[#4752c4]"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              Sign In
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Signup")}
          className="mt-4 py-2"
        >
          <Text className="text-center text-gray-600 dark:text-[#b9bbbe]">
            Don't have an account?{" "}
            <Text className="text-gray-900 dark:text-[#dcddde] font-semibold">Sign Up</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
