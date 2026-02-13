import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface WalkOptionsButtonProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function WalkOptionsButton({ onEdit, onDelete }: WalkOptionsButtonProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [isOpen]);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  // Animation values for the speed dial items
  const editTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const deleteTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -82],
  });

  const itemOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });


  return (
    <View className="absolute bottom-6 left-6">
      {/* Backdrop when open */}
      {isOpen && (
        <Pressable
          className="fixed inset-0 w-screen h-screen"
          style={{ position: "absolute", top: -1000, left: -24, width: 2000, height: 2000 }}
          onPress={() => setIsOpen(false)}
        />
      )}

      {/* Delete action (appears higher) */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          transform: [{ translateY: deleteTranslateY }],
          opacity: itemOpacity,
        }}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable
          onPress={handleDelete}
          className="flex-row items-center"
        >
          <View className="bg-white dark:bg-[#2f3136] rounded-lg px-3 py-2 mr-3 shadow">
            <Text className="text-red-500 dark:text-[#ed4245] font-medium">Delete</Text>
          </View>
          <View className="w-11 h-11 bg-white dark:bg-[#2f3136] rounded-full justify-center items-center shadow">
            <Ionicons name="trash" size={20} color={colors.destructive} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Edit action */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          transform: [{ translateY: editTranslateY }],
          opacity: itemOpacity,
        }}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable
          onPress={handleEdit}
          className="flex-row items-center"
        >
          <View className="bg-white dark:bg-[#2f3136] rounded-lg px-3 py-2 mr-3 shadow">
            <Text className="text-gray-700 dark:text-[#dcddde] font-medium">Edit</Text>
          </View>
          <View className="w-11 h-11 bg-white dark:bg-[#2f3136] rounded-full justify-center items-center shadow">
            <Ionicons name="pencil" size={20} color={colors.text.secondary} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Main FAB */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white dark:bg-[#2f3136] rounded-full justify-center items-center shadow-lg active:bg-gray-100 dark:active:bg-[#202225]"
      >
        <Ionicons
          name={isOpen ? "close" : "ellipsis-horizontal"}
          size={24}
          color={colors.text.primary}
        />
      </Pressable>
    </View>
  );
}
