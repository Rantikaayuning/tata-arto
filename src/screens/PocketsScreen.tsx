import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useExpenseStore from '../context/useExpenseStore';
import { formatCurrency, parseNumberFromDots, formatNumberWithDots } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Wallet } from '../types';

const PocketsScreen = () => {
    const navigation = useNavigation<any>();
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const wallets = useExpenseStore((state) => state.wallets) || [];
    const isBalanceHidden = useExpenseStore((state) => state.isBalanceHidden);
    const addWallet = useExpenseStore((state) => state.addWallet);
    const addExpense = useExpenseStore((state) => state.addExpense);
    const user = useExpenseStore((state) => state.user);
    const categories = useExpenseStore((state) => state.categories) || [];
    const addCategory = useExpenseStore((state) => state.addCategory);

    const [modalVisible, setModalVisible] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');
    const [newWalletIcon, setNewWalletIcon] = useState('wallet');
    const [initialAmount, setInitialAmount] = useState('');

    const renderHiddenAmount = (amount: number) => isBalanceHidden ? '••••••' : formatCurrency(amount);

    const walletsList = useMemo(() => {
        const walletMap = wallets.reduce((acc: { [key: string]: Wallet }, w) => {
            acc[w.id] = { ...w, balance: 0 };
            return acc;
        }, {});

        expenses.forEach(tx => {
            if (tx.wallet && walletMap[tx.wallet.id]) {
                const amount = parseFloat(tx.amount.toString());
                if (tx.type === 'income') {
                    walletMap[tx.wallet.id].balance = (walletMap[tx.wallet.id].balance || 0) + amount;
                } else {
                    walletMap[tx.wallet.id].balance = (walletMap[tx.wallet.id].balance || 0) - amount;
                }
            }
        });

        const sorted = Object.values(walletMap).sort((a, b) => {
            if (a.name === 'Dompet Utama') return -1;
            if (b.name === 'Dompet Utama') return 1;
            return 0;
        });

        const withAddButton = [...sorted, { id: 'add-new-button', name: 'Add', icon: 'add', type: 'wallet', isAddButton: true } as Wallet];

        return withAddButton;
    }, [expenses, wallets]);

    const totalAssets = useMemo(() => {
        return walletsList
            .filter(item => !item.isAddButton)
            .reduce((sum, item) => sum + (item.balance || 0), 0);
    }, [walletsList]);

    const handleAddWallet = async () => {
        if (!newWalletName.trim()) {
            Alert.alert('Error', 'Nama dompet tidak boleh kosong');
            return;
        }

        const newWalletData = {
            name: newWalletName,
            icon: newWalletIcon,
            type: 'wallet' as const
        };

        const createdWallet = await addWallet(newWalletData);
        if (!createdWallet) return;

        const amount = parseNumberFromDots(initialAmount);
        if (amount > 0) {
            await addExpense({
                amount: amount,
                wallet: createdWallet,
                category: undefined,
                note: 'Saldo Awal Dompet',
                date: new Date().toISOString(),
                type: 'income'
            });
        }

        setNewWalletName('');
        setInitialAmount('');
        setModalVisible(false);
    };

    const handleAmountChange = (text: string) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const formatted = formatNumberWithDots(cleanText);
        setInitialAmount(formatted);
    };

    const availableIcons = [
        'wallet', 'pricetag', 'card', 'cash',
        'file-tray-full', 'folder', 'save', 'briefcase',
        'stats-chart', 'pie-chart', 'lock',
        'home', 'flash', 'star', 'medkit',
        'school', 'gift', 'game-controller'
    ];

    const renderCard = ({ item }: { item: Wallet }) => {
        if (item.isAddButton) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        if (!user) {
                            navigation.navigate('Login');
                            return;
                        }
                        setModalVisible(true);
                    }}
                    className="flex-1 bg-white/40 p-5 m-2 rounded-[24px] border-2 border-dashed border-gray-200 min-h-[160px] justify-center items-center max-w-[47%]"
                >
                    <View className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center mb-3">
                        <Ionicons name="add" size={24} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Tambah Dompet</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                className="flex-1 bg-white p-5 m-2 rounded-[24px] shadow-sm shadow-indigo-100/50 min-h-[160px] justify-between max-w-[47%]"
                onPress={() => navigation.navigate('PocketDetail', { wallet: item })}
            >
                <View className="flex-row justify-between items-start">
                    <View className={`w-12 h-12 rounded-full items-center justify-center ${item.name === 'Dompet Utama' ? 'bg-primary/10' : 'bg-gray-50'}`}>
                        <Ionicons name={item.icon as any} size={24} color={item.name === 'Dompet Utama' ? '#343B71' : '#64748B'} />
                    </View>
                    {(item.balance || 0) < 0 && <Ionicons name="alert-circle" size={20} color="#FB7185" />}
                </View>

                <View>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2" numberOfLines={1}>{item.name}</Text>
                    <Text
                        className={`text-xl font-extrabold tracking-tight ${(item.balance || 0) < 0 ? 'text-rose-500' : 'text-gray-900'}`}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                    >
                        {renderHiddenAmount(item.balance || 0)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-extrabold text-primary tracking-tighter mb-6">Dompet Saya</Text>

                <View className="bg-primary p-6 rounded-[32px] shadow-2xl shadow-indigo-900/30 android:elevation-10 overflow-hidden relative">
                    <View className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full" />
                    <View className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />

                    <Text className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-2">Total Aset</Text>
                    <Text className="text-4xl font-black text-white tracking-tighter shadow-sm">
                        {renderHiddenAmount(totalAssets)}
                    </Text>
                </View>
            </View>

            <FlatList
                data={walletsList}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[32px] p-8 max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-bold text-primary tracking-tight">Dompet Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-50 rounded-full">
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">Nama Dompet</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center mb-6">
                                <Ionicons name="wallet-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 font-medium text-gray-800"
                                    placeholder="Contoh: Tabungan"
                                    placeholderTextColor="#D1D5DB"
                                    value={newWalletName}
                                    onChangeText={setNewWalletName}
                                />
                            </View>

                            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">Saldo Awal</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center mb-6">
                                <Ionicons name="cash-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 font-medium text-gray-800"
                                    placeholder="Rp 0"
                                    placeholderTextColor="#D1D5DB"
                                    keyboardType="numeric"
                                    value={initialAmount}
                                    onChangeText={handleAmountChange}
                                />
                            </View>

                            <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3">Pilih Ikon</Text>
                            <View className="flex-row flex-wrap mb-8 gap-3">
                                {availableIcons.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        onPress={() => setNewWalletIcon(icon)}
                                        className={`w-14 h-14 rounded-2xl items-center justify-center ${newWalletIcon === icon ? 'bg-primary shadow-lg shadow-indigo-500/30' : 'bg-gray-50'}`}
                                    >
                                        <Ionicons name={icon as any} size={24} color={newWalletIcon === icon ? 'white' : '#64748B'} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                        </ScrollView>
                        <TouchableOpacity
                            className="bg-primary py-5 rounded-[20px] items-center mt-4 shadow-xl shadow-indigo-900/20"
                            onPress={handleAddWallet}
                        >
                            <Text className="text-white font-bold text-lg tracking-wide">Simpan Dompet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default PocketsScreen;
