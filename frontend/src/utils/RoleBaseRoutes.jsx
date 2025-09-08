import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RoleBaseRoutes = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return <div>Loading ...</div>;
    }

    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user doesn't have required role, redirect to unauthorized
    if (!requiredRole.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    // All good — render children
    return children;
};

export default RoleBaseRoutes;