import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    React.useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                // Redirect to the new customer dashboard
                navigate('/dashboard'); 
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            showToast('Please enter both username and password.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const loggedInUser = await login(username, password);
            showToast(`Welcome, ${loggedInUser.username}!`, 'success');
        } catch (error) {
            showToast('Login failed. Please check your username and password.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to Smart Cart
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your details to begin your shopping experience.
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        id="username"
                        label="Username"
                        placeholder="Name or admin"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <Input
                        id="password"
                        label="Password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                    <Button type="submit" isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
