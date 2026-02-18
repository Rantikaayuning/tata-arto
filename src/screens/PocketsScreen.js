import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, parseNumberFromDots, formatNumberWithDots } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const PocketsScreen = () => {
    const expenses = useExpenseStore((state) => state.expenses);
    const categories = useExpenseStore((state) => state.categories);
    const addCategory = useExpenseStore((state) => state.addCategory);
    const addExpense = useExpenseStore((state) => state.addExpense);

    const [modalVisible, setModalVisible] = useState(false);
    const [newPocketName, setNewPocketName] = useState('');
    const [newPocketIcon, setNewPocketIcon] = useState('wallet');
    const [initialAmount, setInitialAmount] = useState('');

    const pockets = useMemo(() => {
        const pocketMap = categories
            .filter(c => c.type === 'expense')
            .reduce((acc, cat) => {
                acc[cat.id] = { ...cat, balance: 0 };
                return acc;
            }, {});

        expenses.forEach(tx => {
            if (pocketMap[tx.category?.id]) {
                if (tx.type === 'income') {
                    pocketMap[tx.category.id].balance += parseFloat(tx.amount);
                } else {
                    pocketMap[tx.category.id].balance -= parseFloat(tx.amount);
                }
            }
        });

        // Sort: 'Utama' first
        return Object.values(pocketMap).sort((a, b) => {
            if (a.name === 'Utama') return -1;
            if (b.name === 'Utama') return 1;
            return 0;
        });
    }, [expenses, categories]);

    const handleAddPocket = () => {
        if (!newPocketName.trim()) {
            Alert.alert('Error', 'Nama kantong tidak boleh kosong');
            return;
        }

        const newCategory = {
            id: Date.now().toString(),
            name: newPocketName,
            icon: newPocketIcon,
            type: 'expense'
        };

        addCategory(newCategory);

        // If initial amount is set, create an 'Income' transaction for this pocket
        const amount = parseNumberFromDots(initialAmount);
        if (amount > 0) {
            addExpense({
                amount: amount,
                category: newCategory, // Allocated to this new pocket
                note: 'Saldo Awal Kantong',
                date: new Date().toISOString(),
                type: 'income'
            });
        }

        setNewPocketName('');
        setInitialAmount('');
        setModalVisible(false);
    };

    const handleAmountChange = (text) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const formatted = formatNumberWithDots(cleanText);
        setInitialAmount(formatted);
    };

    const availableIcons = [
        'wallet', 'piggy-bank', 'card', 'cash',
        'fast-food', 'restaurant', 'cafe', 'cart',
        'bus', 'car', 'airplane',
        'home', 'flash', 'wifi', 'medkit',
        'school', 'gift', 'game-controller'
    ];

    const renderCard = ({ item }) => (
        <View className="flex-1 bg-white p-4 m-2 rounded-2xl shadow-sm border border-gray-100 min-h-[140px] justify-between">
            <View className="flex-row justify-between items-start">
                <View className={`p-3 rounded-full ${item.name === 'Utama' ? 'bg-primary/20' : 'bg-gray-100'}`}>
                    <Ionicons name={item.icon} size={24} color={item.name === 'Utama' ? '#528567' : '#4B5563'} />
                </View>
                {item.balance < 0 && <Ionicons name="alert-circle" size={20} color="#DC2626" />}
            </View>

            <View>
                <Text className="text-gray-500 font-medium text-sm mb-1">{item.name}</Text>
                <Text className={`text-lg font-bold ${item.balance < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                    {formatCurrency(item.balance)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-6 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">Kantong Keuangan</Text>
                    <Text className="text-gray-500 text-sm mt-1">Kelola pos-pos pengeluaranmu</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-primary p-3 rounded-xl shadow-sm"
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={pockets}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 16 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
            />

            {/* Add Pocket Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">Buat Kantong Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-gray-600 font-medium mb-2">Nama Kantong</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 focus:border-primary"
                                placeholder="Contoh: Tabungan Liburan"
                                value={newPocketName}
                                onChangeText={setNewPocketName}
                            />

                            <Text className="text-gray-600 font-medium mb-2">Saldo Awal (Opsional)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 focus:border-primary"
                                placeholder="Rp 0"
                                keyboardType="numeric"
                                value={initialAmount}
                                onChangeText={handleAmountChange}
                            />

                            <Text className="text-gray-600 font-medium mb-2">Pilih Ikon</Text>
                            <View className="flex-row flex-wrap mb-8">
                                {availableIcons.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        onPress={() => setNewPocketIcon(icon)}
                                        className={`w-12 h-12 rounded-full items-center justify-center m-2 ${newPocketIcon === icon ? 'bg-primary border-primary border' : 'bg-gray-100'}`}
                                    >
                                        <Ionicons name={icon} size={24} color={newPocketIcon === icon ? 'white' : '#4B5563'} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                className="bg-primary py-4 rounded-xl items-center mb-8"
                                onPress={handleAddPocket}
                            >
                                <Text className="text-white font-bold text-lg">Simpan Kantong</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PocketsScreen;
