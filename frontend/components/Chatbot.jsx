import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import Button from './Button';
import Spinner from './Spinner';
import CameraCaptureModal from './CameraCaptureModal'; // Import the new modal

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hello! How can I help you? You can ask me to explain a nutritional chart by taking a photo.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handlePhotoTaken = (imageBlob) => {
        if (imageBlob) {
            const file = new File([imageBlob], "capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };
    
    const makeApiCall = async (apiUrl, payload) => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.error.message || 'Failed to get response from AI.');
            }

            const result = await response.json();
            const botMessageText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
            
            const botMessage = { from: 'bot', text: botMessageText };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
             const errorMessage = { from: 'bot', text: error.message };
             setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };


    const sendMessage = async (messageText) => {
        const userMessage = { from: 'user', text: messageText, image: imagePreview };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        const currentImageFile = imageFile;
        removeImage();

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API key is missing. Please add it to your .env.local file.");
            }
            
            // --- CORRECTED API URL ---
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const systemPrompt = `You are a friendly and helpful shopping assistant for an app called 'Smart Cart'. Your goal is to provide excellent customer service and simplify complex information.
            - If an image of a nutritional chart is provided, act as a helpful nutritionist. Analyze the image and explain the key nutritional values in simple, easy-to-understand terms. For example, instead of just stating the grams of sugar, say whether it's high or low. Highlight good points (like high protein) and bad points (like high saturated fat).
            - If a user reports a 'payment issue', instruct them to check their connection, try another method, or contact support@smartcart.com.
            - If a user finds an 'expired product' IN THE STORE, instruct them not to buy it and to find an associate.
            - If a user asks for a 'refund' for an 'expired product' they BOUGHT, tell them to bring the product and digital receipt to customer service for a full refund.
            - Keep all answers concise, empathetic, and clear.`;

            let payload;
            if (currentImageFile) {
                const toBase64 = file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = error => reject(error);
                });

                const base64Data = await toBase64(currentImageFile);
                payload = {
                    contents: [{
                        parts: [
                            { text: messageText || "Please explain the nutritional values in this image in simple terms for a regular person." },
                            { inlineData: { mimeType: currentImageFile.type, data: base64Data } }
                        ]
                    }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                };
                await makeApiCall(apiUrl, payload);

            } else {
                payload = {
                    contents: [{ parts: [{ text: messageText }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                };
                await makeApiCall(apiUrl, payload);
            }

        } catch (error) {
            const errorMessage = { from: 'bot', text: error.message || 'Sorry, I am having trouble connecting.' };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() && !imageFile) return;
        sendMessage(input);
        setInput('');
    };
    
    const handleQuickAction = (text) => {
        sendMessage(text);
    };

    return (
        <>
            <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handlePhotoTaken}
            />
            <div className={`fixed bottom-24 right-5 z-40 w-full max-w-sm rounded-xl shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Smart Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        {ICONS.x}
                    </button>
                </div>
                 <div className="p-4 h-96 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-3 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.from === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {msg.image && <img src={msg.image} alt="User upload" className="rounded-md mb-2" />}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && ( <div className="flex justify-start"><div className="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700"><Spinner size="sm" /></div></div> )}
                    <div ref={messagesEndRef} />
                </div>
                
                 <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                     <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => handleQuickAction("I have a payment issue")} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">Payment Issue</button>
                        <button onClick={() => handleQuickAction("I found an expired product in the store")} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">Expired Product</button>
                        <button onClick={() => handleQuickAction("I need a refund for an expired item")} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">Request a Refund</button>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {imagePreview && (
                        <div className="relative mb-2 w-24">
                            <img src={imagePreview} alt="Preview" className="rounded-md" />
                            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">{ICONS.x}</button>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        {/* This button now opens the camera modal */}
                        <button type="button" onClick={() => setIsCameraModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                            {ICONS.camera}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask or take a photo..."
                            className="flex-grow block w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100 px-3"
                        />
                        <Button type="submit" isLoading={isLoading} className="w-auto px-4">Send</Button>
                    </div>
                </form>
            </div>
            
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                aria-label="Open Chat"
            >
                {isOpen ? ICONS.x : ICONS.chat}
            </button>
        </>
    );
};

export default Chatbot;

