import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define action types
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT = 'LOGOUT';
const CHECK_AUTH = 'CHECK_AUTH';

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case LOGIN_FAILURE:
        case LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
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

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: { 
                        user: JSON.parse(user),
                        token: token
                    },
                });
            } catch (e) {
                console.error('Failed to parse stored data', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                dispatch({ type: CHECK_AUTH });
            }
        } else {
            dispatch({ type: CHECK_AUTH });
        }
    }, []);
      const API_BASE_URL = import.meta.env.VITE_BACKENDAPI;

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: { 
                        user: data.user,
                        token: data.token
                    },
                });

                if (data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/employee-dashboard');
                }

                return { success: true };
            } else {
                dispatch({ type: LOGIN_FAILURE });
                return { success: false, error: data.error || 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Login error:', error);
            dispatch({ type: LOGIN_FAILURE });
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        dispatch({ type: LOGOUT });
        navigate('/login');
    };

    const value = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;