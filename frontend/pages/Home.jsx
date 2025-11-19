import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ICONS } from '../constants';
import Chatbot from '../components/Chatbot';
import Spinner from '../components/Spinner';
import * as api from '../services/api';
import AccessibilityWidget from '../components/AccessibilityWidget';

// --- (These card components are now used by data mapped from the API) ---
const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 text-center">
        <div className="text-primary-500 dark:text-primary-400 w-16 h-16 mx-auto mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);

const TestimonialCard = ({ quote, author, role }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <p className="text-gray-600 dark:text-gray-400 italic">"{quote}"</p>
        <p className="mt-4 font-bold text-right text-gray-900 dark:text-white">- {author}, <span className="text-primary-500">{role}</span></p>
    </div>
);

const TrendingProductCard = ({ product }) => (
    <div className="flex-shrink-0 w-64 m-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <img 
            className="h-40 w-full object-cover" 
            src={product.imageUrl || 'https://placehold.co/300x200/e2e8f0/e2e8f0?text=Product'} 
            alt={product.name} 
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x200/e2e8f0/e2e8f0?text=Product'; }}
        />
        <div className="p-4">
            <h4 className="font-bold text-gray-900 dark:text-white truncate" title={product.name}>{product.name}</h4>
            <p className="text-primary-500 font-semibold mt-1">₹{product.price.toFixed(2)}</p>
        </div>
    </div>
);

const PromotionCard = ({ title, description, imageUrl, bgColorClass }) => (
    <div className={`relative flex-shrink-0 w-80 h-48 m-2 ${bgColorClass} rounded-xl shadow-lg overflow-hidden text-white p-6 flex flex-col justify-end transform hover:scale-105 transition-transform duration-300`}>
        <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm">{description}</p>
        </div>
    </div>
);


const Home = () => {
    const navigate = useNavigate();
    
    // --- UPDATED: State to hold fetched data ---
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [promotions, setPromotions] = useState([]);
    const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);

    // --- UPDATED: Fetch all data on load ---
    useEffect(() => {
        const fetchData = async () => {
            // Fetch Trending Products
            setIsLoadingTrending(true);
            try {
                const products = await api.getTrendingProducts();
                setTrendingProducts(products);
            } catch (error) {
                console.error("Failed to fetch trending products:", error);
            } finally {
                setIsLoadingTrending(false);
            }

            // Fetch Promotions
            setIsLoadingPromotions(true);
            try {
                const promos = await api.getPromotions();
                setPromotions(promos);
            } catch (error) {
                console.error("Failed to fetch promotions:", error);
            } finally {
                setIsLoadingPromotions(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <div className="bg-gray-100 dark:bg-gray-900">
                {/* Hero Section (No Change) */}
                <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center py-20 px-4">
                    <h1 className="text-5xl font-extrabold mb-4 animate-fade-in-down">The Future of Shopping is Here.</h1>
                    <p className="text-xl max-w-3xl mx-auto animate-fade-in-up">
                        Experience a revolutionary, checkout-free shopping journey with Smart Cart. Scan items as you shop and simply walk out.
                    </p>
                    <Button 
                        onClick={() => navigate('/login')} 
                        className="mt-8 max-w-xs mx-auto !bg-white !text-primary-600 hover:!bg-gray-200 transform hover:scale-110 transition-transform"
                    >
                        Start Shopping Now
                    </Button>
                </section>

                {/* --- UPDATED: "Today's Deals" Section --- */}
                <section className="py-20 px-4 bg-gray-200 dark:bg-gray-800/50">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Today's Deals</h2>
                        {isLoadingPromotions ? (
                            <div className="flex justify-center"><Spinner /></div>
                        ) : (
                            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                {promotions.map(promo => (
                                    <PromotionCard 
                                        key={promo._id}
                                        title={promo.title}
                                        description={promo.description}
                                        bgColorClass={promo.bgColorClass}
                                        imageUrl={promo.imageUrl}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* --- UPDATED: "Trending Now" Section --- */}
                <section className="py-20 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Trending Now</h2>
                        {isLoadingTrending ? (
                            <div className="flex justify-center"><Spinner /></div>
                        ) : (
                            trendingProducts.length > 0 ? (
                                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                    {trendingProducts.map(product => (
                                        product && <TrendingProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                             ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400">No trending products found. Shop more to see trends!</p>
                             )
                        )}
                    </div>
                </section>

                {/* Features Section (No Change) */}
                <section className="bg-white dark:bg-gray-800 py-20 px-4">
                    <div className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white">All-in-One Shopping</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <FeatureCard icon={ICONS.scan} title="Scan, Pay & Go">
                                Add items to your cart by scanning barcodes with your phone. No lines, no hassle.
                            </FeatureCard>
                            <FeatureCard icon={ICONS.dashboard} title="Set Your Budget">
                                Keep track of your spending in real-time with our smart budget tracker.
                            </FeatureCard>
                            <FeatureCard icon={ICONS.camera} title="Analyze Nutrition">
                                Take a photo of any nutritional chart for a simple, AI-powered explanation.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section (No Change) */}
                <section className="bg-gray-200 dark:bg-gray-800/50 py-20 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">What Our Shoppers Are Saying</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <TestimonialCard quote="Smart Cart has completely changed my grocery runs. I'm in and out in minutes. I can't imagine going back to a regular checkout line." author="Pavan G" role="Frequent Shopper" />
                            <TestimonialCard quote="The budget tracker is a game-changer! It helps me stay mindful of my spending, and the nutrition analysis from the AI bot is incredibly useful." author="Asha S" role="Health-Conscious Parent" />
                        </div>
                    </div>
                </section>
            </div>
            <AccessibilityWidget />
            <Chatbot />
        </>
    );
};

export default Home;