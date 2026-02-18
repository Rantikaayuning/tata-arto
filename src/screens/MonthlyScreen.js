import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, formatMonth } from '../utils/format';

const MonthlyScreen = () => {
    const expenses = useExpenseStore((state) => state.expenses);

    const monthlyData = useMemo(() => {
        const grouped = expenses.reduce((acc, curr) => {
            const date = new Date(curr.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`; // unique key for month

            if (!acc[key]) {
                acc[key] = {
                    monthYear: formatMonth(curr.date),
                    income: 0,
                    expense: 0,
                    dateObj: date,
                    key: key
                };
            }

            if (curr.type === 'income') {
                acc[key].income += parseFloat(curr.amount);
            } else {
                acc[key].expense += parseFloat(curr.amount);
            }

            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => b.dateObj - a.dateObj);
    }, [expenses]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-6 bg-white border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-800">Rangkuman Bulanan</Text>
            </View>

            <FlatList
                data={monthlyData}
                keyExtractor={(item) => item.key}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-lg font-bold text-gray-700 mb-3">{item.monthYear}</Text>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Pemasukan</Text>
                            <Text className="text-green-600 font-semibold">+ {formatCurrency(item.income)}</Text>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Pengeluaran</Text>
                            <Text className="text-red-500 font-semibold">- {formatCurrency(item.expense)}</Text>
                        </View>

                        <View className="h-[1px] bg-gray-100 my-2" />

                        <View className="flex-row justify-between">
                            <Text className="text-gray-800 font-medium">Sisa Saldo</Text>
                            <Text className={`font-bold ${item.income - item.expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(item.income - item.expense)}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-400 text-lg">Belum ada data bulanan</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default MonthlyScreen;
