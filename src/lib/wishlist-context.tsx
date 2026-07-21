import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { Product } from '../types';

interface WishlistContextType {
  productIds: string[];
  products: Product[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_KEY = 'wishlist_guest_ids';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      migrateGuestWishlist(user.id).then(() => fetchFromSupabase(user.id));
    } else {
      const saved = localStorage.getItem(GUEST_KEY);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      setProductIds(ids);
      fetchProductsByIds(ids);
    }
  }, [user]);

  async function migrateGuestWishlist(userId: string) {
    const saved = localStorage.getItem(GUEST_KEY);
    const guestIds: string[] = saved ? JSON.parse(saved) : [];
    if (guestIds.length === 0) return;
    try {
      await supabase
        .from('wishlists')
        .upsert(guestIds.map((product_id) => ({ user_id: userId, product_id })), {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: true,
        });
    } catch (error) {
      console.error('Error migrating guest wishlist:', error);
    } finally {
      localStorage.removeItem(GUEST_KEY);
    }
  }

  async function fetchFromSupabase(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*, categories(*))')
        .eq('user_id', userId);
      if (error) throw error;
      const ids = (data || []).map((row: any) => row.product_id);
      const prods = (data || []).map((row: any) => row.products).filter(Boolean);
      setProductIds(ids);
      setProducts(prods);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductsByIds(ids: string[]) {
    setLoading(true);
    try {
      if (ids.length === 0) {
        setProducts([]);
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .in('id', ids);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  }

  function isWishlisted(productId: string) {
    return productIds.includes(productId);
  }

  async function toggleWishlist(product: Product): Promise<boolean> {
    const currentlyWishlisted = productIds.includes(product.id);

    if (user) {
      try {
        if (currentlyWishlisted) {
          await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
          setProductIds((prev) => prev.filter((id) => id !== product.id));
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
        } else {
          await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
          setProductIds((prev) => [...prev, product.id]);
          setProducts((prev) => [...prev, product]);
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        return currentlyWishlisted;
      }
    } else {
      const next = currentlyWishlisted
        ? productIds.filter((id) => id !== product.id)
        : [...productIds, product.id];
      setProductIds(next);
      localStorage.setItem(GUEST_KEY, JSON.stringify(next));
      setProducts((prev) =>
        currentlyWishlisted ? prev.filter((p) => p.id !== product.id) : [...prev, product]
      );
    }

    return !currentlyWishlisted;
  }

  async function removeFromWishlist(productId: string) {
    if (user) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    } else {
      const next = productIds.filter((id) => id !== productId);
      localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    }
    setProductIds((prev) => prev.filter((id) => id !== productId));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <WishlistContext.Provider
      value={{ productIds, products, loading, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
