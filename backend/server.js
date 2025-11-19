const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const twilio = require('twilio');

// --- Twilio Client Initialization ---
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID, 
    process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; 

const dbConnectionString = process.env.DATABASE_URL || "mongodb+srv://pavangowdatl0704_db_user:smartcart123@smart-cart-cluster.12gpa2n.mongodb.net/smart-cart-db?retryWrites=true&w=majority&appName=smart-cart-cluster";

const app = express();
const PORT = 8000;

let currentHardwareState = {
    count: 0,
    weight: 0
};

app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(dbConnectionString)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ Could not connect to MongoDB Atlas.', err));

// --- Database Schemas ---
const productSchema = new mongoose.Schema({
    name: { type: String, index: true },
    price: Number,
    stock: Number,
    barcode: { type: String, index: true, unique: true },
    imageUrl: String,
    weight: Number,
    discountPrice: Number,
    promotionText: String,
    expiryDate: { type: Date, index: true },
});
const Product = mongoose.model('Product', productSchema);

const userSchema = new mongoose.Schema({
    name: { type: String, index: true },
    number: String,
    age: Number,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    walletBalance: { type: Number, default: 5000.00 } 
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    userId: String,
    date: { type: Date, default: Date.now },
    items: Array,
    totalAmount: Number,
    paymentMethod: String 
});
const Order = mongoose.model('Order', orderSchema);

// --- API Routes ---

// --- 1. MODIFIED LOGIN ENDPOINT ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username.toLowerCase() === 'admin' && password === 'password') {
            return res.json({ token: 'fake-admin-token', user: { id: 'admin-123', username: 'admin', role: 'admin' } });
        }
        const foundUser = await User.findOne({ name: username, password: password }).select('-password').lean(); 
        if (foundUser) {
            if (foundUser.walletBalance === undefined || foundUser.walletBalance === null) {
                foundUser.walletBalance = 5000.00; // Give default balance
            }
            foundUser.id = foundUser._id; // Rename _id to id
            delete foundUser._id;
            res.json({ token: 'fake-user-token', user: foundUser }); // Send the full user object
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.post('/api/auth/register', async (req, res) => { try { const newUser = new User(req.body); await newUser.save(); res.status(201).json(newUser); } catch (error) { res.status(400).json({ message: 'Error registering user' }); } });
app.get('/api/users', async (req, res) => { try { const users = await User.find(); const usersWithOrders = await Promise.all(users.map(async (user) => { const userOrders = await Order.find({ userId: user._id.toString() }); return { ...user.toObject(), orders: userOrders }; })); res.json(usersWithOrders); } catch (error) { res.status(500).json({ message: 'Error fetching users' }); } });

// --- 2. MODIFIED USER DETAILS ENDPOINT (FOR WALLET) ---
app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password').lean(); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.walletBalance === undefined || user.walletBalance === null) {
            user.walletBalance = 5000.00; 
        }
        res.json(user); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// --- 3. NEW ENDPOINT TO ADD MONEY TO WALLET ---
app.post('/api/wallet/add-money', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const addAmount = parseFloat(amount);

        if (!userId || !addAmount || addAmount <= 0) {
            return res.status(400).json({ message: 'Invalid user ID or amount.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add to the balance
        user.walletBalance = (user.walletBalance || 0) + addAmount;
        await user.save();

        console.log(`--- Wallet Top-up ---`);
        console.log(`User ${userId} added ₹${addAmount.toFixed(2)}. New balance: ₹${user.walletBalance.toFixed(2)}`);

        // Return the new balance
        res.json({ success: true, newBalance: user.walletBalance });

    } catch (error) {
        console.error('Error adding money to wallet:', error);
        res.status(500).json({ message: 'Error processing wallet top-up.' });
    }
});


app.get('/api/products', async (req, res) => { 
    try { 
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 20; 
        const skip = (page - 1) * limit; 
        const productsPromise = Product.find().sort({ _id: -1 }).skip(skip).limit(limit); 
        const countPromise = Product.countDocuments(); 
        const [products, totalProducts] = await Promise.all([productsPromise, countPromise]); 
        res.json({ products, currentPage: page, totalPages: Math.ceil(totalProducts / limit) }); 
    } catch (error) { 
        res.status(500).json({ message: 'Error fetching products' }); 
    } 
});
app.post('/api/products', async (req, res) => { try { const newProduct = new Product(req.body); await newProduct.save(); res.status(201).json(newProduct); } catch (error) { if (error.code === 11000) { return res.status(400).json({ message: 'Error: A product with this barcode already exists.' }); } res.status(400).json({ message: 'Error adding new product' }); } });

// --- MODIFIED PAYMENT ENDPOINT ---
app.post('/api/checkout/payment', async (req, res) => {
    try {
        const { amount, items, userId, paymentMethod } = req.body; 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (paymentMethod === 'wallet') {
            const currentBalance = user.walletBalance || 0;
            if (currentBalance < amount) {
                return res.status(400).json({ message: "Insufficient wallet balance." });
            }
            user.walletBalance = currentBalance - amount;
        }

        for (const item of items) {
            const productInDb = await Product.findOne({ barcode: item.barcode });
            if (!productInDb || productInDb.stock < item.quantity) {
                return res.status(400).json({ message: `Sorry, ${item.name} is out of stock.` });
            }
            productInDb.stock -= item.quantity;
            await productInDb.save();
        }

        await user.save();
        
        const newOrder = new Order({ userId, items, totalAmount: amount, paymentMethod });
        await newOrder.save();
        
        // --- SEND WHATSAPP BILL ---
        try {
            if (user && user.number && twilioPhoneNumber) {
                const userPhoneNumber = user.number.startsWith('+') ? user.number : `+${user.number}`;
                
                let itemDetails = items.map(item => 
                    `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
                ).join('\n');

                const receiptMessage = `*Thank you for shopping at Smart Cart!* 🛒
Here is your final bill:

*Order ID:* ${newOrder._id.toString().slice(-6)}
*Payment Method:* ${paymentMethod}
---
*Items:*
${itemDetails}
---
*Total Amount: ₹${amount.toFixed(2)}*

Your receipt has been saved to your order history.`;

                // --- 1. TWILIO TYPO FIX ---
                await twilioClient.messages.create({
                    body: receiptMessage,
                    from: `whatsapp:${twilioPhoneNumber}`, 
                    to: `whatsapp:${userPhoneNumber}`
                });
                console.log(`WhatsApp receipt sent to ${userPhoneNumber}`);
            } else {
                console.log("Could not send WhatsApp bill. User phone number or Twilio phone number not found.");
            }
        } catch (smsError) {
            console.error('Twilio WhatsApp failed to send:', smsError.message);
        }
        // -----------------------------

        // --- 2. WALLET BALANCE FIX ---
        // Return the new balance to the frontend
        res.json({ success: true, transactionId: newOrder._id, newBalance: user.walletBalance });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
});

app.get('/api/orders/history/:userId', async (req, res) => { try { const { userId } = req.params; const userOrders = await Order.find({ userId: userId }).sort({ date: -1 }); res.json(userOrders); } catch (error) { res.status(500).json({ message: 'Error fetching order history' }); } });
app.get('/api/products/barcode/:barcode', async (req, res) => { try { const { barcode } = req.params; const product = await Product.findOne({ barcode: barcode }); if (product) { res.json(product); } else { res.status(404).json({ message: 'Product not found' }); } } catch (error) { res.status(500).json({ message: 'Error finding product' }); } });

// --- 3. STATUS CODE FIX ---
app.post('/api/auth/find-user', async (req, res) => { try { const { phoneNumber } = req.body; const user = await User.findOne({ number: phoneNumber }); if (user) { res.json({ success: true, userId: user._id }); } else { res.status(404).json({ success: false, message: 'No account found with that phone number.' }); } } catch (error) { res.status(500).json({ message: 'Server error while finding user.' }); } });

app.put('/api/auth/reset-password', async (req, res) => { try { const { userId, newPassword } = req.body; await User.findByIdAndUpdate(userId, { password: newPassword }); res.json({ success: true, message: 'Password has been updated successfully.' }); } catch (error) { res.status(500).json({ message: 'Server error while resetting password.' }); } });
app.put('/api/products/:barcode', async (req, res) => {
    try {
        const { barcode } = req.params;
        const updateData = req.body;
        const updatedProduct = await Product.findOneAndUpdate(
            { barcode: barcode }, 
            { $set: updateData },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product' });
    }
});
app.get('/api/admin/alerts', async (req, res) => {
    try {
        const lowStockThreshold = 10;
        const expiryWarningDays = 7;
        const today = new Date();
        const expiryLimitDate = new Date();
        expiryLimitDate.setDate(today.getDate() + expiryWarningDays);
        const lowStockProducts = await Product.find({ stock: { $lte: lowStockThreshold } }).limit(10);
        const expiringProducts = await Product.find({ expiryDate: { $ne: null, $lte: expiryLimitDate, $gte: today } }).sort({ expiryDate: 1 }).limit(10);
        res.json({ lowStock: lowStockProducts, expiringSoon: expiringProducts });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory alerts' });
    }
});
app.get('/api/admin/sales-analytics', async (req, res) => {
    try {
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.barcode", name: { $first: "$items.name" }, totalQuantity: { $sum: "$items.quantity" } }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);
        const salesByHour = await Order.aggregate([
            { $project: { hour: { $hour: { date: "$date", timezone: "Asia/Kolkata" } } } },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({ topSellingProducts, salesByHour });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales analytics' });
    }
});
app.get('/api/products/trending', async (req, res) => {
    try {
        const topProductIds = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.barcode", totalQuantity: { $sum: "$items.quantity" } }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 4 }
        ]);
        const barcodes = topProductIds.map(p => p._id);
        const trendingProducts = await Product.find({ barcode: { $in: barcodes } });
        const orderedProducts = barcodes.map(barcode => 
            trendingProducts.find(p => p.barcode === barcode)
        ).filter(Boolean);
        res.json(orderedProducts);
    } catch (error) {
        console.error("Error fetching trending products:", error);
        res.status(500).json({ message: 'Error fetching trending products' });
    }
});


// --- VERIFICATION ENDPOINT (For Exhibition) ---
app.post('/api/checkout/verify', async (req, res) => {
    const { expectedWeight, expectedCount } = req.body;
    const actualWeightFromHardware = currentHardwareState.weight;
    const actualCountFromHardware = currentHardwareState.count;

    console.log(`--- Verification Check ---`);
    console.log(`Software Expected: ${expectedCount} items, ${expectedWeight.toFixed(2)}g`);
    console.log(`Hardware Actual:   ${actualCountFromHardware} items, ${actualWeightFromHardware.toFixed(2)}g`);

    const weightTolerance = 50; 
    const weightMatch = Math.abs(expectedWeight - actualWeightFromHardware) <= weightTolerance;
    const countMatch = (expectedCount == actualCountFromHardware);

    if (weightMatch && countMatch) {
        console.log("Verification OK");
        res.json({ status: 'OK', message: 'Cart verification successful.' });
    } else {
        console.log("Verification FAILED");
        res.status(400).json({ 
            status: 'MISMATCH', 
            message: `Cart Mismatch. Software: (${expectedCount} items, ${expectedWeight.toFixed(2)}g). Hardware: (${actualCountFromHardware} items, ${actualWeightFromHardware.toFixed(2)}g)` 
        });
    }
});

// --- MANUAL HARDWARE UPDATE ENDPOINT ---
app.post('/api/hardware/manual-update', (req, res) => {
    const { count, weight } = req.body;
    currentHardwareState.count = parseInt(count, 10) || 0;
    currentHardwareState.weight = parseFloat(weight) || 0.0;
    console.log(`--- Manual Hardware Update ---`);
    console.log(`New State: ${currentHardwareState.count} items, ${currentHardwareState.weight.toFixed(2)}g`);
    res.json({ success: true, newState: currentHardwareState });
});

// --- (add this new route) ---
// --- DUMMY DATA FOR PROMOTIONS ---
app.get('/api/promotions', (req, res) => {
    const promotions = [
        {
            _id: 'promo1',
            title: "20% Off All Snacks",
            description: "Stock up for the week!",
            bgColorClass: "bg-green-600",
            imageUrl: "https://placehold.co/400x300/22c55e/white?text=Snacks"
        },
        {
            _id: 'promo2',
            title: "Buy 1 Get 1 Free",
            description: "On select beverages.",
            bgColorClass: "bg-blue-600",
            imageUrl: "https://placehold.co/400x300/3b82f6/white?text=Drinks"
        },
        {
            _id: 'promo3',
            title: "Fresh Produce Daily",
            description: "New arrivals today.",
            bgColorClass: "bg-red-600",
            imageUrl: "https://placehold.co/400x300/ef4444/white?text=Fresh"
        }
    ];
    res.json(promotions);
});


// --- HARDWARE STATE ENDPOINT (For Exhibition) ---
app.get('/api/hardware/state', (req, res) => {
    res.json(currentHardwareState);
});

// --- LIVE HARDWARE UPDATE ENDPOINT ---
app.post('/api/hardware/live-update', (req, res) => {
    const { count, weight } = req.body;
    if (count !== undefined && weight !== undefined) {
        currentHardwareState.count = parseInt(count, 10);
        currentHardwareState.weight = parseFloat(weight);
        console.log(`--- LIVE HARDWARE UPDATE ---`);
        console.log(`Received: Count: ${currentHardwareState.count}, Weight: ${currentHardwareState.weight}g`);
        res.json({ success: true, newState: currentHardwareState });
    } else {
        res.status(400).json({ message: 'Invalid data. "count" and "weight" are required.' });
    }
});

// --- DUMMY DATA FOR PROMOTIONS ---
app.get('/api/promotions', (req, res) => {
    const promotions = [
        {
            _id: 'promo1',
            title: "20% Off All Snacks",
            description: "Stock up for the week!",
            bgColorClass: "bg-green-600",
            imageUrl: "https://placehold.co/400x300/22c55e/white?text=Snacks"
        },
        {
            _id: 'promo2',
            title: "Buy 1 Get 1 Free",
            description: "On select beverages.",
            bgColorClass: "bg-blue-600",
            imageUrl: "https://placehold.co/400x300/3b82f6/white?text=Drinks"
        },
        {
            _id: 'promo3',
            title: "Fresh Produce Daily",
            description: "New arrivals today.",
            bgColorClass: "bg-red-600",
            imageUrl: "https://placehold.co/400x300/ef4444/white?text=Fresh"
        }
    ];
    res.json(promotions);
});

app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});