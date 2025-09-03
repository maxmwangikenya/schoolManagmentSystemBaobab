import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext();

// Auth Provider component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Set axios base URL and default headers
    axios.defaults.baseURL = 'http://localhost:3000/api';

    // Check for existing session on mount - FIXED
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('authToken');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error('Error parsing saved user:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    // Email verification function
    const verifyEmailExists = async (email) => {
        try {
            const response = await axios.post('/auth/check-email', { email });
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error);
            return { exists: false, error: 'Email check failed' };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            
            if (response.data.success) {
                const { token, user } = response.data;
                
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                if (user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else if (user.role === 'employee') {
                    navigate('/employee-dashboard');
                } else {
                    navigate('/dashboard');
                }
                
                return { success: true };
            }
        } catch (error) {
            let errorMessage = 'Login failed. Please check your credentials.';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            
            if (response.data.success) {
                const { token, user } = response.data;
                
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                if (user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else if (user.role === 'employee') {
                    navigate('/employee-dashboard');
                } else {
                    navigate('/dashboard');
                }
                
                return { success: true };
            }
        } catch (error) {
            let errorMessage = 'Registration failed';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/login');
    };

    // Update user function
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Context value
    const value = {
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        isAuthenticated: !!user,
        verifyEmailExists,
        userRole: user?.role
    };

    return (
        <AuthContext.Provider value={value}>
            {children} {/* ✅ REMOVED: !loading && */}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;