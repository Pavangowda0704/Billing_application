import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
// --- 1. IMPORT useAuth ---
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { ICONS } from '../constants'; 

const Payment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingWallet, setIsFetchingWallet] = useState(false); // Set to false
    const { totalAmount, items, clearCart } = useCart();
    
    // --- 2. GET USER *AND* updateWalletBalance FUNCTION ---
    const { user, updateWalletBalance } = useAuth(); 
    
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Get balance directly from the logged-in user object
    const walletBalance = user?.walletBalance || 0;

    // Fetch wallet balance on load
    useEffect(() => {
        if (!user) {
            showToast('You must be logged in to pay.', 'error');
            navigate('/login');
            return;
        }

        // We don't need to fetch if we trust the context
        setIsFetchingWallet(false);
        
    }, [user, navigate, showToast]);

    // Handle the payment logic when a button is clicked
    const handlePayment = async (paymentMethod) => {
        setIsLoading(true);
        
        try {
            // --- 3. CAPTURE THE API RESULT ---
            const result = await api.processPayment(totalAmount, items, user.id, paymentMethod);
            
            if (result.success) {
                
                // --- 4. CHECK FOR newBalance AND UPDATE THE CONTEXT ---
                if (paymentMethod === 'wallet' && result.newBalance !== undefined) {
                    updateWalletBalance(result.newBalance);
                }

                showToast('Payment successful!', 'success');
                setTimeout(() => {
                    clearCart();
                    navigate('/exit');
                }, 1500);
            }
        } catch (error) {
            showToast(error.message || 'An error occurred during payment.', 'error');
            setIsLoading(false);
        }
    };

    if (isFetchingWallet) {
         return (
             <div className="container mx-auto max-w-md text-center flex items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg flex flex-col items-center space-y-6">
                    <Spinner size="lg" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fetching Wallet...</h2>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
         return (
             <div className="container mx-auto max-w-md text-center flex items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg flex flex-col items-center space-y-6">
                    <Spinner size="lg" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Processing Payment...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please do not refresh the page.</p>
                </div>
            </div>
        );
    }

    const canAffordWithWallet = walletBalance >= totalAmount;

    return (
        <div className="container mx-auto max-w-md text-center py-8 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Choose Payment Method</h2>
                
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
                    Total: ₹{totalAmount.toFixed(2)}
                </div>

                <div className="space-y-4">
                    {/* Inbuilt Wallet Option */}
                    <Button 
                        onClick={() => handlePayment('wallet')} 
                        isLoading={isLoading} 
                        disabled={!canAffordWithWallet}
                        className="!justify-between" 
                    >
                        <span className="flex items-center">
                            {ICONS.wallet} {/* <-- USE ICON */}
                            <span className="ml-3">Pay with Wallet</span>
                        </span>
                        <span className={`text-sm ${canAffordWithWallet ? 'text-green-300' : 'text-red-300'}`}>
                            Bal: ₹{walletBalance.toFixed(2)}
                        </span>
                    </Button>
                    {!canAffordWithWallet && (
                        <p className="text-xs text-red-500 -mt-2">Not enough balance to pay with wallet.</p>
                    )}

                    {/* Other Payment Options (Disabled for now) */}
                    <Button 
                        onClick={() => showToast('UPI is not yet implemented', 'info')}
                        variant="secondary"
                        disabled
                        className="!justify-start opacity-50" // Added opacity
                    >
                         {ICONS.phone} {/* Using phone icon for UPI */}
                         <span className="ml-3">Pay with UPI (Coming Soon)</span>
                    </Button>
                    
                    <Button 
                        onClick={() => showToast('Card payment is not yet implemented', 'info')}
                        variant="secondary"
                        disabled
                        className="!justify-start opacity-50" // Added opacity
                    >
                         {ICONS.checkout}
                         <span className="ml-3">Pay with Card (Coming Soon)</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Payment;