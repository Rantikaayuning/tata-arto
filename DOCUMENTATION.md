# Tata Arto - Financial Management Application

## Overview

**Tata Arto** adalah aplikasi mobile nullable berbasis React Native/Expo untuk mengelola keuangan pribadi dan keluarga. Nama "Tata Arto" berasal dari bahasa Jawa di mana "Tata" berarti menata/mengelola dan "Arto" yang berkaitan dengan uang/keuangan. Aplikasi ini dirancang untuk pengguna Indonesia dengan fokus pada:

- Pelacakan pemasukan dan pengeluaran harian
- Manajemen multi-dompet (dompet)
- Kolaborasi finansial keluarga melalui sistem undangan
- Laporan dan analisis keuangan bulanan/tahunan
- Kustomisasi kategori transaksi
- Privasi dengan opsi penyembunyian saldo

## Tech Stack

### Frontend
- **React Native** 0.81.5 - Framework mobile
- **Expo** 54 - Development & build tooling
- **TypeScript** 5.9.2 - Type-safe development
- **React Navigation** 7 - Stack & bottom tab navigation
- **NativeWind** 4 - Tailwind CSS styling for React Native
- **React Native Reanimated** 4 - Animasi
- **Expo Vector Icons** - Ionicons integration
- **date-fns** - Date manipulation utilities

### Backend & Database
- **Supabase** - PostgreSQL database + Auth + Real-time
- **Supabase JS Client** 2.97.0
- Row Level Security (RLS) untuk data isolation

### State Management
- **Zustand** 5.0.11 - Lightweight, performant state management

## Application Architecture

### Project Structure
```
src/
├── components/     # Reusable UI components
├── config/         # Configuration files
├── context/        # Zustand state management
├── lib/            # External integrations (Supabase)
├── navigation/     # Navigation configuration
├── screens/        # Main application screens
├── types.ts        # TypeScript type definitions
└── utils/          # Utility functions
```

### State Management Strategy

Menggunakan **Zustand** dengan single store pattern (`useExpenseStore`):

#### Core State
- **user**: Profil pengguna terautentikasi
- **profile**: Data profil dari database
- **expenses**: Array transaksi (pemasukan/pengeluaran)
- **wallets**: Array dompet dengan saldo
- **categories**: Array kategori pengeluaran/pemasukan
- **invitations**: Undangan keluarga tertunda
- **familyMembers**: Anggota keluarga
- **isLoading**: Loading state untuk operasi async
- **showBalance**: Boolean toggle untuk tampilkan/sembunyikan saldo

#### State Actions
- **Authentication**: `login()`, `logout()`
- **Data fetching**: `fetchData()` - loads all user data dengan cascade
- **Expense management**: `addExpense()`, `updateExpense()`, `deleteExpense()`
- **Wallet management**: `addWallet()`, `deleteWallet()`
- **Category management**: `addCategory()`, `deleteCategory()`
- **Family collaboration**: `inviteMember()`, `acceptInvitation()`, `declineInvitation()`, `removeMember()`
- **UI preferences**: `toggleBalanceVisibility()`

### Database Schema (Supabase)

#### Tables

**profiles**
```sql
id UUID (FK to auth.users, cascade delete)
first_name, last_name
email VARCHAR
updated_at TIMESTAMPTZ
```

**families**
```sql
id UUID PRIMARY KEY
name VARCHAR
created_by UUID (FK to profiles)
created_at TIMESTAMPTZ
```

**family_members**
```sql
id UUID PRIMARY KEY
family_id UUID (FK to families)
profile_id UUID (FK to profiles)
role ENUM('admin', 'member')
joined_at TIMESTAMPTZ
UNIQUE(family_id, profile_id)
```

**family_invitations**
```sql
id UUID PRIMARY KEY
family_id UUID (FK to families)
invited_email VARCHAR
status ENUM('pending', 'accepted', 'declined')
created_at TIMESTAMPTZ
UNIQUE(family_id, invited_email)
```

**wallets**
```sql
id UUID PRIMARY KEY
profile_id UUID (FK to profiles)
name VARCHAR
balance DECIMAL(12,2)
created_at TIMESTAMPTZ
```

**categories**
```sql
id UUID PRIMARY KEY
profile_id UUID (FK to profiles)
name VARCHAR
type ENUM('income', 'expense')
icon VARCHAR
color VARCHAR
UNIQUE(profile_id, name)
```

**expenses**
```sql
id UUID PRIMARY KEY
profile_id UUID (FK to profiles)
wallet_id UUID (FK to wallets)
category_id UUID (FK to categories)
amount DECIMAL(12,2)
description TEXT
date DATE
created_at TIMESTAMPTZ
family_shared BOOLEAN DEFAULT FALSE
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Policies ensure users only access their own data
- Family sharing through carefully designed RLS policies
- Automatic profile creation on user signup via database trigger

## Features Breakdown

### 1. Authentication & Authorization

**Endpoints**: Supabase Auth
- Email/password registration with email confirmation required
- Login with session management
- Password reset flow
- Persistent sessions across app restarts
- Automatic session refresh

**Screens**:
- LoginScreen - Email & password authentication
- RegisterScreen - Sign up with email verification
- ForgotPasswordScreen - Email-based password reset
- Session state handled in App.tsx with onAuthStateChange listener

### 2. Home - Transaction Management

**Main Screen**: `HomeScreen` (Beranda)
- Overview card showing:
  - Total saldo dompet (jika showBalance true)
  - Jumlah transaksi bulan berjalan
  - Roda pengeluaran vs pemasukan
- List transaksi dikelompokkan per tanggal
- Floating Action Button untuk tambah transaksi cepat
- Tap transaksi untuk edit/hapus (via modal)

**AddExpense Screen**:
- Modal bottom sheet dengan form
- Input: amount (formatted Rupiah), description, category, wallet, date
- Category & wallet selection using custom pickers (wheel style)
- Date picker untuk tanggal transaksi
- Save, update, atau delete Existing expenses

### 3. Pockets - Wallet Management

**PocketsScreen** (Dompet):
- Grid layout showing all wallets
- Each card displays:
  - Nama dompet
  - Saldo (hanya jika showBalance true)
  - Roda pemasukan vs pengeluaran untuk dompet tersebut
- "Tambah Dompet" floating button
- Tap dompet untuk melihat detail transaksinya

**PocketDetailScreen**:
- Header dengan info dompet
- List transaksi milik dompet tersebut
- Header dengan tombol close untuk kembali

**Features**:
- Multiple wallet support
- Default "Dompet Utama" dibuat otomatis saat first login
- Balance calculation from transaction aggregation
- Wallet-specific transaction filtering

### 4. Categories

**Customization**:
- Default categories created automatically per user (Makan, Transportasi, hiburan, dll)
- User can add custom categories with:
  - Name (unique per user)
  - Type (income/expense)
  - Icon name (from Ionicons set)
  - Color hex value
- Delete custom categories (default cannot be deleted)
- Categories used in transaction forms and expense aggregation

**Default Income Categories**:
- Gaji, Bonus, Investasi, Lainnya

**Default Expense Categories**:
- Makan & Minuman, Transportasi, Belanja, Hiburan, Kesehatan, Pendidikan, Tagihan, Lainnya

### 5. Search & Filter

**SearchScreen** (Cari):
- Multi-filter search functionality:
  - **Keyword search**: Filter by description
  - **Category**: Single category picker
  - **Date range**: Start dan end date
- Combine all filters dengan AND logic
- Results display same expense item component with full tap-to-edit functionality
- Clear all filters option

**Implementation Details**:
- Local filtering of fetched expenses state
- Optimized re-renders dengan useMemo
- Date formatting dengan date-fns (locale: 'id-ID')

### 6. Monthly Reports

**MonthlyScreen** (Laporan):
- **Annual Overview**: Year selector at top, displays:
  - Monthly summary cards (selected month highlight)
  - Total pemasukan/pengeluaran tahunan
  - Net income/loss
- **Trend Chart**: Monthly line chart (placeholder implementation)
- **Top Categories**: Top 5 expense categories by amount
- **Balance Overview**: Current total assets across wallets (jika showBalance true)
- Month/year selection dengan custom wheel pickers

**Visual Elements**:
- Color-coded indicators (green for income, orange for expense)
- Progress bars for category breakdowns
- Monthly cards showing individual month contributions

### 7. Family & Collaboration

**MembersScreen** (Anggota):
- Family header with name
- List of family members:
  - Profile display (avatar + name)
  - Role indicator (Admin/Member)
  - Remove button (hanya untuk anggota selain diri sendiri)
- Invitations section:
  - Pending invitations list
  - Email display
  - Accept/Decline actions
  - Revoke option (jika admin)
- "Undang Anggota Baru" button (hanya admin)

**Invitation Flow**:
1. Admin enters email to invite
2. Invitation stored in `family_invitations` table dengan status 'pending'
3. Upon next login, invited user sees invitation in their app
4. Accept → user加入 keluarga (created_family_id di profiles)
5. Decline/invite rejected durch admin or expiration

**Data Sharing**:
- Family members can see each other's transactions marked `family_shared = true`
- Wallet ownership remains individual
- Categories remain personal
- RLS policies enable shared data access only for family members

**Security**:
- Only family admin can invite/remove members
- Cannot remove yourself if you're the last admin
- Admin members cannot be declined/removed by non-admins

### 8. Privacy Features

**Balance Visibility Toggle**:
- Button in HomeScreen toggles `showBalance` state
- Masks all monetary amounts dengan "****" when false
- Persists across app restarts (Zustand persist)
- Implemented across all screens (Home, Pockets, Monthly, Search)
- Shows "****" atau "Rp xxxx" placeholder untuk masked amounts

## UI/UX Design

### Design System
- **Primary Color**: `#343B71` (Deep navy blue)
- **Accent Color**: `#4F7DF3` (Vibrant blue)
- **Background**: `#F7F8FA` (Light gray)
- **Cards**: White with rounded corners
- **Typography**: System default (San Francisco on iOS, Roboto on Android)

### Layout Patterns
- Safe area handling dengan `react-native-safe-area-context`
- Flexbox layouts with flex-1 untuk full screen
- Screen padding: 20px umumnya
- Fixed header height: ~90px (custom tab bar)
- Rounded corners: 20px untuk cards, 15px untuk modals
- Shadow untuk elevated elements (tab bar, modals)

### Animations
- Screen transitions: `slide_from_right` untuk navigate
- Modal presentations: `slide_from_bottom`
- FAB expansion animation using React Native Reanimated
- Tab bar icon scale on press

### Responsive Design
- Absolute positioning untuk fixed elements (FAB)
- ScrollView/FlatList untuk scrollable content
- Dynamic content sizing based on data
- Keyboard avoidance untuk forms dengan KeyboardAvoidingView

## API Integration

### Supabase Setup

**Configuration**: `src/lib/supabase.config.ts`
```typescript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

**Client Creation**: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Key Database Interactions**:

#### Authentication
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { first_name, last_name } }
});

// OnAuthStateChange listener in App.tsx
supabase.auth.onAuthStateChange((event, session) => { ... });
```

#### CRUD Operations (all via Zustand store)
- `fetchData()`: Parallel queries untuk all user data
- `addExpense()`: Insert dengan wallet balance update (transactional via stored procedure)
- Profile creation trigger untuk auth users
- Family invitation queries dengan RLS enforcement
- Real-time subscriptions (optional, for live updates across devices)

## Installation & Setup

### Prerequisites
- Node.js 18+
- Expo CLI (optional)
- iOS Simulator / Android Emulator atau physical device
- Supabase project configured dengan schema

### Supabase Schema Setup

Run the provided SQL scripts:
1. `SUPABASE_SCHEMA.sql` - Create all tables, policies, functions, triggers
2. `UPDATE_TRIGGER.sql` - Trigger untuk automatic profile creation

Database functions include:
- `get_user_family_ids(uuid)` - Get all family IDs for a user
- `get_admin_family_ids(uuid)` - Get family IDs where user is admin
- `get_family_user_ids(uuid)` - Get all profile IDs dalam keluarganya

### Environment Configuration

Update `src/lib/supabase.config.ts` dengan your Supabase credentials:
```typescript
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '...';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '...';
```

### Dependencies Installation

```bash
npm install
# atau
yarn install
```

### Running the Application

```bash
# Development
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Production build (EAS)
eas build --platform all
```

## Testing & Quality Assurance

### Manual Testing Checklist

#### Authentication
- [ ] Registration dengan email confirmation required
- [ ] Login with valid credentials
- [ ] Login dengan invalid credentials shows error
- [ ] Password reset email flow
- [ ] Session persistence after app restart
- [ ] Logout functionality

#### Expense Tracking
- [ ] Add income transaction
- [ ] Add expense transaction
- [ ] Edit existing transaction
- [ ] Delete transaction (with confirmation)
- [ ] Amount formatting dengan thousand separators
- [ ] Category and wallet selection in modals
- [ ] Date picker functionality

#### Wallet Management
- [ ] Add new wallet
- [ ] Delete wallet (check cascade behavior)
- [ ] View wallet-specific transactions
- [ ] Balance calculation accuracy

#### Categories
- [ ] View default categories
- [ ] Add custom income/expense category
- [ ] Delete custom category
- [ ] Category selection in expense form

#### Family Collaboration
- [ ] Invite new family member via email
- [ ] Accept invitation baru user lain
- [ ] Decline invitation
- [ ] View shared transactions (family_shared = true)
- [ ] Remove family member
- [ ] Role enforcement (admin vs member权限)

#### Privacy & UX
- [ ] Show/Hide balance toggle
- [ ] All amounts masked when hidden
- [ ] Smooth animations dan transitions
- [ ] Loading indicators during async operations
- [ ] Error alerts displayed correctly

### Performance Considerations

- FlatList digunakan untuk daftar panjang (expenses)
- useMemo untuk computed values (total balances, filtered lists)
- Zustand selectors untuk selective re-renders
- Supabase queries optimized dengan foreign key indexes
- Lazy loading untuk detail screens (fetch on demand)

## Deployment

### Build Configuration

**EAS Build** (`eas.json`):
- Development & production profiles
- Android & iOS builds configured
- OTA updates enabled

**Platform-specific**:
- **iOS**: Bundle identifier `com.rantika.tataarto`
- **Android**: Package `com.rantika.tataarto`
- Edge-to-edge enabled untuk Android

### Deployment Steps
1. Configure EAS credentials
2. Run: `eas build --platform all`
3. Submit to app stores (App Store Connect & Google Play Console)
4. OTA updates via EAS Update post-deployment

## Maintenance & Future Improvements

### Known Issues & TODOs
- Wallet delete functionality currently only deletes wallet, cascades untuk expenses? (check RLS)
- Real-time subscriptions tidak implemented (optional enhancement)
- Email invitation sent via temporary placeholder Edge Function (needs proper implementation)
- Default category colors/icons inconsistent (random assignment)
- Admin check (`isAdmin()` dalam store) could be optimized dengan memoization

### Potential Enhancements
- Budgeting system (monthly limits, alerts)
- Recurring transactions
- Export financial reports (PDF/CSV)
- Multi-currency support
- Dark mode (currently only light mode)
- Biometric authentication (Face ID/Touch ID)
- Receipt scanning via camera
- Charts with actual data (currently placeholder)
- Push notifications untuk budget alerts/invitations

## License & Credits

- Author: Rantika
- Project: Tata Arto
- License: Private (not open source)
- Icons: Ionicons (@expo/vector-icons)
- Fonts: System fonts
- Built with: React Native, Expo, Supabase, TypeScript

---

**Last Updated**: April 2025  
**Version**: 1.0.0  
**Framework Version**: Expo SDK 54, React Native 0.81.5
