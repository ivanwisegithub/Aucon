import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(errorHandler(401, 'Unauthorized: No token provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ Token verification failed:', err.message);
      return next(errorHandler(403, 'Forbidden: Invalid token'));
    }

    // ✅ Debug log to confirm token structure — safe to leave during dev
    console.log('🔍 Decoded token:', decoded);

    // ✅ Check for isAdmin flag in token
    if (!decoded.isAdmin) {
      return next(errorHandler(403, 'Access denied. Admins only.'));
    }

    req.user = decoded;
    next();
  });
};

export default verifyAdmin;
