import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, formatMonth } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const MonthlyScreen = () => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showYearModal, setShowYearModal] = useState(false);

    // Extract available years from expenses
    const availableYears = useMemo(() => {
        if (!expenses || expenses.length === 0) return [new Date().getFullYear()];

        const years = new Set(expenses.map(e => new Date(e.date).getFullYear()));
        // Ensure current year is always available
        years.add(new Date().getFullYear());

        return Array.from(years).sort((a, b) => b - a); // Descending
    }, [expenses]);

    const monthlyData = useMemo(() => {
        // Filter by selected year first
        const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);

        const grouped = yearExpenses.reduce((acc, curr) => {
            const date = new Date(curr.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`; // unique key

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
    }, [expenses, selectedYear]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header with Year Selector */}
            <View className="p-6 bg-primary pb-8 shadow-sm">
                <Text className="text-2xl font-bold text-white">Rangkuman Bulanan</Text>
            </View>

            {/* Year Selector - Below Header */}
            <View className="px-6 py-4">
                <Text className="text-gray-500 text-sm font-bold mb-2 ml-1">Tahun</Text>
                <TouchableOpacity
                    onPress={() => setShowYearModal(true)}
                    className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-gray-200 self-start shadow-sm"
                >
                    <Text className="font-bold text-gray-700 mr-2">{selectedYear}</Text>
                    <Ionicons name="chevron-down" size={16} color="#374151" />
                </TouchableOpacity>
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
                        <Text className="text-gray-400 text-lg">Belum ada data di tahun {selectedYear}</Text>
                    </View>
                }
            />

            {/* Year Selection Modal */}
            <Modal
                transparent={true}
                visible={showYearModal}
                animationType="fade"
                onRequestClose={() => setShowYearModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center p-6"
                    activeOpacity={1}
                    onPress={() => setShowYearModal(false)}
                >
                    <View className="bg-white rounded-2xl w-[80%] max-h-[50%] p-4 overflow-hidden">
                        <Text className="text-lg font-bold text-gray-800 mb-4 text-center">Pilih Tahun</Text>
                        <FlatList
                            data={availableYears}
                            keyExtractor={item => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 items-center border-b border-gray-100 ${selectedYear === item ? 'bg-primary/10' : ''}`}
                                    onPress={() => {
                                        setSelectedYear(item);
                                        setShowYearModal(false);
                                    }}
                                >
                                    <Text className={`text-lg font-medium ${selectedYear === item ? 'text-primary' : 'text-gray-700'}`}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default MonthlyScreen;
