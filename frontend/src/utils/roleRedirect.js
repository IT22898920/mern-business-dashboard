/**
 * Get the appropriate redirect path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} - The path to redirect to
 */
export const getRoleBasedRedirect = (userRole) => {
  switch (userRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/staff/dashboard';
    case 'supplier':
      return '/supplier/dashboard';
    case 'interior_designer':
      return '/designer/dashboard';
    case 'user':
      return '/home';
    case 'customer':
    default:
      return '/home';
  }
};

/**
 * Check if user has access to a specific route based on their role
 * @param {string} userRole - The user's role
 * @param {string} route - The route to check
 * @returns {boolean} - Whether user has access
 */
export const hasRouteAccess = (userRole, route) => {
  const roleRoutes = {
    admin: ['/admin', '/staff', '/supplier', '/designer'],
    employee: ['/staff'],
    supplier: ['/supplier'],
    interior_designer: ['/designer'],
    customer: ['/home']
  };

  const userRoutes = roleRoutes[userRole] || ['/home'];
  return userRoutes.some(allowedRoute => route.startsWith(allowedRoute));
};