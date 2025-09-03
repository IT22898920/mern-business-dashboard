import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedAccess = ({ 
  roles = [], 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { user, hasRole, hasAnyRole } = useAuth();

  if (!user) {
    return fallback;
  }

  // If no roles specified, show content (authenticated users only)
  if (roles.length === 0) {
    return children;
  }

  // Check if user has required role(s)
  const hasAccess = requireAll
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);

  if (hasAccess) {
    return children;
  }

  return fallback;
};

export default RoleBasedAccess;