import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, formatMonth } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Expense } from '../types';

interface MonthlyData {
    monthYear: string;
    income: number;
    expense: number;
    dateObj: Date;
    key: string;
}

const MonthlyScreen = () => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const isBalanceHidden = useExpenseStore((state) => state.isBalanceHidden);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showYearModal, setShowYearModal] = useState(false);

    const renderHiddenAmount = (amount: number) => isBalanceHidden ? '••••••' : formatCurrency(amount);

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

        const grouped = yearExpenses.reduce((acc: { [key: string]: MonthlyData }, curr: Expense) => {
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

            const amount = parseFloat(curr.amount as any); // Cast to any to safely handle potential strings in store
            if (curr.type === 'income') {
                acc[key].income += amount;
            } else {
                acc[key].expense += amount;
            }

            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    }, [expenses, selectedYear]);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-4 pb-6">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-extrabold text-primary tracking-tighter">Laporan</Text>

                    <TouchableOpacity
                        onPress={() => setShowYearModal(true)}
                        className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-sm shadow-indigo-100/50"
                    >
                        <Text className="font-bold text-gray-700 mr-2">{selectedYear}</Text>
                        <Ionicons name="chevron-down" size={16} color="#374151" />
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest px-1">
                    Ringkasan Bulanan
                </Text>
            </View>

            <FlatList
                data={monthlyData}
                keyExtractor={(item) => item.key}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View className="bg-white p-6 mb-4 mx-6 rounded-[28px] shadow-sm shadow-indigo-100/40">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-extrabold text-primary tracking-tight">{item.monthYear}</Text>
                            <View className={`px-3 py-1 rounded-full ${item.income - item.expense >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                <Text className={`text-xs font-bold ${item.income - item.expense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {item.income - item.expense >= 0 ? 'Surplus' : 'Defisit'}
                                </Text>
                            </View>
                        </View>

                        <View className="space-y-3">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
                                        <Ionicons name="arrow-up" size={16} color="#10B981" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider">Pemasukan</Text>
                                </View>
                                <Text className="text-emerald-500 font-bold text-base tracking-tight">+ {renderHiddenAmount(item.income)}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center mr-3">
                                        <Ionicons name="arrow-down" size={16} color="#F43F5E" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider">Pengeluaran</Text>
                                </View>
                                <Text className="text-rose-500 font-bold text-base tracking-tight">- {renderHiddenAmount(item.expense)}</Text>
                            </View>
                        </View>

                        <View className="h-[1px] bg-gray-50 my-5" />

                        <View className="flex-row justify-between items-end">
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Sisa Saldo</Text>
                            <Text className={`text-2xl font-black tracking-tighter ${item.income - item.expense >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                                {renderHiddenAmount(item.income - item.expense)}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="calendar" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider text-center">Belum ada data {selectedYear}</Text>
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
                    className="flex-1 bg-black/60 justify-center items-center p-6"
                    activeOpacity={1}
                    onPress={() => setShowYearModal(false)}
                >
                    <View className="bg-white rounded-[32px] w-[80%] max-h-[50%] p-6 overflow-hidden shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-extrabold text-primary tracking-tight">Pilih Tahun</Text>
                            <TouchableOpacity onPress={() => setShowYearModal(false)} className="bg-gray-50 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={availableYears}
                            keyExtractor={item => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 items-center rounded-2xl mb-2 ${selectedYear === item ? 'bg-primary shadow-lg shadow-indigo-500/30' : 'bg-transparent'}`}
                                    onPress={() => {
                                        setSelectedYear(item);
                                        setShowYearModal(false);
                                    }}
                                >
                                    <Text className={`text-lg font-bold ${selectedYear === item ? 'text-white' : 'text-gray-500'}`}>
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
