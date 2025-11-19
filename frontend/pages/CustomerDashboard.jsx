import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext'; // <--- IMPORT useAuth
import Button from '../components/Button';
import Input from '../components/Input';
import { ICONS } from '../constants';
import CameraCaptureModal from '../components/CameraCaptureModal';
import Spinner from '../components/Spinner';
import Chatbot from '../components/Chatbot'; 

// This is your original card component
const FeatureCard = ({ icon, title, description, onClick }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center h-full"
        onClick={onClick}
    >
        <div className="text-primary-500 dark:text-primary-400 w-12 h-12 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
    </div>
);

// --- NEW: A "Primary" card for your main action ---
const PrimaryActionCard = ({ icon, title, description, onClick }) => (
    <div 
        className="bg-primary-600 text-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center h-full justify-center"
        onClick={onClick}
    >
        <div className="w-16 h-16 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-primary-100 flex-grow">{description}</p>
    </div>
);

// --- NEW: A "Wallet" card to show a summary ---
const WalletCard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const walletBalance = user?.walletBalance || 0;

    return (
        <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer h-full flex flex-col justify-between"
            onClick={() => navigate('/wallet')}
        >
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h3>
                    <div className="text-primary-500 w-8 h-8">
                        {React.cloneElement(ICONS.wallet, { className: "w-8 h-8" })}
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Current Balance</p>
                <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ₹{walletBalance.toFixed(2)}
                </p>
            </div>
            <Button variant="secondary" className="w-full mt-4 !py-2 text-sm">
                Add Money
            </Button>
        </div>
    );
};


const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { setBudget } = useCart();
    const { showToast } = useToast();
    const { user } = useAuth(); // <--- Get the user
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [nutritionalAnalysisResult, setNutritionalAnalysisResult] = useState(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

    // (This budget logic remains the same)
    const handleSetBudget = (e) => {
        e.preventDefault();
        const budgetAmount = parseFloat(budgetInput);
        if (!budgetInput) {
            setIsBudgetModalOpen(false);
            return;
        }
        if (isNaN(budgetAmount) || budgetAmount <= 0) {
            showToast('Please enter a valid budget amount.', 'error');
            return;
        }
        setBudget(budgetAmount);
        showToast(`Budget of ₹${budgetAmount} set.`, 'success');
        setIsBudgetModalOpen(false);
        setBudgetInput('');
    };

    // (This nutrition logic remains the same)
    const handlePhotoTakenForNutrition = async (imageBlob) => {
        setIsCameraModalOpen(false);
        setIsLoadingAnalysis(true);
        setNutritionalAnalysisResult(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API key is missing.");
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
            });

            const file = new File([imageBlob], "nutritional_chart.jpg", { type: "image/jpeg" });
            const base64Data = await toBase64(file);

            const systemPrompt = `You are a helpful nutritionist for 'Smart Cart'. Analyze the image of a nutritional chart and explain the key values in simple terms. Focus on calories, fats, sugars, and protein. State if values are high, moderate, or low and highlight any good or bad points. Keep the explanation concise.`;

            const payload = {
                contents: [{
                    parts: [
                        { text: "Explain the nutritional values in this image in simple terms." },
                        { inlineData: { mimeType: file.type, data: base64Data } }
                    ]
                }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.error.message || 'Failed to get analysis from AI.');
            }

            const result = await response.json();
            const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't analyze the chart.";
            setNutritionalAnalysisResult(analysisText);

        } catch (error) {
            setNutritionalAnalysisResult(`Error: ${error.message}`);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    return (
        <>
            {/* --- THIS LINE IS NOW UPDATED WITH THE GRADIENT BACKGROUND --- */}
            <div className="min-h-full py-10 px-4 bg-gradient-to-b from-primary-50 to-gray-100 dark:from-primary-900/10 dark:to-gray-900">
                <div className="container mx-auto max-w-4xl"> {/* <--- Widened container */}
                    
                    {/* --- NEW: Welcome Header --- */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome, {user?.name || 'Shopper'}!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            What would you like to do today?
                        </p>
                    </div>

                    {/* --- NEW: 2x2 Grid Layout --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* --- NEW: Wallet Card --- */}
                        <WalletCard />
                        
                        {/* --- NEW: Primary Action Card --- */}
                        <PrimaryActionCard 
                            icon={React.cloneElement(ICONS.scan, { className: "w-16 h-16" })}
                            title="Scan Products"
                            description="Start your shopping trip by scanning items."
                            onClick={() => navigate('/scan')}
                        />
                        
                        {/* --- Original Feature Cards --- */}
                        <FeatureCard 
                            icon={React.cloneElement(ICONS.dashboard, { className: "w-12 h-12" })} 
                            title="Set Your Budget" 
                            description="Keep track of your spending while you shop."
                            onClick={() => setIsBudgetModalOpen(true)}
                        />
                        <FeatureCard 
                            icon={React.cloneElement(ICONS.camera, { className: "w-12 h-12" })} 
                            title="Analyze Nutrition" 
                            description="Take a photo of a nutritional chart for a simple explanation."
                            onClick={() => setIsCameraModalOpen(true)}
                        />
                    </div>

                    {/* (The rest of your page logic for modals/analysis) */}
                    {isLoadingAnalysis && (
                        <div className="flex justify-center items-center my-8">
                            <Spinner size="lg" />
                            <p className="ml-3 text-primary-600 dark:text-primary-400">Analyzing nutrition info...</p>
                        </div>
                    )}
                    {nutritionalAnalysisResult && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg my-8 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nutritional Analysis:</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{nutritionalAnalysisResult}</p>
                        </div>
                    )}

                    {isBudgetModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-sm">
                                <form onSubmit={handleSetBudget} className="p-6">
                                    <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">Set Shopping Budget</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">Enter an amount to get alerts as you shop.</p>
                                    <div className="mb-4">
                                        <Input
                                            id="budget"
                                            label="Budget Amount (₹)"
                                            type="number"
                                            placeholder="e.g., 2000"
                                            value={budgetInput}
                                            onChange={(e) => setBudgetInput(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full mb-3">Set Budget</Button>
                                    <Button type="button" onClick={() => setIsBudgetModalOpen(false)} variant="secondary" className="w-full">Cancel</Button>
                                </form>
                            </div>
                        </div>
                    )}

                    <CameraCaptureModal
                        isOpen={isCameraModalOpen}
                        onClose={() => setIsCameraModalOpen(false)}
                        onCapture={handlePhotoTakenForNutrition}
                    />
                </div>
            </div>
            <Chatbot />
        </>
    );
};

export default CustomerDashboard;