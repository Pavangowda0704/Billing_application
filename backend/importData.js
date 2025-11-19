const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Configuration ---
// The path to the data file you want to import
const filePath = './products-sample-60k.jsonl';
// Your MongoDB connection string
const dbConnectionString = process.env.DATABASE_URL || "mongodb+srv://pavangowdatl0704_db_user:smartcart123@smart-cart-cluster.12gpa2n.mongodb.net/smart-cart-db?retryWrites=true&w=majority&appName=smart-cart-cluster";


// --- Database Schema (must match your server.js) ---
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
    barcode: String,
    imageUrl: String,
    weight: Number,
    discountPrice: Number,
    promotionText: String,
});
const Product = mongoose.model('Product', productSchema);


// --- Main Import Function ---
const importData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbConnectionString);
        console.log('✅ Connected to MongoDB. Starting import...');

        // Optional: Clear existing products before importing
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let productsBatch = [];
        const batchSize = 500; // Insert 500 products at a time
        let lineCount = 0;

        for await (const line of rl) {
            try {
                const productData = JSON.parse(line);

                // --- Data Transformation ---
                // This is where we map the data from the file to our schema
                if (productData.product_name && productData.code) {
                    const transformedProduct = {
                        name: productData.product_name,
                        barcode: productData.code,
                        imageUrl: productData.image_front_url || 'https://picsum.photos/seed/default/200/200',
                        // Add default values for fields not in the dataset
                        price: Math.floor(Math.random() * 500) + 50, // Random price between 50-550
                        stock: Math.floor(Math.random() * 200) + 10, // Random stock between 10-210
                        weight: parseInt(productData.quantity) || 0,
                    };
                    productsBatch.push(transformedProduct);
                    lineCount++;
                }

                // When the batch is full, insert it into the database
                if (productsBatch.length >= batchSize) {
                    await Product.insertMany(productsBatch);
                    console.log(`Inserted ${productsBatch.length} products. Total: ${lineCount}`);
                    productsBatch = []; // Clear the batch
                }
            } catch (parseError) {
                // Ignore lines that are not valid JSON
            }
        }

        // Insert any remaining products in the last batch
        if (productsBatch.length > 0) {
            await Product.insertMany(productsBatch);
            console.log(`Inserted final batch of ${productsBatch.length} products. Total: ${lineCount}`);
        }

        console.log(`✅ Import complete! A total of ${lineCount} products were added to the database.`);

    } catch (error) {
        console.error('❌ An error occurred during the import process:', error);
    } finally {
        // Close the database connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

// Run the import function
importData();