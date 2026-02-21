import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Expense, Wallet, Category, User } from '../types';

export interface ExpenseState {
    expenses: Expense[];
    wallets: Wallet[];
    categories: Category[];
    isBalanceHidden: boolean;
    user: User | null;
    members: User[];
    isLoading: boolean;

    toggleBalanceVisibility: () => void;
    fetchData: () => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    updateExpense: (id: string, updatedExpense: Partial<Expense>) => Promise<void>;
    addWallet: (newWallet: Omit<Wallet, 'id'>) => Promise<Wallet | undefined>;
    addCategory: (newCategory: Omit<Category, 'id'>) => Promise<Category | undefined>;
    login: (user: User) => void;
    logout: () => Promise<void>;
    addMember: (member: User) => Promise<void>;
}

const useExpenseStore = create<ExpenseState>((set, get) => ({
    user: null,
    expenses: [],
    wallets: [],
    categories: [],
    members: [],
    isBalanceHidden: false,
    isLoading: false,

    toggleBalanceVisibility: () => {
        set((state) => ({
            isBalanceHidden: !state.isBalanceHidden,
        }));
    },

    login: (user) => {
        set({ user });
        get().fetchData();
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({
            user: null,
            expenses: [],
            wallets: [],
            categories: []
        });
    },

    fetchData: async () => {
        set({ isLoading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ isLoading: false });
            return;
        }

        // Fetch concurrently
        const [expensesResult, walletsResult, categoriesResult, profileResult] = await Promise.all([
            supabase.from('expenses').select(`*, wallet:wallets(*), category:categories(*)`).order('date', { ascending: false }),
            supabase.from('wallets').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('profiles').select('*').eq('id', user.id).single()
        ]);

        if (expensesResult.error) console.error('Error fetching expenses:', expensesResult.error.message || expensesResult.error);
        if (walletsResult.error) console.error('Error fetching wallets:', walletsResult.error.message || walletsResult.error);
        if (categoriesResult.error) console.error('Error fetching categories:', categoriesResult.error.message || categoriesResult.error);
        if (profileResult.error && profileResult.error.code !== 'PGRST116') console.error('Error fetching profile:', profileResult.error.message || profileResult.error);

        let profile = profileResult.data;

        // Auto-heal missing profile (if user registered but trigger failed or was added later)
        if (profileResult.error && profileResult.error.code === 'PGRST116') {
            const { data: newProfile, error: profileErr } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                avatar_url: 'person-circle'
            }).select().single();

            if (!profileErr && newProfile) {
                profile = newProfile;
            }
        }

        let fetchedWallets = walletsResult.data || [];

        // Auto-create default wallet if none exist (e.g., newly registered user)
        if (fetchedWallets.length === 0) {
            const { data: defaultWallet, error: defaultWalletError } = await supabase.from('wallets').insert({
                user_id: user.id,
                name: 'Dompet Utama',
                icon: 'wallet',
                type: 'wallet'
            }).select().single();

            if (!defaultWalletError && defaultWallet) {
                fetchedWallets = [defaultWallet];
            }
        }

        // Transform Supabase data to match app types
        const expenses: Expense[] = (expensesResult.data || []).map((e: any) => ({
            id: e.id,
            amount: Number(e.amount),
            note: e.note,
            date: e.date,
            type: e.type,
            wallet: e.wallet,
            category: e.category || undefined
        }));

        set({
            expenses: expenses,
            wallets: fetchedWallets,
            categories: categoriesResult.data || [],
            user: {
                id: user.id,
                name: profile?.full_name || user.user_metadata?.full_name || 'User',
                email: user.email || '',
                avatar: profile?.avatar_url || 'person-circle',
                role: 'admin'
            },
            isLoading: false
        });
    },

    addExpense: async (expense) => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase.from('expenses').insert({
            user_id: user.id,
            amount: expense.amount,
            note: expense.note,
            date: expense.date,
            type: expense.type,
            wallet_id: expense.wallet.id,
            category_id: expense.category?.id || null
        }).select().single();

        if (error) {
            console.error('Error adding expense:', error);
            alert(`Gagal menambah: ${error.message}`);
            return;
        }

        // Optimistic Update or Refetch
        // For simplicity, refetching everything or appending manually
        const newExpense: Expense = {
            ...expense,
            id: data.id
        };

        set(state => ({ expenses: [newExpense, ...state.expenses] }));

        // Also update wallet balance in DB if needed, but our SQL didn't have triggers for that yet.
        // Usually better to have a trigger in SQL to update wallet balance.
        // For now, we just rely on the calculated balance in UI or update manually.
        // Let's update wallet balance manually in UI for responsiveness is handled by `PocketsScreen` calculation.
    },

    deleteExpense: async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) {
            set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
        }
    },

    updateExpense: async (id, updatedExpense) => {
        // This needs mapping back to DB columns
        // Simplified for now
        const { error } = await supabase.from('expenses').update({
            amount: updatedExpense.amount,
            note: updatedExpense.note
            // ... other fields
        }).eq('id', id);

        if (!error) {
            set(state => ({
                expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e)
            }));
        }
    },

    addWallet: async (newWallet) => {
        const { user } = get();
        if (!user) return undefined;

        const { data, error } = await supabase.from('wallets').insert({
            user_id: user.id,
            name: newWallet.name,
            icon: newWallet.icon,
            type: newWallet.type
        }).select().single();

        if (error) {
            console.error('Error adding wallet:', error);
            alert(`Gagal menambah dompet: ${error.message}`);
            return undefined;
        } else if (data) {
            set(state => ({ wallets: [...state.wallets, data] }));
            return data;
        }
    },

    addCategory: async (newCategory) => {
        const { user } = get();
        if (!user) return undefined;

        const { data, error } = await supabase.from('categories').insert({
            user_id: user.id,
            name: newCategory.name,
            icon: newCategory.icon,
            type: newCategory.type
        }).select().single();

        if (error) {
            console.error('Error adding category:', error);
            alert(`Gagal menambah kategori: ${error.message}`);
            return undefined;
        } else if (data) {
            set(state => ({ categories: [...state.categories, data] }));
            return data;
        }
    },

    addMember: async (newMember) => {
        set((state) => ({ members: [...state.members, newMember] }));
    }
}));

export default useExpenseStore;
