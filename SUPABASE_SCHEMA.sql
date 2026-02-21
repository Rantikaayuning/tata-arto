-- 0. Drop Existing Tables & Triggers (Pembersihan / Clean Slate)
-- PERINGATAN: Ini akan menghapus data dummy lama yang ada di tabel ini
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.expenses cascade;
drop table if exists public.categories cascade;
drop table if exists public.wallets cascade;
drop table if exists public.profiles cascade;

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Profiles Table (Public User Data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Wallets Table
create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  icon text default 'wallet',
  type text default 'wallet',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null, -- Every user has their own categories
  name text not null,
  icon text default 'pricetag',
  type text check (type in ('income', 'expense')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Create Expenses Table
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null, -- Keep expense even if cat is deleted? Use set null or cascade.
  amount numeric not null,
  note text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;

-- 7. Create Policies (Users can only see/edit their OWN data)

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Wallets
create policy "Users can view own wallets." on public.wallets for select using (auth.uid() = user_id);
create policy "Users can insert own wallets." on public.wallets for insert with check (auth.uid() = user_id);
create policy "Users can update own wallets." on public.wallets for update using (auth.uid() = user_id);
create policy "Users can delete own wallets." on public.wallets for delete using (auth.uid() = user_id);

-- Categories
create policy "Users can view own categories." on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories." on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories." on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories." on public.categories for delete using (auth.uid() = user_id);

-- Expenses
create policy "Users can view own expenses." on public.expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses." on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses." on public.expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses." on public.expenses for delete using (auth.uid() = user_id);

-- 8. Trigger to Create Profile on Signup
-- This ensures every new user automatically gets a profile entry
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  
  -- Insert Default Wallets
  insert into public.wallets (user_id, name, icon, type) values 
  (new.id, 'Dompet Utama', 'wallet', 'wallet'),
  (new.id, 'Cash', 'cash', 'wallet');

  -- Insert Default Categories
  insert into public.categories (user_id, name, icon, type) values
  (new.id, 'Makan & Minum', 'fast-food', 'expense'),
  (new.id, 'Transportasi', 'bus', 'expense'),
  (new.id, 'Belanja', 'cart', 'expense'),
  (new.id, 'Tagihan', 'receipt', 'expense'),
  (new.id, 'Hiburan', 'game-controller', 'expense'),
  (new.id, 'Kesehatan', 'medkit', 'expense'),
  (new.id, 'Pendidikan', 'school', 'expense'),
  (new.id, 'Gaji', 'business', 'income'),
  (new.id, 'Bonus', 'gift', 'income'),
  (new.id, 'Investasi', 'trending-up', 'income');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
