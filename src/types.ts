export type TransactionType = 'income' | 'expense';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: 'admin' | 'member';
}

export interface Category {
    id: string;
    name: string;
    icon: string; // Ionicons name
    type: TransactionType;
}

export interface Wallet {
    id: string;
    name: string;
    icon: string; // Ionicons name
    type: 'wallet';
    balance?: number; // Calculated dynamically often, but maybe store has it? No, store calculates it or PocketsScreen calculates it.
    isAddButton?: boolean; // For UI rendering logic
}

export interface Expense {
    id?: string; // Sometimes generated
    amount: number;
    wallet: Wallet;
    category: Category;
    note: string;
    date: string; // ISO string
    type: TransactionType;
}
