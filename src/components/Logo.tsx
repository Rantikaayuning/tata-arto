import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { View } from 'react-native';

interface LogoProps {
    width?: number;
    height?: number;
}

export const Logo: React.FC<LogoProps> = ({ width = 100, height = 100 }) => {
    return (
        <View style={{ width, height, aspectRatio: 1 }}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <Defs>
                    {/* Gradient for Primary - Deep Blue */}
                    <LinearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#434D8A" stopOpacity="1" />
                        <Stop offset="1" stopColor="#343B71" stopOpacity="1" />
                    </LinearGradient>

                    {/* Gradient for Accent - Bright Blue */}
                    <LinearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#6C91F5" stopOpacity="1" />
                        <Stop offset="1" stopColor="#4F7DF3" stopOpacity="1" />
                    </LinearGradient>

                    {/* Gradient for Highlight - Soft Cyan/Whiteish */}
                    <LinearGradient id="gradHighlight" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor="#A5B4FC" stopOpacity="1" />
                        <Stop offset="1" stopColor="#818CF8" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background Shape - Subtle soft container or just the logo elements? 
                    Let's utilize the negative space. We'll make a specialized shape.
                */}

                {/* 
                   Concept: "The Golden Growth"
                   Three diverse shapes coming together to form a solid square/circle.
                   Representing: Income, Savings, Investment.
                */}

                {/* Base Block (Stability/Savings) - Bottom Left */}
                <Path
                    d="M 20 50 Q 20 20, 50 20 L 50 50 Z"
                    fill="url(#gradHighlight)"
                    opacity="0.9"
                    transform="rotate(180, 45, 45) translate(10, 10)"
                />
                {/* 
                    Let's rethink. Simple Ascending Bars with a Twist.
                    Three vertical pills.
                 */}

                {/* Left Pill - Small */}
                <Rect x="20" y="55" width="16" height="25" rx="8" fill="url(#gradPrimary)" />

                {/* Middle Pill - Medium */}
                <Rect x="42" y="35" width="16" height="45" rx="8" fill="url(#gradHighlight)" />

                {/* Right Pill - Large */}
                <Rect x="64" y="15" width="16" height="65" rx="8" fill="url(#gradAccent)" />

                {/* 
                    Connecting Curve - The "Flow" or "Control"
                    A line that wraps around them or underlines them? 
                    Maybe a circle ring around them? 
                 */}
                <Circle cx="50" cy="50" r="48" stroke="url(#gradPrimary)" strokeWidth="4" strokeDasharray="20, 10" strokeLinecap="round" rotation="-45" opacity="0.15" />

            </Svg>
        </View>
    );
};
