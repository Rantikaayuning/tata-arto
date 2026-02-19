import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, FlatList, Platform } from 'react-native';
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

    const handleSubmit = () => {
        const numericAmount = parseNumberFromDots(amount);

        if (!numericAmount) {
            Alert.alert('Error', 'Mohon isi jumlah nominal');
            return;
        }
        if (!selectedWallet) {
            Alert.alert('Error', 'Mohon pilih dompet');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Mohon pilih kategori');
            return;
        }

        addExpense({
            amount: numericAmount,
            wallet: selectedWallet,
            category: selectedCategory,
            note,
            date: date.toISOString(),
            type: type
        });

        navigation.goBack();
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'Nama kategori tidak boleh kosong');
            return;
        }
        addCategory({
            id: Date.now().toString(),
            name: newCategoryName,
            icon: newCategoryIcon,
            type: type
        });
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
            className={`mr-3 mb-3 px-4 py-2  flex-row items-center border ${isSelected
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

    return (
        <View className="flex-1 bg-black/50 justify-end">
            <TouchableOpacity className="flex-1" onPress={() => navigation.goBack()} />
            <View className="bg-white max-h-[90%] rounded-t-3xl overflow-hidden shadow-2xl">
                <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-800">
                        {type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="p-6">
                    <View className="mb-6">
                        <Text className="text-gray-600 font-medium mb-2">Jumlah (Rp)</Text>
                        <TextInput
                            className={`w-full bg-gray-50 p-4  text-3xl font-bold border border-gray-200 focus:border-primary ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                            placeholder="0"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={handleAmountChange}
                            autoFocus={true}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-600 font-medium mb-2">Tanggal</Text>
                        <TouchableOpacity
                            className="w-full bg-gray-50 p-4  border border-gray-200 flex-row items-center"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={22} color="#4B5563" className="mr-3" />
                            <Text className="ml-3 text-gray-800 text-base">{formatDate(date.toISOString())}</Text>
                        </TouchableOpacity>
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
                                    className="flex-1 justify-center items-center bg-black/50"
                                    activeOpacity={1}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <View
                                        className="bg-white m-5 p-4  w-[90%] shadow-xl"
                                        onStartShouldSetResponder={() => true}
                                    >
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="inline"
                                            onChange={onDateChange}
                                            themeVariant="light"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowDatePicker(false)}
                                            className="mt-2 p-3 bg-gray-100  items-center"
                                        >
                                            <Text className="font-bold text-gray-700">Tutup</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                    </View>

                    {type === 'expense' ? (
                        <>
                            <View className="mb-6">
                                <Text className="text-gray-600 font-medium mb-3">Sumber Dana (Dompet)</Text>
                                <View className="flex-row flex-wrap">
                                    {wallets.map(wallet =>
                                        renderPill(
                                            wallet,
                                            selectedWallet?.id === wallet.id,
                                            () => setSelectedWallet(wallet),
                                            'bg-blue-100 border-blue-500'
                                        )
                                    )}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-600 font-medium mb-3">Kategori Pengeluaran</Text>
                                <View className="flex-row flex-wrap">
                                    {expenseCategories.map(cat =>
                                        renderPill(
                                            cat,
                                            selectedCategory?.id === cat.id,
                                            () => setSelectedCategory(cat),
                                            'bg-red-100 border-red-500'
                                        )
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        className="mr-3 mb-3 px-4 py-2  flex-row items-center border border-dashed border-gray-300 bg-gray-50"
                                    >
                                        <Ionicons name="add" size={18} color="#6B7280" />
                                        <Text className="ml-2 font-medium text-gray-500">Tambah</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="mb-6">
                                <Text className="text-gray-600 font-medium mb-3">Sumber Pemasukan</Text>
                                <View className="flex-row flex-wrap">
                                    {incomeCategories.map(cat =>
                                        renderPill(
                                            cat,
                                            selectedCategory?.id === cat.id,
                                            () => setSelectedCategory(cat),
                                            'bg-green-100 border-green-500'
                                        )
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        className="mr-3 mb-3 px-4 py-2  flex-row items-center border border-dashed border-gray-300 bg-gray-50"
                                    >
                                        <Ionicons name="add" size={18} color="#6B7280" />
                                        <Text className="ml-2 font-medium text-gray-500">Tambah</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-600 font-medium mb-3">Masuk ke Dompet</Text>
                                <View className="flex-row flex-wrap">
                                    {wallets.map(wallet =>
                                        renderPill(
                                            wallet,
                                            selectedWallet?.id === wallet.id,
                                            () => setSelectedWallet(wallet),
                                            'bg-blue-100 border-blue-500'
                                        )
                                    )}
                                </View>
                            </View>
                        </>
                    )}

                    <View className="mb-8">
                        <Text className="text-gray-600 font-medium mb-2">Catatan (Opsional)</Text>
                        <TextInput
                            className="w-full bg-gray-50 p-4  text-base text-gray-800 border border-gray-200 focus:border-primary"
                            placeholder="Tulis catatan disini..."
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />
                        <TouchableOpacity
                            className={`py-4 rounded-xl items-center shadow-lg active:opacity-90 mt-4 ${type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}
                            onPress={handleSubmit}
                        >
                            <Text className="text-white text-lg font-bold">
                                {type === 'income' ? 'Simpan Pemasukan' : 'Simpan Pengeluaran'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white  p-6 h-[80%]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-gray-800">Tambah Kategori Baru</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <Text className="text-gray-600 font-medium mb-2">Nama Kategori</Text>
                            <TextInput
                                className="bg-gray-50 p-4  border border-gray-200 mb-6 focus:border-primary"
                                placeholder="Contoh: Liburan, Freelance, dll"
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
        </View>
    );
};

export default AddExpenseScreen;
