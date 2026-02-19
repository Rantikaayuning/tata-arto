import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency, formatDate } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const ExpenseItem = ({ item }) => {
    const iconName = item.category?.icon || 'help-circle-outline';
    const isIncome = item.type === 'income';

    return (
        <View className="bg-white p-4 mb-2 rounded-2xl shadow-sm shadow-gray-200/50 flex-row justify-between items-center">
            <View className="flex-row items-center flex-1 mr-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <Ionicons name={iconName} size={24} color={isIncome ? '#10B981' : '#F43F5E'} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base tracking-tight" numberOfLines={1}>
                        {item.category?.name || item.description || 'Transaksi'}
                    </Text>
                    {item.note ? (
                        <Text className="text-gray-500 text-xs mt-1 font-medium" numberOfLines={1}>{item.note}</Text>
                    ) : null}
                    <Text className="text-gray-400 text-[10px] mt-1 font-medium uppercase tracking-wider">{formatDate(item.date)}</Text>
                </View>
            </View>

            <Text className={`font-extrabold text-lg tracking-tight ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

export default ExpenseItem;
