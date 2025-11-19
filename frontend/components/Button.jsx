import React from 'react';
import Spinner from './Spinner';

const Button = ({ children, isLoading = false, variant = 'primary', icon, className, ...props }) => {
  const baseClasses = "w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105";

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : (
        <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </>
      )}
    </button>
  );
};

export default Button;