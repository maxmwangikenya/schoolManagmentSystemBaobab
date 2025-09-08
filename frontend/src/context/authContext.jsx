// src/context/auth.jsx
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
const LOGOUT = 'LOGOUT';
const CHECK_AUTH = 'CHECK_AUTH';

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
            };
        case LOGIN_FAILURE:
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

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: LOGOUT });
        navigate('/login');
    };

    const value = {
        ...state,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ DEFAULT EXPORT — so you can do: import AuthProvider from './context/auth'
export default AuthProvider;