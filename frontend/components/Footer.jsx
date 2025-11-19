import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300">
            <div className="container mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Contact Us Section */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <span className="mt-1 mr-3 text-primary-400">{ICONS.location}</span>
                                <p>Sampige Road, 18th Cross, Malleshwaram Bangalore-560012</p>
                            </div>
                            <div className="flex items-start">
                                <span className="mt-1 mr-3 text-primary-400">{ICONS.phone}</span>
                                <div>
                                    <p>Phone: 080 - 23460460</p>
                                    <p className="text-sm text-gray-400">(From 10:30 Hrs to 17:30 Hrs on Working days)</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                 <span className="mt-1 mr-3 text-primary-400">{ICONS.email}</span>
                                <p>Email: <a href="mailto:support@smartcart.com" className="text-blue-400 hover:text-blue-300">support@smartcart.com</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4">Quick Link</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white">HOME</a></li>
                            <li><a href="#" className="hover:text-white">ABOUT US</a></li>
                            <li><a href="#" className="hover:text-white">CAREERS</a></li>
                        </ul>
                    </div>

                    {/* Scan App Section */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4">Get the SmartCart App</h3>
                        <div className="bg-white p-2 rounded-lg inline-block">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/app-download" alt="QR Code for mobile app" className="w-32 h-32" />
                        </div>
                    </div>

                     {/* Legal Links */}
                    <div>
                         <h3 className="font-bold text-lg text-white mb-4">Information</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a></li>
                            <li><a href="#" className="text-blue-400 hover:text-blue-300">Refund and Cancellation Policy</a></li>
                            <li><a href="#" className="text-blue-400 hover:text-blue-300">Terms & Conditions</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar with Admin Link */}
            <div className="bg-gray-900 py-4">
                <div className="container mx-auto px-6 flex justify-between items-center text-sm">
                    <p>&copy; 2025 SmartCart. All rights reserved.</p>
                    <Link to="/login" className="text-gray-400 hover:text-white">Admin Portal</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;