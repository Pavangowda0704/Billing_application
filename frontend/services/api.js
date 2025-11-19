const API_BASE_URL = 'http://localhost:8000/api';

// Auth API calls
export const login = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        throw new Error('Registration failed');
    }
    return response.json();
};

export const findUser = async (phoneNumber) => {
    const response = await fetch(`${API_BASE_URL}/auth/find-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
    });
    if (!response.ok) {
        throw new Error('User not found');
    }
    return response.json();
};

export const resetPassword = async (userId, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
    });
    if (!response.ok) {
        throw new Error('Password reset failed');
    }
    return response.json();
};

// Product API calls
export const getProducts = async (page = 1, limit = 20) => {
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};

export const getProductByBarcode = async (barcode) => {
    const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);
    if (!response.ok) {
        throw new Error('Product not found');
    }
    return response.json();
};

export const addProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });
    if (!response.ok) {
        throw new Error('Failed to add product');
    }
    return response.json();
};

export const updateProduct = async (barcode, updateData) => {
    const response = await fetch(`${API_BASE_URL}/products/${barcode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error('Failed to update product');
    }
    return response.json();
};

// User API calls
export const getUserDetails = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user details');
    }
    return response.json();
};

export const getAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

// Wallet API calls
export const addMoneyToWallet = async (userId, amount) => {
    const response = await fetch(`${API_BASE_URL}/wallet/add-money`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
    });
    if (!response.ok) {
        throw new Error('Failed to add money to wallet');
    }
    return response.json();
};

// Checkout API calls
export const verifyCheckout = async (items, totalWeight, totalCount, hardwareWeight = 0, hardwareCount = 0) => {
    const response = await fetch(`${API_BASE_URL}/checkout/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            items, 
            expectedWeight: totalWeight, // Match server.js expected key
            expectedCount: totalCount,   // Match server.js expected key
            hardwareWeight, 
            hardwareCount 
        })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
    }
    return response.json();
};

// Payment API calls
export const processPayment = async (amount, items, userId, paymentMethod) => {
    const response = await fetch(`${API_BASE_URL}/checkout/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, items, userId, paymentMethod })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
    }
    return response.json();
};

// Order API calls
export const getOrderHistory = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/orders/history/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch order history');
    }
    return response.json();
};

// Hardware API calls (Simulation)
export const setHardwareState = async (count, weight) => {
    const response = await fetch(`${API_BASE_URL}/hardware/manual-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, weight }),
    });
    if (!response.ok) {
        throw new Error('Failed to set hardware state');
    }
    return response.json();
};

export const getHardwareState = async () => {
    const response = await fetch(`${API_BASE_URL}/hardware/state`);
    if (!response.ok) {
        throw new Error('Failed to get hardware state');
    }
    return response.json();
};

// --- Admin API FUNCTIONS ---
export const getInventoryAlerts = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
};

export const getSalesAnalytics = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/sales-analytics`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
};

// --- Trending Products ---
export const getTrendingProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending products');
    return response.json();
};

// --- (add this function) ---
export const getPromotions = async () => {
    const response = await fetch(`${API_BASE_URL}/promotions`);
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return response.json();
};