import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import * as api from '@/services/api';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import Input from '@/components/Input'; // Import Input

const Checkout = () => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [hardwareState, setHardwareState] = useState({ count: 0, weight: 0 });
    const [isSimulating, setIsSimulating] = useState(false); // Kept for loading state on manual sync
    const { items, totalAmount, totalWeight, totalCount } = useCart(); 
    const navigate = useNavigate();
    const { showToast } = useToast();

    // State for manual input
    const [manualCount, setManualCount] = useState('');
    const [manualWeight, setManualWeight] = useState('');

    // Fetches the current hardware state from the server
    const fetchHardwareState = async () => {
        try {
            const state = await api.getHardwareState();
            setHardwareState(state);
        } catch (error) {
            console.error("Failed to fetch hardware state", error);
        }
    };
    
    // Handler for manual sync
    const handleManualSync = async () => {
        setIsSimulating(true);
        try {
            const count = parseInt(manualCount, 10) || 0;
            const weight = parseFloat(manualWeight) || 0.0;
            
            // Calls the api.js function
            await api.setHardwareState(count, weight); 
            
            await fetchHardwareState();
            showToast("Hardware state manually set", "success");
        } catch (error) {
            showToast(`Failed to set state: ${error.message}`, "error");
        } finally {
            setIsSimulating(false);
        }
    };
    
    // Poll the server for hardware data
    useEffect(() => {
        fetchHardwareState();
        const intervalId = setInterval(fetchHardwareState, 2000);
        return () => clearInterval(intervalId);
    }, []);

    // Run verification
    const handleVerifyAndPay = async () => {
        setIsVerifying(true);
        try {
            const result = await api.verifyCheckout(items, totalWeight, totalCount); 
            if (result.status === 'OK') {
                showToast('Cart verified successfully!', 'success');
                navigate('/payment');
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md text-center py-8 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Final Bill & Verification</h2>

                {/* --- SIMULATOR CONTROLS REMOVED --- */}
                
                {/* --- MANUAL HARDWARE ENTRY --- */}
                <div className="my-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-bold mb-3 dark:text-white">Enter hardware live data</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            id="manualCount"
                            label="Actual Count"
                            type="number"
                            placeholder="e.g., 4"
                            value={manualCount}
                            onChange={(e) => setManualCount(e.target.value)}
                        />
                        <Input
                            id="manualWeight"
                            label="Actual Weight (g)"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 0.00"
                            value={manualWeight}
                            onChange={(e) => setManualWeight(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={handleManualSync} 
                        isLoading={isSimulating}
                        className="w-full mt-4 text-sm py-2"
                    >
                         Sync Hardware
                    </Button>
                </div>
                {/* --- END MANUAL CONTROLS --- */}
                
                {/* This box shows SOFTWARE data (from the app) */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-2 text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                     <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Software Calculation (Your Cart):</h4>
                     <p className="flex justify-between"><span>Expected Item Count:</span> <strong>{totalCount}</strong></p>
                     <p className="flex justify-between"><span>Expected Total Weight:</span> <strong>{totalWeight.toFixed(2)} g</strong></p>
                </div>

                {/* This box shows HARDWARE data (live from server) */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2 text-left bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg border border-blue-300">
                     <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Hardware Sensors (Live Data):</h4>
                     <p className="flex justify-between"><span>Actual Item Count:</span> <strong>{hardwareState.count}</strong></p>
                     <p className="flex justify-between"><span>Actual Total Weight:</span> <strong>{hardwareState.weight.toFixed(2)} g</strong></p>
                </div>

                <div className="text-2xl font-extrabold text-gray-900 dark:text-white flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-4 mb-8">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                {isVerifying ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Spinner />
                        <p className="text-gray-600 dark:text-gray-400">Verifying cart against hardware sensors...</p>
                    </div>
                ) : (
                    <Button onClick={handleVerifyAndPay} isLoading={isVerifying} disabled={items.length === 0}>
                        Verify Cart & Proceed to Payment
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Checkout;