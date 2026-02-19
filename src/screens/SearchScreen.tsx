import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Platform, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Category } from '../types';

const SearchScreen = ({ navigation }: any) => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const categories = useExpenseStore((state) => state.categories) || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null); // null means 'All'

    // Filter State
    const [dateFilterType, setDateFilterType] = useState<'all' | 'specific'>('all');
    const [specificDate, setSpecificDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const filteredExpenses = useMemo(() => {

        // Removed early return to show all expenses by default

        return expenses.filter(expense => {
            // Note Search
            const noteMatch = (expense.note || '').toLowerCase().includes(searchQuery.toLowerCase());
            if (searchQuery.trim() && !noteMatch) return false;

            // Category Filter
            if (selectedCategory && expense.category?.id !== selectedCategory.id) {
                return false;
            }

            // Date Filter
            const expenseDate = new Date(expense.date);
            if (dateFilterType === 'specific') {
                const isSameDay =
                    expenseDate.getDate() === specificDate.getDate() &&
                    expenseDate.getMonth() === specificDate.getMonth() &&
                    expenseDate.getFullYear() === specificDate.getFullYear();

                if (!isSameDay) return false;
            }

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, searchQuery, selectedCategory, dateFilterType, specificDate]);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
            setSpecificDate(selectedDate);
            if (Platform.OS === 'android') setShowDatePicker(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F7F8FA]" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100 shadow-sm android:elevation-2 z-10">
                <Text className="text-2xl font-extrabold text-primary tracking-tighter mb-4">Cari Transaksi</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                    <Ionicons name="search" size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-3 text-base font-bold text-gray-800"
                        placeholder="Ketik catatan..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters Row */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-4"
                    contentContainerStyle={{ paddingBottom: 4 }}
                >
                    {/* Date Filter */}
                    <TouchableOpacity
                        onPress={() => {
                            if (dateFilterType === 'all') {
                                setDateFilterType('specific');
                                setShowDatePicker(true);
                            } else {
                                setDateFilterType('all');
                            }
                        }}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${dateFilterType === 'specific'
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <Ionicons name="calendar-outline" size={16} color={dateFilterType === 'specific' ? 'white' : '#64748B'} />
                        <Text className={`ml-2 font-bold text-xs uppercase tracking-wider ${dateFilterType === 'specific' ? 'text-white' : 'text-gray-600'}`}>
                            {dateFilterType === 'specific' ? format(specificDate, 'dd MMM', { locale: id }) : 'Tanggal'}
                        </Text>
                    </TouchableOpacity>

                    {/* Category Filter */}
                    <TouchableOpacity
                        onPress={() => setShowCategoryModal(true)}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${selectedCategory
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <Ionicons name="pricetag-outline" size={16} color={selectedCategory ? 'white' : '#64748B'} />
                        <Text className={`ml-2 font-bold text-xs uppercase tracking-wider ${selectedCategory ? 'text-white' : 'text-gray-600'}`}>
                            {selectedCategory ? selectedCategory.name : 'Kategori'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Results List */}
            <View className="flex-1 px-6 pt-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest ml-1">Hasil Pencarian</Text>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">{filteredExpenses.length} item</Text>
                </View>

                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item }) => <ExpenseItem item={item} />}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20 opacity-50">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="search" size={40} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider text-center">
                                {searchQuery || selectedCategory || dateFilterType === 'specific' ? 'Tidak ditemukan' : 'Belum ada transaksi'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* Category Modal (Revamped) */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/60 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowCategoryModal(false)}
                >
                    <View className="bg-white rounded-t-[32px] max-h-[70%] overflow-hidden shadow-2xl android:elevation-20">
                        <View className="px-6 py-4 flex-row justify-between items-center bg-primary">
                            <Text className="text-lg font-bold text-white">Filter Kategori</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <Ionicons name="close-circle" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Pressable onPress={() => { setSelectedCategory(null); setShowCategoryModal(false); }} className="p-4 border-b border-gray-100 flex-row items-center bg-gray-50">
                            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                                <Ionicons name="grid" size={20} color="#6B7280" />
                            </View>
                            <Text className="text-gray-800 font-bold text-base">Semua Kategori</Text>
                        </Pressable>

                        <FlatList
                            data={categories}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`flex-row items-center p-4 border-b border-gray-50 ${selectedCategory?.id === item.id ? 'bg-indigo-50' : 'bg-white'}`}
                                    onPress={() => {
                                        setSelectedCategory(item);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                        <Ionicons name={item.icon as any} size={20} color={item.type === 'income' ? '#10B981' : '#F43F5E'} />
                                    </View>
                                    <Text className="text-gray-800 font-bold text-base flex-1">{item.name}</Text>
                                    {selectedCategory?.id === item.id && (
                                        <Ionicons name="checkmark-circle" size={24} color="#343B71" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Picker Modal (Revamped) */}
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
                        <View className="bg-white w-[85%] rounded-[28px] shadow-2xl overflow-hidden android:elevation-10" onStartShouldSetResponder={() => true}>
                            <View className="px-5 py-4 flex-row justify-between items-center bg-primary">
                                <Text className="text-lg font-bold text-white">Filter Tanggal</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Ionicons name="close-circle" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View className="p-2">
                                <DateTimePicker
                                    value={specificDate}
                                    mode="date"
                                    display="inline"
                                    onChange={onDateChange}
                                    themeVariant="light"
                                    accentColor="#343B71"
                                />
                            </View>

                            <View className="p-5 pt-0">
                                <TouchableOpacity
                                    onPress={() => {
                                        // Ensure date is set (onChange handles it, but verify)
                                        setDateFilterType('specific');
                                        setShowDatePicker(false);
                                    }}
                                    className="py-3.5 rounded-2xl items-center shadow-sm active:opacity-90 bg-primary android:elevation-3"
                                >
                                    <Text className="font-bold text-white text-base">Terapkan Filter</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={specificDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </SafeAreaView>
    );
};



export default SearchScreen;
