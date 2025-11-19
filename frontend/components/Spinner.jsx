import React from 'react';

const Spinner = ({ size = 'md', color = 'border-primary-500' }) => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 ${color}`} />
  );
};

export default Spinner;