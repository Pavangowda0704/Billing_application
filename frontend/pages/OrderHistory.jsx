import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OrderItem = ({ item }) => (
    <div className="flex justify-between items-center py-2">
        <div className="flex items-center">
            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-3" />
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
            </div>
        </div>
        <p className="font-semibold text-gray-700 dark:text-gray-300">₹{(item.price * item.quantity).toFixed(2)}</p>
    </div>
);

const OrderCard = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg text-primary-600 dark:text-primary-400">Order #{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-extrabold text-xl text-gray-800 dark:text-gray-200">₹{order.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{order.items.length} items</p>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Items:</h4>
                    {order.items.map(item => <OrderItem key={item.barcode} item={item} />)}
                </div>
            )}
        </div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                // --- THIS LINE IS NOW FIXED ---
                const userOrders = await api.getOrderHistory(user.id);
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to fetch order history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user, navigate]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="container mx-auto max-w-2xl">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Past Orders</h2>
            {orders.length > 0 ? (
                orders.map(order => <OrderCard key={order._id} order={order} />)
            ) : (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">You have no past orders.</p>
                    <Button onClick={() => navigate('/scan')} className="max-w-xs mx-auto">
                        Start a New Shopping Trip
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;