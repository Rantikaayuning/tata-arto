import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const SearchScreen = ({ navigation }) => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const categories = useExpenseStore((state) => state.categories) || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // null means 'All'

    // Date Filter State
    const [dateFilterType, setDateFilterType] = useState('all'); // 'all', 'specific'
    const [specificDate, setSpecificDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Filter Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const filteredExpenses = useMemo(() => {
        // If no search query and no filters, return empty
        if (!searchQuery.trim() && !selectedCategory && dateFilterType === 'all') {
            return [];
        }

        return expenses.filter(expense => {
            // 1. Note Search
            const noteMatch = expense.note?.toLowerCase().includes(searchQuery.toLowerCase());

            if (searchQuery.trim() && !noteMatch) return false;

            // 2. Category Filter
            if (selectedCategory && expense.category?.id !== selectedCategory.id) {
                return false;
            }

            // 3. Date Filter
            const expenseDate = new Date(expense.date);
            if (dateFilterType === 'specific') {
                const isSameDay =
                    expenseDate.getDate() === specificDate.getDate() &&
                    expenseDate.getMonth() === specificDate.getMonth() &&
                    expenseDate.getFullYear() === specificDate.getFullYear();

                if (!isSameDay) return false;
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, searchQuery, selectedCategory, dateFilterType, specificDate]);

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setSpecificDate(selectedDate);
            if (Platform.OS === 'android') setShowDatePicker(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header / Search Bar */}
            <View className="bg-white p-4 pb-2 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-800 mb-4">Pencarian</Text>

                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-800"
                        placeholder="Cari catatan..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                    {/* Date Filter Chip */}
                    <TouchableOpacity
                        onPress={() => {
                            if (dateFilterType === 'all') {
                                setDateFilterType('specific');
                                setShowDatePicker(true);
                            } else {
                                setDateFilterType('all');
                            }
                        }}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${dateFilterType === 'specific' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                    >
                        <Ionicons name="calendar-outline" size={16} color={dateFilterType === 'specific' ? 'white' : '#4B5563'} />
                        <Text className={`ml-2 font-medium ${dateFilterType === 'specific' ? 'text-white' : 'text-gray-700'}`}>
                            {dateFilterType === 'specific' ? format(specificDate, 'dd MMM yyyy', { locale: id }) : 'Semua Tanggal'}
                        </Text>
                        {dateFilterType === 'specific' && (
                            <TouchableOpacity onPress={() => setDateFilterType('all')} className="ml-2 bg-white/20 rounded-full p-0.5">
                                <Ionicons name="close" size={12} color="white" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {/* Category Filter Chip */}
                    <TouchableOpacity
                        onPress={() => setShowCategoryModal(true)}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${selectedCategory ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                    >
                        <Ionicons name="pricetag-outline" size={16} color={selectedCategory ? 'white' : '#4B5563'} />
                        <Text className={`ml-2 font-medium ${selectedCategory ? 'text-white' : 'text-gray-700'}`}>
                            {selectedCategory ? selectedCategory.name : 'Semua Kategori'}
                        </Text>
                        {selectedCategory && (
                            <TouchableOpacity onPress={() => setSelectedCategory(null)} className="ml-2 bg-white/20 rounded-full p-0.5">
                                <Ionicons name="close" size={12} color="white" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Content */}
            <View className="flex-1 px-4 pt-4">
                <Text className="text-gray-500 mb-4 font-medium">
                    {filteredExpenses.length} transaksi ditemukan
                </Text>

                <FlatList
                    data={filteredExpenses}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ExpenseItem item={item} />}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="search-outline" size={60} color="#D1D5DB" />
                            <Text className="text-gray-400 text-lg mt-4 text-center">Tidak ada transaksi yang sesuai</Text>
                        </View>
                    }
                />
            </View>

            {/* Category Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowCategoryModal(false)}
                >
                    <View className="bg-white rounded-t-3xl p-6 h-[60%]">
                        <Text className="text-xl font-bold text-gray-800 mb-4">Pilih Kategori</Text>
                        <FlatList
                            data={categories}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="flex-row items-center p-4 border-b border-gray-100"
                                    onPress={() => {
                                        setSelectedCategory(item);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <View className={`p-2 rounded-full mr-3 ${item.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Ionicons name={item.icon} size={20} color={item.type === 'income' ? '#16A34A' : '#DC2626'} />
                                    </View>
                                    <Text className="text-gray-800 font-medium text-base">{item.name}</Text>
                                    {selectedCategory?.id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#528567" className="ml-auto" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Picker Modal (iOS/Android handling) */}
            {dateFilterType === 'specific' && showDatePicker && (
                Platform.OS === 'ios' ? (
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
                            <View className="bg-white m-5 p-4 rounded-xl w-[90%] shadow-xl">
                                <DateTimePicker
                                    value={specificDate}
                                    mode="date"
                                    display="inline"
                                    onChange={onDateChange}
                                    themeVariant="light"
                                />
                                <TouchableOpacity onPress={() => setShowDatePicker(false)} className="mt-2 p-3 bg-primary rounded-lg items-center">
                                    <Text className="text-white font-bold">OK</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={specificDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )
            )}

        </SafeAreaView>
    );
};

export default SearchScreen;
