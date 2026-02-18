import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../utils/cn'; // Need to create cn util if necessary, but for now simple merging works

const Button = ({ title, onPress, variant = 'primary', style }) => {
    const baseStyle = "px-4 py-3 rounded-xl items-center justify-center active:opacity-80";
    const variants = {
        primary: "bg-blue-600 text-white",
        secondary: "bg-gray-200 text-gray-800",
        danger: "bg-red-500 text-white",
    };

    return (
        <TouchableOpacity
            className={`${baseStyle} ${variants[variant]} ${style}`}
            onPress={onPress}
        >
            <Text className={`font-semibold text-base ${variant === 'secondary' ? 'text-gray-800' : 'text-white'}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default Button;
