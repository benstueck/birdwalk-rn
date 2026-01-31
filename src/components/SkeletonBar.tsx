import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface SkeletonBarProps {
  width: number;
  height?: number;
}

export function SkeletonBar({ width, height = 18 }: SkeletonBarProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#d1d5db",
          borderRadius: 4,
        },
        animatedStyle,
      ]}
    />
  );
}
