import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, SectionList, TouchableOpacity, Pressable, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import FloatingButton from '../components/FloatingButton';
import { formatCurrency, formatMonth } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isSameMonth, getYear, setYear, setMonth, format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEM_WIDTH = 80; // Width for horizontal year item

const HomeScreen = ({ navigation }) => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const [isFabOpen, setIsFabOpen] = useState(false);

    // Month Selection State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMonthModalVisible, setMonthModalVisible] = useState(false);

    // For Modal Logic
    const [tempYear, setTempYear] = useState(getYear(new Date()));
    const yearListRef = useRef(null);

    const handleOpenModal = () => {
        setTempYear(getYear(selectedDate));
        setMonthModalVisible(true);
    };

    const handleSelectMonth = (monthIndex) => {
        const newDate = setMonth(setYear(selectedDate, tempYear), monthIndex);
        setSelectedDate(newDate);
        setMonthModalVisible(false);
    };

    const availableYears = useMemo(() => {
        const currentYear = getYear(new Date());
        // [current-14 ... current] - Ascending
        return Array.from({ length: 15 }, (_, i) => currentYear - 14 + i);
    }, []);

    const monthsNames = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return format(new Date(2000, i, 1), 'MMM', { locale: id });
        });
    }, []);

    // Scroll to selected year when modal opens
    useEffect(() => {
        if (isMonthModalVisible && yearListRef.current) {
            const index = availableYears.indexOf(tempYear);
            if (index !== -1) {
                setTimeout(() => {
                    yearListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
                }, 100);
            }
        }
    }, [isMonthModalVisible, tempYear, availableYears]);


    // FAB Expand/Collapse Animation
    const handleFabPress = () => {
        setIsFabOpen(!isFabOpen);
    };

    const handleNavigate = (type) => {
        setIsFabOpen(false);
        navigation.navigate('AddExpense', { initialType: type });
    };

    // Filtered Data
    const { filteredExpenses, totalIncome, totalExpense, globalBalance } = useMemo(() => {
        let globalInc = 0;
        let globalExp = 0;
        let monthlyInc = 0;
        let monthlyExp = 0;
        const filtered = [];

        expenses.forEach((item) => {
            const amount = parseFloat(item.amount) || 0;
            const itemDate = new Date(item.date);

            // Global Calculation
            if (item.type === 'income') {
                globalInc += amount;
            } else {
                globalExp += amount;
            }

            // Monthly Filter
            if (isSameMonth(itemDate, selectedDate)) {
                filtered.push(item);
                if (item.type === 'income') {
                    monthlyInc += amount;
                } else {
                    monthlyExp += amount;
                }
            }
        });

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            filteredExpenses: filtered,
            totalIncome: monthlyInc,
            totalExpense: monthlyExp,
            globalBalance: globalInc - globalExp
        };
    }, [expenses, selectedDate]);

    const groupedExpenses = useMemo(() => {
        if (!filteredExpenses.length) return [];

        const sections = [];
        let currentTitle = null;
        let currentSection = null;

        filteredExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const title = format(date, 'EEEE, d MMMM yyyy', { locale: id });

            if (title !== currentTitle) {
                currentTitle = title;
                currentSection = { title, data: [] };
                sections.push(currentSection);
            }
            currentSection.data.push(expense);
        });

        return sections;
    }, [filteredExpenses]);

    const renderHeader = () => (
        <View className="mb-6 px-4 pt-2">
            {/* Global Balance - Top Left */}
            {/* Sisa (Net) - Top Left (Replaced Total Aset) */}
            <View className="mb-6 mt-2">
                <Text className="text-gray-500 text-sm font-medium mb-1">Sisa Bulan Ini</Text>
                <Text className={`text-3xl font-bold tracking-tight ${totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                    {formatCurrency(totalIncome - totalExpense)}
                </Text>
            </View>

            {/* Monthly Stats Card */}
            <View className="p-5 bg-primary rounded-2xl shadow-lg shadow-green-900/20">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-green-50 text-base font-medium">Arus Kas Bulan Ini</Text>
                    <View className="bg-white/20 px-2 py-1 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                            {filteredExpenses.length} Trx
                        </Text>
                    </View>
                </View>



                <View className="flex-row gap-4">
                    <View className="flex-1 bg-white/10 p-3 rounded-xl">
                        <View className="flex-row items-center mb-1">
                            <View className="w-6 h-6 rounded-full bg-green-400/20 items-center justify-center mr-2">
                                <Ionicons name="arrow-up" size={14} color="#86EFAC" />
                            </View>
                            <Text className="text-green-100 text-xs font-medium">Pemasukan</Text>
                        </View>
                        <Text className="text-white font-bold text-base" numberOfLines={1}>
                            {formatCurrency(totalIncome)}
                        </Text>
                    </View>

                    <View className="flex-1 bg-white/10 p-3 rounded-xl">
                        <View className="flex-row items-center mb-1">
                            <View className="w-6 h-6 rounded-full bg-red-400/20 items-center justify-center mr-2">
                                <Ionicons name="arrow-down" size={14} color="#FDA4AF" />
                            </View>
                            <Text className="text-red-100 text-xs font-medium">Pengeluaran</Text>
                        </View>
                        <Text className="text-white font-bold text-base" numberOfLines={1}>
                            {formatCurrency(totalExpense)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderYearItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                setTempYear(item);
                const newDate = setYear(selectedDate, item);
                setSelectedDate(newDate);
            }}
            className={`px-4 py-2 rounded-full mr-2 h-[40px] justify-center ${getYear(selectedDate) === item ? 'bg-primary' : 'bg-gray-100'
                }`}
            style={{ width: ITEM_WIDTH }}
        >
            <Text className={`font-bold text-center ${getYear(selectedDate) === item ? 'text-white' : 'text-gray-600'
                }`}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1">
                {renderHeader()}

                <View className="flex-1 px-4">
                    {/* Month Selector Row */}
                    <View className="flex-row justify-end mb-2">
                        <TouchableOpacity
                            onPress={handleOpenModal}
                            className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm"
                        >
                            <Ionicons name="calendar-outline" size={16} color="#528567" />
                            <Text className="text-gray-700 font-bold text-sm mx-2">
                                {selectedDate ? formatMonth(selectedDate.toISOString()) : 'Pilih'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#528567" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-xl font-bold text-gray-800">Riwayat Transaksi</Text>
                    </View>

                    <SectionList
                        sections={groupedExpenses}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ExpenseItem item={item} />}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text className="text-gray-500 font-bold text-sm mt-4 mb-2 bg-gray-50 pb-1">{title}</Text>
                        )}

                        showsVerticalScrollIndicator={false}
                        stickySectionHeadersEnabled={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20">
                                <Ionicons name="clipboard-outline" size={60} color="#D1D5DB" />
                                <Text className="text-gray-400 text-lg mt-4">Belum ada transaksi</Text>
                                <Text className="text-gray-400 text-sm">di bulan ini</Text>
                            </View>
                        }
                    />
                </View>

                {isFabOpen && (
                    <Pressable
                        className="absolute inset-0 bg-black/80 z-40"
                        onPress={() => setIsFabOpen(false)}
                    >
                        <View className="absolute bottom-20 right-8 items-end z-50">
                            <TouchableOpacity
                                className="flex-row items-center bg-green-600 px-4 py-3 rounded-full mb-4 shadow-lg active:scale-95"
                                onPress={() => handleNavigate('income')}
                            >
                                <Text className="text-white font-bold mr-2">Pemasukan</Text>
                                <Ionicons name="arrow-up-circle" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center bg-red-600 px-4 py-3 rounded-full mb-2 shadow-lg active:scale-95"
                                onPress={() => handleNavigate('expense')}
                            >
                                <Text className="text-white font-bold mr-2">Pengeluaran</Text>
                                <Ionicons name="arrow-down-circle" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                )}

                <FloatingButton onPress={handleFabPress} />

                {/* Original Horizontal Date Selection Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMonthModalVisible}
                    onRequestClose={() => setMonthModalVisible(false)}
                >
                    <Pressable
                        className="flex-1 bg-black/60 justify-center items-center p-6"
                        onPress={() => setMonthModalVisible(false)}
                    >
                        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-4 shadow-2xl">
                            <View className="flex-row justify-between items-center mb-6 px-2">
                                <Text className="text-lg font-bold text-gray-800">Pilih Periode</Text>
                                <TouchableOpacity onPress={() => setMonthModalVisible(false)} className="p-1 bg-gray-100 rounded-full">
                                    <Ionicons name="close" size={20} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            {/* Year Selector (Horizontal) */}
                            <View className="mb-6 h-[50px]">
                                <FlatList
                                    ref={yearListRef}
                                    data={availableYears}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.toString()}
                                    renderItem={renderYearItem}
                                    contentContainerStyle={{ paddingHorizontal: 4 }}
                                    getItemLayout={(data, index) => (
                                        { length: ITEM_WIDTH + 8, offset: (ITEM_WIDTH + 8) * index, index }
                                    )} // Width + margin
                                    initialNumToRender={10}
                                />
                            </View>

                            {/* Month Grid */}
                            <View className="flex-row flex-wrap justify-between">
                                {monthsNames.map((monthName, index) => {
                                    const isSelected = getYear(selectedDate) === tempYear && new Date(selectedDate).getMonth() === index;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSelectMonth(index)}
                                            className={`w-[30%] py-3 mb-3 rounded-xl items-center justify-center border ${isSelected
                                                ? 'bg-primary/10 border-primary'
                                                : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <Text className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-600'}`}>
                                                {monthName}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
