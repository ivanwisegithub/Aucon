// ./api/middleware/auth.js
import jwt from 'jsonwebtoken';

// 🔐 Middleware to verify JWT from cookies or headers
export const verifyToken = (req, res, next) => {
  let token =
    req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '') ||
    req.headers['x-access-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token not found.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      isAdmin: decoded.isAdmin || false
    };
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
      code: 'INVALID_OR_EXPIRED'
    });
  }
};

// 🟡 Middleware for optional authentication
export const optionalAuth = (req, res, next) => {
  let token =
    req.cookies?.access_token ||
    req.headers.authorization?.replace('Bearer ', '') ||
    req.headers['x-access-token'];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      isAdmin: decoded.isAdmin || false
    };
  } catch {
    req.user = null;
  }

  next();
};

// 🔒 Middleware to restrict access to admins only
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// 🔐 Middleware to check if user owns a resource or is admin
export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  // Ownership check should be handled in the route/controller
  next();
};
