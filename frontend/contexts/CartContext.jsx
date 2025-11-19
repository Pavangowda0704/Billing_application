import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  });

  const [budget, setBudgetState] = useState(() => {
     try {
      const savedBudget = localStorage.getItem('budget');
      return savedBudget ? JSON.parse(savedBudget) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const setBudget = (amount) => {
    localStorage.setItem('budget', JSON.stringify(amount));
    setBudgetState(amount);
  }
  
  const addItem = useCallback((product, quantityToAdd = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        let newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > product.stock) {
            newQuantity = product.stock;
        }
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: newQuantity } : item
        );
      }
      if (product.stock > 0) {
        const initialQuantity = Math.min(quantityToAdd, product.stock);
        return [...prevItems, { ...product, quantity: initialQuantity }];
      }
      return prevItems;
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  }, []);
  
  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prevItems) => {
      const itemToUpdate = prevItems.find(item => item._id === productId);
      if (!itemToUpdate) return prevItems;

      if (quantity <= 0) {
        return prevItems.filter((item) => item._id !== productId);
      }
      if (quantity > itemToUpdate.stock) {
          return prevItems.map((item) =>
            item._id === productId ? { ...item, quantity: itemToUpdate.stock } : item
          );
      }
      return prevItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setBudgetState(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('budget');
  }, []);

  const totalAmount = items.reduce((sum, item) => {
    const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  // --- NEW: Calculate Total Weight and Count ---
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = typeof item.weight === 'number' ? item.weight : 0;
    return sum + (itemWeight * item.quantity);
  }, 0);

  const totalCount = items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount, totalWeight, totalCount, budget, setBudget }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
