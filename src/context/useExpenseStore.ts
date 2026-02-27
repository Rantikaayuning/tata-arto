import { create } from 'zustand';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Expense, Wallet, Category, User, FamilyInvitation } from '../types';

export interface ExpenseState {
    expenses: Expense[];
    wallets: Wallet[];
    categories: Category[];
    isBalanceHidden: boolean;
    user: User | null;
    members: User[];
    pendingInvitations: FamilyInvitation[];
    familyId: string | null;
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
    inviteMember: (email: string) => Promise<{ success: boolean; message: string }>;
    removeMember: (userId: string) => Promise<void>;
    cancelInvitation: (invitationId: string) => Promise<void>;
    checkAndAcceptInvitations: () => Promise<void>;
}

const useExpenseStore = create<ExpenseState>((set, get) => ({
    user: null,
    expenses: [],
    wallets: [],
    categories: [],
    members: [],
    pendingInvitations: [],
    familyId: null,
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
            categories: [],
            members: [],
            pendingInvitations: [],
            familyId: null,
        });
    },

    checkAndAcceptInvitations: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const { data: invitations } = await supabase
            .from('family_invitations')
            .select('*')
            .eq('invited_email', user.email)
            .eq('status', 'pending');

        if (!invitations || invitations.length === 0) return;

        for (const inv of invitations) {
            await supabase.from('family_members').insert({
                family_id: inv.family_id,
                user_id: user.id,
                role: 'member'
            });

            await supabase.from('family_invitations')
                .update({ status: 'accepted' })
                .eq('id', inv.id);
        }
    },

    fetchData: async () => {
        set({ isLoading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ isLoading: false });
            return;
        }

        // Auto-accept pending invitations on login
        await get().checkAndAcceptInvitations();

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Auto-heal missing profile
        let currentProfile = profile;
        if (profileError && profileError.code === 'PGRST116') {
            const { data: newProfile } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                avatar_url: 'person-circle'
            }).select().single();
            if (newProfile) currentProfile = newProfile;
        }

        // Fetch family membership
        const { data: myMembership, error: membershipError } = await supabase
            .from('family_members')
            .select('family_id, role')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (membershipError && membershipError.code !== 'PGRST116') {
            console.error('Error fetching family membership:', membershipError);
        }

        let familyId = myMembership?.family_id || null;
        console.log('[fetchData] familyId from membership:', familyId, 'user.id:', user.id);

        // Auto-create family if none exists
        if (!familyId) {
            console.log('[fetchData] No family found, creating new family...');
            const { data: newFamily, error: familyError } = await supabase
                .from('families')
                .insert({
                    name: 'Keluarga ' + (currentProfile?.full_name || 'Saya'),
                    created_by: user.id
                })
                .select()
                .single();

            if (familyError) {
                console.error('[fetchData] Error creating family:', familyError);
            }

            if (newFamily) {
                console.log('[fetchData] Family created:', newFamily.id);
                const { error: memberInsertError } = await supabase.from('family_members').insert({
                    family_id: newFamily.id,
                    user_id: user.id,
                    role: 'admin'
                });

                if (memberInsertError) {
                    console.error('[fetchData] Error inserting family member:', memberInsertError);
                }

                familyId = newFamily.id;
            } else {
                console.error('[fetchData] Failed to create family, newFamily is null');
            }
        }

        // Fetch all data (RLS automatically filters by family)
        const [expensesResult, walletsResult, categoriesResult] = await Promise.all([
            supabase.from('expenses').select('*, wallet:wallets(*), category:categories(*)').order('date', { ascending: false }),
            supabase.from('wallets').select('*'),
            supabase.from('categories').select('*'),
        ]);

        if (expensesResult.error) console.error('Error fetching expenses:', expensesResult.error.message);
        if (walletsResult.error) console.error('Error fetching wallets:', walletsResult.error.message);
        if (categoriesResult.error) console.error('Error fetching categories:', categoriesResult.error.message);

        let fetchedWallets = walletsResult.data || [];

        // Auto-create default wallet if none
        if (fetchedWallets.length === 0) {
            const { data: defaultWallet } = await supabase.from('wallets').insert({
                user_id: user.id,
                name: 'Dompet Utama',
                icon: 'wallet',
                type: 'wallet'
            }).select().single();
            if (defaultWallet) fetchedWallets = [defaultWallet];
        }

        // Fetch family members with profiles
        let members: User[] = [];
        if (familyId) {
            const { data: familyMembers } = await supabase
                .from('family_members')
                .select('user_id, role, profiles:user_id(id, full_name, email, avatar_url)')
                .eq('family_id', familyId);

            if (familyMembers) {
                members = familyMembers.map((fm: any) => ({
                    id: fm.profiles.id,
                    name: fm.profiles.full_name || 'User',
                    email: fm.profiles.email || '',
                    avatar: fm.profiles.avatar_url || 'person-circle',
                    role: fm.role,
                }));
            }
        }

        // Fetch pending invitations
        let pendingInvitations: FamilyInvitation[] = [];
        if (familyId) {
            const { data: invitations } = await supabase
                .from('family_invitations')
                .select('*')
                .eq('family_id', familyId)
                .eq('status', 'pending');

            if (invitations) pendingInvitations = invitations;
        }

        // Transform expenses
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
            expenses,
            wallets: fetchedWallets,
            categories: categoriesResult.data || [],
            members,
            pendingInvitations,
            familyId,
            user: {
                id: user.id,
                name: currentProfile?.full_name || user.user_metadata?.full_name || 'User',
                email: user.email || '',
                avatar: currentProfile?.avatar_url || 'person-circle',
                role: myMembership?.role || 'admin'
            },
            isLoading: false
        });
    },

    inviteMember: async (email: string) => {
        const { user } = get();
        let familyId = get().familyId;

        if (!user) return { success: false, message: 'notLoggedIn' };

        // Pastikan state diinisialisasi jika belum
        if (!familyId) {
            console.log('[inviteMember] familyId is null, calling fetchData...');
            await get().fetchData();
            familyId = get().familyId;
            console.log('[inviteMember] After fetchData, familyId:', familyId);
        }

        // Fallback: coba query langsung jika fetchData tidak berhasil
        if (!familyId) {
            console.log('[inviteMember] Still no familyId, trying direct query...');
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: directMembership, error: directErr } = await supabase
                    .from('family_members')
                    .select('family_id')
                    .eq('user_id', authUser.id)
                    .limit(1)
                    .single();
                console.log('[inviteMember] Direct query:', directMembership, 'err:', directErr);
                if (directMembership) {
                    familyId = directMembership.family_id;
                    set({ familyId });
                }
            }
        }

        if (!familyId) {
            return { success: false, message: 'Gagal mendapatkan data keluarga. Silakan restart aplikasi.' };
        }

        const trimmedEmail = email.trim().toLowerCase();

        // Don't invite yourself
        if (trimmedEmail === user.email) {
            return { success: false, message: 'Tidak bisa mengundang diri sendiri' };
        }

        // Check if email is already a member
        const existingMembers = get().members;
        if (existingMembers.some(m => m.email === trimmedEmail)) {
            return { success: false, message: 'Email ini sudah menjadi anggota keluarga' };
        }

        // Check if invitation already pending
        const existingInvitations = get().pendingInvitations;
        if (existingInvitations.some(i => i.invited_email === trimmedEmail)) {
            return { success: false, message: 'Undangan sudah dikirim sebelumnya' };
        }

        // Check if user already exists in profiles
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', trimmedEmail)
            .single();

        if (existingProfile) {
            // User exists - add directly to family
            const { error: memberError } = await supabase.from('family_members').insert({
                family_id: familyId,
                user_id: existingProfile.id,
                role: 'member'
            });

            if (memberError) {
                if (memberError.code === '23505') {
                    return { success: false, message: 'Anggota sudah terdaftar dalam keluarga ini' };
                }
                return { success: false, message: memberError.message };
            }

            // Create accepted invitation record
            await supabase.from('family_invitations').insert({
                family_id: familyId,
                invited_email: trimmedEmail,
                invited_by: user.id,
                status: 'accepted'
            });

            await get().fetchData();
            return { success: true, message: `${existingProfile.full_name || trimmedEmail} berhasil ditambahkan ke keluarga` };
        } else {
            // User doesn't exist - create pending invitation
            const { error: invError } = await supabase.from('family_invitations').insert({
                family_id: familyId,
                invited_email: trimmedEmail,
                invited_by: user.id,
                status: 'pending'
            });

            if (invError) {
                if (invError.code === '23505') {
                    return { success: false, message: 'Undangan sudah pernah dikirim ke email ini' };
                }
                return { success: false, message: invError.message };
            }

            // Kirim email undangan via Supabase Edge Function
            try {
                const { data: familyData } = await supabase
                    .from('families')
                    .select('name')
                    .eq('id', familyId)
                    .single();

                await supabase.functions.invoke('send-invitation-email', {
                    body: {
                        to_email: trimmedEmail,
                        inviter_name: user.name || 'Seseorang',
                        family_name: familyData?.name || 'Keluarga',
                    },
                });
            } catch (emailErr) {
                console.warn('Email undangan gagal dikirim:', emailErr);
                // Tidak gagalkan proses — undangan tetap tersimpan di database
            }

            await get().fetchData();
            return { success: true, message: 'Undangan terkirim! Email notifikasi telah dikirim.' };
        }
    },

    removeMember: async (userId: string) => {
        const { familyId } = get();
        if (!familyId) return;

        await supabase.from('family_members')
            .delete()
            .eq('family_id', familyId)
            .eq('user_id', userId);

        await get().fetchData();
    },

    cancelInvitation: async (invitationId: string) => {
        await supabase.from('family_invitations').delete().eq('id', invitationId);
        await get().fetchData();
    },

    addExpense: async (expense) => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            Alert.alert('Session Expired', 'Sesi login telah berakhir. Silakan login ulang.');
            return;
        }

        const payload: any = {
            user_id: authUser.id,
            amount: expense.amount,
            note: expense.note,
            date: expense.date,
            type: expense.type,
            wallet_id: expense.wallet.id
        };

        if (expense.category?.id) {
            payload.category_id = expense.category.id;
        }

        const { data, error } = await supabase.from('expenses').insert(payload).select().single();

        if (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', `Gagal menambah: ${error.message}`);
            return;
        }

        const newExpense: Expense = { ...expense, id: data.id };
        set(state => ({ expenses: [newExpense, ...state.expenses] }));
    },

    deleteExpense: async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) {
            set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
        }
    },

    updateExpense: async (id, updatedExpense) => {
        const { error } = await supabase.from('expenses').update({
            amount: updatedExpense.amount,
            note: updatedExpense.note
        }).eq('id', id);

        if (!error) {
            set(state => ({
                expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e)
            }));
        }
    },

    addWallet: async (newWallet) => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            Alert.alert('Session Expired', 'Sesi login telah berakhir. Silakan login ulang.');
            return undefined;
        }

        const { data, error } = await supabase.from('wallets').insert({
            user_id: authUser.id,
            name: newWallet.name,
            icon: newWallet.icon,
            type: newWallet.type
        }).select().single();

        if (error) {
            console.error('Error adding wallet:', error);
            Alert.alert('Error', `Gagal menambah dompet: ${error.message}`);
            return undefined;
        } else if (data) {
            set(state => ({ wallets: [...state.wallets, data] }));
            return data;
        }
    },

    addCategory: async (newCategory) => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            Alert.alert('Session Expired', 'Sesi login telah berakhir. Silakan login ulang.');
            return undefined;
        }

        const { data, error } = await supabase.from('categories').insert({
            user_id: authUser.id,
            name: newCategory.name,
            icon: newCategory.icon,
            type: newCategory.type
        }).select().single();

        if (error) {
            console.error('Error adding category:', error);
            Alert.alert('Error', `Gagal menambah kategori: ${error.message}`);
            return undefined;
        } else if (data) {
            set(state => ({ categories: [...state.categories, data] }));
            return data;
        }
    },
}));

export default useExpenseStore;
