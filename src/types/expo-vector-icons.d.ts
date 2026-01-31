declare module "@expo/vector-icons" {
  import { ComponentProps } from "react";
  import { TextStyle } from "react-native";

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  }

  export const Ionicons: React.FC<IconProps>;
  export const Feather: React.FC<IconProps>;
  export const MaterialCommunityIcons: React.FC<IconProps>;
}
