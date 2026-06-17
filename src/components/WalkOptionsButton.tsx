import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface WalkOptionsButtonProps {
  onEdit: () => void;
  onDelete: () => void;
  onInvite?: () => void;
}

export function WalkOptionsButton({ onEdit, onDelete, onInvite }: WalkOptionsButtonProps) {
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

  const handleEdit = () => { setIsOpen(false); onEdit(); };
  const handleDelete = () => { setIsOpen(false); onDelete(); };
  const handleInvite = () => { setIsOpen(false); onInvite?.(); };

  const menuOpacity = animation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const menuScale = animation.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const menuTranslateY = animation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View className="absolute bottom-6 left-6">
      {/* Backdrop */}
      {isOpen && (
        <Pressable
          style={{ position: "absolute", top: -1000, left: -24, width: 2000, height: 2000 }}
          onPress={() => setIsOpen(false)}
        />
      )}

      {/* Items column */}
      <Animated.View
        style={{
          marginBottom: 12,
          opacity: menuOpacity,
          transform: [{ scale: menuScale }, { translateY: menuTranslateY }],
        }}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <DialItem label="Delete" icon="trash" color={colors.destructive} labelColor="#ef4444" onPress={handleDelete} />
        <DialItem label="Edit" icon="pencil" color={colors.text.secondary} onPress={handleEdit} />
        {onInvite && (
          <DialItem label="Invite" icon="person-add-outline" color={colors.text.secondary} onPress={handleInvite} />
        )}
      </Animated.View>

      {/* Main FAB */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white dark:bg-[#40444b] rounded-full justify-center items-center shadow-lg active:bg-gray-100 dark:active:bg-[#202225] border border-[#5865f2]"
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

function DialItem({
  label,
  icon,
  color,
  labelColor,
  onPress,
}: {
  label: string;
  icon: any;
  color: string;
  labelColor?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} className="flex-row items-center mb-3">
      <View className="bg-white dark:bg-[#2f3136] rounded-lg px-3 py-2 mr-3 shadow">
        <Text style={{ color: labelColor ?? colors.text.primary }} className="font-medium">{label}</Text>
      </View>
      <View className="w-11 h-11 bg-white dark:bg-[#2f3136] rounded-full justify-center items-center shadow">
        <Ionicons name={icon} size={20} color={color} />
      </View>
    </Pressable>
  );
}
