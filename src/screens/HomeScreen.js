import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, SectionList, TouchableOpacity, Pressable, Modal, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import FloatingButton from '../components/FloatingButton';
import { formatCurrency, formatMonth } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isSameMonth, getYear, setYear, setMonth, format } from 'date-fns';
import { id } from 'date-fns/locale';

const ITEM_WIDTH = 80;

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

    // Hide/Unhide Balance Logic
    const isBalanceHidden = useExpenseStore((state) => state.isBalanceHidden);
    const toggleBalanceVisibility = useExpenseStore((state) => state.toggleBalanceVisibility);

    const renderHiddenAmount = (amount) => isBalanceHidden ? '••••••' : formatCurrency(amount);

    const renderHeader = () => (
        <View className="mb-4 px-4 pt-4">
            {/* Minimalist Header */}
            <View className="items-center mb-4">
                <View className="flex-row items-center mb-2">
                    <Text className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mr-2">Total Saldo Bulan Ini</Text>
                    <TouchableOpacity onPress={toggleBalanceVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={isBalanceHidden ? "eye-off" : "eye"} size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
                <Text
                    className="text-4xl font-extrabold text-primary tracking-tighter"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                >
                    {renderHiddenAmount(totalIncome - totalExpense)}
                </Text>
            </View>

            {/* Main Stats Card (Deep Navy) */}
            <View className="p-6 bg-primary rounded-[32px] shadow-2xl shadow-indigo-900/30 android:elevation-10">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-white/60 text-xs font-medium tracking-wider uppercase mb-1">Ringkasan</Text>
                        <Text className="text-white text-lg font-bold">
                            {formatMonth(selectedDate.toISOString())}
                        </Text>
                    </View>
                    <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                        <Text className="text-white text-xs font-bold">
                            {filteredExpenses.length} Transaksi
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    {/* Income */}
                    <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                                <Ionicons name="arrow-up" size={16} color="#34D399" />
                            </View>
                            <Text className="text-emerald-100/60 text-xs font-medium uppercase tracking-wide">Masuk</Text>
                        </View>
                        <Text className="text-white font-bold text-lg tracking-tight" numberOfLines={1} adjustsFontSizeToFit>
                            {renderHiddenAmount(totalIncome)}
                        </Text>
                    </View>

                    {/* Expense */}
                    <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-rose-500/20 items-center justify-center mr-3">
                                <Ionicons name="arrow-down" size={16} color="#FB7185" />
                            </View>
                            <Text className="text-rose-100/60 text-xs font-medium uppercase tracking-wide">Keluar</Text>
                        </View>
                        <Text className="text-white font-bold text-lg tracking-tight" numberOfLines={1} adjustsFontSizeToFit>
                            {renderHiddenAmount(totalExpense)}
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
            className={`px-5 py-2 rounded-full mr-2 h-[40px] items-center justify-center border ${getYear(selectedDate) === item
                ? 'bg-primary border-primary shadow-lg shadow-indigo-500/30'
                : 'bg-white border-gray-100'
                }`}
            style={{ minWidth: ITEM_WIDTH }}
        >
            <Text className={`font-bold text-sm ${getYear(selectedDate) === item ? 'text-white' : 'text-gray-400'
                }`}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
            {/* Status Bar Handling for Android */}
            <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

            <View className="flex-1">
                {renderHeader()}

                <View className="flex-1 px-4">
                    {/* Month Selector Row */}
                    <View className="flex-row justify-end mb-2">
                        <TouchableOpacity
                            onPress={handleOpenModal}
                            className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-full shadow-sm android:elevation-2"
                        >
                            <Ionicons name="calendar-outline" size={16} color="#528567" />
                            <Text className="text-gray-700 font-bold text-sm mx-2">
                                {selectedDate ? formatMonth(selectedDate.toISOString()) : 'Pilih'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#528567" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg font-bold text-primary tracking-tight">Riwayat Transaksi</Text>
                    </View>

                    <SectionList
                        sections={groupedExpenses}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ExpenseItem item={item} />}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-6 mb-3 pl-1">{title}</Text>
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
                                className="flex-row items-center bg-green-600 px-4 py-3 rounded-full mb-4 shadow-lg active:scale-95 android:elevation-5"
                                onPress={() => handleNavigate('income')}
                            >
                                <Text className="text-white font-bold mr-2">Uang Masuk</Text>
                                <Ionicons name="wallet-outline" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center bg-red-600 px-4 py-3 rounded-full mb-2 shadow-lg active:scale-95 android:elevation-5"
                                onPress={() => handleNavigate('expense')}
                            >
                                <Text className="text-white font-bold mr-2">Uang Keluar</Text>
                                <Ionicons name="receipt-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                )}

                <FloatingButton onPress={handleFabPress} />

                {/* Date Selection Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isMonthModalVisible}
                    onRequestClose={() => setMonthModalVisible(false)}
                    statusBarTranslucent={true}
                >
                    <Pressable
                        className="flex-1 bg-black/60 justify-center items-center p-6"
                        onPress={() => setMonthModalVisible(false)}
                    >
                        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-4 shadow-2xl android:elevation-20">
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
                                    )}
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
