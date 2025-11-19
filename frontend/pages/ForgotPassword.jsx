import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Enter phone, 2: Reset password
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleFindAccount = async (e) => {
        e.preventDefault();
        if (!phoneNumber) {
            showToast('Please enter your phone number.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const result = await api.findUserByPhoneNumber(phoneNumber);
            if (result.success) {
                setUserId(result.userId);
                showToast('Account found. You can now reset your password.', 'success');
                setStep(2);
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            showToast('Please enter and confirm your new password.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.updatePassword(userId, password);
            showToast('Password has been reset successfully!', 'success');
            navigate('/');
        } catch (error) {
            showToast('Failed to reset password. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                {step === 1 ? (
                    <div>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Find Your Account</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Enter your registered phone number to reset your password.
                            </p>
                        </div>
                        <form className="space-y-6" onSubmit={handleFindAccount}>
                            <Input
                                id="phoneNumber"
                                label="Phone Number"
                                placeholder="Phone Number"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                            <Button type="submit" isLoading={isLoading}>
                                Find Account
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reset Your Password</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Create a new password for your account.
                            </p>
                        </div>
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <Input
                                id="password"
                                label="New Password"
                                placeholder="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Input
                                id="confirmPassword"
                                label="Confirm New Password"
                                placeholder="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" isLoading={isLoading}>
                                Reset Password
                            </Button>
                        </form>
                    </div>
                )}
                 <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <Link to="/" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;