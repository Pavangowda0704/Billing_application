import React, { useState, useEffect } from 'react';

const AccessibilityWidget = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [fontSize, setFontSize] = useState(16); // Base font size in pixels
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        root.style.fontSize = `${fontSize}px`; // Apply base font size
        
        if (isHighContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [fontSize, isHighContrast]);

    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24)); // Cap at 24px
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12)); // Cap at 12px
    const toggleHighContrast = () => setIsHighContrast(prev => !prev);

    return (
        <div className="fixed bottom-5 left-5 z-50">
            {isMenuOpen && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl mb-2 w-48 border border-gray-300 dark:border-gray-600">
                    <h4 className="font-bold text-center mb-3 dark:text-white text-sm">Accessibility</h4>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs dark:text-gray-300">Font Size</span>
                        <div className="flex space-x-1">
                            <button onClick={decreaseFontSize} className="font-bold border rounded-md w-6 h-6 text-sm">-</button>
                            <button onClick={increaseFontSize} className="font-bold border rounded-md w-6 h-6 text-sm">+</button>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs dark:text-gray-300">High Contrast</span>
                        <button onClick={toggleHighContrast} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isHighContrast ? 'bg-primary-600' : 'bg-gray-300'}`}>
                            <span className={`block w-4 h-4 bg-white rounded-full transform transition-transform ${isHighContrast ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-14 h-14 rounded-full bg-gray-700 dark:bg-gray-600 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                aria-label="Accessibility Options"
                title="Accessibility Options"
            >
                {/* Accessibility Icon */}
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.07.207-.141.414-.214.618M4.038 16.059A10.94 10.94 0 0012 19c2.193 0 4.22-.647 5.962-1.741" /></svg>
            </button>
        </div>
    );
};

export default AccessibilityWidget;

