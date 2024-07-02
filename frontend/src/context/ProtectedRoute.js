import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ element: Component }) => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? Component : <Navigate to="/login" />;
  };
  
export default ProtectedRoute;
