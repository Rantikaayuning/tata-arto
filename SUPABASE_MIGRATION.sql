-- ==========================================
-- MIGRATION: Family System
-- Run this in Supabase Dashboard > SQL Editor
-- ==========================================

-- 1. Create Tables FIRST
CREATE TABLE IF NOT EXISTS public.families (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Keluarga Saya',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT timezone('utc'::text, now()),
  UNIQUE(family_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.family_invitations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  UNIQUE(family_id, invited_email)
);

-- 2. Helper Functions (SECURITY DEFINER bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_family_ids()
RETURNS SETOF uuid AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_admin_family_ids()
RETURNS SETOF uuid AS $$
  SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_family_user_ids()
RETURNS SETOF uuid AS $$
  SELECT fm.user_id FROM public.family_members fm
  WHERE fm.family_id IN (
    SELECT fm2.family_id FROM public.family_members fm2 WHERE fm2.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- 4. Families RLS
CREATE POLICY "View own families" ON public.families
  FOR SELECT USING (id IN (SELECT public.get_user_family_ids()));
CREATE POLICY "Create families" ON public.families
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update own families" ON public.families
  FOR UPDATE USING (id IN (SELECT public.get_admin_family_ids()));

-- 5. Family Members RLS
CREATE POLICY "View family members" ON public.family_members
  FOR SELECT USING (family_id IN (SELECT public.get_user_family_ids()));
CREATE POLICY "Add family members" ON public.family_members
  FOR INSERT WITH CHECK (
    family_id IN (SELECT public.get_admin_family_ids())
    OR user_id = auth.uid()
  );
CREATE POLICY "Remove family members" ON public.family_members
  FOR DELETE USING (
    family_id IN (SELECT public.get_admin_family_ids())
    OR user_id = auth.uid()
  );

-- 6. Family Invitations RLS
CREATE POLICY "View invitations" ON public.family_invitations
  FOR SELECT USING (
    family_id IN (SELECT public.get_user_family_ids())
    OR invited_email = (auth.jwt() ->> 'email')
  );
CREATE POLICY "Create invitations" ON public.family_invitations
  FOR INSERT WITH CHECK (family_id IN (SELECT public.get_admin_family_ids()));
CREATE POLICY "Update invitations" ON public.family_invitations
  FOR UPDATE USING (
    invited_email = (auth.jwt() ->> 'email')
    OR family_id IN (SELECT public.get_admin_family_ids())
  );
CREATE POLICY "Delete invitations" ON public.family_invitations
  FOR DELETE USING (family_id IN (SELECT public.get_admin_family_ids()));

-- 7. Drop old policies & create family-shared ones
DROP POLICY IF EXISTS "Users can view own wallets." ON public.wallets;
DROP POLICY IF EXISTS "Users can insert own wallets." ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallets." ON public.wallets;
DROP POLICY IF EXISTS "Users can delete own wallets." ON public.wallets;
DROP POLICY IF EXISTS "Users can view own categories." ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories." ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories." ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories." ON public.categories;
DROP POLICY IF EXISTS "Users can view own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses." ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses." ON public.expenses;

-- Wallets: family can view, only owner can modify
CREATE POLICY "View family wallets" ON public.wallets
  FOR SELECT USING (user_id IN (SELECT public.get_family_user_ids()));
CREATE POLICY "Insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own wallets" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own wallets" ON public.wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Categories: family can view, only owner can modify
CREATE POLICY "View family categories" ON public.categories
  FOR SELECT USING (user_id IN (SELECT public.get_family_user_ids()));
CREATE POLICY "Insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses: family can view, only owner can modify
CREATE POLICY "View family expenses" ON public.expenses
  FOR SELECT USING (user_id IN (SELECT public.get_family_user_ids()));
CREATE POLICY "Insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Update trigger to create family on signup + auto-accept invitations
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
  new_family_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);

  INSERT INTO public.families (name, created_by)
  VALUES ('Keluarga ' || COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.id)
  RETURNING id INTO new_family_id;

  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, new.id, 'admin');

  INSERT INTO public.wallets (user_id, name, icon, type) VALUES
  (new.id, 'Dompet Utama', 'wallet', 'wallet'),
  (new.id, 'Cash', 'cash', 'wallet');

  INSERT INTO public.categories (user_id, name, icon, type) VALUES
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

  -- Auto-accept pending invitations for this email
  INSERT INTO public.family_members (family_id, user_id, role)
  SELECT fi.family_id, new.id, 'member'
  FROM public.family_invitations fi
  WHERE fi.invited_email = new.email AND fi.status = 'pending'
  ON CONFLICT (family_id, user_id) DO NOTHING;

  UPDATE public.family_invitations
  SET status = 'accepted'
  WHERE invited_email = new.email AND status = 'pending';

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create families for existing users who don't have one yet
DO $$
DECLARE
  r RECORD;
  new_fam_id uuid;
BEGIN
  FOR r IN SELECT id, full_name, email FROM public.profiles
    WHERE id NOT IN (SELECT user_id FROM public.family_members)
  LOOP
    INSERT INTO public.families (name, created_by)
    VALUES ('Keluarga ' || COALESCE(r.full_name, split_part(r.email, '@', 1)), r.id)
    RETURNING id INTO new_fam_id;

    INSERT INTO public.family_members (family_id, user_id, role)
    VALUES (new_fam_id, r.id, 'admin');
  END LOOP;
END $$;
