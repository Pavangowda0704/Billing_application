import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';

const Toast = ({ message, type, isVisible }) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  const typeStyles = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900',
      border: 'border-green-500',
      icon: ICONS.checkCircle,
      text: 'text-green-800 dark:text-green-200'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900',
      border: 'border-red-500',
      icon: ICONS.xCircle,
      text: 'text-red-800 dark:text-red-200'
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      border: 'border-blue-500',
      icon: ICONS.infoCircle,
      text: 'text-blue-800 dark:text-blue-200'
    },
  };

  const styles = typeStyles[type];

  if (!show) return null;

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center border-l-4 transition-transform transform ${isVisible ? 'translate-x-0' : 'translate-x-full'} ${styles.bg} ${styles.border}`}>
        <div className="mr-3">
            {styles.icon}
        </div>
        <p className={`font-medium ${styles.text}`}>
            {message}
        </p>
    </div>
  );
};

export default Toast;