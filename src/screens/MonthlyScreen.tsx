import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, Dimensions, Pressable } from 'react-native';
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

    // Extract available years
    const availableYears = useMemo(() => {
        if (!expenses || expenses.length === 0) return [new Date().getFullYear()];
        const years = new Set(expenses.map(e => new Date(e.date).getFullYear()));
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [expenses]);

    // Derived Data for the Selected Year
    const { annualData, monthlyTrend, categoryBreakdown, monthlyList, maxChartValue } = useMemo(() => {
        const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);

        // 1. Annual Totals
        let totalIncome = 0;
        let totalExpense = 0;

        // 2. Monthly Trend (Initialize 12 months)
        const trend = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            income: 0,
            expense: 0,
            label: new Date(selectedYear, i, 1).toLocaleString('id-ID', { month: 'short' })
        }));

        // 3. Category Breakdown
        const catMap: { [key: string]: { amount: number, color: string, icon: string } } = {};

        // 4. Monthly List Data
        const itemsMap: { [key: string]: MonthlyData } = {};

        yearExpenses.forEach(exp => {
            const amount = parseFloat(exp.amount.toString());
            const date = new Date(exp.date);
            const monthIndex = date.getMonth();

            // Annual
            if (exp.type === 'income') totalIncome += amount;
            else totalExpense += amount;

            // Trend
            if (exp.type === 'income') trend[monthIndex].income += amount;
            else trend[monthIndex].expense += amount;

            // Category (Expense Only)
            if (exp.type === 'expense') {
                const catName = exp.category?.name || 'Lainnya';
                if (!catMap[catName]) {
                    catMap[catName] = { amount: 0, color: '#F43F5E', icon: 'pricetag' };
                }
                catMap[catName].amount += amount;
            }

            // Monthly List
            const key = `${selectedYear}-${monthIndex}`;
            if (!itemsMap[key]) {
                itemsMap[key] = {
                    monthYear: formatMonth(exp.date),
                    income: 0,
                    expense: 0,
                    dateObj: date,
                    key
                };
            }
            if (exp.type === 'income') itemsMap[key].income += amount;
            else itemsMap[key].expense += amount;
        });

        const sortedCategories = Object.entries(catMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const maxCatAmount = sortedCategories.length > 0 ? sortedCategories[0].amount : 1;
        const sortedList = Object.values(itemsMap).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        const maxChartValue = Math.max(
            ...trend.map(t => Math.max(t.income, t.expense)),
            1
        );

        return {
            annualData: { income: totalIncome, expense: totalExpense },
            monthlyTrend: trend,
            categoryBreakdown: { data: sortedCategories, max: maxCatAmount },
            monthlyList: sortedList,
            maxChartValue
        };
    }, [expenses, selectedYear]);

    // Helper for Pie Chart Slices


    return (
        <SafeAreaView className="flex-1 bg-[#F7F8FA]" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-2 pb-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm android:elevation-2 z-10">
                <Text className="text-2xl font-extrabold text-primary tracking-tighter">Laporan</Text>
                <TouchableOpacity
                    onPress={() => setShowYearModal(true)}
                    className="flex-row items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-full"
                >
                    <Text className="font-bold text-gray-700 mr-2">{selectedYear}</Text>
                    <Ionicons name="chevron-down" size={16} color="#374151" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 1. Annual Summary Card */}
                <View className="mx-6 mt-6 p-6 bg-primary rounded-[32px] shadow-lg shadow-indigo-900/20 android:elevation-10">
                    <Text className="text-white/70 font-bold text-xs uppercase tracking-widest mb-1">Total Saldo Tahun {selectedYear}</Text>
                    <Text className="text-white text-3xl font-black mb-6 tracking-tight">
                        {renderHiddenAmount(annualData.income - annualData.expense)}
                    </Text>

                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5">
                            <View className="flex-row items-center mb-2">
                                <View className="w-6 h-6 rounded-full bg-emerald-500/20 items-center justify-center mr-2">
                                    <Ionicons name="arrow-up" size={12} color="#34D399" />
                                </View>
                                <Text className="text-emerald-100/70 text-[10px] font-bold uppercase">Masuk</Text>
                            </View>
                            <Text className="text-white font-bold text-lg" numberOfLines={1} adjustsFontSizeToFit>{renderHiddenAmount(annualData.income)}</Text>
                        </View>
                        <View className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5">
                            <View className="flex-row items-center mb-2">
                                <View className="w-6 h-6 rounded-full bg-rose-500/20 items-center justify-center mr-2">
                                    <Ionicons name="arrow-down" size={12} color="#FB7185" />
                                </View>
                                <Text className="text-rose-100/70 text-[10px] font-bold uppercase">Keluar</Text>
                            </View>
                            <Text className="text-white font-bold text-lg" numberOfLines={1} adjustsFontSizeToFit>{renderHiddenAmount(annualData.expense)}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Monthly Trend Chart */}
                <View className="mx-6 mt-6 bg-white p-6 rounded-[32px] shadow-sm android:elevation-5">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-primary font-bold text-lg">Arus Kas Bulanan</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row items-end h-[150px] space-x-4 pr-4">
                            {monthlyTrend.map((m, i) => (
                                <View key={i} className="items-center w-[30px]">
                                    <View className="flex-row items-end h-[120px] w-full justify-between space-x-1">
                                        <View
                                            className="bg-primary/80 rounded-t-sm w-[12px]"
                                            style={{ height: `${(m.income / maxChartValue) * 100}%`, minHeight: m.income > 0 ? 4 : 0 }}
                                        />
                                        <View
                                            className="bg-rose-400 rounded-t-sm w-[12px]"
                                            style={{ height: `${(m.expense / maxChartValue) * 100}%`, minHeight: m.expense > 0 ? 4 : 0 }}
                                        />
                                    </View>
                                    <Text className="text-[10px] text-gray-400 mt-2 font-medium">{m.label}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* 3. Top Categories */}
                {categoryBreakdown.data.length > 0 && (
                    <View className="mx-6 mt-6 bg-white p-6 rounded-[32px] shadow-sm android:elevation-5">
                        <Text className="text-primary font-bold text-lg mb-4">Pengeluaran Terbesar</Text>
                        {categoryBreakdown.data.map((cat, i) => (
                            <View key={i} className="mb-4 last:mb-0">
                                <View className="flex-row justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-700 font-bold text-sm mr-2">{cat.name}</Text>
                                        <Text className="text-gray-400 text-xs">{(cat.amount / annualData.expense * 100).toFixed(1)}%</Text>
                                    </View>
                                    <Text className="text-gray-800 font-bold text-sm">{renderHiddenAmount(cat.amount)}</Text>
                                </View>
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${(cat.amount / categoryBreakdown.max) * 100}%` }}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View className="mx-6 mt-8 mb-2">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Sisa Saldo Bulanan</Text>
                </View>

                {monthlyList.map((item) => (
                    <View key={item.key} className="bg-white p-5 mb-4 mx-6 rounded-[24px] shadow-sm android:elevation-3">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-800 font-bold text-base">{item.monthYear}</Text>
                            <Text className={`font-bold ${item.income - item.expense >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                                {renderHiddenAmount(item.income - item.expense)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-xs text-gray-400">Masuk: <Text className="text-emerald-500">{renderHiddenAmount(item.income)}</Text></Text>
                            <Text className="text-xs text-gray-400">Keluar: <Text className="text-rose-500">{renderHiddenAmount(item.expense)}</Text></Text>
                        </View>
                    </View>
                ))}

                {monthlyList.length === 0 && (
                    <View className="items-center justify-center mt-10 mb-10 opacity-50">
                        <Ionicons name="bar-chart-outline" size={48} color="#CBD5E1" />
                        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider text-center mt-2">Belum ada data</Text>
                    </View>
                )}

            </ScrollView>

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
                    <View className="bg-white rounded-[32px] w-[80%] max-h-[50%] p-6 overflow-hidden shadow-2xl android:elevation-20">
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
