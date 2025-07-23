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

    // Set axios base URL
    axios.defaults.baseURL = 'http://localhost:3000';

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                // Optionally verify token here
            } catch (error) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });
            
            if (response.data.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                
                // Navigate based on user role
                if (response.data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
                
                return { success: true };
            }
        } catch (error) {
            let errorMessage = 'Login failed';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            
            if (response.data.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                
                // Navigate based on user role
                if (response.data.user.role === 'admin') {
                    navigate('/admin-dashboard');
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
        setUser(null);
        navigate('/login');
    };

    // Context value
    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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