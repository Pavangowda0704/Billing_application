import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !number || !age || !password || !confirmPassword) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.register({ name, number, age, email, password });
            showToast(`Registration successful! Please log in.`, 'success');
            navigate('/');
        } catch (error) {
            showToast('Registration failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create an Account
                    </h2>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        id="name"
                        label="Full Name"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        id="number"
                        label="Phone Number"
                        type="tel"
                        placeholder="Phone Number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                    />
                    <Input
                        id="age"
                        label="Age"
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                    <Input
                        id="email"
                        label="Email Address (Optional)"
                        type="email"
                        placeholder="Email Address (Optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <div className="pt-2">
                        <Button type="submit" isLoading={isLoading}>
                            Register
                        </Button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;