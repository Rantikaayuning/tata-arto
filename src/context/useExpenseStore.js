import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useExpenseStore = create(
    persist(
        (set, get) => ({
            expenses: [],
            categories: [
                { id: '1', name: 'Utama', icon: 'wallet', type: 'expense' }, // Default main pocket
                { id: '2', name: 'Gaji', icon: 'briefcase', type: 'income' },
                { id: '3', name: 'Bonus', icon: 'gift', type: 'income' },
                { id: '4', name: 'Investasi', icon: 'trending-up', type: 'income' },
                // Other pockets will be added by user
            ],
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
            resetCategories: () => {
                // Reset to only include 'Utama' and Income sources
                set({
                    categories: [
                        { id: '1', name: 'Utama', icon: 'wallet', type: 'expense' },
                        { id: '2', name: 'Gaji', icon: 'briefcase', type: 'income' },
                        { id: '3', name: 'Bonus', icon: 'gift', type: 'income' },
                        { id: '4', name: 'Investasi', icon: 'trending-up', type: 'income' },
                    ]
                })
            }
        }),
        {
            name: 'expense-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useExpenseStore;
