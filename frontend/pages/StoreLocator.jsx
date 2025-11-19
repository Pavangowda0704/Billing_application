import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { ICONS } from '../constants';

// Dummy data for store locations
const stores = [
    {
        id: 'store1',
        name: 'Smart Cart - Malleshwaram',
        address: 'Sampige Road, 18th Cross, Bangalore-560012',
        phone: '080 - 23460460',
        hours: '7:00 AM - 10:00 PM',
    },
    {
        id: 'store2',
        name: 'Smart Cart - Indiranagar',
        address: '100 Feet Road, Indiranagar, Bangalore-560038',
        phone: '080 - 41235678',
        hours: '8:00 AM - 11:00 PM',
    },
    {
        id: 'store3',
        name: 'Smart Cart - Koramangala',
        address: '80 Feet Road, 7th Block, Koramangala, Bangalore-560095',
        phone: '080 - 55551234',
        hours: '7:00 AM - 10:00 PM',
    },
    {
        id: 'store4',
        name: 'Smart Cart - Jayanagar',
        address: '11th Main Road, 4th Block, Jayanagar, Bangalore-560011',
        phone: '080 - 66778899',
        hours: '8:00 AM - 10:00 PM',
    },
];

// --- UPDATED: This component is now functional ---
const StoreLocationCard = ({ store }) => {
    // This function creates a Google Maps URL from the address
    const handleGetDirections = () => {
        const query = encodeURIComponent(store.address);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(url, '_blank'); // Opens in a new tab
    };

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-primary-600 dark:text-primary-400">{store.name}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{store.address}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{store.phone}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open today: {store.hours}</p>
            <Button 
                variant="secondary" 
                className="!py-2 text-sm mt-3 w-auto px-4"
                onClick={handleGetDirections} // <-- This makes the button work
            >
                Get Directions
            </Button>
        </div>
    );
};

const StoreLocator = () => {
    // --- NEW: State for the search filter ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStores, setFilteredStores] = useState(stores);

    // --- NEW: Effect to filter stores when searchTerm changes ---
    useEffect(() => {
        if (!searchTerm) {
            setFilteredStores(stores); // If search is empty, show all
            return;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();
        const results = stores.filter(store => 
            store.name.toLowerCase().includes(lowerCaseSearch) ||
            store.address.toLowerCase().includes(lowerCaseSearch)
        );
        setFilteredStores(results);
    }, [searchTerm]);

    // This stops the page from reloading on "Enter"
    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="container mx-auto max-w-6xl py-8 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">How to Enjoy Just Walk Out shopping</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">1. Enter at gate</h3>
                        <p className="text-gray-600 dark:text-gray-400">Use the Smart Cart app to open an entry gate and start shopping.</p>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">2. Shop</h3>
                        <p className="text-gray-600 dark:text-gray-400">Pick up and put back items as you please. Use your own bag, or one of ours.</p>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">3. Walk out</h3>
                        <p className="text-gray-600 dark:text-gray-400">When you're finished, walk through an exit gate. You'll only be charged for what you take.</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Find a location near you</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* --- Left Column: Search & List (NOW FUNCTIONAL) --- */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Input
                            id="location-search"
                            label="Enter City, State or Postal Code"
                            placeholder="e.g., Koramangala"
                            icon={ICONS.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // <-- Makes input update
                        />
                        <Button type="submit" className="mt-4">Search</Button>
                    </form>
                    <div className="max-h-96 overflow-y-auto">
                        {/* --- UPDATED: Renders filtered list --- */}
                        {filteredStores.length > 0 ? (
                            filteredStores.map(store => (
                                <StoreLocationCard key={store.id} store={store} />
                            ))
                        ) : (
                            <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No locations found near "{searchTerm}".
                            </p>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Map --- */}
                <div className="md:col-span-2 rounded-xl shadow-lg overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <div className="text-center p-8">
                        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Store Map Placeholder</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">A real map would require a Google Maps API Key.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreLocator;