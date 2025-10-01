// components/Register.js
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Registration function
    const authRegister = async (userData) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        // Validate form
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Prepare data for registration (exclude confirmPassword)
            const { confirmPassword, ...registrationData } = formData;
            
            const result = await authRegister(registrationData);
            
            if (result.success) {
                toast.success('Registration successful! Redirecting to login...', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                
                // Redirect to login after success
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                throw new Error(result.error || 'Registration failed');
            }
            
        } catch (error) {
            setErrors({ general: error.message || 'Registration failed. Please try again.' });
            
            toast.error(error.message || 'Registration failed. Please try again.', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% py-8">
            <ToastContainer />
            
            <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-lg">
                <h2 
                    className="text-3xl text-teal-600 text-center mb-8"
                    style={{ fontFamily: '"Pacifico", cursive' }}
                >
                    Employee Management System
                </h2>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Register</h2>
                    
                    {errors.general && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {errors.general}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    errors.role ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={formData.role}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                className={`w-full px-4 py-2 border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                                transition duration-200 ${
                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="font-medium text-teal-600 hover:text-teal-500 hover:underline"
                        >
                            Sign in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;