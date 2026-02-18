import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useExpenseStore = create(
    persist(
        (set, get) => ({
            expenses: [],
            wallets: [
                { id: '1', name: 'Dompet Utama', icon: 'wallet', type: 'wallet' }
            ],
            categories: [
                // Expense Categories
                { id: 'c1', name: 'Makan & Minum', icon: 'fast-food', type: 'expense' },
                { id: 'c2', name: 'Transportasi', icon: 'bus', type: 'expense' },
                { id: 'c3', name: 'Belanja', icon: 'cart', type: 'expense' },
                { id: 'c4', name: 'Tagihan', icon: 'receipt', type: 'expense' },
                { id: 'c5', name: 'Hiburan', icon: 'game-controller', type: 'expense' },
                { id: 'c6', name: 'Kesehatan', icon: 'medkit', type: 'expense' },
                { id: 'c7', name: 'Pendidikan', icon: 'school', type: 'expense' },

                // Income Categories
                { id: 'inc1', name: 'Gaji', icon: 'business', type: 'income' },
                { id: 'inc2', name: 'Bonus', icon: 'gift', type: 'income' },
                { id: 'inc3', name: 'Investasi', icon: 'trending-up', type: 'income' },
            ],
            addWallet: (newWallet) => {
                set((state) => ({
                    wallets: [...state.wallets, newWallet],
                }));
            },
            addCategory: (newCategory) => {
                set((state) => ({
                    categories: [...state.categories, newCategory],
                }));
            },
            addExpense: (expense) => {
                set((state) => ({
                    expenses: [
                        { id: Date.now().toString(), ...expense },
                        ...state.expenses,
                    ],
                }));
            },
            deleteExpense: (id) => {
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                }));
            },
            updateExpense: (id, updatedExpense) => {
                set((state) => ({
                    expenses: state.expenses.map((e) =>
                        e.id === id ? { ...e, ...updatedExpense } : e
                    ),
                }));
            },
            getMonthlyExpenses: (month, year) => {
                return get().expenses.filter((e) => {
                    const date = new Date(e.date);
                    return date.getMonth() === month && date.getFullYear() === year;
                });
            },
            resetAll: () => {
                set({
                    expenses: [],
                    wallets: [
                        { id: '1', name: 'Dompet Utama', icon: 'wallet', type: 'wallet' }
                    ],
                    categories: [
                        { id: 'c1', name: 'Makan & Minum', icon: 'fast-food', type: 'expense' },
                        { id: 'c2', name: 'Transportasi', icon: 'bus', type: 'expense' },
                        { id: 'c3', name: 'Belanja', icon: 'cart', type: 'expense' },
                        { id: 'c4', name: 'Tagihan', icon: 'receipt', type: 'expense' },
                        { id: 'c5', name: 'Hiburan', icon: 'game-controller', type: 'expense' },
                        { id: 'c6', name: 'Kesehatan', icon: 'medkit', type: 'expense' },
                        { id: 'c7', name: 'Pendidikan', icon: 'school', type: 'expense' },
                        { id: 'inc1', name: 'Gaji', icon: 'business', type: 'income' },
                        { id: 'inc2', name: 'Bonus', icon: 'gift', type: 'income' },
                        { id: 'inc3', name: 'Investasi', icon: 'trending-up', type: 'income' },
                    ]
                });
            }
        }),
        {
            name: 'expense-storage-v2', // v2 implies structural change
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useExpenseStore;
