import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { ICONS } from '../constants';
import Spinner from '../components/Spinner';

const Wallet = () => {
    const { user, updateWalletBalance } = useAuth(); // Get user and the new update function
    const { showToast } = useToast();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get the current balance directly from the auth context
    const currentBalance = user?.walletBalance || 0;

    // This function no longer needs the 'event' parameter
    const handleAddMoney = async () => {
        const addAmount = parseFloat(amount);

        if (isNaN(addAmount) || addAmount <= 0) {
            showToast('Please enter a valid amount to add.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // This simulates a real payment gateway (like Razorpay) succeeding
            const { newBalance } = await api.addMoneyToWallet(user.id, addAmount);

            // Update the wallet balance in our global AuthContext
            // We need to add `updateWalletBalance` to AuthContext.jsx to fix this
            if (updateWalletBalance) {
                updateWalletBalance(newBalance);
            }
            
            showToast(`₹${addAmount.toFixed(2)} added to your wallet.`, 'success');
            setAmount(''); // Clear the input field
        } catch (error) {
            showToast(error.message || 'Failed to add money.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helper variables for the new UI ---
    const addAmountNum = parseFloat(amount) || 0;
    const isValidAmount = addAmountNum > 0 && !isLoading;

    return (
        <div className="container mx-auto max-w-md text-center py-8 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="flex justify-center text-primary-600 dark:text-primary-400 mb-4">
                    {/* Use React.cloneElement to resize the icon from constants */}
                    <div className="w-20 h-20">
                         {React.cloneElement(ICONS.wallet, { className: "w-20 h-20" })}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Smart Wallet</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Your current available balance.</p>

                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-8">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        ₹{currentBalance.toFixed(2)}
                    </p>
                </div>

                {/* --- UPDATED SECTION --- */}
                {/* We removed the <form> tag and now use onClick for each button */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Money to Wallet</h3>
                    
                    <Input
                        id="amount"
                        label="Amount to Add (₹)"
                        type="number"
                        placeholder="e.g., 500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                        disabled={isLoading}
                    />
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 my-4">
                        This simulates a successful payment.
                    </p>

                    <div className="space-y-4">
                        <Button 
                            onClick={handleAddMoney} 
                            isLoading={isLoading} 
                            disabled={!isValidAmount}
                            className="!justify-start w-full"
                            icon={ICONS.phone} // Icon from constants.jsx
                        >
                            {isLoading ? 'Processing...' : `Pay ₹${addAmountNum.toFixed(2)} with UPI`}
                        </Button>

                        <Button 
                            onClick={handleAddMoney} 
                            isLoading={isLoading} 
                            disabled={!isValidAmount}
                            className="!justify-start w-full"
                            variant="secondary"
                            icon={ICONS.checkout} // Icon from constants.jsx
                        >
                            {isLoading ? 'Processing...' : `Pay ₹${addAmountNum.toFixed(2)} with Card`}
                        </Button>
                    </div>
                </div>
                {/* --- END OF UPDATED SECTION --- */}
            </div>
        </div>
    );
};

export default Wallet;