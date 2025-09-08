// src/context/authContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Initial State
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // true until we check localStorage
};

// Action Types
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
const REGISTER_FAILURE = 'REGISTER_FAILURE';
const LOGOUT = 'LOGOUT';
const CHECK_AUTH = 'CHECK_AUTH';

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
            };
        case LOGIN_FAILURE:
        case REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case CHECK_AUTH:
            return {
                ...state,
                isLoading: false,
            };
        default:
            return state;
    }
};

// Create Context
const AuthContext = createContext();

// Custom Hook (named export)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Provider Component
const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Check localStorage on initial load
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: { user: JSON.parse(user) },
                });
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
                localStorage.removeItem('user');
                dispatch({ type: CHECK_AUTH });
            }
        } else {
            dispatch({ type: CHECK_AUTH });
        }
    }, []);

    // Login function — replace with real API call
    const login = async (email, password) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock credentials
        if (email === 'admin@example.com' && password === 'admin') {
            const mockUser = {
                id: 1,
                email,
                name: 'Admin User',
                role: 'admin',
            };

            localStorage.setItem('user', JSON.stringify(mockUser));
            dispatch({
                type: LOGIN_SUCCESS,
                payload: { user: mockUser },
            });

            navigate('/admn-dashboard');
            return { success: true };
        } else if (email === 'employee@example.com' && password === 'password123') {
            const mockUser = {
                id: 2,
                email,
                name: 'Employee User',
                role: 'employee',
            };

            localStorage.setItem('user', JSON.stringify(mockUser));
            dispatch({
                type: LOGIN_SUCCESS,
                payload: { user: mockUser },
            });

            navigate('/employee-dashboard');
            return { success: true };
        } else {
            dispatch({ type: LOGIN_FAILURE });
            return { success: false, error: 'Invalid email or password' };
        }
    };

    // Register function — replace with real API call
    const register = async (userData) => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock registration logic
            // In a real app, you'd send this data to your backend API
            const { email, password, name, role = 'employee' } = userData;

            // Basic validation
            if (!email || !password || !name) {
                dispatch({ type: REGISTER_FAILURE });
                return { success: false, error: 'All fields are required' };
            }

            // Check if user already exists (mock check)
            const existingUsers = ['admin@example.com', 'employee@example.com'];
            if (existingUsers.includes(email)) {
                dispatch({ type: REGISTER_FAILURE });
                return { success: false, error: 'User already exists' };
            }

            // Create new user
            const newUser = {
                id: Date.now(), // Mock ID generation
                email,
                name,
                role,
            };

            // Store user data
            localStorage.setItem('user', JSON.stringify(newUser));
            dispatch({
                type: REGISTER_SUCCESS,
                payload: { user: newUser },
            });

            // Navigate based on role
            if (role === 'admin') {
                navigate('/admn-dashboard');
            } else {
                navigate('/employee-dashboard');
            }

            return { success: true, user: newUser };
        } catch (error) {
            dispatch({ type: REGISTER_FAILURE });
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: LOGOUT });
        navigate('/login');
    };

    const value = {
        ...state,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.isLoading, // Also provide as 'loading' for compatibility
        login,
        register, // Add register function to context value
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Default export
export default AuthProvider;