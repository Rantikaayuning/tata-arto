import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
import useExpenseStore from '../context/useExpenseStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatNumberWithDots, parseNumberFromDots, formatDate } from '../utils/format';
import { Wallet, Category, TransactionType } from '../types';

const AddExpenseScreen = ({ navigation, route }: any) => {
    const addExpense = useExpenseStore((state) => state.addExpense);
    const categories = useExpenseStore((state) => state.categories) || [];
    const wallets = useExpenseStore((state) => state.wallets) || [];
    const addCategory = useExpenseStore((state) => state.addCategory);

    const initialType = route.params?.initialType || 'expense';

    const [type, setType] = useState<TransactionType>(initialType);
    const [amount, setAmount] = useState('');

    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('star');

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    useEffect(() => {
        // Reset category when type changes, but keep wallet if possible
        setSelectedCategory(null);
        if (wallets.length > 0 && !selectedWallet) {
            setSelectedWallet(wallets[0]);
        }
    }, [type, wallets]);

    const handleAmountChange = (text: string) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const formatted = formatNumberWithDots(cleanText);
        setAmount(formatted);
    };

    const handleSubmit = async () => {
        const numericAmount = parseNumberFromDots(amount);

        if (!numericAmount) {
            Alert.alert('Error', 'Mohon isi jumlah nominal');
            return;
        }
        if (!selectedWallet) {
            Alert.alert('Error', 'Mohon pilih dompet');
            return;
        }

        let finalCategory = selectedCategory;

        if (type === 'income') {
            const incomeCat = categories.find(c => c.type === 'income');
            if (incomeCat) {
                finalCategory = incomeCat;
            } else {
                finalCategory = await addCategory({
                    name: 'Pendapatan',
                    icon: 'cash',
                    type: 'income'
                }) || null;
            }
        }

        if (!finalCategory) {
            Alert.alert('Error', 'Gagal membuat atau memilih kategori. Silahkan coba lagi.');
            return;
        }

        // Fire addExpense
        await addExpense({
            amount: numericAmount,
            wallet: selectedWallet,
            category: finalCategory,
            note,
            date: date.toISOString(),
            type: type
        });

        navigation.goBack();
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'Nama kategori tidak boleh kosong');
            return;
        }
        const createdCat = await addCategory({
            name: newCategoryName,
            icon: newCategoryIcon,
            type: type
        });

        if (createdCat) {
            setSelectedCategory(createdCat);
        }

        setNewCategoryName('');
        setModalVisible(false);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const availableIcons = [
        'fast-food', 'restaurant', 'cafe', 'wine', 'beer',
        'bus', 'car', 'bicycle', 'airplane', 'walk',
        'cart', 'bag-handle', 'shirt', 'watch',
        'home', 'flash', 'water', 'wifi',
        'film', 'game-controller', 'musical-notes', 'ticket',
        'briefcase', 'wallet', 'cash', 'card',
        'school', 'book', 'medkit', 'bandage',
        'gift', 'heart', 'star', 'ellipsis-horizontal'
    ];

    const renderIconItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            onPress={() => setNewCategoryIcon(item)}
            className={`w-12 h-12  items-center justify-center m-2 ${newCategoryIcon === item ? 'bg-primary border-primary border' : 'bg-gray-100'}`}
        >
            <Ionicons name={item as any} size={24} color={newCategoryIcon === item ? 'white' : '#4B5563'} />
        </TouchableOpacity>
    );

    const renderPill = (item: Category | Wallet, isSelected: boolean, onPress: () => void, colorClass: string) => (
        <TouchableOpacity
            key={item.id}
            onPress={onPress}
            className={`mr-3 px-4 py-2 rounded-2xl flex-row items-center border ${isSelected
                ? colorClass
                : 'bg-white border-gray-200'
                }`}
        >
            <Ionicons name={item.icon as any || 'help'} size={18} color={isSelected ? '#1F2937' : '#6B7280'} />
            <Text className={`ml-2 font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const isFormValid = type === 'income' ? !!(amount && selectedWallet) : !!(amount && selectedWallet && selectedCategory);

    return (
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <TouchableOpacity
                className="absolute inset-0"
                onPress={() => navigation.goBack()}
                activeOpacity={1}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                className="w-full max-h-[85%]"
            >
                <View className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full android:elevation-10">
                    {/* Header */}
                    <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                        <Text className="text-xl font-bold text-gray-800">
                            {type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6" keyboardShouldPersistTaps="handled">
                        {/* 1. Main Input Area: Amount & Date */}
                        <View className="flex-row items-start mb-6 w-full">
                            {/* Amount Input */}
                            <View className="flex-1 mr-3">
                                <Text className="text-gray-400 text-xs font-bold mb-1.5 uppercase tracking-wider">Nominal</Text>
                                <TextInput
                                    className="w-full bg-gray-50 p-4 min-h-[64px] rounded-2xl text-2xl font-bold border border-gray-200 focus:border-primary text-primary"
                                    placeholder="0"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={handleAmountChange}
                                    autoFocus={true}
                                />
                            </View>

                            {/* Date Button (Compact) */}
                            <View>
                                <Text className="text-gray-400 text-xs font-bold mb-1.5 uppercase tracking-wider">Tanggal</Text>
                                <TouchableOpacity
                                    className="bg-gray-50 p-3 rounded-2xl border border-gray-200 items-center justify-center min-h-[64px] min-w-[64px]"
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <View className="items-center">
                                        <Text className="text-sm font-bold text-gray-800">{date.getDate()}</Text>
                                        <Text className="text-[11px] text-gray-500">{date.toLocaleString('default', { month: 'short' })}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date Picker Logic */}
                        {showDatePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                        {Platform.OS === 'ios' && (
                            <Modal
                                transparent={true}
                                animationType="fade"
                                visible={showDatePicker}
                                onRequestClose={() => setShowDatePicker(false)}
                            >
                                <TouchableOpacity
                                    className="flex-1 justify-center items-center bg-black/60"
                                    activeOpacity={1}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <View className="bg-white w-[85%] rounded-3xl shadow-2xl overflow-hidden android:elevation-10" onStartShouldSetResponder={() => true}>
                                        <View className="px-5 py-4 flex-row justify-between items-center bg-primary">
                                            <Text className="text-lg font-bold text-white">Pilih Tanggal</Text>
                                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                <Ionicons name="close-circle" size={24} color="white" />
                                            </TouchableOpacity>
                                        </View>

                                        <View className="p-2">
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="inline"
                                                onChange={onDateChange}
                                                themeVariant="light"
                                                accentColor="#343B71"
                                            />
                                        </View>

                                        <View className="p-5 pt-0">
                                            <TouchableOpacity
                                                onPress={() => setShowDatePicker(false)}
                                                className="py-3.5 rounded-2xl items-center shadow-sm active:opacity-90 bg-primary android:elevation-3"
                                            >
                                                <Text className="font-bold text-white text-base">Konfirmasi</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        )}


                        {/* 2. Wallets (Horizontal Scroll) */}
                        <View className="mb-6">
                            <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                                {type === 'income' ? 'Masuk ke Dompet' : 'Sumber Dana'}
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {wallets.map(wallet =>
                                    renderPill(
                                        wallet,
                                        selectedWallet?.id === wallet.id,
                                        () => setSelectedWallet(wallet),
                                        'bg-indigo-50 border-primary'
                                    )
                                )}
                            </ScrollView>
                        </View>

                        {/* 3. Categories (Horizontal Scroll) - ONLY FOR EXPENSE */}
                        {type === 'expense' && (
                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Kategori</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                    {(type === 'expense' ? expenseCategories : incomeCategories).map(cat =>
                                        renderPill(
                                            cat,
                                            selectedCategory?.id === cat.id,
                                            () => setSelectedCategory(cat),
                                            'bg-indigo-50 border-primary'
                                        )
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        className="mr-3 px-4 py-2 rounded-2xl flex-row items-center border border-dashed border-gray-300 bg-gray-50"
                                    >
                                        <Ionicons name="add" size={18} color="#6B7280" />
                                        <Text className="ml-2 font-medium text-gray-500">Baru</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}

                        {/* 4. Note Input */}
                        <View className="mb-8">
                            <Text className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Catatan</Text>
                            <TextInput
                                className="w-full bg-gray-50 p-4 rounded-2xl text-base text-gray-800 border border-gray-200 focus:border-primary"
                                placeholder="Tulis catatan (opsional)..."
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        {/* 5. Save Button (Inside ScrollView, validating form) */}
                        <TouchableOpacity
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-2xl items-center shadow-md mb-6 android:elevation-5 ${!isFormValid
                                ? 'bg-gray-200'
                                : 'bg-primary'
                                }`}
                            onPress={handleSubmit}
                        >
                            <Text className={`font-bold text-lg ${!isFormValid ? 'text-gray-400' : 'text-white'}`}>
                                {type === 'income' ? 'Simpan Pemasukan' : 'Simpan Pengeluaran'}
                            </Text>
                        </TouchableOpacity>

                    </ScrollView>

                    {/* Add Category Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-gray-800">Kategori Baru</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#374151" />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-gray-600 font-medium mb-2">Nama Kategori</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 focus:border-primary"
                                    placeholder="Contoh: Belanja, Gaji, dll"
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                />

                                <Text className="text-gray-600 font-medium mb-2">Pilih Ikon</Text>
                                <View className="flex-1">
                                    <FlatList
                                        data={availableIcons}
                                        renderItem={renderIconItem}
                                        keyExtractor={item => item}
                                        numColumns={5}
                                        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </View>

                                <TouchableOpacity
                                    className="bg-primary py-4 rounded-xl items-center mt-4"
                                    onPress={handleAddCategory}
                                >
                                    <Text className="text-white font-bold text-lg">Buat Kategori</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default AddExpenseScreen;
