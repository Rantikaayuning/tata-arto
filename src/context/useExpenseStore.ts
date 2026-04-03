import { create } from "zustand";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { Expense, Wallet, Category, User, FamilyInvitation } from "../types";

export interface ExpenseState {
  expenses: Expense[];
  wallets: Wallet[];
  categories: Category[];
  isBalanceHidden: boolean;
  user: User | null;
  members: User[];
  pendingInvitations: FamilyInvitation[];
  pendingInvitationsForMe: any[]; // FamilyInvitation with foreign keys populated
  familyId: string | null;
  isLoading: boolean;

  toggleBalanceVisibility: () => void;
  fetchData: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (
    id: string,
    updatedExpense: Partial<Expense>,
  ) => Promise<void>;
  addWallet: (newWallet: Omit<Wallet, "id">) => Promise<Wallet | undefined>;
  addCategory: (
    newCategory: Omit<Category, "id">,
  ) => Promise<Category | undefined>;
  login: (user: User) => void;
  logout: () => Promise<void>;
  inviteMember: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  removeMember: (userId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  checkPendingInvitationsForMe: () => Promise<void>;
  acceptInvitation: (invitationId: string, familyId: string) => Promise<{success: boolean; message: string}>;
  declineInvitation: (invitationId: string) => Promise<void>;
}

const useExpenseStore = create<ExpenseState>((set, get) => ({
  user: null,
  expenses: [],
  wallets: [],
  categories: [],
  members: [],
  pendingInvitations: [],
  pendingInvitationsForMe: [],
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
      pendingInvitationsForMe: [],
      familyId: null,
    });
  },

  checkPendingInvitationsForMe: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { data: invitations, error } = await supabase
      .from("family_invitations")
      // explicitly join the inviter to avoid profile relation conflict
      .select("*, families(name), inviter:profiles!family_invitations_invited_by_fkey(full_name)")
      .eq("invited_email", user.email)
      .eq("status", "pending");

    if (error) {
       console.error("Error fetching pending invitations:", error);
    }
    console.log("Pending invitations fetched:", invitations);

    set({ pendingInvitationsForMe: invitations || [] });
  },

  fetchData: async () => {
    set({ isLoading: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    // Cek undangan yang pending untuk user ini (tidak otomatis accept)
    await get().checkPendingInvitationsForMe();

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Auto-heal missing profile
    let currentProfile = profile;
    if (profileError && profileError.code === "PGRST116") {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          email: user.email,
          avatar_url: "person-circle",
        })
        .select()
        .single();
      if (newProfile) currentProfile = newProfile;
    }

    // Fetch family membership
    const { data: myMembership, error: membershipError } = await supabase
      .from("family_members")
      .select("family_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (membershipError && membershipError.code !== "PGRST116") {
      console.error("Error fetching family membership:", membershipError);
    }

    let familyId = myMembership?.family_id || null;
    console.log(
      "[fetchData] familyId from membership:",
      familyId,
      "user.id:",
      user.id,
    );

    // Auto-create family if none exists
    if (!familyId) {
      console.log("[fetchData] No family found, creating new family...");
      const { data: newFamily, error: familyError } = await supabase
        .from("families")
        .insert({
          name: "Keluarga " + (currentProfile?.full_name || "Saya"),
          created_by: user.id,
        })
        .select()
        .single();

      if (familyError) {
        console.error("[fetchData] Error creating family:", familyError);
      }

      if (newFamily) {
        console.log("[fetchData] Family created:", newFamily.id);
        const { error: memberInsertError } = await supabase
          .from("family_members")
          .insert({
            family_id: newFamily.id,
            user_id: user.id,
            role: "admin",
          });

        if (memberInsertError) {
          console.error(
            "[fetchData] Error inserting family member:",
            memberInsertError,
          );
        }

        familyId = newFamily.id;
      } else {
        console.error("[fetchData] Failed to create family, newFamily is null");
      }
    }

    // Fetch all data (RLS automatically filters by family)
    const [expensesResult, walletsResult, categoriesResult] = await Promise.all(
      [
        supabase
          .from("expenses")
          .select("*, wallet:wallets(*), category:categories(*)")
          .order("date", { ascending: false }),
        supabase.from("wallets").select("*"),
        supabase.from("categories").select("*"),
      ],
    );

    if (expensesResult.error)
      console.error("Error fetching expenses:", expensesResult.error.message);
    if (walletsResult.error)
      console.error("Error fetching wallets:", walletsResult.error.message);
    if (categoriesResult.error)
      console.error(
        "Error fetching categories:",
        categoriesResult.error.message,
      );

    let fetchedWallets = walletsResult.data || [];

    // Auto-create default wallet if none
    if (fetchedWallets.length === 0) {
      const { data: defaultWallet } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          name: "Dompet Utama",
          icon: "wallet",
          type: "wallet",
        })
        .select()
        .single();
      if (defaultWallet) fetchedWallets = [defaultWallet];
    }

    // Fetch family members with profiles
    let members: User[] = [];
    if (familyId) {
      const { data: familyMembers } = await supabase
        .from("family_members")
        .select(
          "user_id, role, profiles:user_id(id, full_name, email, avatar_url)",
        )
        .eq("family_id", familyId);

      if (familyMembers) {
        members = familyMembers.map((fm: any) => ({
          id: fm.profiles.id,
          name: fm.profiles.full_name || "User",
          email: fm.profiles.email || "",
          avatar: fm.profiles.avatar_url || "person-circle",
          role: fm.role,
        }));
      }
    }

    // Fetch pending invitations
    let pendingInvitations: FamilyInvitation[] = [];
    if (familyId) {
      const { data: invitations } = await supabase
        .from("family_invitations")
        .select("*")
        .eq("family_id", familyId)
        .eq("status", "pending");

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
      category: e.category || undefined,
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
        name:
          currentProfile?.full_name || user.user_metadata?.full_name || "User",
        email: user.email || "",
        avatar: currentProfile?.avatar_url || "person-circle",
        role: myMembership?.role || "admin",
      },
      isLoading: false,
    });
  },

  inviteMember: async (email: string) => {
    const { user } = get();
    let familyId = get().familyId;

    if (!user) return { success: false, message: "notLoggedIn" };

    // Pastikan state diinisialisasi jika belum
    if (!familyId) {
      console.log("[inviteMember] familyId is null, calling fetchData...");
      await get().fetchData();
      familyId = get().familyId;
      console.log("[inviteMember] After fetchData, familyId:", familyId);
    }

    // Fallback: coba query langsung jika fetchData tidak berhasil
    if (!familyId) {
      console.log("[inviteMember] Still no familyId, trying direct query...");
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: directMembership, error: directErr } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", authUser.id)
          .limit(1)
          .single();
        console.log(
          "[inviteMember] Direct query:",
          directMembership,
          "err:",
          directErr,
        );
        if (directMembership) {
          familyId = directMembership.family_id;
          set({ familyId });
        }
      }
    }

    if (!familyId) {
      return {
        success: false,
        message: "Gagal mendapatkan data keluarga. Silakan restart aplikasi.",
      };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Don't invite yourself
    if (trimmedEmail === user.email) {
      return { success: false, message: "Tidak bisa mengundang diri sendiri" };
    }

    // Check if email is already a member
    const existingMembers = get().members;
    if (existingMembers.some((m) => m.email === trimmedEmail)) {
      return {
        success: false,
        message: "Email ini sudah menjadi anggota keluarga",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: "Format email tidak valid" };
    }

    // Query database directly for any existing invitations (more reliable than store)
    const { data: existingInvitationsDb, error: queryError } = await supabase
      .from("family_invitations")
      .select("id, status")
      .eq("invited_email", trimmedEmail)
      .eq("family_id", familyId);

    if (queryError) {
      console.error(
        "[inviteMember] Error querying existing invitations:",
        queryError,
      );
    }

    // Delete any existing invitations for this email
    if (existingInvitationsDb && existingInvitationsDb.length > 0) {
      console.log(
        "[inviteMember] Found existing invitations, deleting:",
        existingInvitationsDb.map((i) => i.id),
      );
      const { error: deleteError } = await supabase
        .from("family_invitations")
        .delete()
        .eq("invited_email", trimmedEmail)
        .eq("family_id", familyId);

      if (deleteError) {
        console.error(
          "[inviteMember] Error deleting existing invitations:",
          deleteError,
        );
        return {
          success: false,
          message: "Gagal menghapus undangan lama. Coba lagi.",
        };
      }
    }

    // Check if user already exists in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", trimmedEmail)
      .single();

    // Create pending invitation record
    let newInvitation: any;
    let invError: any = null;

    const result = await supabase
      .from("family_invitations")
      .insert({
        family_id: familyId,
        invited_email: trimmedEmail,
        invited_by: user.id,
        status: "pending",
      })
      .select("id")
      .single();

    newInvitation = result.data;
    invError = result.error;

    if (invError) {
      if (invError.code === "23505") {
        // Unique constraint violation — ini rare karena kami sudah delete existing
        // Tapi kalau terjadi, coba lagi dengan delete dan retry
        console.log(
          "[inviteMember] Unique constraint, retrying dengan delete...",
        );
        const { error: deleteRetryErr } = await supabase
          .from("family_invitations")
          .delete()
          .eq("invited_email", trimmedEmail)
          .eq("family_id", familyId);

        if (deleteRetryErr) {
          console.error(
            "[inviteMember] Critical: both delete and insert failed:",
            deleteRetryErr,
          );
          return {
            success: false,
            message: "Gagal memproses undangan. Coba lagi nanti.",
          };
        }
        // Kalau delete sukses, continue to retry insert di bawah
        const { data: retryInsert, error: retryError } = await supabase
          .from("family_invitations")
          .insert({
            family_id: familyId,
            invited_email: trimmedEmail,
            invited_by: user.id,
            status: "pending",
          })
          .select("id")
          .single();

        if (retryError) {
          return { success: false, message: retryError.message };
        }
        newInvitation = retryInsert;
      } else {
        return { success: false, message: invError.message };
      }
    }

    // Kirim email undangan via Supabase Edge Function (opsional, tidak blokir)
    try {
      const { data: familyData } = await supabase
        .from("families")
        .select("name")
        .eq("id", familyId)
        .single();

      await supabase.functions.invoke(
        "send-invitation-email",
        {
          body: {
            to_email: trimmedEmail,
            inviter_name: user.name || "Seseorang",
            family_name: familyData?.name || "Keluarga",
            is_existing_user: !!existingProfile,
          },
        },
      );
    } catch (emailErr) {
      // Email gagal tapi invitation tetap tersimpan — tidak masalah
      console.warn("[inviteMember] Email send failed (non-blocking):", emailErr);
    }

    await get().fetchData();
    return {
      success: true,
      message: `Undangan untuk ${existingProfile?.full_name || trimmedEmail} berhasil dibuat!`,
    };
  },

  acceptInvitation: async (invitationId: string, targetFamilyId: string) => {
    const { user, familyId: currentFamilyId } = get();
    if (!user) return { success: false, message: "Not logged in" };

    // 1. Check if user is admin with other members
    const { data: currentMembers } = await supabase
      .from("family_members")
      .select("user_id, role")
      .eq("family_id", currentFamilyId);

    const isCurrentAdmin = currentMembers?.some(m => m.user_id === user.id && m.role === 'admin');
    const hasOtherMembers = currentMembers ? currentMembers.length > 1 : false;

    if (isCurrentAdmin && hasOtherMembers) {
      // Option B: Auto-appoint new admin
      const otherMember = currentMembers?.find(m => m.user_id !== user.id);
      if (otherMember) {
        await supabase
          .from("family_members")
          .update({ role: 'admin' })
          .eq("family_id", currentFamilyId)
          .eq("user_id", otherMember.user_id);
      }
    }

    // 2. Insert into new family
    const { error: joinError } = await supabase
      .from("family_members")
      .insert({
        family_id: targetFamilyId,
        user_id: user.id,
        role: "member",
      });

    if (joinError) return { success: false, message: joinError.message };

    // 3. Remove membership from old family
    await supabase
      .from("family_members")
      .delete()
      .eq("family_id", currentFamilyId)
      .eq("user_id", user.id);

    // 4. Reset user data (expenses, wallets, categories)
    // Wallets and Categories will cascade delete Expenses if set up that way,
    // but let's delete them to be safe. Actually, expenses cascade when wallet/category deletes.
    await supabase.from("expenses").delete().eq("user_id", user.id);
    await supabase.from("wallets").delete().eq("user_id", user.id);
    await supabase.from("categories").delete().eq("user_id", user.id);

    // 5. Clean up old family if empty
    if (!hasOtherMembers) {
      await supabase.from("families").delete().eq("id", currentFamilyId);
    }

    // 6. Accept invitation
    await supabase
      .from("family_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    // 7. Refresh data
    await get().fetchData();
    return { success: true, message: "Berhasil bergabung dengan keluarga!" };
  },

  declineInvitation: async (invitationId: string) => {
    await supabase
      .from("family_invitations")
      .update({ status: "declined" })
      .eq("id", invitationId);
    await get().checkPendingInvitationsForMe();
  },

  removeMember: async (userId: string) => {
    const { familyId } = get();
    if (!familyId) return;

    // Get member email to also delete pending invitations
    const members = get().members;
    const memberToRemove = members.find((m) => m.id === userId);
    const memberEmail = memberToRemove?.email;

    // Delete from family_members
    await supabase
      .from("family_members")
      .delete()
      .eq("family_id", familyId)
      .eq("user_id", userId);

    // If member has email, also delete any pending invitations for them
    // This allows re-inviting the user after removal
    if (memberEmail) {
      console.log("[removeMember] Deleting invitations for:", memberEmail);
      await supabase
        .from("family_invitations")
        .delete()
        .eq("family_id", familyId)
        .eq("invited_email", memberEmail);
    }

    await get().fetchData();
  },

  cancelInvitation: async (invitationId: string) => {
    await supabase.from("family_invitations").delete().eq("id", invitationId);
    await get().fetchData();
  },

  addExpense: async (expense) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      Alert.alert(
        "Session Expired",
        "Sesi login telah berakhir. Silakan login ulang.",
      );
      return;
    }

    const payload: any = {
      user_id: authUser.id,
      amount: expense.amount,
      note: expense.note,
      date: expense.date,
      type: expense.type,
      wallet_id: expense.wallet.id,
    };

    if (expense.category?.id) {
      payload.category_id = expense.category.id;
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", `Gagal menambah: ${error.message}`);
      return;
    }

    const newExpense: Expense = { ...expense, id: data.id };
    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
  },

  deleteExpense: async (id) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    }
  },

  updateExpense: async (id, updatedExpense) => {
    const { error } = await supabase
      .from("expenses")
      .update({
        amount: updatedExpense.amount,
        note: updatedExpense.note,
      })
      .eq("id", id);

    if (!error) {
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? { ...e, ...updatedExpense } : e,
        ),
      }));
    }
  },

  addWallet: async (newWallet) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      Alert.alert(
        "Session Expired",
        "Sesi login telah berakhir. Silakan login ulang.",
      );
      return undefined;
    }

    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: authUser.id,
        name: newWallet.name,
        icon: newWallet.icon,
        type: newWallet.type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding wallet:", error);
      Alert.alert("Error", `Gagal menambah dompet: ${error.message}`);
      return undefined;
    } else if (data) {
      set((state) => ({ wallets: [...state.wallets, data] }));
      return data;
    }
  },

  addCategory: async (newCategory) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      Alert.alert(
        "Session Expired",
        "Sesi login telah berakhir. Silakan login ulang.",
      );
      return undefined;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: authUser.id,
        name: newCategory.name,
        icon: newCategory.icon,
        type: newCategory.type,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      Alert.alert("Error", `Gagal menambah kategori: ${error.message}`);
      return undefined;
    } else if (data) {
      set((state) => ({ categories: [...state.categories, data] }));
      return data;
    }
  },
}));

export default useExpenseStore;
