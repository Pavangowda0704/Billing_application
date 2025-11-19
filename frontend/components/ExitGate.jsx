import React from 'react';
import { ICONS } from '../constants';

const ExitGate = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-800 dark:text-gray-200">
            {/* Gate Animation */}
            <div className="relative w-full max-w-sm h-64 overflow-hidden mb-8 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-inner">
                <div className="absolute top-0 left-0 h-full w-1/2 bg-gray-500 dark:bg-gray-800 border-r-2 border-gray-600 dark:border-gray-900 origin-left animate-gate-open" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-0 right-0 h-full w-1/2 bg-gray-500 dark:bg-gray-800 border-l-2 border-gray-600 dark:border-gray-900 origin-right animate-gate-open" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">GATE OPENING</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center">
                <div className="w-16 h-16 text-green-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-2">Cart Paid ✅</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Thank you for shopping with us!</p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">You may now exit through the gate.</p>
            </div>
        </div>
    );
};

export default ExitGate;