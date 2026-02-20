import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, SectionList, TouchableOpacity, Pressable, Modal, StatusBar, FlatListProps, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExpenseStore from '../context/useExpenseStore';
import ExpenseItem from '../components/ExpenseItem';
import FloatingButton from '../components/FloatingButton';
import { formatCurrency, formatMonth } from '../utils/format';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isSameMonth, getYear, setYear, setMonth, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Expense } from '../types';
import { Logo } from '../components/Logo';

const ITEM_WIDTH = 80;

interface Section {
    title: string;
    data: Expense[];
}

const HomeScreen = ({ navigation }: any) => {
    const expenses = useExpenseStore((state) => state.expenses) || [];
    const user = useExpenseStore((state) => state.user);
    const logout = useExpenseStore((state) => state.logout);
    const [isFabOpen, setIsFabOpen] = useState(false);

    // Month Selection State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMonthModalVisible, setMonthModalVisible] = useState(false);

    // For Modal Logic
    const [tempYear, setTempYear] = useState(getYear(new Date()));
    const [tempMonth, setTempMonth] = useState(new Date().getMonth());
    const yearListRef = useRef<FlatList>(null);
    const monthListRef = useRef<FlatList>(null);

    const handleOpenModal = () => {
        setTempYear(getYear(selectedDate));
        setTempMonth(selectedDate.getMonth());
        setMonthModalVisible(true);
    };

    const handleConfirmSelection = () => {
        const newDate = setMonth(setYear(selectedDate, tempYear), tempMonth);
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
    // Scroll to selected items when modal opens
    useEffect(() => {
        if (isMonthModalVisible) {
            setTimeout(() => {
                const yearIndex = availableYears.indexOf(tempYear);
                if (yearIndex !== -1 && yearListRef.current) {
                    yearListRef.current.scrollToOffset({ offset: yearIndex * 50, animated: false });
                }
                if (monthListRef.current) {
                    monthListRef.current.scrollToOffset({ offset: tempMonth * 50, animated: false });
                }
            }, 300);
        }
    }, [isMonthModalVisible]);


    // FAB Expand/Collapse Animation
    const handleFabPress = () => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }
        setIsFabOpen(!isFabOpen);
    };

    const handleNavigate = (type: 'income' | 'expense') => {
        setIsFabOpen(false);
        navigation.navigate('AddExpense', { initialType: type });
    };

    // Filtered Data
    const { filteredExpenses, totalIncome, totalExpense } = useMemo(() => {
        let globalInc = 0;
        let globalExp = 0;
        let monthlyInc = 0;
        let monthlyExp = 0;
        const filtered: Expense[] = [];

        expenses.forEach((item) => {
            const amount = parseFloat(item.amount.toString()) || 0;
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

        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            filteredExpenses: filtered,
            totalIncome: monthlyInc,
            totalExpense: monthlyExp,
            globalBalance: globalInc - globalExp
        };
    }, [expenses, selectedDate]);

    const groupedExpenses = useMemo(() => {
        if (!filteredExpenses.length) return [];

        const sections: Section[] = [];
        let currentTitle: string | null = null;
        let currentSection: Section | null = null;

        filteredExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const title = format(date, 'EEEE, d MMMM yyyy', { locale: id });

            if (title !== currentTitle) {
                currentTitle = title;
                currentSection = { title, data: [] };
                sections.push(currentSection);
            }
            if (currentSection) {
                currentSection.data.push(expense);
            }
        });

        return sections;
    }, [filteredExpenses]);

    // Hide/Unhide Balance Logic
    const isBalanceHidden = useExpenseStore((state) => state.isBalanceHidden);
    const toggleBalanceVisibility = useExpenseStore((state) => state.toggleBalanceVisibility);

    const renderHiddenAmount = (amount: number) => isBalanceHidden ? '••••••' : formatCurrency(amount);

    const renderHeader = () => (
        <View className="mb-4 px-4 pt-4">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 shadow-sm border border-gray-100">
                        <Logo width={24} height={24} />
                    </View>
                    <Text className="text-xl font-black text-primary tracking-tighter">tata arto.</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (!user) {
                            navigation.navigate('Login');
                            return;
                        }
                        navigation.navigate('Members');
                    }}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm active:bg-gray-50"
                >
                    <Ionicons name="people" size={20} color="#343B71" />
                </TouchableOpacity>
            </View>

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

    const renderYearItem = ({ item }: { item: number }) => (
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
                        keyExtractor={(item, index) => item.id || index.toString()}
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
                        <View className="bg-white rounded-2xl w-[90%] overflow-hidden p-6 shadow-2xl android:elevation-20 items-center">
                            <View className="flex-row justify-between items-center mb-6 w-full">
                                <Text className="text-xl font-bold text-primary">Pilih Periode</Text>
                                <TouchableOpacity onPress={() => setMonthModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            {/* Wheel Pickers Container */}
                            <View
                                className="flex-row h-[150px] w-full mb-6 relative"
                                key={isMonthModalVisible.toString()}
                            >
                                {/* Selection Overlay (Center Highlight) */}
                                <View className="absolute top-[50px] left-0 right-0 h-[50px] border-t border-b border-gray-200 bg-gray-50 -z-10 rounded-lg" pointerEvents="none" />

                                {/* Month Picker */}
                                <View className="flex-1 mr-2">
                                    <FlatList
                                        ref={monthListRef}
                                        data={monthsNames}
                                        keyExtractor={(_, i) => i.toString()}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={50}
                                        decelerationRate="fast"
                                        contentContainerStyle={{ paddingVertical: 50 }}
                                        getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
                                        initialScrollIndex={tempMonth}
                                        onMomentumScrollEnd={(e) => {
                                            const index = Math.round(e.nativeEvent.contentOffset.y / 50);
                                            if (index >= 0 && index < monthsNames.length) setTempMonth(index);
                                        }}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}
                                                onPress={() => {
                                                    setTempMonth(index);
                                                    monthListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                                                }}
                                            >
                                                <Text className={`text-lg ${tempMonth === index ? 'font-bold text-primary' : 'text-gray-400'}`}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>

                                {/* Year Picker */}
                                <View className="flex-1 ml-2">
                                    <FlatList
                                        ref={yearListRef}
                                        data={availableYears}
                                        keyExtractor={(item) => item.toString()}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={50}
                                        decelerationRate="fast"
                                        contentContainerStyle={{ paddingVertical: 50 }}
                                        getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
                                        initialScrollIndex={availableYears.indexOf(tempYear)}
                                        onMomentumScrollEnd={(e) => {
                                            const index = Math.round(e.nativeEvent.contentOffset.y / 50);
                                            if (index >= 0 && index < availableYears.length) setTempYear(availableYears[index]);
                                        }}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}
                                                onPress={() => {
                                                    setTempYear(item);
                                                    yearListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
                                                }}
                                            >
                                                <Text className={`text-lg ${tempYear === item ? 'font-bold text-primary' : 'text-gray-400'}`}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleConfirmSelection}
                                className="w-full bg-primary py-4 rounded-xl items-center shadow-md active:opacity-90 android:elevation-5"
                            >
                                <Text className="text-white font-bold text-lg">Pilih Periode</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
