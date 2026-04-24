import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin }) => {
    let userInfo = null;
    try {
        userInfo = JSON.parse(localStorage.getItem('userInfo'));
    } catch {
        userInfo = null;
    }

    // Treat missing/partial sessions as logged out ({} is truthy, but not a valid session)
    const hasValidSession = Boolean(userInfo && userInfo._id && userInfo.token);

    if (!hasValidSession) {
        return <Navigate to={isAdmin ? "/admin/login" : "/login"} />;
    }

    if (isAdmin && !userInfo.isAdmin) {
        return <Navigate to="/user/dashboard" />;
    }

    return children;
};

export default ProtectedRoute;
