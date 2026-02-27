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
        <View className="flex-row bg-white p-4 mb-3 rounded-3xl shadow-sm shadow-gray-200/50 border border-gray-50 items-center">
            {/* 1. Icon Box (Updated Style) */}
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'
                }`}>
                <Ionicons
                    name={(item.category?.icon as any) || (isIncome ? 'cash' : 'pricetag')}
                    size={22}
                    color={isIncome ? '#10B981' : '#F43F5E'}
                />
            </View>

            {/* 2. Main Content Area */}
            <View className="flex-1">
                {/* Top Row: Category Name & Amount */}
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-bold text-gray-800 text-[15px] flex-1 mr-2" numberOfLines={1}>
                        {isIncome ? 'Pemasukan' : item.category?.name || 'Lainnya'}
                    </Text>
                    <Text className={`font-extrabold text-[15px] tracking-tight ${isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                        {isIncome ? '+' : '-'} {isBalanceHidden ? '••••••' : formatCurrency(item.amount)}
                    </Text>
                </View>

                {/* Optional Note Row */}
                {item.note ? (
                    <Text className="text-gray-400 text-xs mb-1.5 leading-relaxed" numberOfLines={1}>
                        {item.note}
                    </Text>
                ) : null}

                {/* Bottom Row: Date & Wallet Badge */}
                <View className="flex-row items-center mt-0.5">
                    {/* Date */}
                    <Text className="text-gray-400 text-[11px] font-medium mr-3">
                        {formatDate(item.date)}
                    </Text>

                    {/* Wallet Badge */}
                    {item.wallet && (
                        <View className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg flex-row items-center self-start">
                            <Ionicons name={item.wallet.icon as any || "wallet-outline"} size={10} color="#9CA3AF" />
                            <Text className="text-gray-500 text-[10px] ml-1.5 font-medium" numberOfLines={1}>
                                {item.wallet.name}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default React.memo(ExpenseItem);
