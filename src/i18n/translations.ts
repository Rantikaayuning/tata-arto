export type Language = 'id' | 'en';

export const translations: Record<Language, Record<string, string>> = {
    id: {
        // Common
        email: 'Email',
        password: 'Password',
        cancel: 'Batal',
        save: 'Simpan',
        delete: 'Hapus',
        error: 'Error',
        ok: 'OK',
        back: 'Kembali',
        close: 'Tutup',
        processing: 'Memproses...',
        sending: 'Mengirim...',
        fillAllFields: 'Mohon isi semua field',
        connectionError: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
        sessionExpired: 'Sesi login telah berakhir. Silakan login ulang.',

        //Subtitle
        subtitle: 'Kelola Keuangan Bersama',

        // Tabs
        tabHome: 'Beranda',
        tabWallet: 'Dompet',
        tabSearch: 'Cari',
        tabReport: 'Laporan',

        // Login
        loginTitle: 'Masuk Akun',
        loginButton: 'Masuk',
        forgotPassword: 'Lupa Password?',
        noAccount: 'Belum punya akun? ',
        register: 'Daftar',
        loginFailed: 'Login Gagal',
        loginErrCredentials: 'Email atau password salah. Pastikan email dan password yang dimasukkan sudah benar.',
        loginErrEmailNotConfirmed: 'Email belum dikonfirmasi. Silakan cek inbox email Anda untuk link konfirmasi, lalu coba login kembali.',

        // Register
        registerTitle: 'Buat Akun Baru',
        registerSubtitle: 'Mulai kelola keuanganmu dengan lebih baik bersama tata arto.',
        fullName: 'Nama Lengkap',
        namePlaceholder: 'Nama Kamu',
        minPassword: 'Minimal 6 karakter',
        registerButton: 'Daftar Sekarang',
        creatingAccount: 'Membuat Akun...',
        hasAccount: 'Sudah punya akun? ',
        login: 'Masuk',
        regFailed: 'Registrasi Gagal',
        emailAlreadyRegistered: 'Email Sudah Terdaftar',
        emailAlreadyMsg: 'Email ini sudah digunakan. Silakan login atau reset password jika lupa.',
        emailAlreadyRegMsg: 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.',
        passwordMin6: 'Password minimal 6 karakter',

        // Email Confirmation
        checkEmail: 'Cek Email Anda!',
        confirmEmailSent: 'Kami telah mengirim link konfirmasi ke:',
        confirmEmailInstruction: 'Klik link di email untuk mengaktifkan akun Anda, lalu kembali ke sini untuk login.',
        noEmailReceived: 'Tidak menerima email? Cek folder spam atau coba daftar ulang dengan email yang sama.',
        goToLogin: 'Ke Halaman Login',

        // Forgot Password
        forgotPasswordTitle: 'Lupa Password?',
        forgotPasswordSubtitle: 'Masukkan email Anda dan kami akan mengirim link untuk reset password.',
        sendResetLink: 'Kirim Link Reset',
        resetFailed: 'Gagal',
        emailSent: 'Email Terkirim!',
        resetEmailSentMsg: 'Kami telah mengirim link reset password ke',
        checkInboxOrSpam: 'Silakan cek inbox atau folder spam Anda.',
        backToLogin: 'Kembali ke Login',
        rememberPassword: 'Ingat password? ',

        // Pockets / Wallets
        myWallets: 'Dompet Saya',
        totalAssets: 'Total Aset',
        addWallet: 'Tambah Dompet',
        newWallet: 'Dompet Baru',
        walletName: 'Nama Dompet',
        walletNamePlaceholder: 'Contoh: Tabungan',
        initialBalance: 'Saldo Awal',
        chooseIcon: 'Pilih Ikon',
        saveWallet: 'Simpan Dompet',
        walletNameRequired: 'Nama dompet tidak boleh kosong',
        failedAddWallet: 'Gagal menambah dompet',
        initialBalanceNote: 'Saldo Awal Dompet',

        // Members
        familyMembers: 'Anggota Keluarga',
        manageAccess: 'Kelola akses dan pemantauan',
        loggedInAs: 'Login Sebagai',
        inviteMember: 'Undang Anggota',
        memberList: 'Anggota',
        pendingInvites: 'Undangan Tertunda',
        owner: 'Pemilik',
        member: 'Anggota',
        me: '(Saya)',
        waitingRegistration: 'Menunggu pendaftaran',
        familyInfoMsg: 'Anggota keluarga dapat melihat catatan keuangan bersama. Undang anggota dengan email mereka.',
        inviteSubtitle: 'Masukkan email anggota keluarga. Jika sudah terdaftar, akan langsung ditambahkan. Jika belum, undangan akan menunggu sampai mereka mendaftar.',
        sendInvite: 'Kirim Undangan',
        removeMember: 'Hapus Anggota',
        removeMemberConfirm: 'Apakah Anda yakin ingin menghapus',
        removeMemberSuffix: 'dari keluarga? Akses ke data keuangan keluarga akan dihapus.',
        cancelInvite: 'Batalkan Undangan',
        cancelInviteConfirm: 'Batalkan undangan untuk',

        // Logout
        logout: 'Logout',
        logoutConfirm: 'Apakah Anda yakin ingin keluar?',
        logoutButton: 'Keluar',

        // Language
        language: 'Bahasa',
        indonesian: 'Indonesia',
        english: 'English',

        // Store Messages
        notLoggedIn: 'Anda belum login.',
        familyNotFound: 'Keluarga tidak ditemukan. Silakan login ulang.',
        cantInviteSelf: 'Anda tidak bisa mengundang diri sendiri.',
        alreadyMember: 'Email ini sudah menjadi anggota keluarga.',
        inviteAlreadySent: 'Undangan sudah dikirim untuk email ini.',
        memberAlreadyExists: 'User sudah menjadi anggota keluarga.',
        addedToFamily: 'berhasil ditambahkan ke keluarga!',
        inviteSentPending: 'Undangan terkirim. User perlu mendaftar terlebih dahulu.',
        failedAdd: 'Gagal menambah',
        failedAddCategory: 'Gagal menambah kategori',

        // Home
        greeting: 'Halo',
        totalBalance: 'Total Saldo',
        recentTransactions: 'Transaksi Terakhir',
        noTransactions: 'Belum ada transaksi',
        seeAll: 'Lihat Semua',
        income: 'Pemasukan',
        expense: 'Pengeluaran',

        // Search
        searchTitle: 'Cari Transaksi',
        searchPlaceholder: 'Cari berdasarkan catatan...',
        noResults: 'Tidak ada hasil',

        // Monthly
        monthlyReport: 'Laporan Bulanan',

        // Add Expense
        addTransaction: 'Tambah Transaksi',
        amount: 'Jumlah',
        note: 'Catatan',
        notePlaceholder: 'Tulis catatan...',
        date: 'Tanggal',
        wallet: 'Dompet',
        category: 'Kategori',
        saveTransaction: 'Simpan',
    },
    en: {
        // Common
        email: 'Email',
        password: 'Password',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        error: 'Error',
        ok: 'OK',
        back: 'Back',
        close: 'Close',
        processing: 'Processing...',
        sending: 'Sending...',
        fillAllFields: 'Please fill in all fields',
        connectionError: 'Connection error. Please try again.',
        sessionExpired: 'Session expired. Please log in again.',

        // Subtitle
        subtitle: 'Family Financial Manager',

        // Tabs
        tabHome: 'Home',
        tabWallet: 'Wallets',
        tabSearch: 'Search',
        tabReport: 'Reports',

        // Login
        loginTitle: 'Sign In',
        loginButton: 'Sign In',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account? ",
        register: 'Sign Up',
        loginFailed: 'Login Failed',
        loginErrCredentials: 'Incorrect email or password. Please make sure your email and password are correct.',
        loginErrEmailNotConfirmed: 'Email not confirmed. Please check your inbox for the confirmation link, then try logging in again.',

        // Register
        registerTitle: 'Create Account',
        registerSubtitle: 'Start managing your finances better with tata arto.',
        fullName: 'Full Name',
        namePlaceholder: 'Your Name',
        minPassword: 'Minimum 6 characters',
        registerButton: 'Sign Up Now',
        creatingAccount: 'Creating Account...',
        hasAccount: 'Already have an account? ',
        login: 'Sign In',
        regFailed: 'Registration Failed',
        emailAlreadyRegistered: 'Email Already Registered',
        emailAlreadyMsg: 'This email is already in use. Please sign in or reset your password.',
        emailAlreadyRegMsg: 'This email is already registered. Please sign in or use a different email.',
        passwordMin6: 'Password must be at least 6 characters',

        // Email Confirmation
        checkEmail: 'Check Your Email!',
        confirmEmailSent: 'We have sent a confirmation link to:',
        confirmEmailInstruction: 'Click the link in the email to activate your account, then come back here to sign in.',
        noEmailReceived: "Didn't receive the email? Check your spam folder or try registering again with the same email.",
        goToLogin: 'Go to Sign In',

        // Forgot Password
        forgotPasswordTitle: 'Forgot Password?',
        forgotPasswordSubtitle: 'Enter your email and we will send you a link to reset your password.',
        sendResetLink: 'Send Reset Link',
        resetFailed: 'Failed',
        emailSent: 'Email Sent!',
        resetEmailSentMsg: 'We have sent a password reset link to',
        checkInboxOrSpam: 'Please check your inbox or spam folder.',
        backToLogin: 'Back to Sign In',
        rememberPassword: 'Remember your password? ',

        // Pockets / Wallets
        myWallets: 'My Wallets',
        totalAssets: 'Total Assets',
        addWallet: 'Add Wallet',
        newWallet: 'New Wallet',
        walletName: 'Wallet Name',
        walletNamePlaceholder: 'e.g. Savings',
        initialBalance: 'Initial Balance',
        chooseIcon: 'Choose Icon',
        saveWallet: 'Save Wallet',
        walletNameRequired: 'Wallet name cannot be empty',
        failedAddWallet: 'Failed to add wallet',
        initialBalanceNote: 'Initial Wallet Balance',

        // Members
        familyMembers: 'Family Members',
        manageAccess: 'Manage access and monitoring',
        loggedInAs: 'Logged In As',
        inviteMember: 'Invite Member',
        memberList: 'Members',
        pendingInvites: 'Pending Invitations',
        owner: 'Owner',
        member: 'Member',
        me: '(Me)',
        waitingRegistration: 'Waiting for registration',
        familyInfoMsg: 'Family members can view shared financial records. Invite members by their email.',
        inviteSubtitle: "Enter the family member's email. If they're already registered, they'll be added immediately. If not, the invitation will wait until they register.",
        sendInvite: 'Send Invitation',
        removeMember: 'Remove Member',
        removeMemberConfirm: 'Are you sure you want to remove',
        removeMemberSuffix: "from the family? Their access to the family's financial data will be revoked.",
        cancelInvite: 'Cancel Invitation',
        cancelInviteConfirm: 'Cancel invitation for',

        // Logout
        logout: 'Logout',
        logoutConfirm: 'Are you sure you want to log out?',
        logoutButton: 'Log Out',

        // Language
        language: 'Language',
        indonesian: 'Indonesia',
        english: 'English',

        // Store Messages
        notLoggedIn: 'You are not logged in.',
        familyNotFound: 'Family not found. Please log in again.',
        cantInviteSelf: 'You cannot invite yourself.',
        alreadyMember: 'This email is already a family member.',
        inviteAlreadySent: 'Invitation already sent for this email.',
        memberAlreadyExists: 'User is already a family member.',
        addedToFamily: 'has been added to the family!',
        inviteSentPending: 'Invitation sent. User needs to register first.',
        failedAdd: 'Failed to add',
        failedAddCategory: 'Failed to add category',

        // Home
        greeting: 'Hello',
        totalBalance: 'Total Balance',
        recentTransactions: 'Recent Transactions',
        noTransactions: 'No transactions yet',
        seeAll: 'See All',
        income: 'Income',
        expense: 'Expense',

        // Search
        searchTitle: 'Search Transactions',
        searchPlaceholder: 'Search by notes...',
        noResults: 'No results found',

        // Monthly
        monthlyReport: 'Monthly Report',

        // Add Expense
        addTransaction: 'Add Transaction',
        amount: 'Amount',
        note: 'Note',
        notePlaceholder: 'Write a note...',
        date: 'Date',
        wallet: 'Wallet',
        category: 'Category',
        saveTransaction: 'Save',
    },
};
