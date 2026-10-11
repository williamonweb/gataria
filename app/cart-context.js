'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const CART_STORAGE_KEY = 'gataria-cart-v1';

const CartContext = createContext(null);

function itemKey(item) {
  return [item.id, item.model || '', item.color || '', item.size || ''].join('::');
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  return Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
}

export function parseBRL(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch (error) {
      console.error('Não foi possível carregar o carrinho da Gataria.', error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Não foi possível salvar o carrinho da Gataria.', error);
    }
  }, [items, ready]);

  const addItem = useCallback((product, options = {}) => {
    const requested = normalizeQuantity(options.quantity);
    const maxStock = Math.max(0, Number(product.stock) || 0);
    const nextItem = {
      id: String(product.id),
      slug: product.slug || product.id,
      name: product.name,
      image: product.image,
      sku: product.sku || '',
      price: product.price,
      pix: product.pix,
      stock: maxStock,
      model: options.model || '',
      color: options.color || '',
      size: options.size || '',
      quantity: Math.min(requested, maxStock || requested)
    };
    const key = itemKey(nextItem);

    setItems((current) => {
      const existing = current.find((item) => itemKey(item) === key);
      if (!existing) return [...current, nextItem];
      return current.map((item) => itemKey(item) === key
        ? { ...item, quantity: Math.min(item.quantity + requested, maxStock || item.quantity + requested) }
        : item);
    });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((current) => current.map((item) => {
      if (itemKey(item) !== key) return item;
      const maxStock = Math.max(1, Number(item.stock) || 1);
      return { ...item, quantity: Math.min(normalizeQuantity(quantity), maxStock) };
    }));
  }, []);

  const removeItem = useCallback((key) => {
    setItems((current) => current.filter((item) => itemKey(item) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const count = useMemo(() => items.reduce((total, item) => total + normalizeQuantity(item.quantity), 0), [items]);
  const subtotal = useMemo(() => items.reduce((total, item) => total + parseBRL(item.price) * normalizeQuantity(item.quantity), 0), [items]);
  const pixSubtotal = useMemo(() => items.reduce((total, item) => total + parseBRL(item.pix || item.price) * normalizeQuantity(item.quantity), 0), [items]);

  const value = useMemo(() => ({
    items,
    ready,
    count,
    subtotal,
    pixSubtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemKey: itemKey
  }), [items, ready, count, subtotal, pixSubtotal, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider.');
  return context;
}
