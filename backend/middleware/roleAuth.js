// Role-based authorization middleware

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }

    // Check if user has required role
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Specific role check functions
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

export const requireStaff = (req, res, next) => {
  if (!req.user || !['admin', 'employee'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff role required.'
    });
  }
  next();
};

export const requireSupplier = (req, res, next) => {
  if (!req.user || !['admin', 'supplier'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Supplier role required.'
    });
  }
  next();
};

export const requireDesigner = (req, res, next) => {
  if (!req.user || !['admin', 'interior_designer'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Designer role required.'
    });
  }
  next();
};

// Check if user can access resource (owner or admin)
export const requireOwnershipOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId || req.user.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }

  if (req.user.role === 'admin' || req.user.id === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};