import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import { Product, ProductVariant, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  couponCode: string | null;
  couponDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price_adjustment
      ? item.price + item.variant.price_adjustment
      : item.price;
    return sum + price * item.quantity;
  }, 0);
  const discount = couponDiscount;
  const total = subtotal - discount;

  useEffect(() => {
    if (user) {
      fetchCartItems(user.id);
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*, categories (*)),
          product_variants (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product: item.products,
        variant_id: item.variant_id,
        variant: item.product_variants,
        quantity: item.quantity,
        price: item.price,
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, variant: ProductVariant, quantity = 1) => {
    const existingIndex = items.findIndex(
      (item) => item.product_id === product.id && item.variant_id === variant.id
    );

    if (existingIndex > -1) {
      const newQuantity = items[existingIndex].quantity + quantity;
      await updateQuantity(items[existingIndex].id, newQuantity);
      return;
    }

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      product,
      variant_id: variant.id,
      variant,
      quantity,
      price: product.price,
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            variant_id: variant.id,
            quantity,
            price: product.price,
          })
          .select()
          .single();

        if (!error && data) {
          newItem.id = data.id;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }

    setItems([...items, newItem]);
  };

  const removeItem = async (itemId: string) => {
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('id', itemId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq('id', itemId);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }

    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, message: 'Invalid coupon code' };
      }

      const now = new Date();
      const startsAt = new Date(data.starts_at);
      const expiresAt = new Date(data.expires_at);

      if (now < startsAt || now > expiresAt) {
        return { success: false, message: 'Coupon has expired' };
      }

      if (data.max_uses && data.uses_count >= data.max_uses) {
        return { success: false, message: 'Coupon has reached maximum uses' };
      }

      if (data.min_order_amount && subtotal < data.min_order_amount) {
        return {
          success: false,
          message: `Minimum order amount is ${data.min_order_amount}`
        };
      }

      let discountAmount = 0;
      if (data.type === 'percentage') {
        discountAmount = (subtotal * data.value) / 100;
      } else {
        discountAmount = data.value;
      }

      setCouponCode(code);
      setCouponDiscount(discountAmount);
      return { success: true, message: 'Coupon applied successfully' };
    } catch (error) {
      return { success: false, message: 'Error applying coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        subtotal,
        discount,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        couponCode,
        couponDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
