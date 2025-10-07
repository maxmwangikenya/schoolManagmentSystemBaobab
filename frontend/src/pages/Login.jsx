import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({
        email: '',
        password: '',
        general: ''
    });
  const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({ email: '', password: '', general: '' });
        setIsLoading(true);

        // Client-side validation
        if (!email) {
            setIsLoading(false);
            return setError(prev => ({ ...prev, email: 'Email is required' }));
        }
        if (!password) {
            setIsLoading(false);
            return setError(prev => ({ ...prev, password: 'Password is required' }));
        }

        try {
            console.log('Attempting login with:', { email }); // Debug log
            
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies if backend uses them
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status); // Debug log

            const data = await response.json();
            console.log('Response data:', data); // Debug log

            if (!response.ok) {
                // Handle specific error messages from backend
                if (response.status === 401) {
                    throw new Error('Invalid email or password');
                } else if (response.status === 404) {
                    throw new Error('User not found');
                } else {
                    throw new Error(data.error || data.message || 'Login failed');
                }
            }

            if (data.success && data.token) {
                // Save token and user to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success toast
                toast.success(`Welcome back, ${data.user.name}!`, {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                });

                // Redirect based on role after a short delay

if (!data.user || !data.user.role) {
                    throw new Error('User role is undefined. Please contact support.');
                }
                // Redirect based on role after a short delay

                    if (data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (data.user.role === 'employee') {
                        navigate('/employee-dashboard');
                    } else {
                        navigate('/');
                    }
                
            } else {
                throw new Error(data.error || data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle network errors specifically
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message === 'Failed to fetch') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 3000.';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your connection and ensure CORS is configured.';
            } else {
                errorMessage = error.message;
            }
            
            setError(prev => ({
                ...prev,
                general: errorMessage
            }));
            
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50%">
            <ToastContainer />
            
            <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-lg">
                <h2 
                    className="text-3xl text-teal-600 text-center mb-8"
                    style={{ fontFamily: '"Pacifico", cursive' }}
                >
                    Employee Management System
                </h2>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Login</h2>
                    
                    {error.general && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error.general}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    error.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(prev => ({ ...prev, email: '' }));
                                }}
                                disabled={isLoading}
                            />
                            {error.email && (
                                <p className="mt-1 text-sm text-red-600">{error.email}</p>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    error.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(prev => ({ ...prev, password: '' }));
                                }}
                                disabled={isLoading}
                            />
                            {error.password && (
                                <p className="mt-1 text-sm text-red-600">{error.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                disabled={isLoading}
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>

                        <Link 
                            to="/forgot-password"
                            className="text-sm text-teal-600 hover:text-teal-500 hover:underline
                            transition duration-200"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 px-4 text-white font-medium rounded-md transition duration-300
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                            isLoading 
                                ? 'bg-teal-400 cursor-not-allowed' 
                                : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="font-medium text-teal-600 hover:text-teal-500 hover:underline"
                        >
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;