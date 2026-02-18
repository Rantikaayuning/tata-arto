import React from 'react';
import { View, TextInput, Text } from 'react-native';

const Input = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry }) => {
    return (
        <View className="mb-4">
            {label && <Text className="text-gray-600 mb-1 font-medium">{label}</Text>}
            <TextInput
                className="w-full bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
};

export default Input;
