import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import { formatCurrency } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const PocketDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { wallet } = route.params || {};

    if (!wallet) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-4 bg-gray-100 rounded-lg">
                    <Text className="text-gray-500">Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const expenses = useExpenseStore((state) => state.expenses) || [];

    const walletExpenses = useMemo(() => {
        return expenses
            .filter(e => e.wallet && e.wallet.id === wallet.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, wallet.id]);

    const currentBalance = useMemo(() => {
        let bal = 0;
        expenses.forEach(tx => {
            if (tx.wallet && tx.wallet.id === wallet.id) {
                if (tx.type === 'income') bal += parseFloat(tx.amount);
                else bal -= parseFloat(tx.amount);
            }
        });
        return bal;
    }, [expenses, wallet.id]);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 pt-2 flex-row items-center border-b border-gray-100 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-100">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>{wallet.name}</Text>
                    <Text className="text-gray-500 text-xs">Detail Transaksi</Text>
                </View>
                <View className={`p-2 rounded-full bg-gray-50 border border-gray-100`}>
                    <Ionicons name={wallet.icon} size={24} color="#528567" />
                </View>
            </View>

            <View className="flex-1">
                {/* Summary Card */}
                <View className="mx-4 mt-6 mb-2 p-5 bg-primary rounded-2xl shadow-lg shadow-green-900/10">
                    <Text className="text-green-50 text-sm font-medium mb-1">Saldo Saat Ini</Text>
                    <Text className="text-3xl font-bold text-white tracking-tight">
                        {formatCurrency(currentBalance)}
                    </Text>
                </View>

                {/* List */}
                <View className="flex-1 px-4 mt-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">Riwayat {walletExpenses.length > 0 ? `(${walletExpenses.length})` : ''}</Text>
                    </View>

                    <FlatList
                        data={walletExpenses}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <ExpenseItem item={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20 opacity-50">
                                <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-4 font-medium">Belum ada transaksi</Text>
                                <Text className="text-gray-400 text-xs">di dompet ini</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default PocketDetailScreen;
