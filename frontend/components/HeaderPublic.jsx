import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- 1. IMPORT LINK
import { useTheme } from '../contexts/ThemeContext';
import { ICONS } from '../constants';
import Button from './Button';

const HeaderPublic = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md sticky top-0 z-10 text-gray-800 dark:text-gray-200">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    Smart Cart
                </h1>
                <div className="flex items-center space-x-2">
                    {/* --- 2. ADD THIS LINK --- */}
                    <Link 
                        to="/locations" 
                        className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm transition-colors"
                    >
                        Find a Location
                    </Link>

                    <Button onClick={() => navigate('/login')} className="w-auto px-4 py-2 text-sm">
                        Login
                    </Button>
                     <Button onClick={() => navigate('/register')} variant="secondary" className="w-auto px-4 py-2 text-sm">
                        Register
                    </Button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200" aria-label="Toggle dark mode">
                        {theme === 'dark' ? ICONS.sun : ICONS.moon}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderPublic;