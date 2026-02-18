import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView, Modal, FlatList } from 'react-native';
import useExpenseStore from '../context/useExpenseStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatNumberWithDots, parseNumberFromDots, formatDate } from '../utils/format';

const AddExpenseScreen = ({ navigation, route }) => {
    const addExpense = useExpenseStore((state) => state.addExpense);
    const categories = useExpenseStore((state) => state.categories);
    const addCategory = useExpenseStore((state) => state.addCategory);

    const initialType = route.params?.initialType || 'expense';

    const [type, setType] = useState(initialType);
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // New Category States
    const [modalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('star');

    // Logic: 
    // If Type == Expense: Show only 'expense' categories relative to logic
    // If Type == Income: Show 'income' categories AND 'expense' categories (as Pockets to fill)
    // Let's create two sections for Income: "Sources" (Gaji, Bonus) and "Pockets" (Makan, Bensin...)

    const incomeSources = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    useEffect(() => {
        // Reset selection when type changes to prevent mismatch
        setSelectedCategory(null);
    }, [type]);

    const handleAmountChange = (text) => {
        const cleanText = text.replace(/[^0-9]/g, '');
        const formatted = formatNumberWithDots(cleanText);
        setAmount(formatted);
    };

    const handleSubmit = () => {
        const numericAmount = parseNumberFromDots(amount);

        if (!numericAmount || !selectedCategory) {
            Alert.alert('Error', 'Mohon isi jumlah dan pilih kategori');
            return;
        }

        addExpense({
            amount: numericAmount,
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

    const onDateChange = (event, selectedDate) => {
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

    const renderIconItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => setNewCategoryIcon(item)}
            className={`w-12 h-12 rounded-full items-center justify-center m-2 ${newCategoryIcon === item ? 'bg-primary border-primary border' : 'bg-gray-100'}`}
        >
            <Ionicons name={item} size={24} color={newCategoryIcon === item ? 'white' : '#4B5563'} />
        </TouchableOpacity>
    );

    const renderCategoryPill = (cat) => (
        <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat)}
            className={`mr-3 mb-3 px-4 py-2 rounded-full flex-row items-center border ${selectedCategory?.id === cat.id
                    ? (type === 'income' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500')
                    : 'bg-white border-gray-200'
                }`}
        >
            <Ionicons name={cat.icon || 'help'} size={18} color={selectedCategory?.id === cat.id ? '#1F2937' : '#6B7280'} />
            <Text className={`ml-2 font-medium ${selectedCategory?.id === cat.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {cat.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-800">
                    {type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-100 rounded-full">
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView className="p-6">
                {/* Type Selector */}
                <View className="flex-row mb-6 bg-gray-100 p-1 rounded-xl">
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
                        onPress={() => setType('expense')}
                    >
                        <Ionicons name="arrow-down-circle" size={22} color={type === 'expense' ? '#DC2626' : '#9CA3AF'} />
                        <Text className={`ml-2 font-semibold ${type === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>Pengeluaran</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
                        onPress={() => setType('income')}
                    >
                        <Ionicons name="arrow-up-circle" size={22} color={type === 'income' ? '#16A34A' : '#9CA3AF'} />
                        <Text className={`ml-2 font-semibold ${type === 'income' ? 'text-green-600' : 'text-gray-500'}`}>Pemasukan</Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-2">Jumlah (Rp)</Text>
                    <TextInput
                        className={`w-full bg-gray-50 p-4 rounded-xl text-3xl font-bold border border-gray-200 focus:border-primary ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                        placeholder="0"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={handleAmountChange}
                        autoFocus={true}
                    />
                </View>

                {/* Categories */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-3">Kategori</Text>
                    <View className="flex-row flex-wrap">
                        {type === 'expense' ? (
                            // Expense Mode: Show only expense categories
                            <>
                                {expenseCategories.map(renderCategoryPill)}
                            </>
                        ) : (
                            // Income Mode: Show Income Sources + Pockets (Expense Categories)
                            <>
                                <View className="w-full mb-2"><Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sumber Dana</Text></View>
                                {incomeSources.map(renderCategoryPill)}

                                <View className="w-full mt-4 mb-2"><Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Isi Kantong (Alokasi)</Text></View>
                                {expenseCategories.map(renderCategoryPill)}
                            </>
                        )}

                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="mr-3 mb-3 px-4 py-2 rounded-full flex-row items-center border border-dashed border-gray-300 bg-gray-50"
                        >
                            <Ionicons name="add" size={18} color="#6B7280" />
                            <Text className="ml-2 font-medium text-gray-500">Tambah</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date/Notes omitted for brevity in thought, but included here */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-medium mb-2">Tanggal</Text>
                    <TouchableOpacity
                        className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row items-center"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar" size={22} color="#4B5563" className="mr-3" />
                        <Text className="ml-3 text-gray-800 text-base">{formatDate(date.toISOString())}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}
                </View>

                <View className="mb-8">
                    <Text className="text-gray-600 font-medium mb-2">Catatan (Opsional)</Text>
                    <TextInput
                        className="w-full bg-gray-50 p-4 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-primary"
                        placeholder="Tulis catatan disini..."
                        value={note}
                        onChangeText={setNote}
                        multiline
                    />
                </View>

                <TouchableOpacity
                    className={`py-4 rounded-xl items-center shadow-lg active:opacity-90 ${type === 'income' ? 'bg-green-600' : 'bg-red-600'}`}
                    onPress={handleSubmit}
                >
                    <Text className="text-white text-lg font-bold">
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
                            <Text className="text-xl font-bold text-gray-800">Tambah Kategori Baru</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 font-medium mb-2">Nama Kategori</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 focus:border-primary"
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

        </SafeAreaView>
    );
};

export default AddExpenseScreen;
