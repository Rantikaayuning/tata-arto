import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency, formatDate } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const ExpenseItem = ({ item }) => {
    const iconName = item.category?.icon || 'help-circle-outline';
    const isIncome = item.type === 'income';

    return (
        <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View className="flex-row items-center flex-1 mr-4">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Ionicons name={iconName} size={22} color={isIncome ? '#16A34A' : '#DC2626'} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-base" numberOfLines={1}>
                        {item.category?.name || item.description || 'Transaksi'}
                    </Text>
                    {item.note ? (
                        <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{item.note}</Text>
                    ) : null}
                    <Text className="text-gray-400 text-xs mt-0.5">{formatDate(item.date)}</Text>
                </View>
            </View>

            <Text className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
                {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

export default ExpenseItem;
