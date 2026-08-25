import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles || allowedRoles.includes(role) || role === 'ADMIN') {
    return children;
  }

  return <Navigate to="/access-denied" replace />;
};

export default RoleGuard;
