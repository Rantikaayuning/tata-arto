CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE
  new_family_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);

  INSERT INTO public.families (name, created_by)
  VALUES ('Keluarga ' || coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.id)
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

  -- Note: Auto-accept pending family invitations logic removed. User must manually accept.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
