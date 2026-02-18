import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, parseNumberFromDots, formatNumberWithDots } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';

const PocketsScreen = () => {
    const navigation = useNavigation();
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const wallets = useExpenseStore((state) => state.wallets) || [];
    const addWallet = useExpenseStore((state) => state.addWallet);
    const addExpense = useExpenseStore((state) => state.addExpense);
    const resetAll = useExpenseStore((state) => state.resetAll);

    const [modalVisible, setModalVisible] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');
    const [newWalletIcon, setNewWalletIcon] = useState('wallet');
    const [initialAmount, setInitialAmount] = useState('');

    const walletsList = useMemo(() => {
        const walletMap = wallets.reduce((acc, w) => {
            acc[w.id] = { ...w, balance: 0 };
            return acc;
        }, {});

        expenses.forEach(tx => {
            if (tx.wallet && walletMap[tx.wallet.id]) {
                if (tx.type === 'income') {
                    walletMap[tx.wallet.id].balance += parseFloat(tx.amount);
                } else {
                    walletMap[tx.wallet.id].balance -= parseFloat(tx.amount);
                }
            }
        });

        // Sort: 'Dompet Utama' first
        const sorted = Object.values(walletMap).sort((a, b) => {
            if (a.name === 'Dompet Utama') return -1;
            if (b.name === 'Dompet Utama') return 1;
            return 0;
        });

        // Insert 'Add Wallet' card at the second position
        const withAddButton = [...sorted];
        withAddButton.splice(1, 0, { id: 'add-new-button', isAddButton: true });

        return withAddButton;
    }, [expenses, wallets]);

    const handleAddWallet = () => {
        if (!newWalletName.trim()) {
            Alert.alert('Error', 'Nama dompet tidak boleh kosong');
            return;
        }

        const newWallet = {
            id: Date.now().toString(),
            name: newWalletName,
            icon: newWalletIcon,
            type: 'wallet'
        };

        addWallet(newWallet);

        // If initial amount is set, create an 'Income' transaction for this wallet
        const amount = parseNumberFromDots(initialAmount);
        if (amount > 0) {
            addExpense({
                amount: amount,
                wallet: newWallet, // Allocated TO this new wallet
                category: { name: 'Saldo Awal', icon: 'cash' },
                note: 'Saldo Awal Dompet',
                date: new Date().toISOString(),
                type: 'income'
            });
        }

        setNewWalletName('');
        setInitialAmount('');
        setModalVisible(false);
    };

    const handleAmountChange = (text) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const formatted = formatNumberWithDots(cleanText);
        setInitialAmount(formatted);
    };

    const handleReset = () => {
        Alert.alert(
            "Reset Data",
            "Apakah Anda yakin ingin menghapus semua data? Aplikasi akan kembali ke kondisi awal.",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: () => {
                        resetAll();
                        Alert.alert("Berhasil", "Data telah direset.");
                    }
                }
            ]
        );
    };

    const availableIcons = [
        'wallet', 'pricetag', 'card', 'cash',
        'file-tray-full', 'folder', 'save', 'briefcase',
        'stats-chart', 'pie-chart', 'lock',
        'home', 'flash', 'star', 'medkit',
        'school', 'gift', 'game-controller'
    ];

    const renderCard = ({ item }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-1 bg-gray-50 p-4 m-2 rounded-2xl border-2 border-dashed border-gray-300 min-h-[140px] justify-center items-center"
                >
                    <Ionicons name="add" size={32} color="#9CA3AF" />
                    <Text className="text-gray-500 font-medium text-sm mt-2 text-center">Buat Dompet</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                className="flex-1 bg-white p-4 m-2 rounded-2xl shadow-sm border border-gray-100 min-h-[140px] justify-between active:bg-gray-50"
                onPress={() => navigation.navigate('PocketDetail', { wallet: item })}
            >
                <View className="flex-row justify-between items-start">
                    <View className={`p-3 rounded-full ${item.name === 'Dompet Utama' ? 'bg-primary/20' : 'bg-gray-100'}`}>
                        <Ionicons name={item.icon} size={24} color={item.name === 'Dompet Utama' ? '#528567' : '#4B5563'} />
                    </View>
                    {item.balance < 0 && <Ionicons name="alert-circle" size={20} color="#DC2626" />}
                </View>

                <View>
                    <Text className="text-gray-500 font-medium text-sm mb-1">{item.name}</Text>
                    <Text className={`text-lg font-bold ${item.balance < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                        {formatCurrency(item.balance)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-6 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">Dompet Keuangan</Text>
                    <Text className="text-gray-500 text-sm mt-1">Kelola sumber dana & akun</Text>
                </View>
            </View>

            <FlatList
                data={walletsList}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 16 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <TouchableOpacity onPress={handleReset} className="mt-8 mb-8 p-4 bg-red-50 rounded-xl border border-red-100 items-center mx-4">
                        <Text className="text-red-500 font-bold">Reset Semua Data</Text>
                    </TouchableOpacity>
                }
            />

            {/* Add Wallet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">Buat Dompet Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-gray-600 font-medium mb-2">Nama Dompet</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 focus:border-primary"
                                placeholder="Contoh: Dompet Tunai, Bank BCA"
                                value={newWalletName}
                                onChangeText={setNewWalletName}
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
                                        onPress={() => setNewWalletIcon(icon)}
                                        className={`w-12 h-12 rounded-full items-center justify-center m-2 ${newWalletIcon === icon ? 'bg-primary border-primary border' : 'bg-gray-100'}`}
                                    >
                                        <Ionicons name={icon} size={24} color={newWalletIcon === icon ? 'white' : '#4B5563'} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                className="bg-primary py-4 rounded-xl items-center mb-8"
                                onPress={handleAddWallet}
                            >
                                <Text className="text-white font-bold text-lg">Simpan Dompet</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PocketsScreen;
