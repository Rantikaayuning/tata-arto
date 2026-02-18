import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import FloatingButton from '../components/FloatingButton';
import { formatCurrency } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
    const expenses = useExpenseStore((state) => state.expenses);
    const [isFabOpen, setIsFabOpen] = useState(false);

    // FAB Expand/Collapse Animation
    const handleFabPress = () => {
        setIsFabOpen(!isFabOpen);
    };

    const handleNavigate = (type) => {
        setIsFabOpen(false);
        navigation.navigate('AddExpense', { initialType: type });
    };

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        let income = 0;
        let expense = 0;

        expenses.forEach((item) => {
            if (item.type === 'income') {
                income += parseFloat(item.amount) || 0;
            } else {
                expense += parseFloat(item.amount) || 0;
            }
        });

        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [expenses]);

    const renderHeader = () => (
        <View className="mb-6 px-4 pt-4">
            <View className="p-6 bg-primary rounded-3xl shadow-lg">
                <Text className="text-white text-lg font-medium opacity-80 mb-1">Total Saldo</Text>
                <Text className="text-white text-4xl font-bold mb-4">
                    {formatCurrency(balance)}
                </Text>

                <View className="flex-row justify-between bg-white/10 p-4 rounded-xl">
                    <View>
                        <Text className="text-green-200 text-xs font-medium mb-1">PEMASUKAN</Text>
                        <Text className="text-white font-bold text-lg">{formatCurrency(totalIncome)}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-red-200 text-xs font-medium mb-1">PENGELUARAN</Text>
                        <Text className="text-white font-bold text-lg">{formatCurrency(totalExpense)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1">
                {renderHeader()}

                <View className="flex-1 px-6">
                    <Text className="text-xl font-bold text-gray-800 mb-4 ml-2">Riwayat Transaksi</Text>

                    <FlatList
                        data={expenses}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ExpenseItem item={item} />}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20">
                                <Ionicons name="clipboard-outline" size={60} color="#D1D5DB" />
                                <Text className="text-gray-400 text-lg mt-4">Belum ada transaksi</Text>
                            </View>
                        }
                    />
                </View>

                {/* Speed Dial Menu */}
                {isFabOpen && (
                    <Pressable
                        className="absolute inset-0 bg-black/50 z-40"
                        onPress={() => setIsFabOpen(false)}
                    >
                        <View className="absolute bottom-24 right-8 items-end z-50">
                            <TouchableOpacity
                                className="flex-row items-center bg-green-600 px-4 py-3 rounded-full mb-4 shadow-lg active:scale-95"
                                onPress={() => handleNavigate('income')}
                            >
                                <Text className="text-white font-bold mr-2">Pemasukan</Text>
                                <Ionicons name="arrow-up-circle" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center bg-red-600 px-4 py-3 rounded-full mb-2 shadow-lg active:scale-95"
                                onPress={() => handleNavigate('expense')}
                            >
                                <Text className="text-white font-bold mr-2">Pengeluaran</Text>
                                <Ionicons name="arrow-down-circle" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                )}

                {/* Main FAB */}
                <FloatingButton onPress={handleFabPress} />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
