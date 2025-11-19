import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((msg, toastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, message, type, isVisible }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};