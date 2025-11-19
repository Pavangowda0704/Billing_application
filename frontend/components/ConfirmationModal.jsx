import React from 'react';
import Button from './Button';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rounded-b-xl">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;