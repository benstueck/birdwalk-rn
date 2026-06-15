import React from 'react';
import { Pressable, Text } from 'react-native';

interface FABButtonProps {
  onPress: () => void;
  className?: string;
}

export function FABButton({ onPress, className = '' }: FABButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-14 h-14 bg-gray-900 dark:bg-[#5865f2] rounded-full justify-center items-center shadow-lg active:bg-gray-800 dark:active:bg-[#4752c4] ${className}`}
    >
      <Text style={{ color: 'white', fontSize: 30, lineHeight: 30, fontWeight: '300' }}>+</Text>
    </Pressable>
  );
}
