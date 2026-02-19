import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Wallet, Category, User } from '../types';



interface ExpenseState {
    expenses: Expense[];
    wallets: Wallet[];
    categories: Category[];
    isBalanceHidden: boolean;

    // Auth & Members
    user: User | null;
    members: User[];

    toggleBalanceVisibility: () => void;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
    updateExpense: (id: string, updatedExpense: Partial<Expense>) => void;
    addWallet: (newWallet: Wallet) => void;
    addCategory: (newCategory: Category) => void;
    getMonthlyExpenses: (month: number, year: number) => Expense[];
    resetAll: () => void;

    // Auth Actions
    login: (user: User) => void;
    logout: () => void;
    addMember: (member: User) => void;
}

const useExpenseStore = create<ExpenseState>()(
    persist(
        (set, get) => ({
            user: null, // Initial Auth State
            members: [
                { id: 'user-1', name: 'Rantika', email: 'rantika@tataarto.com', role: 'admin', avatar: 'person' }
            ],
            expenses: [],
            wallets: [
                { id: '1', name: 'Dompet Utama', icon: 'wallet', type: 'wallet' },
                { id: '2', name: 'Cash', icon: 'cash', type: 'wallet' }
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

            isBalanceHidden: false,

            toggleBalanceVisibility: () => {
                set((state) => ({
                    isBalanceHidden: !state.isBalanceHidden,
                }));
            },

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
                        { ...expense, id: Date.now().toString() },
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
                        { id: '1', name: 'Dompet Utama', icon: 'wallet', type: 'wallet' },
                        { id: '2', name: 'Cash', icon: 'cash', type: 'wallet' }
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
            },

            login: (user) => set({ user }),
            logout: () => set({ user: null }),
            addMember: (member) => set((state) => ({ members: [...state.members, member] })),
        }),
        {
            name: 'expense-storage-v3',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useExpenseStore;
