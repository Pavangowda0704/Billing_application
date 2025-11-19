import React from 'react';

const Input = ({ label, id, icon, ...props }) => {
  const hasIcon = !!icon;
  return (
    <div>
      {/* The "sr-only" class was removed from here to make the label visible */}
      <label htmlFor={id} className="block text-sm text-left font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {hasIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
        )}
        <input
            id={id}
            className={`mt-1 block w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100 ${hasIcon ? 'pl-10 pr-3' : 'px-3'}`}
            {...props}
        />
      </div>
    </div>
  );
};

export default Input;