import React, { useState, useEffect } from 'react';
import Button from './Button';
import Spinner from './Spinner'; // <-- 1. IMPORT SPINNER

const ProductConfirmationModal = ({ isOpen, product, onConfirm, onCancel }) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 whenever a new product is shown
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  // --- 2. ADD THIS LOADING STATE ---
  // If the modal is open but there's no product yet, show a spinner.
  if (!product) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs text-center p-8 flex flex-col items-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-700 dark:text-gray-300">Looking up product...</p>
            </div>
        </div>
    );
  }
  // --- END OF NEW LOADING STATE ---

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };
  
  const hasDiscount = product.discountPrice && product.discountPrice > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
        {/* Close button on the top right of the screen */}
        <button onClick={onCancel} className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300">&times;</button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add to Cart?</h3>
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-24 h-24 rounded-lg object-contain mx-auto mb-4" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/e2e8f0/e2e8f0?text='; }}
                />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{product.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white my-2">
                    ₹{(hasDiscount ? product.discountPrice : product.price).toFixed(2)}
                </p>
                
                {/* Quantity Selector */}
                <div className="flex items-center justify-center space-x-4 my-4">
                    <button onClick={handleDecrement} disabled={quantity <= 1} className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-xl">-</button>
                    <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                    <button onClick={handleIncrement} disabled={quantity >= product.stock} className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-xl">+</button>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-2 gap-4 rounded-b-xl">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" onClick={() => onConfirm(quantity)}>
                    Add to Cart
                </Button>
            </div>
        </div>
    </div>
  );
};

export default ProductConfirmationModal;