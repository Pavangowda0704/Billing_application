import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ICONS } from '../constants';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { items } = useCart();
    const { user, logout } = useAuth(); // <-- Get user from Auth
    const location = useLocation();
    const navigate = useNavigate();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const getPageTitle = () => {
        if (user?.role === 'admin') {
            return 'Admin Dashboard';
        }
        switch (location.pathname) {
            case '/dashboard': return 'My Dashboard';
            case '/scan': return 'Scan Products';
            case '/cart': return 'Your Cart';
            case '/checkout': return 'Checkout';
            case '/payment': return 'Payment';
            case '/wallet': return 'My Wallet'; // <-- ADDED TITLE
            case '/exit': return 'Thank You!';
            case '/history': return 'Order History';
            default: return 'Smart Cart';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/'); 
    };
    
    const navLinkClasses = ({ isActive }) => {
        const baseClasses = 'relative p-2 rounded-full transition-colors duration-200';
        const activeClasses = 'bg-primary-50 text-primary-600 dark:bg-primary-900';
        const inactiveClasses = 'hover:bg-gray-200 dark:hover:bg-gray-700';
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 text-gray-800 dark:text-gray-200">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{getPageTitle()}</h1>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <nav className="flex items-center space-x-2 md:space-x-4">
                        {user?.role === 'user' && (
                            <>
                                <NavLink to="/dashboard" className={navLinkClasses} title="Dashboard">{ICONS.home}</NavLink>
                                <NavLink to="/scan" className={navLinkClasses} title="Scan">{ICONS.scan}</NavLink>
                                
                                {/* --- 1. ADDED WALLET LINK --- */}
                                <NavLink to="/wallet" className={navLinkClasses} title="My Wallet">
                                    {ICONS.wallet}
                                </NavLink>
                                
                                <NavLink to="/cart" className={navLinkClasses} title="Cart">
                                    {ICONS.cart}
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </NavLink>
                                <NavLink to="/history" className={navLinkClasses} title="Order History">{ICONS.history}</NavLink>
                            </>
                        )}
                        {user?.role === 'admin' && (
                            <NavLink to="/admin/dashboard" className={navLinkClasses} title="Dashboard">{ICONS.dashboard}</NavLink>
                        )}
                    </nav>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Toggle dark mode">
                        {theme === 'dark' ? ICONS.sun : ICONS.moon}
                    </button>
                    {/* --- 2. ADDED WALLET BALANCE TO HEADER --- */}
                    {user?.role === 'user' && (
                        <div 
                            className="text-sm font-semibold text-primary-600 dark:text-primary-400 p-2 rounded-full bg-primary-50 dark:bg-primary-900 cursor-pointer"
                            onClick={() => navigate('/wallet')}
                            title="Wallet Balance"
                        >
                            ₹{user.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}
                        </div>
                    )}
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Logout" title="Logout">
                        {ICONS.logout}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;