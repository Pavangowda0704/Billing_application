import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { useCart } from './CartContext';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user: loggedInUser } = await api.login(username, password);
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setUser(null);
    clearCart();
  }, [clearCart]);

  // --- THIS IS THE NEW FUNCTION THAT WAS MISSING ---
  const updateWalletBalance = useCallback((newBalance) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      
      // Create the updated user object
      const updatedUser = { ...currentUser, walletBalance: newBalance };
      
      // Update local storage so the balance stays after a refresh
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Return the new user object to update the app's state
      return updatedUser;
    });
  }, []);
  // --------------------------------------------------

  const isAuthenticated = !!user;

  return (
    // --- THE newBalance FUNCTION IS NOW ADDED TO THE VALUE ---
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateWalletBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};