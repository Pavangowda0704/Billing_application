import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/Button';
import { ICONS } from '../constants';

const CartItemRow = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();
    const { showToast } = useToast();
    const hasDiscount = item.discountPrice && item.discountPrice > 0;

    const handleRemove = () => {
        removeItem(item._id);
        showToast(`${item.name} removed from cart.`, 'info');
    };
    
    const isOutOfStock = item.stock < item.quantity;

    return (
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h3>
                <div className="flex items-center space-x-2">
                    <p className={`text-sm font-bold ${hasDiscount ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        ₹{hasDiscount ? item.discountPrice.toFixed(2) : item.price.toFixed(2)}
                    </p>
                    {hasDiscount && <p className="text-xs text-gray-400 line-through">₹{item.price.toFixed(2)}</p>}
                </div>
                {item.promotionText && <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{item.promotionText}</p>}
                {isOutOfStock && <p className="text-xs font-bold text-red-500">Not enough stock!</p>}
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{ICONS.minus}</button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{ICONS.plus}</button>
            </div>
            <button onClick={handleRemove} className="ml-4 p-2 text-red-500 hover:text-red-700">{ICONS.trash}</button>
        </div>
    );
}

const BudgetTracker = () => {
    // ... (This component remains the same)
};

const CartSummary = () => {
    const { items, totalAmount } = useCart();
    const navigate = useNavigate();

    const isAnyItemOutOfStock = items.some(item => item.stock < item.quantity);

    return (
        <div className="container mx-auto max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <BudgetTracker />
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart Summary</h2>
                </div>
                
                {items.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <p>Your cart is empty.</p>
                        <Button onClick={() => navigate('/scan')} className="mt-4 max-w-xs mx-auto">Start Scanning</Button>
                    </div>
                ) : (
                    <div>
                        <div className="max-h-80 overflow-y-auto">
                            {items.map(item => <CartItemRow key={item._id} item={item} />)}
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center text-lg font-bold mb-6">
                                <span className="text-gray-800 dark:text-gray-200">Total Amount:</span>
                                <span className="text-primary-600 dark:text-primary-400">₹{totalAmount.toFixed(2)}</span>
                            </div>
                            {isAnyItemOutOfStock && (
                                <p className="text-center text-red-500 font-semibold mb-4">Please resolve stock issues before proceeding.</p>
                            )}
                            <Button 
                                onClick={() => navigate('/checkout')} 
                                icon={ICONS.checkout}
                                disabled={isAnyItemOutOfStock}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSummary;