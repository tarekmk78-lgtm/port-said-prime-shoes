-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role WITHOUT causing infinite RLS recursion.
-- A policy on `profiles` that queries `profiles` again inside itself (as a plain
-- subquery) re-triggers RLS evaluation on every row, recursing forever. Wrapping
-- the check in a SECURITY DEFINER function breaks that cycle, since the function
-- runs with the privileges of its owner rather than re-applying the caller's RLS.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Profiles policies
CREATE POLICY "profiles_select_authenticated" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "categories_select_public" ON categories FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "categories_select_admin" ON categories FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (is_admin());

-- Products policies (public read, admin write)
CREATE POLICY "products_select_public" ON products FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "products_select_admin" ON products FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "products_insert_admin" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "products_update_admin" ON products FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "products_delete_admin" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- Product Variants policies
CREATE POLICY "product_variants_select_public" ON product_variants FOR SELECT
  TO public USING (EXISTS (SELECT 1 FROM products WHERE id = product_id AND is_active = true));

CREATE POLICY "product_variants_select_admin" ON product_variants FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "product_variants_insert_admin" ON product_variants FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "product_variants_update_admin" ON product_variants FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "product_variants_delete_admin" ON product_variants FOR DELETE
  TO authenticated USING (is_admin());

-- Addresses policies (users manage own addresses, admin can see all)
CREATE POLICY "addresses_select_own" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "addresses_insert_own" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Order Items policies
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (user_id = auth.uid() OR is_admin())));

CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));

-- Reviews policies
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT
  TO public USING (is_approved = true);

CREATE POLICY "reviews_select_own" ON reviews FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "reviews_update_admin" ON reviews FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR is_admin());

-- Wishlists policies
CREATE POLICY "wishlists_select_own" ON wishlists FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert_own" ON wishlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete_own" ON wishlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Coupons policies
CREATE POLICY "coupons_select_admin" ON coupons FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "coupons_select_valid" ON coupons FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "coupons_insert_admin" ON coupons FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "coupons_update_admin" ON coupons FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "coupons_delete_admin" ON coupons FOR DELETE
  TO authenticated USING (is_admin());

-- Banners policies (public read active, admin full access)
CREATE POLICY "banners_select_public" ON banners FOR SELECT
  TO public USING (is_active = true);

CREATE POLICY "banners_select_admin" ON banners FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "banners_insert_admin" ON banners FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "banners_update_admin" ON banners FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "banners_delete_admin" ON banners FOR DELETE
  TO authenticated USING (is_admin());

-- Settings policies (public read, admin write)
CREATE POLICY "settings_select_public" ON settings FOR SELECT
  TO public USING (true);

CREATE POLICY "settings_update_admin" ON settings FOR UPDATE
  TO authenticated USING (is_admin());

-- Cart Items policies
CREATE POLICY "cart_items_select_own" ON cart_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_own" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_own" ON cart_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_own" ON cart_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default settings
INSERT INTO settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;