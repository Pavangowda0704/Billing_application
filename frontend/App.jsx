import React, { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { ToastProvider, useToast } from './contexts/ToastContext';

// Pages & Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import ScanProduct from './pages/ScanProduct';
import CartSummary from './pages/CartSummary';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import ExitGate from './components/ExitGate';
import Header from './components/Header';
import HeaderPublic from './components/HeaderPublic';
import Footer from './components/Footer';
import Toast from './components/Toast';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import Wallet from './pages/Wallet';
import RegisterCart from './pages/RegisterCart';
import StoreLocator from './pages/StoreLocator'; // <--- 1. IMPORT THE NEW PAGE

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.role === 'user' ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/login" replace />;
};

// This component ensures logged-in users don't see the public home page.
const HomeRoute = () => {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated) {
        return user?.role === 'admin' 
            ? <Navigate to="/admin/dashboard" replace /> 
            : <Navigate to="/dashboard" replace />;
    }
    return <Home />;
};

const AppRoutes = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    
    const isPublicPage = ['/login', '/register', '/forgot-password', '/locations'].includes(location.pathname); // <-- Added /locations
    const isHomePage = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen font-sans">
            {isAuthenticated && !isPublicPage && <Header />}
            {/* --- UPDATED: Show public header on /locations page too --- */}
            {!isAuthenticated && (isHomePage || location.pathname === '/locations') && <HeaderPublic />}
            
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomeRoute />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/locations" element={<StoreLocator />} /> {/* <-- 2. ADD THE ROUTE */}
                    
                    {/* User Routes */}
                    <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
                    <Route path="/scan" element={<PrivateRoute><ScanProduct /></PrivateRoute>} />
                    <Route path="/cart" element={<PrivateRoute><CartSummary /></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
                    <Route path="/exit" element={<PrivateRoute><ExitGate /></PrivateRoute>} />
                    <Route path="/history" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
                    <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
                    <Route path="/register-cart" element={<PrivateRoute><RegisterCart /></PrivateRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                </Routes>
            </main>
            
            {/* --- UPDATED: Show footer on /locations page too --- */}
            {!isAuthenticated && (isHomePage || location.pathname === '/locations') && <Footer />}
        </div>
    );
};

const AppContent = () => {
  const { message, type, isVisible, showToast } = useToast();
  const { totalAmount, budget } = useCart();
  const prevTotalAmountRef = useRef(totalAmount);

  useEffect(() => {
    if (!budget || totalAmount <= prevTotalAmountRef.current) {
        prevTotalAmountRef.current = totalAmount;
        return;
    }

    const budgetWarningThreshold = budget * 0.9;

    if (prevTotalAmountRef.current < budget && totalAmount > budget) {
        showToast(`Budget of ₹${budget} exceeded!`, 'error');
    } else if (prevTotalAmountRef.current < budgetWarningThreshold && totalAmount >= budgetWarningThreshold && prevTotalAmountRef.current < budget) {
        showToast(`Nearing your budget of ₹${budget}.`, 'info');
    }

    prevTotalAmountRef.current = totalAmount;
  }, [totalAmount, budget, showToast]);

  return (
    <>
      <AppRoutes />
      <Toast message={message} type={type} isVisible={isVisible} />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>
            <HashRouter>
              <AppContent />
            </HashRouter>
          </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;