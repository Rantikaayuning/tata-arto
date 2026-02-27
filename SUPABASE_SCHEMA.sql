-- ==========================================
-- TATA ARTO - Full Database Schema
-- For fresh installs only. For existing DB, use SUPABASE_MIGRATION.sql
-- ==========================================

-- 0. Clean Slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.get_user_family_ids();
drop function if exists public.get_admin_family_ids();
drop function if exists public.get_family_user_ids();
drop table if exists public.family_invitations cascade;
drop table if exists public.family_members cascade;
drop table if exists public.families cascade;
drop table if exists public.expenses cascade;
drop table if exists public.categories cascade;
drop table if exists public.wallets cascade;
drop table if exists public.profiles cascade;

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  email text,
  updated_at timestamptz default timezone('utc'::text, now())
);

-- 3. Families
create table public.families (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'Keluarga Saya',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now())
);

-- 4. Family Members
create table public.family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamptz default timezone('utc'::text, now()),
  unique(family_id, user_id)
);

-- 5. Family Invitations
create table public.family_invitations (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  invited_email text not null,
  invited_by uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  created_at timestamptz default timezone('utc'::text, now()),
  unique(family_id, invited_email)
);

-- 6. Wallets
create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text default 'wallet',
  type text default 'wallet',
  created_at timestamptz default timezone('utc'::text, now())
);

-- 7. Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text default 'pricetag',
  type text check (type in ('income', 'expense')) not null,
  created_at timestamptz default timezone('utc'::text, now())
);

-- 8. Expenses
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric not null,
  note text,
  date timestamptz default timezone('utc'::text, now()) not null,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamptz default timezone('utc'::text, now())
);

-- 9. Enable RLS
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invitations enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;

-- 10. Helper Functions (SECURITY DEFINER to bypass RLS)
create or replace function public.get_user_family_ids()
returns setof uuid as $$
  select family_id from public.family_members where user_id = auth.uid()
$$ language sql security definer stable;

create or replace function public.get_admin_family_ids()
returns setof uuid as $$
  select family_id from public.family_members where user_id = auth.uid() and role = 'admin'
$$ language sql security definer stable;

create or replace function public.get_family_user_ids()
returns setof uuid as $$
  select fm.user_id from public.family_members fm
  where fm.family_id in (
    select fm2.family_id from public.family_members fm2 where fm2.user_id = auth.uid()
  )
$$ language sql security definer stable;

-- 11. RLS Policies

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Families
create policy "View own families" on public.families for select using (id in (select public.get_user_family_ids()));
create policy "Create families" on public.families for insert with check (created_by = auth.uid());
create policy "Update own families" on public.families for update using (id in (select public.get_admin_family_ids()));

-- Family Members
create policy "View family members" on public.family_members for select using (family_id in (select public.get_user_family_ids()));
create policy "Add family members" on public.family_members for insert with check (family_id in (select public.get_admin_family_ids()) or user_id = auth.uid());
create policy "Remove family members" on public.family_members for delete using (family_id in (select public.get_admin_family_ids()) or user_id = auth.uid());

-- Family Invitations
create policy "View invitations" on public.family_invitations for select using (family_id in (select public.get_user_family_ids()) or invited_email = (auth.jwt() ->> 'email'));
create policy "Create invitations" on public.family_invitations for insert with check (family_id in (select public.get_admin_family_ids()));
create policy "Update invitations" on public.family_invitations for update using (invited_email = (auth.jwt() ->> 'email') or family_id in (select public.get_admin_family_ids()));
create policy "Delete invitations" on public.family_invitations for delete using (family_id in (select public.get_admin_family_ids()));

-- Wallets (family can view, only owner modifies)
create policy "View family wallets" on public.wallets for select using (user_id in (select public.get_family_user_ids()));
create policy "Insert own wallets" on public.wallets for insert with check (auth.uid() = user_id);
create policy "Update own wallets" on public.wallets for update using (auth.uid() = user_id);
create policy "Delete own wallets" on public.wallets for delete using (auth.uid() = user_id);

-- Categories (family can view, only owner modifies)
create policy "View family categories" on public.categories for select using (user_id in (select public.get_family_user_ids()));
create policy "Insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- Expenses (family can view, only owner modifies)
create policy "View family expenses" on public.expenses for select using (user_id in (select public.get_family_user_ids()));
create policy "Insert own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Update own expenses" on public.expenses for update using (auth.uid() = user_id);
create policy "Delete own expenses" on public.expenses for delete using (auth.uid() = user_id);

-- 12. Trigger: Auto-setup on user registration
create function public.handle_new_user() returns trigger as $$
declare
  new_family_id uuid;
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);

  insert into public.families (name, created_by)
  values ('Keluarga ' || coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.id)
  returning id into new_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (new_family_id, new.id, 'admin');

  insert into public.wallets (user_id, name, icon, type) values
  (new.id, 'Dompet Utama', 'wallet', 'wallet'),
  (new.id, 'Cash', 'cash', 'wallet');

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

  -- Auto-accept pending family invitations
  insert into public.family_members (family_id, user_id, role)
  select fi.family_id, new.id, 'member'
  from public.family_invitations fi
  where fi.invited_email = new.email and fi.status = 'pending'
  on conflict (family_id, user_id) do nothing;

  update public.family_invitations
  set status = 'accepted'
  where invited_email = new.email and status = 'pending';

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
