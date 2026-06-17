import React from "react";
import { View, Text } from "react-native";
import { getAvatarEmoji } from "../utils/avatars";

interface Collaborator {
  user_id: string;
  avatar_id: number;
  display_name: string;
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
  size?: "sm" | "md";
  max?: number;
}

export function CollaboratorAvatars({ collaborators, size = "sm", max = 3 }: CollaboratorAvatarsProps) {
  if (collaborators.length <= 1) return null;

  const visible = collaborators.slice(0, max);
  const overflow = collaborators.length - max;
  const dim = size === "sm" ? 24 : 32;
  const fontSize = size === "sm" ? 12 : 16;
  const overlap = size === "sm" ? 8 : 10;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {visible.map((c, i) => (
        <View
          key={c.user_id}
          style={{
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: "#202225",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: i === 0 ? 0 : -overlap,
            borderWidth: 1.5,
            borderColor: "transparent",
            zIndex: visible.length - i,
          }}
        >
          <Text style={{ fontSize }}>{getAvatarEmoji(c.avatar_id)}</Text>
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: "#4f545c",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -overlap,
            borderWidth: 1.5,
            borderColor: "transparent",
          }}
        >
          <Text style={{ fontSize: fontSize - 2, color: "#dcddde", fontWeight: "600" }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
