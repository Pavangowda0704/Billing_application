import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import Button from '../components/Button';
import Input from '../components/Input';

const RegisterCart = () => {
    const [budgetInput, setBudgetInput] = useState('');
    const { setBudget } = useCart();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSetBudget = (e) => {
        e.preventDefault();
        const budgetAmount = parseFloat(budgetInput);
        if (!budgetInput) {
            // If the input is empty, just proceed without a budget
            navigate('/scan');
            return;
        }
        if (isNaN(budgetAmount) || budgetAmount <= 0) {
            showToast('Please enter a valid budget amount.', 'error');
            return;
        }
        setBudget(budgetAmount);
        showToast(`Budget of ₹${budgetAmount} set. Happy shopping!`, 'success');
        navigate('/scan');
    };

    return (
        <div className="container mx-auto max-w-lg text-center flex flex-col items-center justify-center h-full">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full">
                <form onSubmit={handleSetBudget}>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Set Your Shopping Budget</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Enter your budget to get alerts as you shop. This is an optional step.
                    </p>
                    <Input 
                        id="budget"
                        label="Budget Amount (₹)"
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        placeholder="e.g., 2000"
                        min="1"
                    />
                    <Button type="submit" className="mt-6">
                        Start Shopping
                    </Button>
                     <Button variant="secondary" onClick={() => navigate('/scan')} className="mt-4">
                        Skip for Now
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RegisterCart;

