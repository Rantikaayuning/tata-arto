import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const FloatingButton = ({ onPress }) => {
    return (
        <TouchableOpacity
            className="absolute bottom-1 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name="add" color="white" size={32} />
        </TouchableOpacity>
    );
};

export default FloatingButton;
