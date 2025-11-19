import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Quagga from 'quagga';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import { ICONS } from '../constants';
import ProductConfirmationModal from '../components/ProductConfirmationModal';

// --- CameraScanner component with "Balanced" settings ---
const CameraScanner = ({ onDetected, onScannerReady, isPaused }) => {
    const scannerRef = useRef(null);
    const memoizedOnDetected = useCallback(onDetected, [onDetected]);

    useEffect(() => {
        let isMounted = true;
        
        const initQuagga = () => {
             if (!scannerRef.current) return;
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerRef.current,
                    constraints: { width: 640, height: 480, facingMode: "environment" }, 
                },
                locator: { patchSize: "medium", halfSample: true },
                numOfWorkers: navigator.hardwareConcurrency || 4,
                frequency: 10, // 10 scans per second
                decoder: {
                    readers: ["ean_reader", "upc_reader", "code_128_reader"],
                },
                locate: true,
            }, (err) => {
                if (err) {
                    if (isMounted) onScannerReady(false, "Camera initialization failed.");
                    return;
                }
                if (isMounted) {
                    Quagga.start();
                    onScannerReady(true, "Camera ready.");
                }
            });
            Quagga.onDetected(memoizedOnDetected);
        };
        
        // --- 1. LOGIC UPDATED ---
        // We now use isPaused to stop the scanner.
        if (!isPaused) {
            initQuagga();
        } else {
             if (Quagga.running) {
                Quagga.stop();
             }
        }

        return () => {
            isMounted = false;
            if (Quagga.running) {
                Quagga.offDetected(memoizedOnDetected);
                Quagga.stop();
            }
        };
    }, [memoizedOnDetected, onScannerReady, isPaused]); // isPaused is now a dependency

    // --- Visual overlay ---
    return (
        <div className="w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden relative shadow-lg border-4 border-gray-700">
            <div ref={scannerRef} id="scanner-viewport" style={{ width: '100%', height: '100%' }} />
            {!isPaused && (
                <div className="absolute inset-0 z-10">
                    <div className="absolute left-0 w-full h-1 bg-red-500/70 shadow-[0_0_10px_theme(colors.red.500)] animate-scan-line" />
                    <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-white/80 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-white/80 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-white/80 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-white/80 rounded-br-lg" />
                </div>
            )}
        </div>
    );
};
// --- End of CameraScanner ---


const ScanProduct = () => {
    const { addItem, items } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [scannerStatus, setScannerStatus] = useState({ ready: false, message: "Initializing camera..." });
    const [scannerType, setScannerType] = useState('phone');
    const [manualBarcode, setManualBarcode] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const lastScanTime = useRef(0);

    // --- 2. NEW STATE TO HOLD THE BARCODE ---
    const [foundBarcode, setFoundBarcode] = useState(null);
    const [hwBarcode, setHwBarcode] = useState('');
    
    // --- 3. This function is removed, its logic is in the new useEffect ---
    // const findAndShowProduct = ... (REMOVED)

    // --- 4. handleDetected is now VERY FAST ---
    // It only sets the barcode and does NO network calls.
    const handleDetected = useCallback((data) => {
        const now = Date.now();
        const cooldown = 3000; // 3-second cooldown
        // Don't scan if modal is open OR if we're already processing a barcode
        if (isModalOpen || foundBarcode || (now - lastScanTime.current < cooldown)) {
            return;
        }
        lastScanTime.current = now;
        
        const barcode = data.codeResult.code;
        if(barcode) {
            setFoundBarcode(barcode); // <-- This triggers the useEffect below
        }
    }, [isModalOpen, foundBarcode]); // Dependencies

    // --- 5. NEW useEffect to handle the "slow" part ---
    // This runs AFTER the scanner has stopped
    useEffect(() => {
        // If we have a barcode but the modal isn't open...
        if (foundBarcode && !isModalOpen) {
            
            // 1. Open the modal immediately (it will show a spinner)
            setIsModalOpen(true); 
            
            // 2. Define the async function to fetch the product
            const fetchProduct = async () => {
                try {
                    const product = await api.getProductByBarcode(foundBarcode);
                    if (product.stock > 0) {
                        setScannedProduct(product); // <-- This will replace the spinner in the modal
                    } else {
                        showToast(`${product.name} is out of stock`, 'error');
                        closeModalAndReset(); // Close the modal if out of stock
                    }
                } catch (error) {
                    showToast(error.message || `Product not found.`, 'error');
                    closeModalAndReset(); // Close the modal on error
                }
            };
            
            fetchProduct();
        }
    }, [foundBarcode, isModalOpen]); // This runs when foundBarcode changes


    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!manualBarcode) {
            showToast('Please enter a barcode.', 'info');
            return;
        }
        setFoundBarcode(manualBarcode); // <-- This triggers the useEffect
        setManualBarcode('');
    };

    const closeModalAndReset = () => {
        setIsModalOpen(false);
        setScannedProduct(null);
        setManualBarcode('');
        setHwBarcode('');
        setFoundBarcode(null); // <-- 6. CLEAR THE BARCODE
        lastScanTime.current = Date.now(); // Reset cooldown
    };

    const handleConfirm = (quantity) => {
        if (scannedProduct) {
            addItem(scannedProduct, quantity);
            showToast(`${quantity} x ${scannedProduct.name} added to cart`, 'success');
        }
        closeModalAndReset();
    };

    const handleCancel = () => {
        closeModalAndReset();
    };

    // Hardware scanner simulation (acts as a keyboard)
    useEffect(() => {
        // --- 7. LOGIC UPDATED ---
        // Don't listen if modal is open OR if we're processing a barcode
        if (scannerType !== 'hardware' || isModalOpen || foundBarcode) {
            return;
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (hwBarcode) {
                    setFoundBarcode(hwBarcode); // <-- This triggers the useEffect
                }
                setHwBarcode('');
            } else if (e.key.length === 1) {
                setHwBarcode(prev => prev + e.key);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };

    }, [scannerType, hwBarcode, isModalOpen, foundBarcode]); // Dependencies updated

    return (
        <>
            <ProductConfirmationModal
                isOpen={isModalOpen}
                product={scannedProduct} // <-- Will be null initially, triggering the spinner
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
            <div className="container mx-auto max-w-lg text-center">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scan Product</h2>
                    <div className="flex justify-center space-x-2 mb-4">
                        <Button onClick={() => setScannerType('phone')} variant={scannerType === 'phone' ? 'primary' : 'secondary'} className="flex-1">Use Phone Camera</Button>
                        <Button onClick={() => setScannerType('hardware')} variant={scannerType === 'hardware' ? 'primary' : 'secondary'} className="flex-1">Use Hardware Scanner</Button>
                    </div>

                    {scannerType === 'phone' && (
                        <>
                            {/* --- 8. PAUSE THE SCANNER WHEN MODAL IS OPEN OR BARCODE IS FOUND --- */}
                            <CameraScanner 
                                onDetected={handleDetected} 
                                onScannerReady={(ready, message) => setScannerStatus({ ready, message })} 
                                isPaused={isModalOpen || !!foundBarcode} 
                            />
                            {!scannerStatus.ready && <p className="text-yellow-500 font-semibold mt-4">{scannerStatus.message}</p>}
                        </>
                    )}

                    {scannerType === 'hardware' && (
                        <div className="w-full max-w-md mx-auto aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Hardware Scanner Active</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Ready to receive input...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                (Simulate a scan by typing a barcode number and pressing Enter)
                            </p>
                            {hwBarcode && (
                                <p className="mt-4 text-primary-600 dark:text-primary-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {hwBarcode}
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleManualAdd} className="mt-6">
                        <label htmlFor="manual-barcode" className="block text-sm text-left font-medium text-gray-700 dark:text-gray-300 mb-1">Manual Barcode Entry</label>
                        <div className="flex items-start space-x-2">
                            <Input id="manual-barcode" label="" placeholder="Enter barcode number..." value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} className="flex-grow" />
                            {/* --- 9. No more spinner on this button --- */}
                            <Button type="submit" className="w-auto px-4 !mt-0">Add</Button>
                        </div>
                    </form>
                    <div className="mt-6">
                        {items.length > 0 && (
                            <Button onClick={() => navigate('/cart')} variant="secondary" icon={ICONS.cart}>
                                View Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
                            {/* --- 10. FIX THE TYPO FROM YOUR ERROR MESSAGE --- */}
                            </Button> 
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScanProduct;