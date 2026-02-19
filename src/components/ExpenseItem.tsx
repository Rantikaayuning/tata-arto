import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency, formatDate } from '../utils/format';
import useExpenseStore from '../context/useExpenseStore';
import { Expense } from '../types';

interface ExpenseItemProps {
    item: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ item }) => {
    const isBalanceHidden = useExpenseStore(state => state.isBalanceHidden);
    const isIncome = item.type === 'income';

    return (
        <View className="flex-row items-center bg-white p-4 mb-3 rounded-2xl shadow-sm border border-gray-100">
            {/* Icon Box */}
            <View className={`p-3 rounded-xl mr-4 ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <Ionicons
                    name={item.category.icon as any}
                    size={24}
                    color={isIncome ? '#10B981' : '#F43F5E'}
                />
            </View>

            {/* Details */}
            <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base mb-1" numberOfLines={1}>
                    {item.category.name}
                </Text>
                {item.note ? (
                    <Text className="text-gray-400 text-xs mb-1" numberOfLines={1}>
                        {item.note}
                    </Text>
                ) : null}
                <View className="flex-row items-center">
                    <Text className="text-gray-400 text-xs mr-2">
                        {formatDate(item.date)}
                    </Text>
                    {item.wallet && (
                        <View className="bg-gray-100 px-2 py-0.5 rounded-md flex-row items-center">
                            <Ionicons name={item.wallet.icon as any || "wallet-outline"} size={10} color="#6B7280" />
                            <Text className="text-gray-500 text-[10px] ml-1 font-medium">
                                {item.wallet.name}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Amount */}
            <Text className={`font-extrabold text-lg tracking-tight ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isIncome ? '+' : '-'} {isBalanceHidden ? '••••••' : formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

export default ExpenseItem;
