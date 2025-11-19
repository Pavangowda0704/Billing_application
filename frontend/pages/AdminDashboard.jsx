import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Input from '../components/Input';
import { ICONS } from '../constants';
import { useToast } from '../contexts/ToastContext';

// --- MODAL COMPONENTS ---

const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700"><h3 className="text-xl font-bold">User Details</h3></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="font-semibold text-lg mb-2">Registration Info</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Name:</strong> {user.name}</div>
                            <div><strong>Phone:</strong> {user.number}</div>
                            <div><strong>Age:</strong> {user.age}</div>
                            <div><strong>Email:</strong> {user.email || 'N/A'}</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg mt-6 mb-2">Order History</h4>
                        {user.orders && user.orders.length > 0 ? (
                            <div className="space-y-4">{user.orders.map(order => (
                                <div key={order._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-primary-600">Order #{order._id.slice(-6)}</span>
                                        <span className="text-xs text-gray-500">{new Date(order.date).toLocaleString()}</span>
                                    </div>
                                    <ul>{order.items.map(item => (<li key={item.barcode} className="flex justify-between text-sm py-1"><span>{item.name} x{item.quantity}</span><span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span></li>))}</ul>
                                    <div className="text-right font-bold mt-2 border-t pt-2">Total: ₹{order.totalAmount.toFixed(2)}</div>
                                </div>
                            ))}</div>
                        ) : (<p className="text-gray-500 text-center py-4">This user has no past orders.</p>)}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end rounded-b-xl"><Button onClick={onClose} variant="secondary">Close</Button></div>
            </div>
        </div>
    );
};

const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
    const isEditing = !!productToEdit;
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            const initialData = isEditing ? {
                ...productToEdit,
                expiryDate: productToEdit.expiryDate ? new Date(productToEdit.expiryDate).toISOString().split('T')[0] : ''
            } : { name: '', price: 0, stock: 0, barcode: '', imageUrl: '', weight: 0, expiryDate: '' };
            setFormData(initialData);
        }
    }, [isOpen, productToEdit, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            showToast(error.message || `Failed to ${isEditing ? 'update' : 'save'} product.`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b"><h3 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h3></div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <Input label="Product Name" name="name" type="text" value={formData.name || ''} onChange={handleChange} required />
                        <Input label="Barcode" name="barcode" type="text" value={formData.barcode || ''} onChange={handleChange} required disabled={isEditing} />
                        <Input label="Price (₹)" name="price" type="number" step="0.01" value={formData.price || 0} onChange={handleChange} required />
                        <Input label="Stock Quantity" name="stock" type="number" value={formData.stock || 0} onChange={handleChange} required />
                        <Input label="Weight (g)" name="weight" type="number" value={formData.weight || 0} onChange={handleChange} />
                        <Input label="Expiry Date" name="expiryDate" type="date" value={formData.expiryDate || ''} onChange={handleChange} />
                        <Input label="Image URL" name="imageUrl" type="text" value={formData.imageUrl || ''} onChange={handleChange} />
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rounded-b-xl">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>{isEditing ? 'Update Product' : 'Save Product'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('alerts');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productsPage, setProductsPage] = useState(1);
    const [productsTotalPages, setProductsTotalPages] = useState(1);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [alerts, setAlerts] = useState({ lowStock: [], expiringSoon: [] });
    const [analytics, setAnalytics] = useState({ topSellingProducts: [], salesByHour: [] });
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (activeTab === 'users') { setUsers(await api.getUsers()); }
                else if (activeTab === 'products') {
                    const data = await api.getProducts(productsPage);
                    setProducts(data.products);
                    setProductsTotalPages(data.totalPages);
                } else if (activeTab === 'alerts') { setAlerts(await api.getInventoryAlerts()); }
                else if (activeTab === 'analytics') { setAnalytics(await api.getSalesAnalytics()); }
            } catch (error) {
                showToast(`Failed to load data for ${activeTab}.`, "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeTab, productsPage, showToast]);

    const handleSaveProduct = async (productData) => {
        if (editingProduct) {
            const updated = await api.updateProduct(editingProduct.barcode, productData);
            setProducts(prev => prev.map(p => p.barcode === editingProduct.barcode ? updated : p));
            showToast("Product updated successfully!", "success");
        } else {
            const newProduct = await api.addProduct(productData);
            setProducts(prev => [newProduct, ...prev]);
            if (activeTab !== 'products') setActiveTab('products');
            else setProductsPage(1);
            showToast("Product added successfully!", "success");
        }
        setEditingProduct(null);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    return (
        <>
            <div className="container mx-auto">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {['alerts', 'analytics', 'users', 'products', 'behavior'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}>
                                {tab.replace('-', ' ')}
                            </button>
                        ))}
                    </nav>
                </div>

                {isLoading ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> : (
                    <>
                        {activeTab === 'alerts' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Real-Time Alerts</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-xl shadow-md">
                                        <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200 mb-3">Low Stock Items (10 or fewer)</h3>
                                        {alerts.lowStock.length > 0 ? (
                                            <ul className="space-y-2">{alerts.lowStock.map(p => (<li key={p._id} className="flex justify-between text-sm"><span>{p.name}</span><span className="font-bold bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-2 py-1 rounded-full">{p.stock} left</span></li>))}</ul>
                                        ) : <p className="text-sm">No low stock items.</p>}
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-xl shadow-md">
                                        <h3 className="font-bold text-lg text-red-800 dark:text-red-200 mb-3">Expiring Soon (Next 7 Days)</h3>
                                        {alerts.expiringSoon.length > 0 ? (
                                            <ul className="space-y-2">{alerts.expiringSoon.map(p => (<li key={p._id} className="flex justify-between text-sm"><span>{p.name}</span><strong className="text-red-600 dark:text-red-300">{new Date(p.expiryDate).toLocaleDateString()}</strong></li>))}</ul>
                                        ) : <p className="text-sm">No items expiring soon.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'analytics' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Sales Analytics</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                        <h3 className="font-bold text-lg mb-4">Top 5 Selling Products (by Quantity)</h3>
                                        {analytics.topSellingProducts.length > 0 ? (
                                            <ul className="space-y-3">{analytics.topSellingProducts.map(p => (<li key={p._id} className="flex justify-between items-center text-sm"><span>{p.name}</span><strong className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">{p.totalQuantity} sold</strong></li>))}</ul>
                                        ) : <p>No sales data yet.</p>}
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                        <h3 className="font-bold text-lg mb-4">Peak Shopping Hours (IST)</h3>
                                        <p className="text-xs text-gray-500 mb-3">A chart here would be ideal. Showing as a list for now.</p>
                                        {analytics.salesByHour.length > 0 ? (
                                            <ul className="space-y-2 text-sm">{analytics.salesByHour.map(h => {
                                                const hour = h._id % 12 === 0 ? 12 : h._id % 12; const ampm = h._id < 12 ? 'AM' : 'PM';
                                                return <li key={h._id} className="flex justify-between items-center"><span>{`${hour}:00 ${ampm}`}</span><strong>{h.count} transactions</strong></li>
                                            })}</ul>
                                        ) : <p>No sales data yet.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'users' && (<div><h2 className="text-2xl font-bold mb-6">Registered Users</h2><div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto"><table className="min-w-full divide-y"><thead><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Orders</th><th className="relative px-6 py-3"></th></tr></thead><tbody>{users.map((user) => (<tr key={user._id}><td className="px-6 py-4">{user.name}</td><td className="px-6 py-4">{user.number}</td><td className="px-6 py-4">{user.orders ? user.orders.length : 0}</td><td className="px-6 py-4 text-right"><Button onClick={() => setSelectedUser(user)} variant="secondary" className="py-2 px-3 text-xs">View Details</Button></td></tr>))}</tbody></table></div></div>)}
                        {activeTab === 'products' && (
                            <div>
                                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Product Inventory</h2><Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} icon={ICONS.plus}>Add Product</Button></div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Product</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Stock</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Barcode</th><th className="relative px-6 py-3"></th></tr></thead>
                                        <tbody className="divide-y">{products.map((p) => (<tr key={p._id}><td className="px-6 py-4"><div className="flex items-center"><img className="h-10 w-10 rounded-full object-cover" src={p.imageUrl} alt={p.name} /><div className="ml-4 font-medium">{p.name}</div></div></td><td className="px-6 py-4">₹{p.price.toFixed(2)}</td><td className="px-6 py-4 font-bold">{p.stock}</td><td className="px-6 py-4">{p.barcode}</td><td className="px-6 py-4 text-right"><Button onClick={() => openEditModal(p)} variant="secondary" className="py-1 px-3 text-xs">{ICONS.edit}</Button></td></tr>))}</tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center mt-4"><Button onClick={() => setProductsPage(pg => Math.max(pg - 1, 1))} disabled={productsPage === 1}>Previous</Button><span>Page <strong>{productsPage}</strong> of <strong>{productsTotalPages}</strong></span><Button onClick={() => setProductsPage(pg => Math.min(pg + 1, productsTotalPages))} disabled={productsPage === productsTotalPages}>Next</Button></div>
                            </div>
                        )}
                        {activeTab === 'behavior' && (
                             <div>
                                <h2 className="text-2xl font-bold mb-6">User Behavior Analytics</h2>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                    <h3 className="font-bold text-lg mb-4">Integrating a Third-Party Service</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Tracking detailed user behavior like clicks, session times, and conversion funnels is best handled by specialized analytics platforms. These provide powerful dashboards and insights out-of-the-box.</p>
                                    <h4 className="font-semibold mt-6 mb-2">Recommended Platforms:</h4>
                                    <ul className="list-disc list-inside text-primary-600 dark:text-primary-400">
                                        <li><a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Google Analytics</a></li>
                                        <li><a href="https://mixpanel.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Mixpanel</a></li>
                                        <li><a href="https://amplitude.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Amplitude</a></li>
                                    </ul>
                                    <p className="mt-6 text-sm text-gray-500"><strong>Implementation:</strong> To use these, sign up for their service and add a small JavaScript snippet to your app's entry point (`index.html` or `App.jsx`) to start tracking user sessions and events.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
            <ProductFormModal isOpen={isProductModalOpen} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} productToEdit={editingProduct} />
        </>
    );
};

export default AdminDashboard;

