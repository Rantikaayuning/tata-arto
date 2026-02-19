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
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-extrabold text-primary tracking-tighter mb-6">Pencarian</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white shadow-lg shadow-indigo-100/50 rounded-[20px] px-5 py-4 mb-6">
                    <Ionicons name="search" size={24} color="#343B71" />
                    <TextInput
                        className="flex-1 ml-4 text-lg font-bold text-gray-800"
                        placeholder="Cari catatan..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2" contentContainerStyle={{ paddingBottom: 10 }}>
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
                        className={`flex-row items-center px-5 py-2.5 rounded-full mr-3 border-0 ${dateFilterType === 'specific'
                                ? 'bg-primary shadow-lg shadow-indigo-500/30'
                                : 'bg-white shadow-sm shadow-indigo-100/30'
                            }`}
                    >
                        <Ionicons name="calendar-outline" size={18} color={dateFilterType === 'specific' ? 'white' : '#64748B'} />
                        <Text className={`ml-2 font-bold text-xs uppercase tracking-wider ${dateFilterType === 'specific' ? 'text-white' : 'text-gray-500'}`}>
                            {dateFilterType === 'specific' ? format(specificDate, 'dd MMM', { locale: id }) : 'Tanggal'}
                        </Text>
                        {dateFilterType === 'specific' && (
                            <View className="ml-2 bg-white/20 rounded-full p-0.5">
                                <Ionicons name="close" size={10} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Category Filter Chip */}
                    <TouchableOpacity
                        onPress={() => setShowCategoryModal(true)}
                        className={`flex-row items-center px-5 py-2.5 rounded-full mr-3 border-0 ${selectedCategory
                                ? 'bg-primary shadow-lg shadow-indigo-500/30'
                                : 'bg-white shadow-sm shadow-indigo-100/30'
                            }`}
                    >
                        <Ionicons name="pricetag-outline" size={18} color={selectedCategory ? 'white' : '#64748B'} />
                        <Text className={`ml-2 font-bold text-xs uppercase tracking-wider ${selectedCategory ? 'text-white' : 'text-gray-500'}`}>
                            {selectedCategory ? selectedCategory.name : 'Kategori'}
                        </Text>
                        {selectedCategory && (
                            <View className="ml-2 bg-white/20 rounded-full p-0.5">
                                <Ionicons name="close" size={10} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Content */}
            <View className="flex-1 px-6">
                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-1">
                    {filteredExpenses.length} transaksi ditemukan
                </Text>

                <FlatList
                    data={filteredExpenses}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ExpenseItem item={item} />}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20 opacity-50">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="search" size={40} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider text-center">Tidak ada hasil</Text>
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
