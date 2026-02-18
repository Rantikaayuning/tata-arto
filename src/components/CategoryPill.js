import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
// Use Ionicons from Expo for guaranteed compatibility
import Ionicons from '@expo/vector-icons/Ionicons';

const CategoryPill = ({ category, isSelected, onPress }) => {
    if (!category) return null;

    // Use category.icon directly. Default fallback.
    // We assume valid Ionicons names are now in store.
    const iconName = category.icon || 'help-circle-outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`mr-3 mb-3 px-4 py-2 rounded-full flex-row items-center border ${isSelected ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'
                }`}
        >
            <Ionicons name={iconName} size={18} color={isSelected ? 'white' : '#4B5563'} />
            <Text className={`ml-2 font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

export default CategoryPill;
