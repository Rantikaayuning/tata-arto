import React from "react";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from "react-native-svg";
import { View } from "react-native";

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 100, height = 100 }) => {
  return (
    <View style={{ width, height, aspectRatio: 1 }}>
      <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#434D8A" stopOpacity="1" />
            <Stop offset="1" stopColor="#343B71" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6C91F5" stopOpacity="1" />
            <Stop offset="1" stopColor="#4F7DF3" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="gradHighlight" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A5B4FC" stopOpacity="1" />
            <Stop offset="1" stopColor="#818CF8" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        <Path
          d="M 20 50 Q 20 20, 50 20 L 50 50 Z"
          fill="url(#gradHighlight)"
          opacity="0.9"
        />

        <Rect
          x="20"
          y="55"
          width="16"
          height="25"
          rx="8"
          fill="url(#gradPrimary)"
        />

        <Rect
          x="42"
          y="35"
          width="16"
          height="45"
          rx="8"
          fill="url(#gradHighlight)"
        />

        <Rect
          x="64"
          y="15"
          width="16"
          height="65"
          rx="8"
          fill="url(#gradAccent)"
        />

        <Circle
          cx="50"
          cy="50"
          r="48"
          stroke="url(#gradPrimary)"
          strokeWidth="4"
          strokeDasharray="20, 10"
          strokeLinecap="round"
          opacity="0.15"
        />
      </Svg>
    </View>
  );
};
