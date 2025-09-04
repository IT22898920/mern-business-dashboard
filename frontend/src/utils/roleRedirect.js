/**
 * Get the appropriate redirect path based on user role
 * @param {string} userRole - The user's role
 * @returns {string} - The path to redirect to
 */
export const getRoleBasedRedirect = (userRole) => {
  console.log('DEBUG: getRoleBasedRedirect called with:', userRole);
  console.log('DEBUG: userRole type:', typeof userRole);
  console.log('DEBUG: userRole === "admin":', userRole === 'admin');
  
  switch (userRole) {
    case 'admin':
      console.log('DEBUG: Returning admin path');
      return '/admin/products';
    case 'employee':
      console.log('DEBUG: Returning employee path');
      return '/staff/dashboard';
    case 'supplier':
      console.log('DEBUG: Returning supplier path');
      return '/supplier/dashboard';
    case 'interior_designer':
      console.log('DEBUG: Returning interior_designer path');
      return '/designer/dashboard';
    case 'customer':
      console.log('DEBUG: Returning customer path');
      return '/home';
    default:
      console.log('DEBUG: Returning default path');
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